import { AIMessage, AIResponse, AIProvider, LoadBalancingStrategy } from './types';
import { geminiProvider } from './gemini';
import { openRouterProvider } from './openrouter';

class AILoadBalancer {
  private providers: Map<string, AIProvider> = new Map();
  private currentProviderIndex = 0;
  private strategy: LoadBalancingStrategy = 'intelligent';

  constructor() {
    this.providers.set('gemini', geminiProvider);
    this.providers.set('openrouter', openRouterProvider);
  }

  setStrategy(strategy: LoadBalancingStrategy) {
    this.strategy = strategy;
  }

  async generateResponse(messages: AIMessage[], context?: any): Promise<AIResponse> {
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobinStrategy(messages, context);
      case 'intelligent':
        return this.intelligentStrategy(messages, context);
      case 'fallback':
        return this.fallbackStrategy(messages, context);
      default:
        return this.intelligentStrategy(messages, context);
    }
  }

  // Strategy 1: Round-Robin - Equal distribution
  private async roundRobinStrategy(messages: AIMessage[], context?: any): Promise<AIResponse> {
    const providerNames = Array.from(this.providers.keys());
    const maxAttempts = providerNames.length;

    for (let i = 0; i < maxAttempts; i++) {
      const providerName = providerNames[this.currentProviderIndex];
      this.currentProviderIndex = (this.currentProviderIndex + 1) % providerNames.length;

      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        console.log(`[Round-Robin] Trying provider: ${providerName}`);
        const response = await provider.generateResponse(messages, context);
        console.log(`[Round-Robin] Success with: ${providerName}`);
        return response;
      } catch (error) {
        console.log(`[Round-Robin] Failed with ${providerName}, trying next...`);
        continue;
      }
    }

    throw new Error('All providers failed in round-robin');
  }

  // Strategy 2: Intelligent Routing - Task-based
  private async intelligentStrategy(messages: AIMessage[], context?: any): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    
    // Determine best provider based on task
    let preferredProvider = 'gemini'; // Default to Gemini (faster, cheaper)

    // Use OpenRouter for complex tasks
    if (
      lastMessage.includes('draft') ||
      lastMessage.includes('complex') ||
      lastMessage.includes('detailed') ||
      lastMessage.includes('comprehensive') ||
      lastMessage.length > 500
    ) {
      preferredProvider = 'openrouter';
    }

    // Try preferred provider first
    try {
      console.log(`[Intelligent] Using ${preferredProvider} for this task`);
      const provider = this.providers.get(preferredProvider);
      if (provider) {
        const response = await provider.generateResponse(messages, context);
        console.log(`[Intelligent] Success with: ${preferredProvider}`);
        return response;
      }
    } catch (error) {
      console.log(`[Intelligent] ${preferredProvider} failed, trying fallback...`);
    }

    // Fallback to other provider
    const fallbackProvider = preferredProvider === 'gemini' ? 'openrouter' : 'gemini';
    const provider = this.providers.get(fallbackProvider);
    if (provider) {
      console.log(`[Intelligent] Falling back to: ${fallbackProvider}`);
      return await provider.generateResponse(messages, context);
    }

    throw new Error('All providers failed in intelligent routing');
  }

  // Strategy 3: Fallback System - Most reliable
  private async fallbackStrategy(messages: AIMessage[], context?: any): Promise<AIResponse> {
    const fallbackOrder = ['gemini', 'openrouter']; // Try Gemini first (faster)

    for (const providerName of fallbackOrder) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        console.log(`[Fallback] Trying provider: ${providerName}`);
        const isAvailable = await provider.isAvailable();
        
        if (!isAvailable) {
          console.log(`[Fallback] ${providerName} not available, skipping...`);
          continue;
        }

        const response = await provider.generateResponse(messages, context);
        console.log(`[Fallback] Success with: ${providerName}`);
        return response;
      } catch (error) {
        console.log(`[Fallback] ${providerName} failed:`, error);
        continue;
      }
    }

    throw new Error('All providers failed in fallback strategy');
  }

  // Get provider statistics
  getProviderStats() {
    return {
      strategy: this.strategy,
      availableProviders: Array.from(this.providers.keys()),
      currentIndex: this.currentProviderIndex
    };
  }
}

export const aiLoadBalancer = new AILoadBalancer();
