/**
 * Aggregate: PublicationIdentity
 * Bridges the scholarly object with external identifiers utilized via Provider Runtime.
 */
export interface PublicationIdentity {
  id: string;
  scholarlyWorkId: string;
  doi: string | null;
  ssrnId: string | null;
  zenodoId: string | null;
  repositoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
