#!/usr/bin/env python3
"""
Upload RAG database to Supabase
"""
import json
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def upload_rag_data():
    """Upload RAG database to Supabase"""
    print("\n[INFO] Loading RAG database...")
    
    # Load RAG data
    with open("data/rag_database.json", 'r', encoding='utf-8') as f:
        rag_data = json.load(f)
    
    print(f"[OK] Loaded {len(rag_data)} chunks")
    
    try:
        import requests
        
        print("\n[INFO] Uploading to Supabase...")
        
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        # Upload in batches
        batch_size = 10
        for i in range(0, len(rag_data), batch_size):
            batch = rag_data[i:i+batch_size]
            
            # Format for Supabase
            formatted_batch = []
            for item in batch:
                formatted_batch.append({
                    "title": item["title"],
                    "content": item["content"],
                    "embedding": item["embedding"],
                    "document_type": "act",
                    "metadata": {"chunk_id": item["chunk_id"]}
                })
            
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/legal_documents",
                headers=headers,
                json=formatted_batch
            )
            
            if response.status_code in [200, 201]:
                print(f"[OK] Uploaded batch {i//batch_size + 1}/{(len(rag_data)-1)//batch_size + 1}")
            else:
                print(f"[ERROR] Batch {i//batch_size + 1} failed: {response.text}")
        
        print("\n[SUCCESS] RAG database uploaded to Supabase!")
        
    except ImportError:
        print("\n[ERROR] 'requests' module not found")
        print("\nMANUAL UPLOAD INSTRUCTIONS:")
        print("1. Go to: https://supabase.com/dashboard/project/lyyqkvdnarwbvxguqwvg")
        print("2. Click 'Table Editor' -> 'legal_documents'")
        print("3. Click 'Insert' -> 'Import data from CSV/JSON'")
        print("4. Select file: data/rag_database.json")
        print("5. Map columns: title->title, content->content, embedding->embedding")
        print("6. Click 'Import'")

if __name__ == "__main__":
    upload_rag_data()
