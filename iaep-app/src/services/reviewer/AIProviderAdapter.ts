export interface AIResponse {
  novelty_rating: number;       // Integer 1-5
  methodology_rating: number;   // Integer 1-5
  clarity_rating: number;       // Integer 1-5
  confidence_score: number;     // Float 0-100
  summary_evaluation: string;
  suggested_improvements: string;
}

export interface IAIProvider {
  generateAssessment(prompt: string): Promise<AIResponse>;
  generateText(systemPrompt: string, userMessage: string, history?: Array<{ role: string; content: string }>): Promise<string>;
}

/**
 * Gemini API / Vertex AI Adapter implementation (default).
 */
export class GeminiProviderAdapter implements IAIProvider {
  private readonly apiKey: string;
  
  constructor() {
    this.apiKey = process.env.NINE_ROUTER_API_KEY || '';
  }

  public async generateAssessment(prompt: string): Promise<AIResponse> {
    if (!this.apiKey || !this.apiKey.startsWith('sk-254')) {
      throw new Error('A valid NINE_ROUTER_API_KEY is required; direct provider calls are disabled for APASIFIC assessments.');
    }
    const baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '');
    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.apiKey },
      body: JSON.stringify({
        model: process.env.NINE_ROUTER_MODEL || 'UltimateAI',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0,
        stream: false
      }),
      signal: AbortSignal.timeout(90000)
    });
    if (!response.ok) throw new Error('UltimateAI/9Router HTTP error: status=' + response.status);
    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (typeof rawText !== 'string' || !rawText.trim()) throw new Error('UltimateAI/9Router returned empty assessment content.');
    let parsed: any;
    try {
      parsed = JSON.parse(rawText.trim());
    } catch {
      throw new Error('UltimateAI/9Router returned invalid JSON; assessment rejected.');
    }
    return this.validateSchema(parsed);
  }

  /**
   * Generate plain text response for conversational AI chat.
   * Used by AIChatService for the APASIFIC AI chatbot.
   */
  public async generateText(
    systemPrompt: string,
    userMessage: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    if (!this.apiKey || !this.apiKey.startsWith('sk-254')) {
      throw new Error('A valid NINE_ROUTER_API_KEY is required; direct provider calls are disabled.');
    }
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];
    const baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '');
    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + this.apiKey },
      body: JSON.stringify({ model: process.env.NINE_ROUTER_MODEL || 'UltimateAI', messages, temperature: 0.7, stream: false }),
      signal: AbortSignal.timeout(90000)
    });
    if (!response.ok) throw new Error('UltimateAI/9Router HTTP error: status=' + response.status);
    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;
    if (typeof rawText !== 'string' || !rawText.trim()) throw new Error('UltimateAI/9Router returned empty text.');
    return rawText.trim();
  }

  /**
   * Strictly validates and coerces the AI output JSON schema.
   * Prevents textual ratings (e.g. "excellent") and forces rating ranges between 1 and 5.
   */
  private validateSchema(rawJson: any): AIResponse {
    const requireRating = (field: string): number => {
      const value = rawJson?.[field];
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
        throw new Error(`AI assessment rejected: ${field} must be an integer from 1 to 5; no fallback score is permitted.`);
      }
      return value;
    };
    const confidence = rawJson?.confidence_score;
    if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 100) {
      throw new Error('AI assessment rejected: confidence_score must be a finite number from 0 to 100; no fallback confidence is permitted.');
    }
    if (typeof rawJson?.summary_evaluation !== 'string' || !rawJson.summary_evaluation.trim()) {
      throw new Error('AI assessment rejected: summary_evaluation is missing.');
    }
    if (typeof rawJson?.suggested_improvements !== 'string' || !rawJson.suggested_improvements.trim()) {
      throw new Error('AI assessment rejected: suggested_improvements is missing.');
    }
    return {
      novelty_rating: requireRating('novelty_rating'),
      methodology_rating: requireRating('methodology_rating'),
      clarity_rating: requireRating('clarity_rating'),
      confidence_score: confidence,
      summary_evaluation: rawJson.summary_evaluation.trim(),
      suggested_improvements: rawJson.suggested_improvements.trim()
    };
  }
}

/**
 * Factory class to choose active AI LLM provider.
 */
export class AIProviderFactory {
  public static getProvider(providerType: string = process.env.AI_PROVIDER_TYPE || 'gemini'): IAIProvider {
    switch (providerType.toLowerCase()) {
      case 'gemini':
      default:
        return new GeminiProviderAdapter();
    }
  }

  public static getActiveModelName(providerType: string = process.env.AI_PROVIDER_TYPE || 'gemini'): string {
    switch (providerType.toLowerCase()) {
      case 'gemini':
      default:
        return 'UltimateAI via 9Router';
    }
  }
}
