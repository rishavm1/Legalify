-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for semantic search
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

-- Create function for similarity search
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
