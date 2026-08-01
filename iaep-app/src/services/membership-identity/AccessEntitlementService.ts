import { MembershipProfile } from '../../domain/membership-identity/MembershipProfile';
import { MembershipType } from '../../domain/membership-identity/MembershipType';

export type EcosystemPlatform = 
  | 'PUBLICATION_PORTAL' 
  | 'CERTIFICATION_PORTAL' 
  | 'RESEARCH_COMMUNITY' 
  | 'REVIEWER_NETWORK' 
  | 'CONFERENCE_SYSTEM';

/**
 * Phase F.3 & F.4: Identity Core Federation & Entitlement Mapping
 * Resolves ecosystem access boundaries based strictly on active membership type.
 */
export class AccessEntitlementService {

  /**
   * Determines platform entitlements dynamically. No manual role assignment.
   */
  public resolveEntitlements(profile: MembershipProfile, type: MembershipType): EcosystemPlatform[] {
    
    // Entitlements are void if membership is not ACTIVE
    if (profile.status !== 'ACTIVE') {
      return []; 
    }

    const baseEntitlements: EcosystemPlatform[] = ['CERTIFICATION_PORTAL'];
    
    switch (type.code) {
      case 'STUDENT':
        return [...baseEntitlements, 'RESEARCH_COMMUNITY'];
      
      case 'PROFESSIONAL':
      case 'ASSOCIATE':
        return [...baseEntitlements, 'RESEARCH_COMMUNITY', 'PUBLICATION_PORTAL'];
      
      case 'SENIOR_ACADEMIC':
      case 'FELLOW':
        // Senior members and Fellows gain access to the Reviewer Network
        return [...baseEntitlements, 'RESEARCH_COMMUNITY', 'PUBLICATION_PORTAL', 'REVIEWER_NETWORK', 'CONFERENCE_SYSTEM'];
      
      case 'INSTITUTIONAL':
        return ['CONFERENCE_SYSTEM', 'PUBLICATION_PORTAL'];
        
      default:
        return [];
    }
  }

  /**
   * Validates if a member can access a specific platform boundary.
   */
  public hasAccess(profile: MembershipProfile, type: MembershipType, platform: EcosystemPlatform): boolean {
    const entitlements = this.resolveEntitlements(profile, type);
    return entitlements.includes(platform);
  }
}
