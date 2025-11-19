#!/usr/bin/env python3
"""
Download Indian Legal Acts from legislative.csv
Reads CSV with act names and PDF URLs, downloads to data/acts/
"""

import os
import re
import time

try:
    import pandas as pd
    import requests
except ImportError as e:
    print("\n" + "="*60)
    print("[ERROR] Missing Required Libraries!")
    print("="*60)
    print("\nPlease install: pip install pandas requests")
    print("="*60)
    exit(1)

# Configuration
CSV_FILE = "../legislative.csv"
OUTPUT_DIR = "data/acts"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def clean_filename(title):
    """Clean title to create valid filename"""
    # Remove special characters, keep only alphanumeric and spaces
    cleaned = re.sub(r'[^\w\s-]', '', title)
    # Replace spaces with underscores
    cleaned = re.sub(r'\s+', '_', cleaned)
    # Limit length to 100 chars
    cleaned = cleaned[:100].strip('_')
    return cleaned + ".pdf"

def download_pdf(url, filepath, title):
    """Download PDF from URL to filepath"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30, stream=True)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            print(f"  [ERROR] HTTP {response.status_code}: {title}")
            return False
    except Exception as e:
        print(f"  [ERROR] {title} - {str(e)}")
        return False

def main():
    print("="*60)
    print("LEGISLATIVE DATA DOWNLOADER")
    print("="*60)
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")
    
    # Check if CSV exists
    if not os.path.exists(CSV_FILE):
        print(f"[ERROR] {CSV_FILE} not found!")
        print("Please place legislative.csv in the project root.")
        return
    
    # Read CSV
    print(f"Reading {CSV_FILE}...")
    df = pd.read_csv(CSV_FILE)
    
    # Get column names (assuming columns 0 and 2)
    title_col = df.columns[0]  # bt-content
    url_col = df.columns[2]    # pdf-downloads href
    
    print(f"Found {len(df)} acts to download\n")
    
    downloaded = 0
    skipped = 0
    failed = 0
    
    # Process each row
    for idx, row in df.iterrows():
        title = str(row[title_col]).strip()
        url = str(row[url_col]).strip()
        
        # Skip if missing data
        if pd.isna(title) or pd.isna(url) or not url.startswith('http'):
            skipped += 1
            continue
        
        # Create filename
        filename = clean_filename(title)
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # Skip if already exists
        if os.path.exists(filepath):
            print(f"  [SKIP] {title} (already exists)")
            skipped += 1
            continue
        
        # Download
        print(f"  [DOWNLOADING] {title}")
        if download_pdf(url, filepath, title):
            print(f"  [OK] Downloaded: {title}")
            downloaded += 1
        else:
            failed += 1
        
        # Be polite to server
        time.sleep(0.5)
    
    # Summary
    print("\n" + "="*60)
    print("DOWNLOAD COMPLETE!")
    print("="*60)
    print(f"[OK] Downloaded: {downloaded}")
    print(f"[SKIP] Skipped: {skipped}")
    print(f"[FAIL] Failed: {failed}")
    print(f"[DIR] Files saved in: {OUTPUT_DIR}")
    print("="*60)

if __name__ == "__main__":
    main()
