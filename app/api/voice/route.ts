import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json({ error: 'HuggingFace API key not configured' }, { status: 500 });
    }

    // Convert audio file to buffer
    const audioBuffer = await audioFile.arrayBuffer();

    // Use HuggingFace Whisper model (FREE!)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'audio/webm',
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `Speech recognition failed: ${errorText}` 
      }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.text || !data.text.trim()) {
      return NextResponse.json({ 
        error: 'No speech detected. Please speak clearly and try again.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      transcript: data.text.trim() 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
