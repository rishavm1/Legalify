import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { grammarChecker } from '@/lib/ai/grammar-checker';
import { AuditLogger } from '@/lib/audit-logger';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid text provided' }, { status: 400 });
    }

    const [grammarErrors, legalErrors] = await Promise.all([
      grammarChecker.checkGrammar(text),
      grammarChecker.checkLegalErrors(text)
    ]);

    const totalIssues = grammarErrors.length + legalErrors.length;
    const score = Math.max(0, 100 - (totalIssues * 2));

    await AuditLogger.log({
      userId: session.user.id,
      action: 'review_draft',
      resourceType: 'review',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { textLength: text.length, score, totalIssues }
    });

    return NextResponse.json({
      success: true,
      analysis: {
        score,
        grammarErrors,
        legalErrors,
        summary: {
          totalIssues,
          grammarIssues: grammarErrors.length,
          legalIssues: legalErrors.length,
          highSeverity: legalErrors.filter(e => e.severity === 'high').length,
          mediumSeverity: legalErrors.filter(e => e.severity === 'medium').length,
          lowSeverity: legalErrors.filter(e => e.severity === 'low').length
        }
      }
    });
  } catch (error) {
    console.error('Review draft error:', error);
    return NextResponse.json({ error: 'Failed to review draft' }, { status: 500 });
  }
}
