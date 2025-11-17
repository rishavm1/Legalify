-- Enable pgvector if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Legal documents table for RAG system
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  act_name TEXT,
  section_number TEXT,
  content TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('act', 'case', 'article', 'amendment')),
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS legal_documents_embedding_idx ON legal_documents USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS legal_documents_act_idx ON legal_documents(act_name);
CREATE INDEX IF NOT EXISTS legal_documents_type_idx ON legal_documents(document_type);

-- Search function for RAG
CREATE OR REPLACE FUNCTION search_legal_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  act_name TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    legal_documents.id,
    legal_documents.title,
    legal_documents.content,
    legal_documents.act_name,
    1 - (legal_documents.embedding <=> query_embedding) as similarity
  FROM legal_documents
  WHERE 1 - (legal_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY legal_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Judgments table
CREATE TABLE IF NOT EXISTS judgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number TEXT UNIQUE NOT NULL,
  case_title TEXT NOT NULL,
  court TEXT NOT NULL,
  judges TEXT[],
  petitioner TEXT,
  respondent TEXT,
  judgment_date DATE,
  facts TEXT,
  issues TEXT[],
  decision TEXT,
  ratio_decidendi TEXT,
  precedents TEXT[],
  citations TEXT[],
  full_text TEXT,
  summary TEXT,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS judgments_embedding_idx ON judgments USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS judgments_case_number_idx ON judgments(case_number);
CREATE INDEX IF NOT EXISTS judgments_court_idx ON judgments(court);

-- Templates table for fine-tuning
CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  template_content TEXT NOT NULL,
  input_fields JSONB,
  example_output TEXT,
  court_type TEXT,
  case_type TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS templates_type_idx ON legal_templates(template_type);
CREATE INDEX IF NOT EXISTS templates_court_idx ON legal_templates(court_type);

-- Training data for SFT
CREATE TABLE IF NOT EXISTS training_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instruction TEXT NOT NULL,
  input TEXT,
  output TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('petition', 'memo', 'argument', 'notice', 'reply')),
  quality_score FLOAT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS training_data_type_idx ON training_data(data_type);
CREATE INDEX IF NOT EXISTS training_data_verified_idx ON training_data(verified);

-- User preferences for language
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT false;

-- Update RBAC with new features
ALTER TABLE users ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{"voice": false, "translation": false, "rag_search": true, "judgment_analysis": true}'::jsonb;

COMMENT ON TABLE legal_documents IS 'RAG system - stores all Indian acts and legal documents with embeddings';
COMMENT ON TABLE judgments IS 'Stores analyzed court judgments with extracted information';
COMMENT ON TABLE legal_templates IS 'Templates for document generation and fine-tuning';
COMMENT ON TABLE training_data IS 'Training data for supervised fine-tuning of legal AI model';
