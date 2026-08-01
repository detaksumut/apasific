import { ExpertDiscoveryEngine } from './ExpertDiscoveryEngine';

/**
 * Phase I.6: Academic AI Assistant
 * Provides a Natural Language interface to navigate the APASIFIC Intelligence Ecosystem.
 */
export class AcademicAIAssistant {
  private expertEngine: ExpertDiscoveryEngine;

  constructor() {
    this.expertEngine = new ExpertDiscoveryEngine();
  }

  /**
   * Interprets user prompt and delegates to the appropriate intelligence engine.
   */
  public async ask(prompt: string): Promise<string> {
    // A production implementation would use an LLM (e.g., GPT-4 / Gemini) to parse intent.
    
    console.log(`[AI Assistant] Received prompt: "${prompt}"`);

    if (prompt.toLowerCase().includes("reviewer yang cocok")) {
      // NLP intent maps to ExpertDiscovery
      const recommendations = await this.expertEngine.discoverExperts("AI Ethics");
      const bestMatch = recommendations[0];
      
      return `Recommended Reviewer ID: ${bestMatch.targetId}. Confidence: ${bestMatch.score}%. Reason: ${bestMatch.explanation}`;
    }

    return "I am the APASIFIC Academic AI Assistant. How can I help you navigate the ecosystem today?";
  }
}
