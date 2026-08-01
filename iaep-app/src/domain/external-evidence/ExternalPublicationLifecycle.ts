// src/domain/external-evidence/ExternalPublicationLifecycle.ts

export enum ExternalPublicationState {
  DRAFT = 'DRAFT',
  READY_FOR_DEPOSIT = 'READY_FOR_DEPOSIT',
  DEPOSIT_CREATED = 'DEPOSIT_CREATED',
  FILE_UPLOADED = 'FILE_UPLOADED',
  PUBLISHED_EXTERNAL = 'PUBLISHED_EXTERNAL',
  DOI_VERIFIED = 'DOI_VERIFIED',
  INDEXING_PENDING = 'INDEXING_PENDING',
  OPENAIRE_DISCOVERED = 'OPENAIRE_DISCOVERED',
  GLOBAL_DISCOVERY_VERIFIED = 'GLOBAL_DISCOVERY_VERIFIED',
  
  // Crossref Publisher Lifecycle
  CROSSREF_DEPOSIT_SUBMITTED = 'CROSSREF_DEPOSIT_SUBMITTED',
  CROSSREF_DEPOSIT_ACCEPTED = 'CROSSREF_DEPOSIT_ACCEPTED',
  CROSSREF_DOI_REGISTERED = 'CROSSREF_DOI_REGISTERED',
  CROSSREF_METADATA_UPDATED = 'CROSSREF_METADATA_UPDATED'
}

export class ExternalPublicationLifecycle {
  private currentState: ExternalPublicationState;

  constructor(initialState: ExternalPublicationState = ExternalPublicationState.DRAFT) {
    this.currentState = initialState;
  }

  public getState(): ExternalPublicationState {
    return this.currentState;
  }

  public transitionTo(newState: ExternalPublicationState): boolean {
    // Valid state transitions can be enforced here
    const allowedTransitions: Record<ExternalPublicationState, ExternalPublicationState[]> = {
      [ExternalPublicationState.DRAFT]: [ExternalPublicationState.READY_FOR_DEPOSIT],
      [ExternalPublicationState.READY_FOR_DEPOSIT]: [ExternalPublicationState.DEPOSIT_CREATED],
      [ExternalPublicationState.DEPOSIT_CREATED]: [ExternalPublicationState.FILE_UPLOADED],
      [ExternalPublicationState.FILE_UPLOADED]: [ExternalPublicationState.PUBLISHED_EXTERNAL],
      [ExternalPublicationState.PUBLISHED_EXTERNAL]: [ExternalPublicationState.DOI_VERIFIED],
      [ExternalPublicationState.DOI_VERIFIED]: [ExternalPublicationState.INDEXING_PENDING],
      [ExternalPublicationState.INDEXING_PENDING]: [ExternalPublicationState.OPENAIRE_DISCOVERED, ExternalPublicationState.CROSSREF_DEPOSIT_SUBMITTED],
      [ExternalPublicationState.OPENAIRE_DISCOVERED]: [ExternalPublicationState.GLOBAL_DISCOVERY_VERIFIED],
      [ExternalPublicationState.GLOBAL_DISCOVERY_VERIFIED]: [],
      [ExternalPublicationState.CROSSREF_DEPOSIT_SUBMITTED]: [ExternalPublicationState.CROSSREF_DEPOSIT_ACCEPTED],
      [ExternalPublicationState.CROSSREF_DEPOSIT_ACCEPTED]: [ExternalPublicationState.CROSSREF_DOI_REGISTERED],
      [ExternalPublicationState.CROSSREF_DOI_REGISTERED]: [ExternalPublicationState.CROSSREF_METADATA_UPDATED],
      [ExternalPublicationState.CROSSREF_METADATA_UPDATED]: []
    };

    if (allowedTransitions[this.currentState].includes(newState)) {
      this.currentState = newState;
      return true;
    }

    throw new Error(`Invalid lifecycle transition from ${this.currentState} to ${newState}`);
  }
}
