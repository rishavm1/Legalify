import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nerExtractor } from '@/lib/ai/ner-extractor';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, filename } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text provided' }, { status: 400 });
    }

    const entities = nerExtractor.extractEntities(text);
    const facts = nerExtractor.extractFacts(text);
    const summary = nerExtractor.generateSummary(facts);

    return NextResponse.json({
      success: true,
      analysis: {
        filename: filename || 'document.pdf',
        entities,
        facts,
        summary,
        statistics: {
          totalEntities: entities.length,
          parties: facts.parties.length,
          dates: facts.dates.length,
          amounts: facts.amounts.length,
          locations: facts.locations.length,
          legalReferences: facts.statutes.length
        }
      }
    });
  } catch (error) {
    console.error('PDF analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze PDF' }, { status: 500 });
  }
}
