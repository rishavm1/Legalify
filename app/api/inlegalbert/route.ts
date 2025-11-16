import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inlegalbert } from '@/lib/ai/inlegalbert-client';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, text, caseFacts } = await request.json();

    let result;
    switch (action) {
      case 'extract_entities':
        result = await inlegalbert.extractLegalEntities(text);
        break;
      case 'segment_document':
        result = await inlegalbert.segmentDocument(text);
        break;
      case 'identify_statutes':
        result = await inlegalbert.identifyStatutes(caseFacts || text);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await AuditLogger.log({
      userId: session.user.id,
      action: `inlegalbert_${action}`,
      resourceType: 'ai_analysis',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { action, textLength: text?.length || caseFacts?.length }
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('InLegalBERT error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
