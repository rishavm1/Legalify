#!/usr/bin/env python3
"""
Vector Store Builder for Legalify RAG System
Creates FAISS index using InLegalBERT embeddings from processed legal texts
"""

import os
from pathlib import Path
from langchain_community.document_loaders import TextLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document

def load_documents(text_dir):
    """Load all text files from processed_text directory"""
    documents = []
    text_files = list(Path(text_dir).glob("*.txt"))
    
    if not text_files:
        raise FileNotFoundError(f"No text files found in {text_dir}. Run process_pdfs.py first.")
    
    print(f"Loading {len(text_files)} text files...")
    
    for file_path in text_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Create document with metadata
            doc = Document(
                page_content=content,
                metadata={
                    "source": file_path.name,
                    "act_name": file_path.stem.replace("_processed", "")
                }
            )
            documents.append(doc)
            print(f"  ✓ Loaded: {file_path.name}")
            
        except Exception as e:
            print(f"  ✗ Error loading {file_path.name}: {e}")
    
    return documents

def split_documents(documents):
    """Split documents into chunks for better retrieval"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len,
        separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""]
    )
    
    print("Splitting documents into chunks...")
    chunks = text_splitter.split_documents(documents)
    print(f"Created {len(chunks)} text chunks")
    
    return chunks

def create_embeddings():
    """Initialize InLegalBERT embeddings"""
    print("Loading InLegalBERT embedding model...")
    
    embeddings = HuggingFaceEmbeddings(
        model_name="law-ai/InLegalBERT",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )
    
    print("✓ InLegalBERT model loaded successfully")
    return embeddings

def build_vector_store(chunks, embeddings, output_dir):
    """Create and save FAISS vector store"""
    print("Building FAISS vector store...")
    
    # Create vector store from documents
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )
    
    # Create output directory
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    # Save the vector store
    vector_store.save_local(output_dir)
    
    print(f"✓ Vector store saved to: {output_dir}")
    return vector_store

def main():
    """Main function to build the RAG knowledge base"""
    print("🚀 Building Legalify RAG Vector Store")
    print("=" * 50)
    
    # Setup paths
    base_dir = Path(__file__).parent.parent
    text_dir = base_dir / "data" / "processed_text"
    output_dir = base_dir / "data" / "vector_store"
    
    try:
        # Step 1: Load documents
        documents = load_documents(text_dir)
        
        # Step 2: Split into chunks
        chunks = split_documents(documents)
        
        # Step 3: Create embeddings
        embeddings = create_embeddings()
        
        # Step 4: Build vector store
        vector_store = build_vector_store(chunks, embeddings, output_dir)
        
        print("=" * 50)
        print(f"🎉 SUCCESS: Vector Store built with {len(chunks)} chunks")
        print(f"📁 Location: {output_dir}")
        print("🔍 Ready for RAG queries!")
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        print("Make sure you have run 'python scripts/process_pdfs.py' first")

if __name__ == "__main__":
    main()