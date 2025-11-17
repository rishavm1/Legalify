import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db';
import { logAudit } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { caseId, facts, issues, hearingHistory } = await req.json();

    const strategy = await generateStrategy(facts, issues, hearingHistory);

    const { data, error } = await supabase
      .from('ai_strategies')
      .insert({
        case_id: caseId,
        strategy_type: 'court_appearance',
        strategy_content: strategy.content,
        confidence_score: strategy.confidence,
        key_points: strategy.keyPoints,
        counter_arguments: strategy.counterArguments,
        precedents_to_cite: strategy.precedents,
      })
      .select()
      .single();

    if (error) throw error;
    await logAudit(session.user.email, 'strategy_generated', req, { caseId });
    return NextResponse.json({ success: true, strategy: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateStrategy(facts: string, issues: string[], hearingHistory: any[]) {
  const lastHearing = hearingHistory[0];
  const judgeComments = lastHearing?.judge_comments || '';
  const opponentArgs = lastHearing?.opponent_arguments || '';

  return {
    content: `Based on case facts and hearing history:\n\n1. Address judge's concerns: ${judgeComments}\n2. Counter opponent's arguments: ${opponentArgs}\n3. Focus on key legal issues: ${issues.join(', ')}\n4. Present strong precedents\n5. Maintain professional demeanor`,
    confidence: 0.85,
    keyPoints: [
      'Emphasize factual strengths',
      'Address legal precedents',
      'Counter opponent weaknesses',
      'Respond to judge queries',
    ],
    counterArguments: [
      'Anticipate opponent objections',
      'Prepare rebuttal points',
      'Have backup arguments ready',
    ],
    precedents: [
      'Relevant Supreme Court cases',
      'High Court precedents',
      'Similar fact patterns',
    ],
  };
}
