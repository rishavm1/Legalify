#!/usr/bin/env python3
"""
Extract text from PDFs in data/acts/ and save to data/processed_text/
"""

import os
import re

try:
    from PyPDF2 import PdfReader
except ImportError:
    print("[ERROR] PyPDF2 not installed. Run: pip install PyPDF2")
    exit(1)

INPUT_DIR = "data/acts"
OUTPUT_DIR = "data/processed_text"

def clean_text(text):
    """Clean extracted text"""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\n+', '\n', text)
    return text.strip()

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return clean_text(text)
    except Exception as e:
        print(f"  [ERROR] {os.path.basename(pdf_path)}: {e}")
        return None

def main():
    print("="*60)
    print("PDF TEXT EXTRACTION")
    print("="*60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    pdf_files = [f for f in os.listdir(INPUT_DIR) if f.endswith('.pdf')]
    print(f"Found {len(pdf_files)} PDF files\n")
    
    processed = 0
    failed = 0
    
    for pdf_file in pdf_files:
        pdf_path = os.path.join(INPUT_DIR, pdf_file)
        txt_file = pdf_file.replace('.pdf', '.txt')
        txt_path = os.path.join(OUTPUT_DIR, txt_file)
        
        if os.path.exists(txt_path):
            print(f"  [SKIP] {pdf_file}")
            continue
        
        print(f"  [PROCESSING] {pdf_file}")
        text = extract_text_from_pdf(pdf_path)
        
        if text:
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(text)
            print(f"  [OK] Extracted {len(text)} chars")
            processed += 1
        else:
            failed += 1
    
    print("\n" + "="*60)
    print(f"[OK] Processed: {processed}")
    print(f"[FAIL] Failed: {failed}")
    print(f"[DIR] Text files saved in: {OUTPUT_DIR}")
    print("="*60)

if __name__ == "__main__":
    main()
