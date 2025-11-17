#!/usr/bin/env python3
"""
Scrape Indian legal acts from indiacode.nic.in
"""
import os
import requests
from bs4 import BeautifulSoup
import time

OUTPUT_DIR = "data/acts"
BASE_URL = "https://www.indiacode.nic.in"

def create_output_dir():
    """Create output directory if it doesn't exist"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"[OK] Output directory ready: {OUTPUT_DIR}")

def fetch_act_links():
    """Fetch links to legal acts from the homepage"""
    try:
        print("Fetching act links from indiacode.nic.in...")
        response = requests.get(f"{BASE_URL}/handle/123456789/1362/browse", timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        links = []
        
        # Find all links that contain 'show' in href (act detail pages)
        for link in soup.find_all('a', href=True):
            href = link['href']
            if '/show/' in href or '/bitstream/' in href:
                full_url = BASE_URL + href if not href.startswith('http') else href
                title = link.text.strip() or 'Unknown Act'
                links.append({'url': full_url, 'title': title})
        
        print(f"[OK] Found {len(links)} potential act links")
        return links[:10]  # Return first 10
        
    except Exception as e:
        print(f"[ERROR] Error fetching act links: {e}")
        return []

def download_pdf(url, filename, index):
    """Download a single PDF file"""
    try:
        print(f"Downloading Act {index}/10: {filename}...")
        
        response = requests.get(url, timeout=60, stream=True)
        response.raise_for_status()
        
        # Check if response is actually a PDF
        content_type = response.headers.get('Content-Type', '')
        if 'pdf' not in content_type.lower():
            print(f"  [SKIP] Not a PDF: {content_type}")
            return False
        
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        file_size = os.path.getsize(filepath) / 1024  # KB
        print(f"  [SUCCESS] Downloaded: {filename} ({file_size:.1f} KB)")
        return True
        
    except requests.exceptions.Timeout:
        print(f"  [ERROR] Timeout downloading {filename}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"  [ERROR] Error downloading {filename}: {e}")
        return False
    except Exception as e:
        print(f"  [ERROR] Unexpected error: {e}")
        return False

def sanitize_filename(title):
    """Convert title to safe filename"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        title = title.replace(char, '_')
    
    title = title[:100].strip()
    if not title.endswith('.pdf'):
        title += '.pdf'
    
    return title

def main():
    """Main scraping function"""
    print("=" * 60)
    print("INDIAN LEGAL ACTS SCRAPER")
    print("=" * 60)
    
    create_output_dir()
    act_links = fetch_act_links()
    
    if not act_links:
        print("\n[ERROR] No acts found to download")
        return
    
    print(f"\nStarting download of {len(act_links)} acts...\n")
    
    success_count = 0
    for index, act in enumerate(act_links, 1):
        filename = sanitize_filename(act['title'])
        
        if download_pdf(act['url'], filename, index):
            success_count += 1
        
        if index < len(act_links):
            time.sleep(2)
    
    print("\n" + "=" * 60)
    print(f"DOWNLOAD COMPLETE")
    print(f"Successfully downloaded: {success_count}/{len(act_links)} acts")
    print(f"Files saved in: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[ERROR] Download interrupted by user")
    except Exception as e:
        print(f"\n[ERROR] Fatal error: {e}")
