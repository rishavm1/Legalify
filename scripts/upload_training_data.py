#!/usr/bin/env python3
"""
Upload training data to Supabase
"""
import json
import requests

SUPABASE_URL = "https://lyyqkvdnarwbvxguqwvg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5eXFrdmRuYXJ3YnZ4Z3Vxd3ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTk4NTcyNSwiZXhwIjoyMDc3NTYxNzI1fQ.HkmMB1v3e-jdLDeExOSL8baWzJS-zqGzmzyIHeU3veE"

def upload_training_data():
    print("\n[INFO] Loading training data...")
    
    training_data = []
    with open("data/sft_training_data.jsonl", 'r', encoding='utf-8') as f:
        for line in f:
            training_data.append(json.loads(line))
    
    print(f"[OK] Loaded {len(training_data)} training examples")
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    print("\n[INFO] Uploading to Supabase...")
    
    for item in training_data:
        # Map data_type
        data_type_map = {
            "Civil petition": "petition",
            "Bail arguments": "argument",
            "Legal notice": "notice",
            "Judgment analysis": "memo",
            "Counter arguments": "argument"
        }
        
        instruction_lower = item["instruction"].lower()
        data_type = "petition"
        for key, value in data_type_map.items():
            if key.lower() in instruction_lower:
                data_type = value
                break
        
        data = {
            "instruction": item["instruction"],
            "input": item["input"],
            "output": item["output"],
            "data_type": data_type,
            "quality_score": 0.9,
            "verified": True
        }
        
        response = requests.post(
            f"{SUPABASE_URL}/rest/v1/training_data",
            headers=headers,
            json=data
        )
        
        if response.status_code in [200, 201]:
            print(f"[OK] Uploaded: {item['instruction'][:50]}...")
        else:
            print(f"[ERROR] Failed: {response.text}")
    
    print("\n[SUCCESS] Training data uploaded to Supabase!")

if __name__ == "__main__":
    upload_training_data()
