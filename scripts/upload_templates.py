#!/usr/bin/env python3
"""
Upload templates to Supabase
"""
import json
import requests
import os
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def upload_templates():
    print("\n[INFO] Loading templates...")
    
    with open("data/templates/templates_collection.json", 'r', encoding='utf-8') as f:
        templates = json.load(f)
    
    print(f"[OK] Loaded {len(templates)} templates")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    print("\n[INFO] Uploading to Supabase...")
    
    for key, template in templates.items():
        data = {
            "template_type": key,
            "template_name": template["name"],
            "template_content": template["content"],
            "input_fields": template["fields"],
            "court_type": "all",
            "case_type": key.replace('_', ' ').title()
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/legal_templates",
            headers=headers,
            json=data
        )
        
        if response.status_code in [200, 201]:
            print(f"[OK] Uploaded: {template['name']}")
        else:
            print(f"[ERROR] Failed: {template['name']} - {response.text}")
    
    print("\n[SUCCESS] Templates uploaded to Supabase!")

if __name__ == "__main__":
    upload_templates()
