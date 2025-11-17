import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const SUPPORTED_LANGUAGES = {
  'hi': 'Hindi',
  'ta': 'Tamil',
  'pa': 'Punjabi',
  'en': 'English',
  'te': 'Telugu',
  'mr': 'Marathi',
  'bn': 'Bengali',
  'gu': 'Gujarati',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { text, targetLanguage, sourceLanguage = 'en' } = await req.json();

    if (!SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }

    // Use Google Translate API
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
          format: 'text',
        }),
      }
    );

    const data = await response.json();
    const translatedText = data.data?.translations?.[0]?.translatedText || text;

    return NextResponse.json({ 
      success: true, 
      translatedText,
      sourceLanguage,
      targetLanguage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    supportedLanguages: SUPPORTED_LANGUAGES,
  });
}
