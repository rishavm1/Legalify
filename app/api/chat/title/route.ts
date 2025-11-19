import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ title: 'New Chat' });
    }

    // Use first 3 messages to generate title
    const context = messages.slice(0, 3).map(m => `${m.role}: ${m.content}`).join('\n');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a title generator. Generate a concise 3-6 word title summarizing the following conversation. Do not use quotes. Do not use the first message verbatim."
        },
        {
          role: "user",
          content: context
        }
      ],
      max_tokens: 20,
    });

    const title = completion.choices[0].message.content?.trim() || 'New Chat';

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json({ title: 'New Chat' }); // Fallback
  }
}
