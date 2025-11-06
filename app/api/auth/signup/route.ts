import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      // If user exists but is not verified, allow re-signup (update password)
      if (!existingUser.is_verified) {
        const passwordHash = await bcrypt.hash(password, 12);
        await supabaseAdmin
          .from('users')
          .update({ password_hash: passwordHash })
          .eq('email', email);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Account found. Please verify your email.' 
        });
      }
      
      // User exists and is verified
      return NextResponse.json({ error: 'User already exists. Please sign in.' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user (not verified yet)
    await supabaseAdmin.from('users').insert({
      email,
      password_hash: passwordHash,
      is_verified: false,
    });

    return NextResponse.json({ success: true, message: 'User created. Please verify your email.' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}