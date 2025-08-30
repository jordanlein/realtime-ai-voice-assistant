export type ConversationStatus = "idle" | "connecting" | "active" | "stopping";

export interface TranscriptEntry {
  speaker: "user" | "ai";
  text: string;
  isFinal?: boolean;
}

export interface SavedConversation {
  id: number;
  timestamp: Date;
  transcript: TranscriptEntry[];
  userAudio?: Blob;
  assistantAudio?: Blob;
  userAudioUrl?: string;
  assistantAudioUrl?: string;
}

export interface ApiKeys {
    openai: string;
    google: string;
    searchEngineId: string;
}

// Based on OpenAI Realtime API documentation
export type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "cedar" | "marin";