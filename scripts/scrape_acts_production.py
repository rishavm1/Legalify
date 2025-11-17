#!/usr/bin/env python3
"""
Production Scraper for Indian Legal Acts
Downloads 1000+ acts with pagination support
"""

import os
import sys
import time

# Check for required dependencies
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError as e:
    print("\n" + "="*60)
    print("[ERROR] Missing Required Libraries!")
    print("="*60)
    print("\nThe scraper needs 'beautifulsoup4' and 'requests' to work.")
    print("\nPlease install them using ONE of these commands:\n")
    print("  Option 1: python -m pip install beautifulsoup4 requests")
    print("  Option 2: pip install beautifulsoup4 requests")
    print("  Option 3: pip install -r requirements.txt")
    print("\n" + "="*60)
    print(f"\nMissing module: {e.name}")
    print("="*60 + "\n")
    sys.exit(1)

# CONFIGURATION
OUTPUT_DIR = "data/acts"
BASE_URL = "https://www.indiacode.nic.in"
MAX_PAGES = 50  # Safety limit (50 pages * 20 acts = ~1000 acts)

def create_output_dir():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"[OK] Created directory: {OUTPUT_DIR}")

def sanitize_filename(title):
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        title = title.replace(char, '_')
    return title[:100].strip() + ".pdf"

def download_pdf(url, filename):
    try:
        response = requests.get(url, stream=True, timeout=30)
        if 'pdf' not in response.headers.get('Content-Type', '').lower():
            return False
        
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except:
        return False

def main():
    print("=" * 60)
    print("PRODUCTION SCRAPER - MASSIVE DATA COLLECTION")
    print("=" * 60)
    print("This will download 1000+ Indian legal acts")
    print("Estimated time: 1-2 hours")
    print("You can leave this running overnight")
    print("=" * 60)
    
    create_output_dir()
    
    total_downloaded = 0
    total_skipped = 0
    
    # PAGINATION LOOP
    for page in range(MAX_PAGES):
        offset = page * 20
        print(f"\n[PAGE {page + 1}/{MAX_PAGES}] Scanning offset {offset}...")
        
        try:
            # Hit the browse endpoint with offset
            url = f"{BASE_URL}/handle/123456789/1362/browse?offset={offset}"
            response = requests.get(url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            links_found_on_page = 0
            
            # Find all Act links
            for link in soup.find_all('a', href=True):
                href = link['href']
                if '/show/' in href or '/bitstream/' in href:
                    full_url = BASE_URL + href if not href.startswith('http') else href
                    title = link.text.strip()
                    
                    if not title: 
                        continue
                    
                    filename = sanitize_filename(title)
                    filepath = os.path.join(OUTPUT_DIR, filename)
                    
                    # Skip if already exists (Time Saver!)
                    if os.path.exists(filepath):
                        print(f"  [SKIP] Already exists: {filename}")
                        total_skipped += 1
                        continue
                        
                    print(f"  [DOWNLOAD] {filename}")
                    if download_pdf(full_url, filename):
                        total_downloaded += 1
                        links_found_on_page += 1
                        time.sleep(1)  # Be polite to server
            
            if links_found_on_page == 0:
                print("[INFO] No more new links found. Stopping.")
                break
            
            # Progress update
            print(f"[PROGRESS] Page {page + 1}: Downloaded {links_found_on_page} new acts")
            print(f"[TOTAL] Downloaded: {total_downloaded} | Skipped: {total_skipped}")
                
        except Exception as e:
            print(f"[ERROR] Error on page {page}: {e}")
            time.sleep(5)

    print("\n" + "=" * 60)
    print("MISSION COMPLETE!")
    print(f"Total New Acts Downloaded: {total_downloaded}")
    print(f"Total Skipped (Already Existed): {total_skipped}")
    print(f"Files saved in: {OUTPUT_DIR}")
    print("=" * 60)
    print("\nNext steps:")
    print("1. python scripts/process_pdfs.py")
    print("2. python scripts/build_vector_store.py")

if __name__ == "__main__":
    main()
