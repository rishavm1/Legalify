import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { templateId, answers, document } = await req.json();

  await supabaseAdmin.from('documents').insert({
    user_id: session.user.id,
    template_id: templateId,
    answers,
    document,
  });

  return NextResponse.json({ success: true });
}
