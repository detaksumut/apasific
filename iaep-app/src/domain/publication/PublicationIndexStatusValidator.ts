// src/domain/publication/PublicationIndexStatusValidator.ts

import { PublicationIndexStatus, VisibilityState } from './PublicationIndexStatus';
import { DoiLifecycleEngine } from './DoiLifecycle';

const VALID_VISIBILITY_STATES: VisibilityState[] = [
  "NOT_STARTED",
  "PROCESSING",
  "PARTIAL",
  "VISIBLE",
  "FAILED"
];

export class PublicationIndexStatusValidator {
  /**
   * Validates a raw object against the PublicationIndexStatus contract.
   * Throws an error or returns false if validation fails.
   */
  public static validate(raw: any): raw is PublicationIndexStatus {
    if (!raw || typeof raw !== 'object') {
      throw new Error("Invalid schema: root must be an object.");
    }

    // Validate overall
    if (!raw.overall || typeof raw.overall !== 'object') {
      throw new Error("Invalid schema: 'overall' object is required.");
    }

    if (!VALID_VISIBILITY_STATES.includes(raw.overall.visibility)) {
      throw new Error(`Invalid schema: 'overall.visibility' must be one of: ${VALID_VISIBILITY_STATES.join(', ')}.`);
    }

    if (raw.overall.last_checked !== null && typeof raw.overall.last_checked !== 'string') {
      throw new Error("Invalid schema: 'overall.last_checked' must be a ISO timestamp string or null.");
    }

    // Validate doi (optional)
    if (raw.doi) {
      if (typeof raw.doi !== 'object') {
        throw new Error("Invalid schema: 'doi' must be an object.");
      }
      if (typeof raw.doi.value !== 'string' || !raw.doi.value.trim()) {
        throw new Error("Invalid schema: 'doi.value' must be a non-empty string.");
      }
      if (typeof raw.doi.provider !== 'string' || !raw.doi.provider.trim()) {
        throw new Error("Invalid schema: 'doi.provider' must be a non-empty string.");
      }
      if (raw.doi.verified_at !== null && typeof raw.doi.verified_at !== 'string') {
        throw new Error("Invalid schema: 'doi.verified_at' must be a string or null.");
      }
    }

    // Validate zenodo (optional)
    if (raw.zenodo) {
      if (typeof raw.zenodo !== 'object') {
        throw new Error("Invalid schema: 'zenodo' must be an object.");
      }
      if (typeof raw.zenodo.status !== 'string') {
        throw new Error("Invalid schema: 'zenodo.status' must be a string.");
      }
      if (typeof raw.zenodo.record_id !== 'string') {
        throw new Error("Invalid schema: 'zenodo.record_id' must be a string.");
      }
      if (raw.zenodo.checked_at !== null && typeof raw.zenodo.checked_at !== 'string') {
        throw new Error("Invalid schema: 'zenodo.checked_at' must be a string or null.");
      }
    }

    // Validate openaire (optional)
    if (raw.openaire) {
      if (typeof raw.openaire !== 'object') {
        throw new Error("Invalid schema: 'openaire' must be an object.");
      }
      if (typeof raw.openaire.status !== 'string') {
        throw new Error("Invalid schema: 'openaire.status' must be a string.");
      }
      if (raw.openaire.checked_at !== null && typeof raw.openaire.checked_at !== 'string') {
        throw new Error("Invalid schema: 'openaire.checked_at' must be a string or null.");
      }
    }

    // Validate googleScholar (optional)
    if (raw.googleScholar) {
      if (typeof raw.googleScholar !== 'object') {
        throw new Error("Invalid schema: 'googleScholar' must be an object.");
      }
      if (typeof raw.googleScholar.status !== 'string') {
        throw new Error("Invalid schema: 'googleScholar.status' must be a string.");
      }
      if (raw.googleScholar.last_checked !== null && typeof raw.googleScholar.last_checked !== 'string') {
        throw new Error("Invalid schema: 'googleScholar.last_checked' must be a string or null.");
      }
    }

    // Validate doiLifecycle (optional, additive — Target #4)
    if (raw.doiLifecycle !== undefined) {
      if (!DoiLifecycleEngine.fromRaw(raw.doiLifecycle)) {
        throw new Error("Invalid schema: 'doiLifecycle' must be a valid DoiLifecycleRecord.");
      }
    }

    return true;
  }
}
