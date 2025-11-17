-- ============================================
-- FINAL SQL MIGRATION - RUN THIS IN SUPABASE
-- ============================================

-- 1. Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create embeddings table for semantic search
CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID,
  document_type VARCHAR(50),
  title TEXT,
  content TEXT,
  embedding vector(768),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_embeddings_user_id ON document_embeddings(user_id);
CREATE INDEX idx_embeddings_document_type ON document_embeddings(document_type);
CREATE INDEX idx_embeddings_vector ON document_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 3. Create function for similarity search
CREATE OR REPLACE FUNCTION search_similar_documents(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.id,
    document_embeddings.title,
    document_embeddings.content,
    1 - (document_embeddings.embedding <=> query_embedding) as similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  duration_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_performance_endpoint ON performance_metrics(endpoint);
CREATE INDEX idx_performance_created_at ON performance_metrics(created_at DESC);
CREATE INDEX idx_performance_duration ON performance_metrics(duration_ms DESC);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if vector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('document_embeddings', 'performance_metrics');

-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'search_similar_documents';
