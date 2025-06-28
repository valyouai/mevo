-- Create transcripts table without vector extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  raw_transcript TEXT NOT NULL,
  title TEXT,
  hook TEXT,
  takeaway TEXT,
  supporting_bullet_points TEXT[],
  cta TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  advanced_fields JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add basic indexes
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_created_at ON transcripts(created_at);
