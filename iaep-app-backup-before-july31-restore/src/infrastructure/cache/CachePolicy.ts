// src/infrastructure/cache/CachePolicy.ts

/**
 * Enterprise Cache Policies for APASIFIC Domains
 * TTLs are defined based on volatility and access frequency.
 */

export const CachePolicies = {
  // Researcher Profile: Updated infrequently, viewed highly
  RESEARCHER_PROFILE: {
    prefix: 'profile:',
    ttlSeconds: 86400, // 24 hours
  },
  
  // Public Publications Metadata: Immutable once published
  PUBLICATION_METADATA: {
    prefix: 'pub:',
    ttlSeconds: 604800, // 7 days
  },
  
  // AI Insights & Reputation: Computed daily/weekly
  AI_INSIGHT: {
    prefix: 'ai_insight:',
    ttlSeconds: 43200, // 12 hours
  },
  
  // Active Dashboards (Reviewer/Author): Highly volatile
  DASHBOARD_STATE: {
    prefix: 'dash:',
    ttlSeconds: 60, // 1 minute (Micro-caching)
  }
};
