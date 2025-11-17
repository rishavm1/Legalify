import { supabase } from './db';

export async function searchLegalDatabase(query: string, limit: number = 5) {
  try {
    // Generate embedding for query
    const embedding = await generateEmbedding(query);

    // Search in vector database
    const { data, error } = await supabase.rpc('search_legal_documents', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('RAG search error:', error);
    return [];
  }
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use HuggingFace InLegalBERT for embeddings
    const response = await fetch(
      'https://api-inference.huggingface.co/models/law-ai/InLegalBERT',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    const data = await response.json();
    return data[0] || new Array(768).fill(0);
  } catch (error) {
    console.error('Embedding generation error:', error);
    return new Array(768).fill(0);
  }
}

export async function getRelevantContext(query: string): Promise<string> {
  const results = await searchLegalDatabase(query, 3);
  return results.map((r: any) => r.content).join('\n\n');
}
