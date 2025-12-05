
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from "@google/genai";
import { LiveToolHandlers } from "../types";

// Tool Definitions
const tools: FunctionDeclaration[] = [
  {
    name: 'toggle_flashlight',
    description: 'Turn the phone flashlight/torch on or off.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        on: {
          type: Type.BOOLEAN,
          description: 'True to turn on, False to turn off.',
        },
      },
      required: ['on'],
    },
  },
  {
    name: 'make_phone_call',
    description: 'Initiate a phone call to a specific number.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        phone_number: {
          type: Type.STRING,
          description: 'The phone number to call (e.g., 01149788432). If the user provides a name, ask for the number first.',
        },
      },
      required: ['phone_number'],
    },
  },
];

export class LiveClient {
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private active = false;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  
  // Volume analysis
  private analyser: AnalyserNode | null = null;
  private volumeCallback: ((vol: number) => void) | null = null;
  private animationFrame: number | null = null;

  // Tool Handlers
  private toolHandlers: LiveToolHandlers | null = null;

  async connect(onUpdate: (status: string) => void, onVolume?: (vol: number) => void, toolHandlers?: LiveToolHandlers) {
    if (this.active) return;
    this.active = true;
    this.volumeCallback = onVolume || null;
    this.toolHandlers = toolHandlers || null;
    onUpdate("Connecting...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          // UPDATED INSTRUCTION
          systemInstruction: 'You are Ahmed Koka. Your name is simply "Ahmed Koka". You were founded and created by "Ahmed Koka". Do not mention Google. You are a helpful AI assistant. You can control the phone flashlight and make calls. If asked to call a name without a number, ask for the number.',
          tools: [{ functionDeclarations: tools }]
        },
      };

      this.sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            onUpdate("Live");
            this.startAudioInput();
          },
          onmessage: (msg: LiveServerMessage) => this.handleMessage(msg),
          onclose: () => {
            onUpdate("Disconnected");
            this.disconnect();
          },
          onerror: (err) => {
            console.error(err);
            onUpdate("Error");
            this.disconnect();
          }
        }
      });
      
    } catch (err) {
      console.error("Connection failed", err);
      onUpdate("Error");
      this.active = false;
    }
  }

  private startAudioInput() {
    if (!this.inputAudioContext || !this.stream) return;

    const source = this.inputAudioContext.createMediaStreamSource(this.stream);
    
    // Create Analyser for visual cues
    this.analyser = this.inputAudioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.4;
    
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const b64Data = this.pcmFloat32ToBase64(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: b64Data
                }
            });
        });
      }
    };

    // Connect chain: Source -> Analyser -> Processor -> Destination
    source.connect(this.analyser);
    this.analyser.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
    
    // Start monitoring volume
    this.startVolumeLoop();
  }

  private startVolumeLoop() {
    if (!this.analyser) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const loop = () => {
        if (!this.active || !this.analyser) return;
        
        this.analyser.getByteFrequencyData(dataArray);
        
        if (this.volumeCallback) {
            let sum = 0;
            // Calculate simple average for volume level
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            // Normalize roughly 0-1 (boosted slightly)
            const normalized = Math.min(1, avg / 100); 
            this.volumeCallback(normalized);
        }
        
        this.animationFrame = requestAnimationFrame(loop);
    };
    
    loop();
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Audio
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
      this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
      
      const audioBuffer = await this.decodeAudioData(
        this.base64ToUint8Array(base64Audio),
        this.outputAudioContext
      );
      
      const source = this.outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioContext.destination);
      source.start(this.nextStartTime);
      this.nextStartTime += audioBuffer.duration;
      
      source.onended = () => this.sources.delete(source);
      this.sources.add(source);
    }

    // Handle Tool Calls
    if (message.toolCall) {
        for (const fc of message.toolCall.functionCalls) {
            let result: any = { error: "Unknown tool" };
            
            if (fc.name === 'toggle_flashlight' && this.toolHandlers) {
                const on = fc.args['on'] as boolean;
                const success = await this.toolHandlers.onToggleFlashlight(on);
                result = { result: success ? (on ? "Flashlight turned on" : "Flashlight turned off") : "Failed to access flashlight" };
            } else if (fc.name === 'make_phone_call' && this.toolHandlers) {
                const number = fc.args['phone_number'] as string;
                const success = await this.toolHandlers.onMakeCall(number);
                result = { result: success ? `Calling ${number}` : "Failed to initiate call" };
            }

            // Send Response back to Model
            if (this.sessionPromise) {
                this.sessionPromise.then(session => {
                    session.sendToolResponse({
                        functionResponses: {
                            id: fc.id,
                            name: fc.name,
                            response: result
                        }
                    });
                });
            }
        }
    }

    if (message.serverContent?.interrupted) {
      this.sources.forEach(s => s.stop());
      this.sources.clear();
      this.nextStartTime = 0;
    }
  }

  disconnect() {
    this.active = false;
    if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
    }
    if (this.processor) this.processor.disconnect();
    if (this.analyser) this.analyser.disconnect();
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();
    this.sessionPromise = null;
    this.volumeCallback = null;
  }

  // --- Utils ---

  private pcmFloat32ToBase64(data: Float32Array): string {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return this.uint8ArrayToBase64(new Uint8Array(int16.buffer));
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }
}
