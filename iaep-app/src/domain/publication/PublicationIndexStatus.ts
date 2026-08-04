// src/domain/publication/PublicationIndexStatus.ts

import { DoiLifecycleRecord } from './DoiLifecycle';

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

  /**
   * DOI lifecycle tracking (Target #4). Additive field — persisted inside
   * submissions.index_status; absent for publications that predate the
   * consolidated deposit workflow until they are (re)processed.
   */
  doiLifecycle?: DoiLifecycleRecord;
}
