import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      id: 'email-password',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .eq('is_verified', true)
            .single();

          if (!user || !user.password_hash) return null;

          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isValidPassword) return null;

          return { 
            id: user.id, 
            email: user.email, 
            name: user.username || user.name,
            username: user.username 
          };
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: 'email-otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;
        
        try {
          const { data: otpRecord } = await supabaseAdmin
            .from('otps')
            .select('*')
            .eq('email', credentials.email)
            .eq('otp', credentials.otp)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (!otpRecord) return null;

          await supabaseAdmin.from('otps').delete().eq('id', otpRecord.id);

          // Mark user as verified
          await supabaseAdmin
            .from('users')
            .update({ is_verified: true })
            .eq('email', credentials.email);

          return { 
            id: credentials.email, 
            email: credentials.email,
            needsUsername: true
          };
        } catch (error) {
          console.error('OTP verification error:', error);
          return null;
        }
      },
    }),

  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
          
          if (!existingUser) {
            // Create new user
            const { data: newUser, error: insertError } = await supabaseAdmin
              .from('users')
              .insert({
                email: user.email,
                name: user.name,
                username: user.name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0],
                image: user.image,
                provider: 'google',
                is_verified: true,
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('Error creating user:', insertError);
              return false;
            }
            
            if (newUser) {
              user.id = newUser.id;
            }
          } else {
            // Existing user
            user.id = existingUser.id;
            
            // Auto-generate username if missing
            if (!existingUser.username) {
              const autoUsername = user.name?.replace(/\s+/g, '').toLowerCase() || user.email?.split('@')[0];
              await supabaseAdmin
                .from('users')
                .update({ username: autoUsername })
                .eq('id', existingUser.id);
            }
          }
        } catch (error) {
          console.error('Supabase error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, username, name')
            .eq('email', session.user.email)
            .single();
          
          if (user) {
            session.user.id = user.id;
            session.user.name = user.username || user.name || session.user.name;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  theme: {
    colorScheme: 'dark',
  },
  debug: process.env.NODE_ENV === 'development',
};
