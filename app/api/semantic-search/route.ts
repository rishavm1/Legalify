import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VectorSearch } from '@/lib/vector-search';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, limit } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const results = await VectorSearch.searchSimilar(query, session.user.id, limit || 10);

    await AuditLogger.log({
      userId: session.user.id,
      action: 'semantic_search',
      resourceType: 'search',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { query, resultsCount: results.length }
    });

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Semantic search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, documentType, metadata } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const embeddingId = await VectorSearch.storeEmbedding(
      session.user.id,
      title,
      content,
      documentType || 'document',
      metadata
    );

    return NextResponse.json({ success: true, embeddingId });
  } catch (error) {
    console.error('Store embedding error:', error);
    return NextResponse.json({ error: 'Failed to store' }, { status: 500 });
  }
}
