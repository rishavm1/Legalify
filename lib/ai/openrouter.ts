import { AIMessage, AIResponse, AIProvider } from './types';

const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterProvider implements AIProvider {
  name = 'openrouter';

  async generateResponse(messages: AIMessage[], context?: any): Promise<AIResponse> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          temperature: 0.7,
          max_tokens: 2048,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'No response generated';

      return {
        content,
        provider: 'openrouter',
        model: 'gpt-3.5-turbo',
        tokensUsed: data.usage?.total_tokens
      };
    } catch (error) {
      console.error('OpenRouter error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!OPENROUTER_API_KEY;
  }
}

export const openRouterProvider = new OpenRouterProvider();
