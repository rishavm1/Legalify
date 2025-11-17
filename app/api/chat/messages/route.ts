import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';
import { Encryption } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Verify session belongs to user
    const { data: chatSession } = await supabaseAdmin
      .from('chat_sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single();

    if (!chatSession || chatSession.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Decrypt messages
    const decryptedMessages = (messages || []).map(msg => ({
      ...msg,
      content: msg.metadata?.encrypted ? Encryption.decrypt(msg.content) : msg.content
    }));

    return NextResponse.json({ messages: decryptedMessages });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, role, content, metadata } = await request.json();

    const { data: message, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        role,
        content,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    // Update session timestamp
    await supabaseAdmin
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}