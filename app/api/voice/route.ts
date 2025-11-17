// This API is no longer needed - using Web Speech API in browser instead
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Voice recognition now uses browser Web Speech API - no server needed' 
  }, { status: 410 });
}
