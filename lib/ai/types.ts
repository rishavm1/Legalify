export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface AIProvider {
  name: string;
  generateResponse: (messages: AIMessage[], context?: any) => Promise<AIResponse>;
  isAvailable: () => Promise<boolean>;
}

export type LoadBalancingStrategy = 'round-robin' | 'intelligent' | 'fallback';

export interface AIConfig {
  strategy: LoadBalancingStrategy;
  providers: string[];
  fallbackOrder?: string[];
}
