#!/usr/bin/env python3
"""
Test RAG system with sample queries
"""

import json

KB_FILE = "data/simple_knowledge_base.json"

def search_knowledge_base(query, knowledge_base, top_k=3):
    """Simple keyword-based search"""
    query_words = set(query.lower().split())
    results = []
    
    for doc in knowledge_base:
        # Calculate relevance score
        title_matches = sum(1 for word in query_words if word in doc['title'].lower())
        content_matches = sum(1 for word in query_words if word in doc['content'].lower())
        keyword_matches = sum(1 for word in query_words if word in doc['keywords'])
        
        score = title_matches * 3 + content_matches + keyword_matches * 2
        
        if score > 0:
            results.append((score, doc))
    
    # Sort by score and return top_k
    results.sort(reverse=True, key=lambda x: x[0])
    return [doc for score, doc in results[:top_k]]

def main():
    print("="*60)
    print("RAG SYSTEM TEST")
    print("="*60)
    
    # Load knowledge base
    with open(KB_FILE, 'r', encoding='utf-8') as f:
        knowledge_base = json.load(f)
    
    print(f"Loaded {len(knowledge_base)} documents\n")
    
    # Test queries
    test_queries = [
        "What is the First Amendment?",
        "Tell me about Article 21",
        "Constitution amendment 42",
        "Right to education amendment"
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        print("-" * 60)
        
        results = search_knowledge_base(query, knowledge_base)
        
        if results:
            print(f"Found {len(results)} relevant documents:\n")
            for i, doc in enumerate(results, 1):
                print(f"{i}. {doc['title']}")
                preview = doc['content'][:150].encode('ascii', 'ignore').decode('ascii')
                print(f"   Preview: {preview}...")
                print()
        else:
            print("No relevant documents found.\n")
    
    print("="*60)
    print("TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
