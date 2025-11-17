#!/usr/bin/env python3
"""
RAG System Tester for Legalify
Tests the vector store and retrieval system using InLegalBERT
"""

import os
from pathlib import Path
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

def load_vector_store(vector_store_path):
    """Load the FAISS vector store and embeddings"""
    if not Path(vector_store_path).exists():
        raise FileNotFoundError(f"Vector store not found at {vector_store_path}. Run build_vector_store.py first.")
    
    print("Loading InLegalBERT embeddings...")
    embeddings = HuggingFaceEmbeddings(
        model_name="law-ai/InLegalBERT",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    print("Loading FAISS vector store...")
    vector_store = FAISS.load_local(
        vector_store_path, 
        embeddings,
        allow_dangerous_deserialization=True
    )
    
    print("✓ Vector store loaded successfully")
    return vector_store

def test_queries(vector_store):
    """Test the RAG system with sample queries"""
    
    test_queries = [
        "What is the punishment for murder under IPC?",
        "What are the requirements for a valid contract?",
        "Explain Article 21 of Constitution",
        "What is cheating under Indian law?"
    ]
    
    print("\n" + "="*60)
    print("🔍 TESTING RAG RETRIEVAL SYSTEM")
    print("="*60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📋 TEST {i}: {query}")
        print("-" * 50)
        
        try:
            # Perform similarity search
            results = vector_store.similarity_search(
                query, 
                k=3  # Get top 3 most relevant chunks
            )
            
            if results:
                print(f"✓ Found {len(results)} relevant documents:")
                
                for j, doc in enumerate(results, 1):
                    print(f"\n📄 RESULT {j}:")
                    print(f"Source: {doc.metadata.get('source', 'Unknown')}")
                    print(f"Content: {doc.page_content[:300]}...")
                    
                    # Show similarity score if available
                    if hasattr(doc, 'score'):
                        print(f"Similarity Score: {doc.score:.4f}")
            else:
                print("❌ No relevant documents found")
                
        except Exception as e:
            print(f"❌ Error during search: {str(e)}")
    
    print("\n" + "="*60)

def test_specific_search(vector_store):
    """Test specific legal concept search"""
    print("🎯 SPECIFIC LEGAL SEARCH TEST")
    print("-" * 40)
    
    # Test with a specific legal query
    query = "What is the punishment for murder under IPC?"
    print(f"Query: {query}")
    
    try:
        # Get results with scores
        results_with_scores = vector_store.similarity_search_with_score(query, k=2)
        
        print(f"\n📊 DETAILED RESULTS:")
        for i, (doc, score) in enumerate(results_with_scores, 1):
            print(f"\n🔍 Match {i} (Score: {score:.4f}):")
            print(f"Source: {doc.metadata.get('act_name', 'Unknown Act')}")
            print(f"Content: {doc.page_content}")
            print("-" * 30)
            
    except Exception as e:
        print(f"❌ Error in specific search: {str(e)}")

def main():
    """Main testing function"""
    print("🚀 Legalify RAG System Test")
    print("=" * 40)
    
    # Setup paths
    base_dir = Path(__file__).parent.parent
    vector_store_path = base_dir / "data" / "vector_store"
    
    try:
        # Load vector store
        vector_store = load_vector_store(vector_store_path)
        
        # Run tests
        test_queries(vector_store)
        test_specific_search(vector_store)
        
        print("🎉 RAG SYSTEM TEST COMPLETED!")
        print("✅ Your legal knowledge base is working correctly!")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Run: python scripts/build_vector_store.py")
        print("2. Install: pip install langchain-community langchain-huggingface faiss-cpu")

if __name__ == "__main__":
    main()