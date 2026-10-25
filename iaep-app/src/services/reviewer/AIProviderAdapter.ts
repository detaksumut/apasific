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
    if (!this.apiKey) {
      throw new Error('NINE_ROUTER_API_KEY is not configured. Assessment requests must go through UltimateAI/9Router.');
    }
    if (!this.apiKey.startsWith('sk-254')) {
      throw new Error('NINE_ROUTER_API_KEY format is not recognized; direct provider bypass is disabled for APASIFIC assessments.');
    }

    try {
      let response;
      let rawText = '';

      if (this.apiKey.startsWith('sk-254')) {
        // Route through 9Router Proxy (read custom base URL or default to localhost)
        const baseUrl = process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1';
        const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
        const requestBody = {
          model: 'UltimateAI',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          stream: false
        };

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`9Router Proxy HTTP Error: status=${response.status}`);
        }

        const responseData = await response.json();
        rawText = responseData?.choices?.[0]?.message?.content;
      } else if (this.apiKey.startsWith('sk-or-')) {
        // Route through OpenRouter
        const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        const requestBody = {
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.2
        };

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://apasific.org',
            'X-Title': 'APASIFIC IAEP Platform'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API HTTP Error: status=${response.status}`);
        }

        const responseData = await response.json();
        rawText = responseData?.choices?.[0]?.message?.content;
      } else {
        // Call Gemini API directly (1.5 Flash is highly suited for instant JSON structured output)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
        const requestBody = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        };

        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`Gemini API HTTP Error: status=${response.status}`);
        }

        const responseData = await response.json();
        rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      }
      
      if (!rawText) {
        throw new Error('AI Provider returned an empty content candidate.');
      }

      // Parse and strictly validate the JSON schema
      const parsed = JSON.parse(rawText.trim());
      if (parsed.findings && Array.isArray(parsed.findings)) {
        return parsed as any;
      }
      return this.validateSchema(parsed);
    } catch (e: any) {
      console.error('[AIProviderAdapter] API call or parsing failed:', e);
      throw e;
    }
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
    if (!this.apiKey) {
      throw new Error('NINE_ROUTER_API_KEY is not configured. APASIFIC AI requests must go through UltimateAI/9Router.');
    }
    if (!this.apiKey.startsWith('sk-254')) {
      throw new Error('NINE_ROUTER_API_KEY format is not recognized; direct provider bypass is disabled.');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: userMessage }
    ];

    try {
      let response;
      let rawText = '';

      if (this.apiKey.startsWith('sk-254')) {
        const baseUrl = process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1';
        const apiUrl = `${baseUrl.replace(/\/$/, '')}/chat/completions`;
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'UltimateAI',
            messages,
            temperature: 0.7,
            stream: false
          })
        });
        if (!response.ok) throw new Error(`9Router HTTP ${response.status}`);
        const data = await response.json();
        rawText = data?.choices?.[0]?.message?.content || '';
      } else if (this.apiKey.startsWith('sk-or-')) {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://apasific.org',
            'X-Title': 'APASIFIC IAEP Platform'
          },
          body: JSON.stringify({
            model: 'google/gemini-flash-1.5',
            messages,
            temperature: 0.7
          })
        });
        if (!response.ok) throw new Error(`OpenRouter HTTP ${response.status}`);
        const data = await response.json();
        rawText = data?.choices?.[0]?.message?.content || '';
      } else {
        const contents = messages
          .filter(m => m.role !== 'system')
          .map(m => ({ parts: [{ text: m.content }] }));
        const systemInstruction = messages.find(m => m.role === 'system');
        const body: Record<string, unknown> = {
          contents,
          generationConfig: { temperature: 0.7 }
        };
        if (systemInstruction) {
          body.systemInstruction = { parts: [{ text: systemInstruction.content }] };
        }
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        );
        if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
        const data = await response.json();
        rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }

      return rawText.trim();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[AIProviderAdapter] generateText failed:', msg);
      throw e;
    }
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
