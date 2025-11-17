"""
Script to scrape Indian legal acts from indiacode.nic.in
This builds the foundation for RAG system
"""

import requests
from bs4 import BeautifulSoup
import PyPDF2
import os
import time
from pathlib import Path

class IndianLawScraper:
    def __init__(self, output_dir="data/legal_acts"):
        self.base_url = "https://www.indiacode.nic.in"
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def get_all_acts(self):
        """Get list of all central acts"""
        url = f"{self.base_url}/handle/123456789/1362/browse"
        
        try:
            response = requests.get(url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            acts = []
            # Find all act links
            for link in soup.find_all('a', href=True):
                if '/show/' in link['href']:
                    acts.append({
                        'title': link.text.strip(),
                        'url': self.base_url + link['href']
                    })
            
            return acts
        except Exception as e:
            print(f"Error fetching acts list: {e}")
            return []
    
    def download_act_pdf(self, act_url, act_title):
        """Download PDF of an act"""
        try:
            response = requests.get(act_url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find PDF download link
            pdf_link = soup.find('a', text='Download PDF')
            if pdf_link and pdf_link.get('href'):
                pdf_url = self.base_url + pdf_link['href']
                
                # Download PDF
                pdf_response = requests.get(pdf_url, timeout=60)
                
                # Save PDF
                filename = f"{act_title[:50].replace('/', '_')}.pdf"
                filepath = self.output_dir / filename
                
                with open(filepath, 'wb') as f:
                    f.write(pdf_response.content)
                
                print(f"Downloaded: {filename}")
                return filepath
            
        except Exception as e:
            print(f"Error downloading {act_title}: {e}")
        
        return None
    
    def extract_text_from_pdf(self, pdf_path):
        """Extract text from PDF using PyPDF2"""
        try:
            text = ""
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            
            return text
        except Exception as e:
            print(f"Error extracting text from {pdf_path}: {e}")
            return ""
    
    def save_as_txt(self, text, act_title):
        """Save extracted text as .txt file"""
        filename = f"{act_title[:50].replace('/', '_')}.txt"
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"Saved text: {filename}")
        return filepath
    
    def scrape_all(self, limit=None):
        """Main function to scrape all acts"""
        print("Fetching list of acts...")
        acts = self.get_all_acts()
        
        if limit:
            acts = acts[:limit]
        
        print(f"Found {len(acts)} acts to process")
        
        for i, act in enumerate(acts, 1):
            print(f"\n[{i}/{len(acts)}] Processing: {act['title']}")
            
            # Download PDF
            pdf_path = self.download_act_pdf(act['url'], act['title'])
            
            if pdf_path:
                # Extract text
                text = self.extract_text_from_pdf(pdf_path)
                
                if text:
                    # Save as txt
                    self.save_as_txt(text, act['title'])
                
                # Delete PDF to save space
                os.remove(pdf_path)
            
            # Rate limiting
            time.sleep(2)
        
        print(f"\n✅ Scraping complete! Files saved in: {self.output_dir}")

# Priority acts to scrape first
PRIORITY_ACTS = [
    "Indian Penal Code, 1860",
    "Code of Criminal Procedure, 1973",
    "Code of Civil Procedure, 1908",
    "Indian Contract Act, 1872",
    "Transfer of Property Act, 1882",
    "Indian Evidence Act, 1872",
    "Constitution of India",
    "Real Estate (Regulation and Development) Act, 2016",
    "Consumer Protection Act, 2019",
    "Companies Act, 2013",
    "Information Technology Act, 2000",
    "Arbitration and Conciliation Act, 1996",
    "Limitation Act, 1963",
    "Registration Act, 1908",
    "Indian Succession Act, 1925"
]

if __name__ == "__main__":
    scraper = IndianLawScraper()
    
    # Start with priority acts (limit=15)
    print("Starting to scrape Indian legal acts...")
    print("This will take some time. Please be patient.\n")
    
    scraper.scrape_all(limit=15)  # Start with 15 priority acts
