import { AIMessage, AIResponse, AIProvider } from './types';

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyDL8f0whyefiEaAogVelGn1sRTL30a7eVA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

class GeminiProvider implements AIProvider {
  name = 'gemini';

  async generateResponse(messages: AIMessage[], context?: any): Promise<AIResponse> {
    try {
      const prompt = this.formatMessages(messages);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

      return {
        content,
        provider: 'gemini',
        model: 'gemini-pro',
        tokensUsed: data.usageMetadata?.totalTokenCount
      };
    } catch (error) {
      console.error('Gemini error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'test' }] }]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private formatMessages(messages: AIMessage[]): string {
    return messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
  }
}

export const geminiProvider = new GeminiProvider();
