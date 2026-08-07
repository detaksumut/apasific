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
}

/**
 * Gemini API / Vertex AI Adapter implementation (default).
 */
export class GeminiProviderAdapter implements IAIProvider {
  private readonly apiKey: string;
  
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  }

  public async generateAssessment(prompt: string): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    try {
      // Call Gemini API (1.5 Flash is highly suited for instant JSON structured output)
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      
      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Gemini API HTTP Error: status=${response.status}`);
      }

      const responseData = await response.json();
      const rawText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        throw new Error('Gemini API returned an empty content candidate.');
      }

      // Parse and strictly validate the JSON schema
      const parsed = JSON.parse(rawText.trim());
      return this.validateSchema(parsed);
    } catch (e: any) {
      console.error('[GeminiAdapter] API call or parsing failed:', e);
      throw e;
    }
  }

  /**
   * Strictly validates and coerces the AI output JSON schema.
   * Prevents textual ratings (e.g. "excellent") and forces rating ranges between 1 and 5.
   */
  private validateSchema(rawJson: any): AIResponse {
    const coerceRating = (val: any): number => {
      const parsedInt = parseInt(val, 10);
      if (Number.isNaN(parsedInt)) return 3; // Neutral fallback if rating is textual
      return Math.max(1, Math.min(5, parsedInt)); // Constraint between 1 and 5
    };

    const coerceConfidence = (val: any): number => {
      const parsedFloat = parseFloat(val);
      if (Number.isNaN(parsedFloat)) return 80.00;
      return Math.max(0, Math.min(100, parsedFloat));
    };

    return {
      novelty_rating: coerceRating(rawJson.novelty_rating),
      methodology_rating: coerceRating(rawJson.methodology_rating),
      clarity_rating: coerceRating(rawJson.clarity_rating),
      confidence_score: coerceConfidence(rawJson.confidence_score),
      summary_evaluation: String(rawJson.summary_evaluation || 'Penilaian ringkasan tidak tersedia.').trim(),
      suggested_improvements: String(rawJson.suggested_improvements || 'Saran perbaikan tidak tersedia.').trim()
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
        return 'Gemini 1.5 Flash';
    }
  }
}
