/**
 * Aggregate: DigitalTwinProfile
 * The macroscopic projection/simulation model for researchers and institutions.
 * Allows "what-if" simulations without mutating reality.
 */
export interface DigitalTwinProfile {
  id: string;
  targetId: string;
  targetType: 'RESEARCHER' | 'INSTITUTION';
  currentState: Record<string, any>;
  predictionModels: Record<string, any> | null;
  lastSimulatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
