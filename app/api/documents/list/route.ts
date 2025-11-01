import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: documents } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ documents: documents || [] });
}
