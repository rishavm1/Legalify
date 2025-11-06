import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { email, phone, otp: providedOtp, type } = await req.json();
    const otp = providedOtp || Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (email) {
      // Delete any existing OTPs for this email
      await supabaseAdmin.from('otps').delete().eq('email', email);
      
      // Insert new OTP
      await supabaseAdmin.from('otps').insert({
        email,
        otp,
        expires_at: expiresAt,
      });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: type === 'password_reset' ? 'Reset Your Legalify Password' : 'Your Legalify Verification Code',
        text: type === 'password_reset' ? `Your password reset code is: ${otp}. Valid for 10 minutes.` : `Your Legalify verification code is: ${otp}. Valid for 10 minutes.`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Legalify Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #000000;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; border-bottom: 1px solid #333;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: -0.5px;">Legalify</h1>
              <p style="color: #a3a3a3; font-size: 16px; margin: 8px 0 0 0;">Legal Document Generator</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 20px; text-align: center;">
              <div style="background-color: #111111; border: 1px solid #333; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Verification Code</h2>
                <p style="color: #a3a3a3; font-size: 16px; margin: 0 0 24px 0; line-height: 1.5;">Enter this code to complete your sign-in:</p>
                
                <!-- OTP Code -->
                <div style="background: linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%); border: 2px solid #404040; border-radius: 8px; padding: 20px; margin: 24px 0; display: inline-block;">
                  <div style="color: #ffffff; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
                </div>
                
                <p style="color: #666666; font-size: 14px; margin: 24px 0 0 0;">This code expires in 10 minutes</p>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 8px; padding: 20px; text-align: left;">
                <h3 style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center;">
                  Security Notice
                </h3>
                <ul style="color: #a3a3a3; font-size: 14px; margin: 0; padding-left: 20px; line-height: 1.6;">
                  <li>Never share this code with anyone</li>
                  <li>Legalify will never ask for your code via phone or email</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #0a0a0a; border-top: 1px solid #1a1a1a; padding: 24px 20px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0; line-height: 1.5;">
                This email was sent by Legalify<br>
                © 2024 Legalify. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
        `,
      });

      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent to email', 
        otp: process.env.NODE_ENV === 'development' ? otp : undefined 
      });
    }

    if (phone) {
      return NextResponse.json({ success: false, message: 'Phone OTP not supported' }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: 'Email or phone required' }, { status: 400 });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 });
  }
}
