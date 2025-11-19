#!/usr/bin/env python3
"""
Build searchable knowledge base from processed text files
"""

import os
import json
import re

INPUT_DIR = "data/processed_text"
OUTPUT_FILE = "data/simple_knowledge_base.json"

def extract_keywords(text):
    """Extract important keywords from text"""
    keywords = set()
    
    # Common legal terms
    legal_terms = ['act', 'amendment', 'constitution', 'article', 'section', 'clause', 
                   'schedule', 'parliament', 'state', 'union', 'court', 'law', 'right',
                   'duty', 'power', 'authority', 'government', 'president', 'governor']
    
    words = re.findall(r'\b\w+\b', text.lower())
    
    for word in words:
        if len(word) > 3 and word in legal_terms:
            keywords.add(word)
    
    # Extract numbers (amendment numbers, article numbers)
    numbers = re.findall(r'\b\d+\b', text)
    keywords.update(numbers[:10])  # Limit to first 10 numbers
    
    return list(keywords)

def main():
    print("="*60)
    print("BUILDING KNOWLEDGE BASE")
    print("="*60)
    
    txt_files = [f for f in os.listdir(INPUT_DIR) if f.endswith('.txt')]
    print(f"Found {len(txt_files)} text files\n")
    
    knowledge_base = []
    
    for txt_file in txt_files:
        txt_path = os.path.join(INPUT_DIR, txt_file)
        
        with open(txt_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not content.strip():
            continue
        
        # Extract metadata
        title = txt_file.replace('.txt', '').replace('_', ' ')
        keywords = extract_keywords(content)
        
        doc = {
            'title': title,
            'content': content[:5000],  # Limit content size
            'keywords': keywords,
            'source': txt_file,
            'length': len(content)
        }
        
        knowledge_base.append(doc)
        print(f"  [OK] {title[:60]}... ({len(content)} chars)")
    
    # Save knowledge base
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(knowledge_base, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*60)
    print(f"[OK] Knowledge base created: {len(knowledge_base)} documents")
    print(f"[FILE] Saved to: {OUTPUT_FILE}")
    print("="*60)

if __name__ == "__main__":
    main()
