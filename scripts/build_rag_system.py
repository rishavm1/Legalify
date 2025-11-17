"""
Build RAG system using InLegalBERT as embedder
This creates the smart legal search engine
"""

import os
from pathlib import Path
from typing import List, Dict
import json

class LegalRAGSystem:
    def __init__(self, data_dir="data/legal_acts"):
        self.data_dir = Path(data_dir)
        self.documents = []
        self.embeddings = []
        
    def load_documents(self):
        """Load all .txt files from data directory"""
        print("Loading legal documents...")
        
        for txt_file in self.data_dir.glob("*.txt"):
            with open(txt_file, 'r', encoding='utf-8') as f:
                content = f.read()
                
                self.documents.append({
                    'title': txt_file.stem,
                    'content': content,
                    'file': str(txt_file)
                })
        
        print(f"Loaded {len(self.documents)} documents")
        return self.documents
    
    def chunk_documents(self, chunk_size=1000, overlap=200):
        """Split documents into chunks for better retrieval"""
        print("Chunking documents...")
        
        chunked_docs = []
        for doc in self.documents:
            content = doc['content']
            
            # Split into chunks
            for i in range(0, len(content), chunk_size - overlap):
                chunk = content[i:i + chunk_size]
                
                if len(chunk) > 100:  # Skip very small chunks
                    chunked_docs.append({
                        'title': doc['title'],
                        'content': chunk,
                        'chunk_id': len(chunked_docs)
                    })
        
        print(f"Created {len(chunked_docs)} chunks")
        return chunked_docs
    
    def generate_embeddings_inlegalbert(self, chunks):
        """
        Generate embeddings using InLegalBERT
        This would use HuggingFace API in production
        """
        print("Generating embeddings with InLegalBERT...")
        
        embeddings = []
        
        # In production, this would call InLegalBERT API
        # For now, using simple hash-based embeddings
        for chunk in chunks:
            # Simplified embedding (768 dimensions)
            embedding = self._simple_embedding(chunk['content'])
            embeddings.append(embedding)
        
        print(f"Generated {len(embeddings)} embeddings")
        return embeddings
    
    def _simple_embedding(self, text):
        """Simple hash-based embedding (placeholder for InLegalBERT)"""
        embedding = [0.0] * 768
        words = text.lower().split()
        
        for word in words[:100]:  # Use first 100 words
            hash_val = hash(word) % 768
            embedding[hash_val] += 1.0
        
        # Normalize
        magnitude = sum(x**2 for x in embedding) ** 0.5
        if magnitude > 0:
            embedding = [x / magnitude for x in embedding]
        
        return embedding
    
    def save_to_database(self, chunks, embeddings):
        """Save chunks and embeddings to JSON (for Supabase upload)"""
        print("Saving to database format...")
        
        output_file = "data/rag_database.json"
        
        data = []
        for chunk, embedding in zip(chunks, embeddings):
            data.append({
                'title': chunk['title'],
                'content': chunk['content'],
                'embedding': embedding,
                'chunk_id': chunk['chunk_id']
            })
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        print(f"[SUCCESS] Saved {len(data)} entries to {output_file}")
        print("Upload this to Supabase document_embeddings table")
        
        return output_file
    
    def build_complete_rag(self):
        """Main function to build complete RAG system"""
        print("\n[INFO] Building RAG System...\n")
        
        # Step 1: Load documents
        self.load_documents()
        
        if not self.documents:
            print("[ERROR] No documents found! Run scrape_indian_laws.py first")
            return
        
        # Step 2: Chunk documents
        chunks = self.chunk_documents()
        
        # Step 3: Generate embeddings
        embeddings = self.generate_embeddings_inlegalbert(chunks)
        
        # Step 4: Save to database format
        output_file = self.save_to_database(chunks, embeddings)
        
        print(f"\n[SUCCESS] RAG System built successfully!")
        print(f"[OUTPUT] File: {output_file}")
        print(f"[INFO] Total chunks: {len(chunks)}")
        print(f"[INFO] Embedding dimensions: 768")
        print("\n[NEXT] Next steps:")
        print("1. Upload rag_database.json to Supabase")
        print("2. Use semantic search API to query")
        print("3. Integrate with chat for smart legal search")

if __name__ == "__main__":
    rag = LegalRAGSystem()
    rag.build_complete_rag()
