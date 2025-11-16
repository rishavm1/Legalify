import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { citationSystem } from '@/lib/ai/citation-system';
import { AuditLogger } from '@/lib/audit-logger';
import { RBAC } from '@/lib/rbac';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = (session.user as any).role || 'free';
    if (!RBAC.canAccessFeature(userRole, 'legal-research')) {
      return NextResponse.json({ 
        error: RBAC.getUpgradeMessage('Legal Research') 
      }, { status: 403 });
    }

    const { query, type } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query provided' }, { status: 400 });
    }

    const result = await citationSystem.conductResearch(query);
    const bibliography = citationSystem.generateBibliography(result.citations);

    await AuditLogger.log({
      userId: session.user.id,
      action: 'legal_research',
      resourceType: 'research',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { query, citationsFound: result.citations.length }
    });

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
