-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add test user
INSERT INTO users (id) VALUES ('00000000-0000-0000-0000-000000000000') ON CONFLICT (id) DO NOTHING;
