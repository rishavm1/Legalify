import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseId = req.nextUrl.searchParams.get('caseId');
    const { data, error } = await supabase
      .from('hearings')
      .select('*')
      .eq('case_id', caseId)
      .order('hearing_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, hearings: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, hearingDate, judge, courtRoom, outcome, judgeComments, opponentArguments, nextDate } = await req.json();

    const { data, error } = await supabase
      .from('hearings')
      .insert({
        case_id: caseId,
        hearing_date: hearingDate,
        judge,
        court_room: courtRoom,
        outcome,
        judge_comments: judgeComments,
        opponent_arguments: opponentArguments,
        next_hearing_date: nextDate,
      })
      .select()
      .single();

    if (error) throw error;
    await logAudit(session.user.email, 'hearing_added', req, { caseId, hearingDate });
    return NextResponse.json({ success: true, hearing: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
