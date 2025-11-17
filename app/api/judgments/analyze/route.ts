import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { judgmentText, caseNumber } = await req.json();

    const analysis = {
      caseNumber,
      court: extractCourt(judgmentText),
      judges: extractJudges(judgmentText),
      parties: extractParties(judgmentText),
      facts: extractFacts(judgmentText),
      issues: extractIssues(judgmentText),
      precedents: extractPrecedents(judgmentText),
      decision: extractDecision(judgmentText),
      citations: extractCitations(judgmentText),
      summary: generateSummary(judgmentText),
    };

    await logAudit(session.user.email, 'judgment_analysis', req, { caseNumber });
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function extractCourt(text: string): string {
  const match = text.match(/Supreme Court of India|High Court of ([A-Za-z\s]+)|District Court/i);
  return match?.[0] || 'Unknown Court';
}

function extractJudges(text: string): string[] {
  const matches = [...text.matchAll(/(?:Justice|J\.) ([A-Z][a-z]+ [A-Z][a-z]+)/g)];
  return [...new Set(matches.map(m => m[1]))].slice(0, 5);
}

function extractParties(text: string): { petitioner: string; respondent: string } {
  const match = text.match(/([A-Z][A-Za-z\s]+)\s+(?:v\.|vs\.?)\s+([A-Z][A-Za-z\s]+)/i);
  return { petitioner: match?.[1]?.trim() || 'Unknown', respondent: match?.[2]?.trim() || 'Unknown' };
}

function extractFacts(text: string): string[] {
  const section = text.match(/FACTS?:?\s*([\s\S]{0,2000})/i);
  return section?.[1].split(/\.\s+/).filter(s => s.length > 20).slice(0, 5) || [];
}

function extractIssues(text: string): string[] {
  const section = text.match(/ISSUES?:?\s*([\s\S]{0,1000})/i);
  return section?.[1].split(/\n/).filter(s => s.trim().length > 10).slice(0, 3) || [];
}

function extractPrecedents(text: string): string[] {
  const matches = [...text.matchAll(/([A-Z][A-Za-z\s]+v\.\s*[A-Z][A-Za-z\s]+(?:\(\d{4}\))?)/g)];
  return [...new Set(matches.map(m => m[1]))].slice(0, 10);
}

function extractDecision(text: string): string {
  const match = text.match(/(?:HELD|DECISION):?\s*([\s\S]{0,500})/i);
  return match?.[1]?.trim() || 'Decision not stated';
}

function extractCitations(text: string): string[] {
  const matches = [...text.matchAll(/\(?\d{4}\)?\s+\d+\s+[A-Z]{3,}\s+\d+/g)];
  return [...new Set(matches.map(m => m[0]))].slice(0, 10);
}

function generateSummary(text: string): string {
  return text.substring(0, 500).split('.')[0] + '...';
}
