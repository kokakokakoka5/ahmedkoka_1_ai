
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold, Modality } from "@google/genai";
import { Attachment, FeatureMode, Message } from "../types";

// Helper to get client (always fresh for API key updates)
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// --- General Content Generation ---
export const generateResponse = async (
  mode: FeatureMode,
  history: Message[],
  prompt: string,
  attachments: Attachment[],
  location?: GeolocationCoordinates
): Promise<Message> => {
  const ai = getClient();
  
  let modelName = 'gemini-2.5-flash';
  let config: any = {};
  // Updated system instruction to handle singing requests and persona
  let systemInstruction: string | undefined = "You are ahmedkoka_1_ai, a helpful and advanced AI assistant. If the user asks you to sing, write lyrics and respond in a rhythmic, poetic way that sounds beautiful when read aloud.";

  // Configure based on mode
  switch (mode) {
    case FeatureMode.CHAT:
      modelName = 'gemini-3-pro-preview';
      break;
    
    case FeatureMode.THINKING:
      modelName = 'gemini-3-pro-preview';
      config = { thinkingConfig: { thinkingBudget: 16000 }, maxOutputTokens: 32768 }; 
      break;

    case FeatureMode.SEARCH:
      modelName = 'gemini-2.5-flash';
      config = { tools: [{ googleSearch: {} }] };
      break;

    case FeatureMode.MAPS:
      modelName = 'gemini-2.5-flash';
      config = {
        tools: [{ googleMaps: {} }],
        toolConfig: location ? {
          retrievalConfig: {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          }
        } : undefined
      };
      break;

    case FeatureMode.IMAGE_EDIT:
      modelName = 'gemini-2.5-flash-image';
      break;
      
    case FeatureMode.AUDIO_TRANSCRIPT:
      modelName = 'gemini-2.5-flash';
      break;

    case FeatureMode.MUSIC_CRITIQUE:
      modelName = 'gemini-2.5-flash'; // Flash is good for multimodal audio
      systemInstruction = "You are an expert vocal coach and music critic. Listen to the provided audio carefully. Analyze the pitch, tone, emotion, and technique of the singer. Give constructive feedback and a rating out of 10. Be encouraging but honest.";
      break;

    default:
      modelName = 'gemini-2.5-flash';
  }

  // Construct Content
  const parts: any[] = [];
  
  attachments.forEach(att => {
    parts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        ...config,
        systemInstruction,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      }
    });

    // Extract Text
    const text = response.text || "";

    // Extract Grounding
    let groundingLinks: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((c: any) => {
        if (c.web) {
          groundingLinks.push({ title: c.web.title, uri: c.web.uri });
        }
        if (c.maps && c.maps.uri) {
           groundingLinks.push({ title: c.maps.title || "Map Location", uri: c.maps.uri });
        }
      });
    }

    // Extract Images (if any)
    let image: string | undefined;
    const resParts = response.candidates?.[0]?.content?.parts;
    if (resParts) {
        for (const part of resParts) {
            if (part.inlineData) {
                image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }

    return {
      role: 'model',
      text,
      groundingLinks,
      image
    };

  } catch (error: any) {
    console.error("GenAI Error:", error);
    return {
      role: 'model',
      text: `Error: ${error.message || "Something went wrong."}`
    };
  }
};

// --- Image Generation (Pro) ---
export const generateImage = async (prompt: string, aspectRatio: string = "1:1", imageSize: string = "1K"): Promise<Message> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio,
                    imageSize: imageSize
                }
            }
        });

        let imageUrl: string | undefined;
        let text: string | undefined;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
                text = part.text;
            }
        }

        if (!imageUrl) throw new Error("No image generated");

        return {
            role: 'model',
            image: imageUrl,
            text: text || "Here is your generated image."
        };

    } catch (error: any) {
         return {
            role: 'model',
            text: `Image Generation Error: ${error.message}`
        };
    }
}

// --- Nano Banana Image Generation (Flash Image) ---
export const generateNanoImage = async (prompt: string): Promise<Message> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
        });

        let imageUrl: string | undefined;
        let text: string | undefined;

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else if (part.text) {
                text = part.text;
            }
        }

        if (!imageUrl) throw new Error("No image generated by Nano Banana");

        return {
            role: 'model',
            image: imageUrl,
            text: text || "⚡ Generated with Nano Banana (Fast)"
        };

    } catch (error: any) {
         return {
            role: 'model',
            text: `Nano Banana Error: ${error.message}`
        };
    }
}

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        // Using 'Kore' for a potentially more "beautiful" singing/melodic tone, 
                        // or 'Fenrir' as requested previously. Swapping to 'Kore' for variety based on "beautiful voice" request.
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (e) {
        console.error("TTS Error", e);
        return null;
    }
}
