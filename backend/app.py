#!/usr/bin/env python3
"""
Legalify Flask API Server
Exposes RAG system via REST API for Frontend integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from pathlib import Path
import traceback

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

# Global variables for RAG components
vector_store = None
embeddings = None
app = Flask(__name__)

def load_rag_system():
    """Load RAG components on startup"""
    global vector_store, embeddings
    
    try:
        print("[STARTUP] Loading RAG system...")
        
        # Try to import required libraries
        try:
            from langchain_community.vectorstores import FAISS
            from langchain_huggingface import HuggingFaceEmbeddings
            
            # Load embeddings
            print("[STARTUP] Loading InLegalBERT embeddings...")
            embeddings = HuggingFaceEmbeddings(
                model_name="law-ai/InLegalBERT",
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            
            # Load vector store
            base_dir = Path(__file__).parent.parent
            vector_store_path = base_dir / "data" / "vector_store"
            
            if vector_store_path.exists():
                print(f"[STARTUP] Loading vector store from {vector_store_path}")
                vector_store = FAISS.load_local(
                    str(vector_store_path), 
                    embeddings,
                    allow_dangerous_deserialization=True
                )
                print("[STARTUP] ✅ RAG system loaded successfully!")
                return True
            else:
                print(f"[ERROR] Vector store not found at {vector_store_path}")
                return False
                
        except ImportError as e:
            print(f"[ERROR] Missing dependencies: {e}")
            print("[INFO] Falling back to simple search...")
            return load_simple_search()
            
    except Exception as e:
        print(f"[ERROR] Failed to load RAG system: {e}")
        traceback.print_exc()
        return load_simple_search()

def load_simple_search():
    """Fallback to simple keyword search"""
    global vector_store
    
    try:
        import json
        base_dir = Path(__file__).parent.parent
        kb_file = base_dir / "data" / "simple_knowledge_base.json"
        
        if kb_file.exists():
            with open(kb_file, 'r', encoding='utf-8') as f:
                vector_store = json.load(f)
            print("[STARTUP] ✅ Simple search system loaded!")
            return True
        else:
            print(f"[ERROR] Knowledge base not found at {kb_file}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Failed to load simple search: {e}")
        return False

def simple_search(query, max_results=3):
    """Simple keyword-based search fallback"""
    if not vector_store or 'documents' not in vector_store:
        return []
    
    query_words = query.lower().split()
    results = []
    
    for doc_name, doc_data in vector_store['documents'].items():
        content = doc_data['content'].lower()
        score = 0
        
        # Count keyword matches
        for word in query_words:
            score += content.count(word)
        
        if score > 0:
            results.append({
                'content': doc_data['content'],
                'source': doc_name,
                'score': score
            })
    
    # Sort by relevance score
    results.sort(key=lambda x: x['score'], reverse=True)
    return results[:max_results]

def advanced_search(query, max_results=3):
    """Advanced vector similarity search"""
    try:
        if not vector_store or not embeddings:
            return simple_search(query, max_results)
        
        # Perform similarity search
        results = vector_store.similarity_search(query, k=max_results)
        
        formatted_results = []
        for doc in results:
            formatted_results.append({
                'content': doc.page_content,
                'source': doc.metadata.get('act_name', 'Unknown'),
                'score': 1.0  # FAISS doesn't return scores by default
            })
        
        return formatted_results
        
    except Exception as e:
        print(f"[ERROR] Advanced search failed: {e}")
        return simple_search(query, max_results)

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for legal queries"""
    try:
        # Get request data
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Query is required'}), 400
        
        query = data['query'].strip()
        language = data.get('language', 'en')
        
        if not query:
            return jsonify({'error': 'Query cannot be empty'}), 400
        
        print(f"[QUERY] {query}")
        
        # Search for relevant documents
        if embeddings and hasattr(vector_store, 'similarity_search'):
            results = advanced_search(query)
        else:
            results = simple_search(query)
        
        if not results:
            return jsonify({
                'response': 'I could not find relevant information in the legal database for your query. Please try rephrasing your question.',
                'sources': []
            })
        
        # Format response
        combined_text = ""
        sources = []
        
        for i, result in enumerate(results):
            combined_text += f"{result['content']}\n\n"
            sources.append(result['source'])
        
        # Create response
        response_text = f"Based on Indian Law, here is what I found:\n\n{combined_text.strip()}"
        
        print(f"[RESPONSE] Found {len(results)} relevant documents")
        
        return jsonify({
            'response': response_text,
            'sources': sources
        })
        
    except Exception as e:
        print(f"[ERROR] Chat endpoint error: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    status = {
        'status': 'healthy',
        'rag_system': 'loaded' if vector_store else 'not_loaded',
        'embeddings': 'loaded' if embeddings else 'not_loaded'
    }
    return jsonify(status)

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Legalify RAG API Server',
        'version': '1.0.0',
        'endpoints': {
            'chat': 'POST /api/chat',
            'health': 'GET /api/health'
        }
    })

def main():
    """Main function to start the server"""
    print("🚀 Starting Legalify RAG API Server")
    print("=" * 50)
    
    # Load RAG system
    if not load_rag_system():
        print("[WARNING] RAG system not fully loaded, using fallback")
    
    # Enable CORS for all routes
    CORS(app, origins=["http://localhost:3000", "https://legalifylunatics.vercel.app"])
    
    print("\n📡 Server Configuration:")
    print("- Port: 5000")
    print("- CORS: Enabled")
    print("- Endpoints: /api/chat, /api/health")
    print("\n🔗 Frontend Integration:")
    print("- React: http://localhost:3000")
    print("- Production: https://legalifylunatics.vercel.app")
    print("\n✅ Server ready for legal queries!")
    print("=" * 50)
    
    # Start Flask server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )

if __name__ == "__main__":
    main()