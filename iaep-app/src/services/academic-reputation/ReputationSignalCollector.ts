import { ReputationSignal } from '../../domain/academic-reputation/ReputationSignal';
import { ResearcherTimelineEvent } from '../../domain/identity/ResearchTimelineEvent';

/**
 * Phase G.2: Reputation Signal Collector
 * Gathers evidence triggered by domain events and transforms them into standard normalized signals.
 * Does not calculate the final score.
 */
export class ReputationSignalCollector {
  
  /**
   * Processes a domain event into a ReputationSignal.
   * Mock implementation of standard normalization logic.
   */
  public processEventToSignal(event: ResearcherTimelineEvent): ReputationSignal | null {
    // Note: A real implementation would query the source contexts via defined interfaces,
    // but absolutely NO direct DB access to other contexts' tables.
    
    let signalType = '';
    let rawValue = 0;
    let normalizedValue = 0; // Out of 100
    
    switch (event.eventType) {
      case 'CITATION_GROWTH_DETECTED':
        signalType = 'IMPACT_SIGNAL';
        rawValue = (event.eventData?.newCitations as number) || 0;
        normalizedValue = Math.min((rawValue / 1000) * 100, 100); // e.g., 1000 citations = 100
        break;
        
      case 'CERTIFICATION_COMPLETED':
        signalType = 'CREDENTIAL_SIGNAL';
        rawValue = 1; // 1 certification
        normalizedValue = 85; // Baseline score for achieving a credential
        break;
        
      case 'ARTICLE_PUBLISHED':
        signalType = 'PUBLICATION_SIGNAL';
        rawValue = 1;
        normalizedValue = 75; // Baseline score for a publication
        break;
        
      case 'IDENTITY_VERIFIED' as any:
        signalType = 'IDENTITY_SIGNAL';
        rawValue = 1;
        normalizedValue = 100; // Binary fully verified
        break;
        
      default:
        return null; // Event not mapped to a reputation signal
    }

    return {
      id: crypto.randomUUID(),
      researcherId: event.researcherId,
      signalType,
      sourceContext: event.sourceContext,
      rawValue,
      normalizedValue,
      weight: 0, // Will be set by calculation engine
      contributionScore: 0, // Will be set by calculation engine
      confidence: 95.0,
      calculatedAt: new Date()
    };
  }
}
