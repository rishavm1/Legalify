import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const memoryType = searchParams.get('type');

    let query = supabaseAdmin
      .from('user_memory')
      .select('*')
      .eq('user_id', session.user.id);

    if (memoryType) {
      query = query.eq('memory_type', memoryType);
    }

    const { data: memories, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ memories });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user memory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memoryType, key, value } = await request.json();

    const { data: memory, error } = await supabaseAdmin
      .from('user_memory')
      .upsert({
        user_id: session.user.id,
        memory_type: memoryType,
        key,
        value,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ memory });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save user memory' }, { status: 500 });
  }
}