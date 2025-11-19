#!/usr/bin/env python3
"""
Download IPC sections from IndiaCode.nic.in
"""

import os
import time
import requests
from bs4 import BeautifulSoup

OUTPUT_DIR = "data/acts"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Direct PDF links for major Indian laws
MAJOR_LAWS = {
    "Indian_Penal_Code_1860.pdf": "https://legislative.gov.in/sites/default/files/A1860-45.pdf",
    "Code_of_Criminal_Procedure_1973.pdf": "https://legislative.gov.in/sites/default/files/A1974-2.pdf",
    "Code_of_Civil_Procedure_1908.pdf": "https://legislative.gov.in/sites/default/files/A1908-05.pdf",
    "Indian_Contract_Act_1872.pdf": "https://legislative.gov.in/sites/default/files/A1872-09.pdf",
    "Indian_Evidence_Act_1872.pdf": "https://legislative.gov.in/sites/default/files/A1872-01.pdf",
    "Consumer_Protection_Act_2019.pdf": "https://legislative.gov.in/sites/default/files/A2019-35.pdf",
    "Information_Technology_Act_2000.pdf": "https://legislative.gov.in/sites/default/files/A2000-21.pdf",
    "Transfer_of_Property_Act_1882.pdf": "https://legislative.gov.in/sites/default/files/A1882-04.pdf",
    "Negotiable_Instruments_Act_1881.pdf": "https://legislative.gov.in/sites/default/files/A1881-26.pdf",
    "Motor_Vehicles_Act_1988.pdf": "https://legislative.gov.in/sites/default/files/A1988-59.pdf"
}

def download_pdf(url, filename):
    """Download PDF from URL"""
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    if os.path.exists(filepath):
        print(f"  [SKIP] {filename} already exists")
        return True
    
    try:
        print(f"  [DOWNLOADING] {filename}")
        response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  [OK] Downloaded {filename}")
            return True
        else:
            print(f"  [ERROR] HTTP {response.status_code} for {filename}")
            return False
    except Exception as e:
        print(f"  [ERROR] {filename}: {e}")
        return False

def main():
    print("="*60)
    print("DOWNLOADING MAJOR INDIAN LAWS")
    print("="*60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    downloaded = 0
    failed = 0
    skipped = 0
    
    for filename, url in MAJOR_LAWS.items():
        if os.path.exists(os.path.join(OUTPUT_DIR, filename)):
            skipped += 1
            print(f"  [SKIP] {filename}")
            continue
            
        if download_pdf(url, filename):
            downloaded += 1
        else:
            failed += 1
        
        time.sleep(1)
    
    print("\n" + "="*60)
    print(f"[OK] Downloaded: {downloaded}")
    print(f"[SKIP] Skipped: {skipped}")
    print(f"[FAIL] Failed: {failed}")
    print("="*60)

if __name__ == "__main__":
    main()
