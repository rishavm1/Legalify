import { supabaseAdmin } from './db';

export interface DocumentEmbedding {
  id: string;
  title: string;
  content: string;
  embedding: number[];
  similarity?: number;
}

export class VectorSearch {
  // Generate embedding using InLegalBERT (simplified - uses text length as proxy)
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      // In production, this would call InLegalBERT API
      // For now, using a simple hash-based embedding
      const embedding = new Array(768).fill(0);
      const words = text.toLowerCase().split(/\s+/);
      
      words.forEach((word, idx) => {
        const hash = this.simpleHash(word);
        embedding[hash % 768] += 1;
      });
      
      // Normalize
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return new Array(768).fill(0);
    }
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  static async storeEmbedding(
    userId: string,
    title: string,
    content: string,
    documentType: string,
    metadata?: any
  ): Promise<string | null> {
    try {
      const embedding = await this.generateEmbedding(content);
      
      const { data, error } = await supabaseAdmin
        .from('document_embeddings')
        .insert({
          user_id: userId,
          title,
          content,
          document_type: documentType,
          embedding: JSON.stringify(embedding),
          metadata
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Store embedding failed:', error);
      return null;
    }
  }

  static async searchSimilar(
    query: string,
    userId?: string,
    limit: number = 10
  ): Promise<DocumentEmbedding[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await supabaseAdmin.rpc('search_similar_documents', {
        query_embedding: JSON.stringify(queryEmbedding),
        match_threshold: 0.5,
        match_count: limit
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Semantic search failed:', error);
      // Fallback to keyword search
      return this.keywordSearch(query, userId, limit);
    }
  }

  private static async keywordSearch(
    query: string,
    userId?: string,
    limit: number = 10
  ): Promise<DocumentEmbedding[]> {
    try {
      let queryBuilder = supabaseAdmin
        .from('document_embeddings')
        .select('id, title, content')
        .textSearch('content', query, { type: 'websearch' })
        .limit(limit);

      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }

      const { data, error } = await queryBuilder;
      if (error) throw error;

      return (data || []).map(doc => ({
        ...doc,
        embedding: [],
        similarity: 0.7
      }));
    } catch (error) {
      console.error('Keyword search failed:', error);
      return [];
    }
  }
}
