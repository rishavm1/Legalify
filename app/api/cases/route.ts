import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { AuditLogger } from '@/lib/audit-logger';

// GET - List all cases for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cases, error } = await supabaseAdmin
      .from('cases')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, cases: cases || [] });
  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 });
  }
}

// POST - Create new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      caseNumber,
      caseTitle,
      caseType,
      courtName,
      filingDate,
      clientName,
      opponentName,
      caseFacts,
      legalIssues
    } = body;

    if (!caseTitle) {
      return NextResponse.json({ error: 'Case title required' }, { status: 400 });
    }

    const { data: newCase, error } = await supabaseAdmin
      .from('cases')
      .insert({
        user_id: session.user.id,
        case_number: caseNumber,
        case_title: caseTitle,
        case_type: caseType,
        court_name: courtName,
        filing_date: filingDate,
        client_name: clientName,
        opponent_name: opponentName,
        case_facts: caseFacts,
        legal_issues: legalIssues,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    await AuditLogger.log({
      userId: session.user.id,
      action: 'create_case',
      resourceType: 'case',
      resourceId: newCase.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      metadata: { caseTitle, caseType }
    });

    return NextResponse.json({ success: true, case: newCase });
  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 });
  }
}
