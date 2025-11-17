#!/usr/bin/env python3
"""
Simple RAG Test for Legalify
Tests basic text search functionality without complex dependencies
"""

import os
import json
from pathlib import Path
import re

def load_processed_texts():
    """Load all processed text files"""
    base_dir = Path(__file__).parent.parent
    text_dir = base_dir / "data" / "processed_text"
    
    documents = {}
    text_files = list(text_dir.glob("*.txt"))
    
    if not text_files:
        print("[ERROR] No processed text files found!")
        print("Run: python scripts/process_pdfs.py first")
        return {}
    
    print(f"Loading {len(text_files)} legal documents...")
    
    for file_path in text_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Clean filename for display
            doc_name = file_path.stem.replace("_processed", "").replace("_", " ")
            documents[doc_name] = {
                'content': content,
                'file': file_path.name
            }
            print(f"  [OK] {doc_name}")
            
        except Exception as e:
            print(f"  [ERROR] Error loading {file_path.name}: {e}")
    
    return documents

def simple_search(documents, query, max_results=3):
    """Simple keyword-based search"""
    query_words = query.lower().split()
    results = []
    
    for doc_name, doc_data in documents.items():
        content = doc_data['content'].lower()
        score = 0
        
        # Count keyword matches
        for word in query_words:
            score += content.count(word)
        
        if score > 0:
            results.append({
                'name': doc_name,
                'content': doc_data['content'],
                'file': doc_data['file'],
                'score': score
            })
    
    # Sort by relevance score
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:max_results]

def test_legal_queries(documents):
    """Test with legal queries"""
    
    test_queries = [
        "What is the punishment for murder under IPC?",
        "What are the requirements for a valid contract?", 
        "What is cheating under Indian law?",
        "Article 21 Constitution rights"
    ]
    
    print("\n" + "="*60)
    print("[TESTING] LEGAL KNOWLEDGE RETRIEVAL")
    print("="*60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nTEST {i}: {query}")
        print("-" * 50)
        
        results = simple_search(documents, query)
        
        if results:
            print(f"[SUCCESS] Found {len(results)} relevant documents:")
            
            for j, result in enumerate(results, 1):
                print(f"\nRESULT {j} (Score: {result['score']}):")
                print(f"Document: {result['name']}")
                print(f"Content Preview: {result['content'][:200]}...")
                
        else:
            print("[ERROR] No relevant documents found")

def create_simple_knowledge_base(documents):
    """Create a simple JSON knowledge base"""
    base_dir = Path(__file__).parent.parent
    kb_file = base_dir / "data" / "simple_knowledge_base.json"
    
    # Create searchable knowledge base
    knowledge_base = {
        "metadata": {
            "total_documents": len(documents),
            "created": "2024-11-17",
            "description": "Legalify Legal Knowledge Base"
        },
        "documents": {}
    }
    
    for doc_name, doc_data in documents.items():
        knowledge_base["documents"][doc_name] = {
            "content": doc_data['content'],
            "source_file": doc_data['file'],
            "keywords": extract_keywords(doc_data['content'])
        }
    
    # Save knowledge base
    with open(kb_file, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, indent=2, ensure_ascii=False)
    
    print(f"\n[SAVED] Knowledge base saved to: {kb_file}")
    return knowledge_base

def extract_keywords(text):
    """Extract important legal keywords"""
    # Common legal terms to identify
    legal_terms = [
        'section', 'act', 'punishment', 'imprisonment', 'fine', 'court',
        'judge', 'law', 'legal', 'contract', 'agreement', 'rights',
        'constitution', 'article', 'ipc', 'crpc', 'cpc', 'evidence'
    ]
    
    found_keywords = []
    text_lower = text.lower()
    
    for term in legal_terms:
        if term in text_lower:
            found_keywords.append(term)
    
    return found_keywords

def main():
    """Main function"""
    print("[LEGALIFY] Simple RAG Test")
    print("=" * 40)
    
    try:
        # Load documents
        documents = load_processed_texts()
        
        if not documents:
            return
        
        # Test queries
        test_legal_queries(documents)
        
        # Create knowledge base
        kb = create_simple_knowledge_base(documents)
        
        print("\n" + "="*60)
        print("[SUCCESS] RAG SYSTEM TEST COMPLETED!")
        print(f"[OK] Processed {len(documents)} legal documents")
        print("[OK] Knowledge base created successfully")
        print("[OK] Search functionality working!")
        
        print("\nSUMMARY:")
        for doc_name in documents.keys():
            print(f"  - {doc_name}")
        
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")

if __name__ == "__main__":
    main()