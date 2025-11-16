import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { citationSystem } from '@/lib/ai/citation-system';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, type } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query provided' }, { status: 400 });
    }

    const result = await citationSystem.conductResearch(query);
    const bibliography = citationSystem.generateBibliography(result.citations);

    return NextResponse.json({
      success: true,
      research: {
        ...result,
        bibliography
      }
    });
  } catch (error) {
    console.error('Legal research error:', error);
    return NextResponse.json({ error: 'Failed to conduct research' }, { status: 500 });
  }
}
