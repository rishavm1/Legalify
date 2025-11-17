#!/usr/bin/env python3
"""
PDF Processing Script for Legalify
Converts PDFs from data/acts to clean text files for RAG system
"""

import os
from pathlib import Path
import re

def clean_text(text):
    """Clean extracted text by removing extra whitespace and common artifacts"""
    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common PDF artifacts
    text = re.sub(r'Page \d+', '', text)
    text = re.sub(r'^\d+\s*$', '', text, flags=re.MULTILINE)
    
    # Remove header/footer patterns (common in legal docs)
    text = re.sub(r'^.*?©.*?$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^.*?www\..*?$', '', text, flags=re.MULTILINE)
    
    # Clean up line breaks
    text = text.strip()
    
    return text

def process_text_file(text_path, output_dir):
    """Clean and process existing text files"""
    try:
        # Read existing text file
        with open(text_path, 'r', encoding='utf-8') as f:
            full_text = f.read()
        
        # Clean the text
        cleaned_text = clean_text(full_text)
        
        # Save to output file
        text_name = Path(text_path).stem
        output_file = output_dir / f"{text_name}_processed.txt"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(cleaned_text)
        
        return True, len(cleaned_text)
    
    except Exception as e:
        print(f"Error processing {text_path}: {str(e)}")
        return False, 0

def main():
    """Main processing function"""
    # Setup directories
    base_dir = Path(__file__).parent.parent
    input_dir = base_dir / "data" / "legal_acts"
    output_dir = base_dir / "data" / "processed_text"
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Find all text files (already processed)
    text_files = list(input_dir.glob("*.txt"))
    
    if not text_files:
        print(f"No text files found in {input_dir}")
        return
    
    print(f"Found {len(text_files)} text files to process")
    print("-" * 50)
    
    processed = 0
    total_chars = 0
    
    for i, text_file in enumerate(text_files, 1):
        print(f"Processing {i}/{len(text_files)}: {text_file.name}")
        
        success, char_count = process_text_file(text_file, output_dir)
        
        if success:
            processed += 1
            total_chars += char_count
            print(f"  [OK] Extracted {char_count:,} characters")
        else:
            print(f"  [ERROR] Failed to process")
    
    print("-" * 50)
    print(f"Processing complete!")
    print(f"Successfully processed: {processed}/{len(text_files)} files")
    print(f"Total text extracted: {total_chars:,} characters")
    print(f"Output directory: {output_dir}")

if __name__ == "__main__":
    main()