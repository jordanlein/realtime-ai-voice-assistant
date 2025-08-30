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
  userAudioUrl?: string;
  assistantAudioUrl?: string;
}

// Based on OpenAI Realtime API documentation
export type OpenAIVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "cedar" | "marin";