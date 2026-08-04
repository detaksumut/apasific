// src/domain/external-evidence/PublicationFederationEvents.ts

export enum PublicationFederationEventType {
  ZENODO_DEPOSIT_CREATED = 'ZENODO_DEPOSIT_CREATED',
  ZENODO_FILE_UPLOADED = 'ZENODO_FILE_UPLOADED',
  ZENODO_DOI_ASSIGNED = 'ZENODO_DOI_ASSIGNED',
  ZENODO_RECORD_VERIFIED = 'ZENODO_RECORD_VERIFIED',
  // Target #4 — consolidated publication federation lifecycle events (additive)
  CROSSREF_METADATA_REGISTERED = 'CROSSREF_METADATA_REGISTERED',
  DATACITE_ARTIFACT_REGISTERED = 'DATACITE_ARTIFACT_REGISTERED',
  ORCID_WORK_SYNCHRONIZED = 'ORCID_WORK_SYNCHRONIZED',
  OPENAIRE_DISCOVERY_CHECKED = 'OPENAIRE_DISCOVERY_CHECKED',
  DOI_LIFECYCLE_ADVANCED = 'DOI_LIFECYCLE_ADVANCED',
  EXISTING_IDENTIFIERS_PRESERVED = 'EXISTING_IDENTIFIERS_PRESERVED'
}

export interface PublicationFederationEvent {
  type: PublicationFederationEventType;
  publicationId: string;
  externalRecordId: string;
  timestamp: Date;
  payload?: any;
}
