
export enum FeatureMode {
  CHAT = 'Chat',
  THINKING = 'Thinking',
  SEARCH = 'Search Grounding',
  MAPS = 'Maps Grounding',
  IMAGE_GEN = 'Image Generation (Pro)',
  NANO_BANANA_GEN = 'Nano Banana (Free)',
  IMAGE_EDIT = 'Image Editing',
  MUSIC_CRITIQUE = 'Music Evaluation', // New Mode
  LIVE = 'Live Conversation',
  AUDIO_TRANSCRIPT = 'Audio Transcription'
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export interface Message {
  role: 'user' | 'model' | 'system';
  text?: string;
  image?: string; // Base64 or URL
  video?: string; // URL
  audio?: string; // Base64
  groundingLinks?: { title: string; uri: string }[];
  isThinking?: boolean;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  date: number;
  messages: Message[];
}

export interface LiveToolHandlers {
  onToggleFlashlight: (on: boolean) => Promise<boolean>;
  onMakeCall: (number: string) => Promise<boolean>;
}

// Correctly augment the Window interface
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}
