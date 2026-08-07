/**
 * Aggregate: ConferenceEntity
 * A Knowledge Dissemination Node representing global academic conferences.
 */
export interface ConferenceEntity {
  id: string;
  name: string;
  organizer: string;
  discipline: string;
  location: string | null;
  eventDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
