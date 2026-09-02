/**
 * AIChatService — APASIFIC AI Chatbot service layer.
 *
 * Responsibilities:
 * 1. Build conversation context from history
 * 2. Call existing AI provider for text generation
 * 3. Return clean AI response
 *
 * Phase 1: Public knowledge only — no user data access.
 */

import { AIProviderFactory } from '@/services/reviewer/AIProviderAdapter';
import { APASIFIC_AI_SYSTEM_PROMPT } from '@/lib/ai-chat/prompts';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIChatResult {
  success: boolean;
  response?: string;
  error?: string;
}

const MAX_HISTORY_MESSAGES = 10;

export class AIChatService {

  /**
   * Generate an AI chat response using the existing AI provider.
   *
   * @param userMessage  The current user message
   * @param history      Recent conversation history (already loaded from DB)
   * @returns            AI response text
   */
  static async generateResponse(
    userMessage: string,
    history: ChatMessage[] = []
  ): Promise<AIChatResult> {
    try {
      const provider = AIProviderFactory.getProvider();

      // Take only the most recent messages to stay within context limits
      const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

      const response = await provider.generateText(
        APASIFIC_AI_SYSTEM_PROMPT,
        userMessage,
        recentHistory
      );

      if (!response) {
        return { success: false, error: 'AI provider returned empty response.' };
      }

      return { success: true, response };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[AIChatService] Generation failed:', msg);
      return { success: false, error: 'AI provider temporarily unavailable.' };
    }
  }
}
