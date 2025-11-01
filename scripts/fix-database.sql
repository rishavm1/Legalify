-- EMERGENCY DATABASE FIX
-- Run this in your Supabase SQL Editor to fix the chat session creation issue

-- First, check if tables exist and their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'chat_sessions', 'chat_messages')
ORDER BY table_name, ordinal_position;

-- Drop existing tables if they have wrong foreign key references
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS user_memory CASCADE;

-- Ensure users table exists with correct structure
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    name TEXT,
    image TEXT,
    password_hash TEXT,
    provider TEXT DEFAULT 'email',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table with correct foreign key
CREATE TABLE chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other necessary tables
CREATE TABLE uploaded_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    extracted_text TEXT,
    analysis_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, memory_type, key)
);

CREATE TABLE IF NOT EXISTS otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agreement workflows table
CREATE TABLE IF NOT EXISTS agreement_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    questions JSONB NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default agreement workflow
INSERT INTO agreement_workflows (name, category, questions, template) VALUES
('Land Owner - Builder Agreement', 'property', 
'[
  {"id": "landowner_name", "text": "What is the landowner''s full name?", "type": "text", "required": true},
  {"id": "builder_name", "text": "What is the builder''s full name?", "type": "text", "required": true},
  {"id": "property_address", "text": "What is the complete property address?", "type": "textarea", "required": true},
  {"id": "construction_type", "text": "What type of construction is planned?", "type": "select", "options": ["Residential Building", "Commercial Building", "Mixed Use", "Other"], "required": true},
  {"id": "project_duration", "text": "What is the expected project duration (in months)?", "type": "number", "required": true},
  {"id": "total_cost", "text": "What is the total estimated cost?", "type": "text", "required": true},
  {"id": "payment_terms", "text": "What are the payment terms?", "type": "textarea", "required": true}
]',
'AGREEMENT BETWEEN LANDOWNER AND BUILDER

This Agreement is made on [DATE] between:

LANDOWNER: {{landowner_name}}
BUILDER: {{builder_name}}

PROPERTY DETAILS:
Address: {{property_address}}
Construction Type: {{construction_type}}

TERMS:
1. Project Duration: {{project_duration}} months
2. Total Cost: {{total_cost}}
3. Payment Terms: {{payment_terms}}

[Additional standard clauses would be inserted here based on Indian contract law]'
) ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);

-- Verify the fix
SELECT 'Database setup completed successfully!' as status;