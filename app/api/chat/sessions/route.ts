import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET sessions - Session data:', session);
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.id) {
      console.log('No user ID found in session');
      return NextResponse.json({ error: 'User ID not found' }, { status: 401 });
    }

    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Database error fetching sessions:', error);
      throw error;
    }

    console.log('Sessions fetched:', sessions?.length || 0);
    return NextResponse.json({ sessions: sessions || [] });
  } catch (error) {
    console.error('Error in GET /api/chat/sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sessions: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session data:', session);
    
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    if (!session.user.id) {
      console.log('No user ID found in session');
      return NextResponse.json({ error: 'User ID not found - Please sign in again' }, { status: 401 });
    }

    const { title } = await request.json();
    console.log('Creating session for user:', session.user.id, 'with title:', title);

    // First check if user exists in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      console.log('User not found in database, creating user:', userError);
      // Create user if doesn't exist
      const { data: newUser, error: createUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          is_verified: true
        })
        .select()
        .single();
      
      if (createUserError) {
        console.error('Failed to create user:', createUserError);
        return NextResponse.json({ error: 'Failed to create user: ' + createUserError.message }, { status: 500 });
      }
    }

    const { data: newSession, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        user_id: session.user.id,
        title: title || 'New Chat'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating session:', error);
      throw error;
    }

    console.log('Session created successfully:', newSession);
    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Error in POST /api/chat/sessions:', error);
    return NextResponse.json({ 
      error: 'Failed to create session: ' + (error as Error).message 
    }, { status: 500 });
  }
}