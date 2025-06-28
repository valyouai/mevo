-- Add performance indexes
CREATE INDEX idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX idx_transcripts_timestamp ON transcripts(timestamp);

-- Full-text search index
CREATE INDEX idx_transcripts_raw_transcript_gin ON transcripts USING gin(to_tsvector('english', raw_transcript));

-- JSONB indexes
CREATE INDEX idx_transcripts_advanced_fields ON transcripts USING gin(advanced_fields);
CREATE INDEX idx_transcripts_advanced_fields_tags ON transcripts USING gin((advanced_fields->'tags'));
CREATE INDEX idx_transcripts_advanced_fields_problem ON transcripts USING gin((advanced_fields->'problem'));
CREATE INDEX idx_transcripts_metadata ON transcripts USING gin(metadata);

-- Vector index
CREATE INDEX idx_transcripts_embeddings_hnsw ON transcripts USING hnsw(embeddings vector_l2_ops)
WITH (m = 24, ef_construction = 200);

-- Enable Row Level Security
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY transcripts_user_access ON transcripts
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY transcripts_user_modification ON transcripts
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY transcripts_user_modification_update ON transcripts
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true)::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);

CREATE POLICY transcripts_user_deletion ON transcripts
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true)::uuid);
