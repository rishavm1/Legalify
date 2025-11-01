-- First ensure users table exists
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

-- Chat History and Memory System (New tables - won't conflict with existing)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Analysis and File Storage
CREATE TABLE IF NOT EXISTS uploaded_files (
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

-- User Memory and Context
CREATE TABLE IF NOT EXISTS user_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    memory_type TEXT NOT NULL, -- 'case_info', 'preference', 'context'
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, memory_type, key)
);

-- OTP table for email verification
CREATE TABLE IF NOT EXISTS otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agreement Templates and Workflows
CREATE TABLE IF NOT EXISTS agreement_workflows (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    questions JSONB NOT NULL,
    template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default agreement workflows
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
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_memory_user_id ON user_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);

-- Note: RLS is disabled for now since we're using service role key
-- Enable RLS when moving to production with proper user authentication
-- ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;