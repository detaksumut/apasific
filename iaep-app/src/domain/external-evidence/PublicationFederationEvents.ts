// src/domain/external-evidence/PublicationFederationEvents.ts

export enum PublicationFederationEventType {
  ZENODO_DEPOSIT_CREATED = 'ZENODO_DEPOSIT_CREATED',
  ZENODO_FILE_UPLOADED = 'ZENODO_FILE_UPLOADED',
  ZENODO_DOI_ASSIGNED = 'ZENODO_DOI_ASSIGNED',
  ZENODO_RECORD_VERIFIED = 'ZENODO_RECORD_VERIFIED',
}

export interface PublicationFederationEvent {
  type: PublicationFederationEventType;
  publicationId: string;
  externalRecordId: string;
  timestamp: Date;
  payload?: any;
}
