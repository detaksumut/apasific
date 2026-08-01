import { CollaborationOpportunity } from '../../domain/scholarly-marketplace/CollaborationOpportunity';
import { ExpertDiscoveryEngine } from '../ai-intelligence/ExpertDiscoveryEngine';

/**
 * Phase J.2: AI Expert Matching Integration
 * Connects the Marketplace Collaboration Opportunity with the AI Intelligence Layer.
 */
export class MarketplaceMatchingEngine {
  private expertDiscovery: ExpertDiscoveryEngine;

  constructor() {
    this.expertDiscovery = new ExpertDiscoveryEngine();
  }

  /**
   * Fetches AI-recommended candidates for a marketplace opportunity.
   */
  public async generateMatches(opportunity: CollaborationOpportunity) {
    console.log(`[Marketplace Matching] Requesting AI candidates for Opportunity: ${opportunity.id}`);
    
    // Pass the required expertise to the AI Discovery Engine
    const topicQuery = opportunity.requiredExpertise.join(' ');
    const recommendations = await this.expertDiscovery.discoverExperts(topicQuery);

    return recommendations.map(rec => ({
      candidateId: rec.targetId,
      suitabilityScore: rec.score,
      explanation: rec.explanation
    }));
  }
}
