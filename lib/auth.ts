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

          // Mark user as verified and return for username creation
          await supabaseAdmin
            .from('users')
            .upsert({ 
              email: credentials.email, 
              is_verified: true 
            }, { 
              onConflict: 'email' 
            });

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
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (!existingUser) {
            const { data: newUser } = await supabaseAdmin.from('users').insert({
              email: user.email,
              name: user.name,
              image: user.image,
              provider: 'google',
              is_verified: true,
            }).select().single();
            
            if (newUser) {
              user.id = newUser.id;
            }
          } else {
            user.id = existingUser.id;
            if (!existingUser.username) {
              (user as any).needsUsername = true;
            }
          }
        } catch (error) {
          console.error('Supabase error during sign in:', error);
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
  },
  session: {
    strategy: 'jwt',
  },
  theme: {
    colorScheme: 'dark',
  },
  debug: process.env.NODE_ENV === 'development',
};
