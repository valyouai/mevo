interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

interface Metadata {
  deviceInfo?: {
    os: string;
    model: string;
    appVersion: string;
  };
  recordingInfo?: {
    duration: number;
    sampleRate: number;
    format: string;
  };
  custom?: Record<string, unknown>;
}

interface AdvancedFields {
  tags?: string[];
  problem?: string;
  solution?: string;
  context?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high';
}

interface Transcript {
  id: string;
  userId: string;
  rawTranscript: string;
  title?: string | null;
  hook?: string | null;
  takeaway?: string | null;
  supportingBulletPoints?: string[] | null;
  cta?: string | null;
  timestamp: Date;
  advancedFields?: AdvancedFields;
  embeddings?: number[];
  metadata?: Metadata;
  createdAt: Date;
  updatedAt: Date;
}

interface TranscriptListItem {
  id: string;
  title?: string | null;
  hook?: string | null;
  timestamp: Date;
}

interface TranscriptSearchResult extends TranscriptListItem {
  similarityScore: number;
}

export type {
  Location,
  Metadata,
  AdvancedFields,
  Transcript,
  TranscriptListItem,
  TranscriptSearchResult
};
