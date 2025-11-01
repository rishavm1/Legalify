import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id?: string | string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawId = params.id;
    const sessionId = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    // First delete all messages in the session
    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', session.user.id);

    // Then delete the session
    const { error } = await supabaseAdmin
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Database error deleting session:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/chat/sessions/[id]:', error);
    return NextResponse.json({ 
      error: 'Failed to delete session: ' + (error as Error).message 
    }, { status: 500 });
  }
}