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
    """Fetch links to legal acts from ALL pages with pagination"""
    try:
        all_links = []
        page = 0
        max_pages = 50  # Safety limit: ~1000 acts
        
        print("Fetching act links from indiacode.nic.in...")
        print("This will take several minutes. Please wait...\n")
        
        while page < max_pages:
            try:
                # Pagination: offset increases by 20 per page
                offset = page * 20
                url = f"{BASE_URL}/handle/123456789/1362/browse?offset={offset}"
                
                print(f"[PAGE {page + 1}/{max_pages}] Fetching from offset {offset}...")
                response = requests.get(url, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.content, 'html.parser')
                page_links = []
                
                # Find all links that contain 'show' or 'bitstream' in href
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    if '/show/' in href or '/bitstream/' in href:
                        full_url = BASE_URL + href if not href.startswith('http') else href
                        title = link.text.strip() or 'Unknown Act'
                        
                        # Avoid duplicates
                        if not any(l['url'] == full_url for l in all_links):
                            page_links.append({'url': full_url, 'title': title})
                
                if not page_links:
                    print(f"[INFO] No more acts found on page {page + 1}. Stopping.")
                    break
                
                all_links.extend(page_links)
                print(f"  Found {len(page_links)} acts on this page. Total: {len(all_links)}")
                
                page += 1
                time.sleep(2)  # Be polite to server
                
            except requests.exceptions.RequestException as e:
                print(f"[ERROR] Error on page {page + 1}: {e}")
                break
        
        print(f"\n[OK] Total acts found: {len(all_links)}")
        return all_links  # Return ALL acts, no limit
        
    except Exception as e:
        print(f"[ERROR] Fatal error fetching act links: {e}")
        return []

def download_pdf(url, filename, index):
    """Download a single PDF file"""
    try:
        print(f"Downloading Act {index}: {filename}...")
        
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
    
    total_acts = len(act_links)
    print(f"\nStarting download of {total_acts} acts...\n")
    print("This will take several hours. You can leave it running overnight.\n")
    
    success_count = 0
    for index, act in enumerate(act_links, 1):
        filename = sanitize_filename(act['title'])
        
        if download_pdf(act['url'], filename, index):
            success_count += 1
        
        # Progress update every 50 acts
        if index % 50 == 0:
            print(f"\n[PROGRESS] Downloaded {success_count}/{index} acts successfully ({(success_count/index)*100:.1f}% success rate)\n")
        
        if index < total_acts:
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
