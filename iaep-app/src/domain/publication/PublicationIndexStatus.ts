// src/domain/publication/PublicationIndexStatus.ts

export type VisibilityState =
  | "NOT_STARTED"
  | "PROCESSING"
  | "PARTIAL"
  | "VISIBLE"
  | "FAILED";

export interface PublicationIndexStatus {
  overall: {
    visibility: VisibilityState;
    last_checked: string | null;
  };

  doi?: {
    value: string;
    provider: string;
    verified_at: string | null;
  };

  zenodo?: {
    status: string;
    record_id: string;
    checked_at: string | null;
  };

  openaire?: {
    status: string;
    checked_at: string | null;
  };

  googleScholar?: {
    status: string;
    last_checked: string | null;
  };
}
