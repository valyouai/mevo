-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create transcripts table
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
  embeddings VECTOR(1536),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add column comments
COMMENT ON TABLE transcripts IS 'Stores voice memo transcripts and their metadata';
COMMENT ON COLUMN transcripts.id IS 'Unique identifier for the transcript';
COMMENT ON COLUMN transcripts.user_id IS 'ID of the user who created the transcript';
COMMENT ON COLUMN transcripts.raw_transcript IS 'The full text content of the voice memo';
COMMENT ON COLUMN transcripts.title IS 'Optional title for the transcript';
COMMENT ON COLUMN transcripts.hook IS 'Attention-grabbing summary';
COMMENT ON COLUMN transcripts.takeaway IS 'Main point or conclusion';
COMMENT ON COLUMN transcripts.supporting_bullet_points IS 'Key supporting points';
COMMENT ON COLUMN transcripts.cta IS 'Call to action or next steps';
COMMENT ON COLUMN transcripts.timestamp IS 'When the voice memo was recorded';
COMMENT ON COLUMN transcripts.advanced_fields IS 'Structured data extracted from transcript';
COMMENT ON COLUMN transcripts.embeddings IS 'Vector embedding of the transcript content';
COMMENT ON COLUMN transcripts.metadata IS 'Technical metadata about the recording';
COMMENT ON COLUMN transcripts.created_at IS 'When the record was created in the database';
COMMENT ON COLUMN transcripts.updated_at IS 'When the record was last updated in the database';
