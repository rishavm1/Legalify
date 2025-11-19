#!/usr/bin/env python3
"""
Download major laws from IndiaCode.nic.in with direct links
"""

import os
import time
import requests

OUTPUT_DIR = "data/acts"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Working direct links from IndiaCode
LAWS = {
    "Indian_Penal_Code_1860.pdf": "https://www.indiacode.nic.in/bitstream/123456789/4219/1/THE-INDIAN-PENAL-CODE-1860.pdf",
    "Code_of_Criminal_Procedure_1973.pdf": "https://www.indiacode.nic.in/bitstream/123456789/15272/1/the_code_of_criminal_procedure%2C_1973.pdf",
    "Indian_Contract_Act_1872.pdf": "https://www.indiacode.nic.in/bitstream/123456789/2187/1/A1872-09.pdf",
    "Indian_Evidence_Act_1872.pdf": "https://www.indiacode.nic.in/bitstream/123456789/2188/1/A1872-01.pdf",
    "Information_Technology_Act_2000.pdf": "https://www.indiacode.nic.in/bitstream/123456789/13116/1/it_act_2000_updated.pdf",
}

def download_pdf(url, filename):
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        print(f"  [SKIP] {filename}")
        return True
    
    try:
        print(f"  [DOWNLOADING] {filename}")
        response = requests.get(url, headers=HEADERS, timeout=60, stream=True)
        
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            size = os.path.getsize(filepath) / 1024
            print(f"  [OK] {filename} ({size:.1f} KB)")
            return True
        else:
            print(f"  [ERROR] HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False

def main():
    print("="*60)
    print("DOWNLOADING FROM INDIACODE.NIC.IN")
    print("="*60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success = 0
    failed = 0
    
    for filename, url in LAWS.items():
        if download_pdf(url, filename):
            success += 1
        else:
            failed += 1
        time.sleep(2)
    
    print("\n" + "="*60)
    print(f"[OK] Success: {success}")
    print(f"[FAIL] Failed: {failed}")
    print("="*60)

if __name__ == "__main__":
    main()
