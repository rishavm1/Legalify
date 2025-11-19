import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface KnowledgeBaseDoc {
  title: string;
  content: string;
  keywords: string[];
  source: string;
  length: number;
}

// Load knowledge base
let knowledgeBase: KnowledgeBaseDoc[] = [];
try {
  const kbPath = path.join(process.cwd(), 'data', 'simple_knowledge_base.json');
  const kbData = fs.readFileSync(kbPath, 'utf-8');
  knowledgeBase = JSON.parse(kbData);
} catch (error) {
  console.error('Failed to load knowledge base:', error);
}

// Simple keyword search
function searchKnowledgeBase(query: string, topK: number = 3): KnowledgeBaseDoc[] {
  const queryWords = new Set(query.toLowerCase().split(/\s+/));
  const results: Array<{ score: number; doc: KnowledgeBaseDoc }> = [];

  for (const doc of knowledgeBase) {
    let score = 0;
    
    // Title matches (weight: 3)
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) {
        score += 3;
      }
    }
    
    // Content matches (weight: 1)
    for (const word of queryWords) {
      if (doc.content.toLowerCase().includes(word)) {
        score += 1;
      }
    }
    
    // Keyword matches (weight: 2)
    for (const word of queryWords) {
      if (doc.keywords.some(k => k.toLowerCase().includes(word))) {
        score += 2;
      }
    }
    
    if (score > 0) {
      results.push({ score, doc });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK).map(r => r.doc);
}

// Generate AI response using OpenRouter
async function generateAIResponse(query: string, context: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  
  if (!apiKey) {
    return `Based on Indian legal documents:\n\n${context.substring(0, 500)}...\n\n(AI response generation unavailable - API key not configured)`;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://legalifylunatics.vercel.app',
        'X-Title': 'Legalify'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful Indian legal assistant. Answer questions based on the provided legal documents. Be accurate, cite sources, and explain in simple language. If you don\'t know, say so.'
          },
          {
            role: 'user',
            content: `Question: ${query}\n\nRelevant Legal Documents:\n${context}\n\nProvide a clear, accurate answer based on these documents.`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate response.';
  } catch (error) {
    console.error('AI generation error:', error);
    return `Based on Indian legal documents:\n\n${context.substring(0, 500)}...\n\n(AI response generation failed - using fallback)`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, language } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // Search knowledge base
    const relevantDocs = searchKnowledgeBase(query, 3);

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        response: 'I couldn\'t find relevant information in the legal database. Please try rephrasing your question or ask about Indian Constitutional Amendments, IPC, CrPC, or other major Indian laws.',
        sources: []
      });
    }

    // Prepare context for AI
    const context = relevantDocs
      .map((doc, i) => `[${i + 1}] ${doc.title}\n${doc.content.substring(0, 1000)}`)
      .join('\n\n');

    // Generate AI response
    const aiResponse = await generateAIResponse(query, context);

    // Prepare sources
    const sources = relevantDocs.map(doc => doc.title);

    return NextResponse.json({
      response: aiResponse,
      sources: sources
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Legalify Chat API',
    documents: knowledgeBase.length
  });
}
