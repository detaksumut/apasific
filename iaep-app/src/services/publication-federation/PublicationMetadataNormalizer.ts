// src/services/publication-federation/PublicationMetadataNormalizer.ts
//
// Publication Metadata Normalization (Target #4 — Scholarly Ecosystem Integration).
//
// Single normalization boundary that turns heterogeneous internal submission
// data into one canonical shape (NormalizedPublicationMetadata), then converts
// it into each provider's required format:
//   - Zenodo   (repository deposit)      via ApasificPublicationMetadata
//   - Crossref (DOI metadata registry)   via CrossrefDepositMetadata
//   - ORCID    (author work records)     via ORCIDWorkMetadata
//   - DataCite (artifact DOI registry)   via DataCiteArtifactMetadata
//
// Normalized fields: title, abstract, authors, affiliation, ORCID, DOI,
// journal metadata, volume, issue, keywords, license.
//
// CRITICAL DATA PRESERVATION:
//   - Existing DOIs and Zenodo record IDs are carried through unchanged
//     (preserved identifiers are never regenerated or rewritten).
//   - Normalization is pure/deterministic and never performs I/O.

import { ApasificPublicationMetadata } from '@/providers/zenodo/ZenodoMapper';
import { CrossrefDepositMetadata } from '@/providers/crossref/CrossrefMapper';
import { ORCIDWorkMetadata } from '@/providers/orcid/ORCIDMapper';
import { DataCiteArtifactMetadata, ResearchResourceType } from '@/providers/datacite/DataCiteMapper';

export interface NormalizedAuthor {
  name: string;
  givenName?: string;
  familyName?: string;
  affiliation?: string;
  orcid?: string;
}

export interface NormalizedJournalMetadata {
  name: string;
  issn?: string;
  publisher?: string;
}

export interface NormalizedPublicationMetadata {
  title: string;
  abstractPlain: string;
  abstractHtml?: string;
  authors: NormalizedAuthor[];
  affiliation?: string;
  orcid?: string;
  /** Preserved existing DOI (source of truth when present). */
  doi?: string;
  /** Preserved existing Zenodo record ID (source of truth when present). */
  zenodoId?: string;
  journal: NormalizedJournalMetadata;
  volume?: string;
  issue?: string;
  keywords: string[];
  license: string;
  publicationDate: string; // YYYY-MM-DD
  publicationYear: string; // YYYY
  language?: string;
  articleUrl?: string;
}

export interface PublicationNormalizeInput {
  title?: string | null;
  /** May be a plain string or a JSON string {abstract, abstract_en, keywords}. */
  abstract?: string | null;
  keywords?: string | string[] | null;
  authors?: Array<{ name?: string | null; affiliation?: string | null; orcid?: string | null }> | null;
  /** Fallback single-author fields (submissions.author / profiles join). */
  authorName?: string | null;
  affiliation?: string | null;
  orcid?: string | null;
  doi?: string | null;
  zenodoId?: string | null;
  journalName?: string | null;
  issn?: string | null;
  publisher?: string | null;
  volume?: string | null;
  issue?: string | null;
  license?: string | null;
  publicationDate?: string | Date | null;
  language?: string | null;
  articleUrl?: string | null;
}

export class PublicationMetadataNormalizer {
  /** License Governance: CC-BY-4.0 default (matches ZenodoMapper governance). */
  public static readonly DEFAULT_LICENSE = 'CC-BY-4.0';
  public static readonly DEFAULT_JOURNAL_NAME = 'APASIFIC Journal';

  /**
   * Normalizes raw submission data into the canonical publication metadata.
   * Pure function — no I/O, no external calls. Throws fail-closed when the
   * title is missing (a publication without a title cannot be deposited).
   */
  public static normalize(input: PublicationNormalizeInput): NormalizedPublicationMetadata {
    const title = PublicationMetadataNormalizer.cleanText(input.title);
    if (!title) {
      throw new Error('PublicationMetadataNormalizer: title is required.');
    }

    const abstractParts = PublicationMetadataNormalizer.parseAbstract(input.abstract || undefined);

    const explicitKeywords = PublicationMetadataNormalizer.splitKeywords(input.keywords);
    const abstractKeywords = PublicationMetadataNormalizer.splitKeywords(abstractParts.keywordsRaw);
    const keywords = PublicationMetadataNormalizer.dedupe([...explicitKeywords, ...abstractKeywords]);

    const authors = PublicationMetadataNormalizer.normalizeAuthors(input);
    const primaryAuthor = authors[0];

    const doi = PublicationMetadataNormalizer.normalizeDoi(input.doi);
    const zenodoId = input.zenodoId ? String(input.zenodoId).trim() : undefined;

    const publicationDate = PublicationMetadataNormalizer.toDateStr(input.publicationDate);

    return {
      title,
      abstractPlain: abstractParts.abstractPlain,
      abstractHtml: abstractParts.abstractHtml,
      authors,
      affiliation: PublicationMetadataNormalizer.cleanText(input.affiliation) || primaryAuthor?.affiliation,
      orcid: primaryAuthor?.orcid || PublicationMetadataNormalizer.normalizeOrcid(input.orcid),
      doi,
      zenodoId: zenodoId || undefined,
      journal: {
        name: PublicationMetadataNormalizer.cleanText(input.journalName) || PublicationMetadataNormalizer.DEFAULT_JOURNAL_NAME,
        issn: PublicationMetadataNormalizer.cleanText(input.issn),
        publisher: PublicationMetadataNormalizer.cleanText(input.publisher)
      },
      volume: PublicationMetadataNormalizer.cleanText(input.volume),
      issue: PublicationMetadataNormalizer.cleanText(input.issue),
      keywords,
      license: PublicationMetadataNormalizer.cleanText(input.license) || PublicationMetadataNormalizer.DEFAULT_LICENSE,
      publicationDate,
      publicationYear: publicationDate.slice(0, 4),
      language: PublicationMetadataNormalizer.cleanText(input.language),
      articleUrl: PublicationMetadataNormalizer.cleanText(input.articleUrl)
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /** Trims and collapses whitespace. Returns undefined for empty values. */
  private static cleanText(value?: string | null): string | undefined {
    if (value === null || value === undefined) return undefined;
    const cleaned = String(value).replace(/\s+/g, ' ').trim();
    return cleaned || undefined;
  }

  /** Removes HTML tags for plain-text projections. */
  public static stripHtml(html?: string | null): string {
    if (!html) return '';
    return String(html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Parses the abstract field. Submissions may store either plain text or a
   * JSON string: { abstract, abstract_en, keywords }. Returns both a plain
   * text projection and an HTML projection (parity with the legacy deposit
   * description format), plus the raw keywords when embedded.
   */
  public static parseAbstract(raw?: string): {
    abstractPlain: string;
    abstractHtml?: string;
    keywordsRaw?: string;
  } {
    if (!raw) return { abstractPlain: '' };

    const trimmed = String(raw).trim();

    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        const idPart = typeof parsed.abstract === 'string' ? parsed.abstract.trim() : '';
        const enPart = typeof parsed.abstract_en === 'string' ? parsed.abstract_en.trim() : '';
        const keywordsRaw = typeof parsed.keywords === 'string' ? parsed.keywords : undefined;

        const plainParts = [idPart, enPart].filter(Boolean);
        const abstractPlain = plainParts.join('\n\n');

        if (idPart || enPart) {
          const sections: string[] = [];
          if (idPart) sections.push(`<h3>Abstrak</h3>\n<p>${idPart}</p>`);
          if (enPart) sections.push(`<h3>Abstract</h3>\n<p>${enPart}</p>`);
          if (keywordsRaw) sections.push(`<p><strong>Keywords:</strong> ${keywordsRaw}</p>`);
          return { abstractPlain, abstractHtml: sections.join('\n<br/>\n'), keywordsRaw };
        }
      }
    } catch {
      // Not JSON — fall through to plain-text handling.
    }

    return { abstractPlain: PublicationMetadataNormalizer.stripHtml(trimmed) };
  }

  /** Splits keyword input on commas/semicolons and cleans each entry. */
  public static splitKeywords(raw?: string | string[] | null): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw
        .map((k) => PublicationMetadataNormalizer.cleanText(k))
        .filter((k): k is string => Boolean(k));
    }
    let text = String(raw).trim();
    // Tolerate labels like "Keywords: a, b" / "Kata kunci: a, b".
    text = text.replace(/^(keywords|kata\s+kunci)\s*:\s*/i, '');
    return text
      .split(/[,;]/)
      .map((k) => PublicationMetadataNormalizer.cleanText(k))
      .filter((k): k is string => Boolean(k));
  }

  private static dedupe(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const value of values) {
      const key = value.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(value);
      }
    }
    return result;
  }

  /**
   * Builds the author list. Prefers an explicit authors array; otherwise
   * falls back to the single-author fields (submissions.author + profile
   * affiliation/ORCID). Names are split into given/family for registries
   * that require both parts.
   */
  private static normalizeAuthors(input: PublicationNormalizeInput): NormalizedAuthor[] {
    const fromArray: NormalizedAuthor[] = (input.authors || [])
      .map((a): NormalizedAuthor | null => {
        const name = PublicationMetadataNormalizer.cleanText(a?.name);
        if (!name) return null;
        const parts = PublicationMetadataNormalizer.deriveGivenFamily(name);
        return {
          name,
          givenName: parts.givenName,
          familyName: parts.familyName,
          affiliation: PublicationMetadataNormalizer.cleanText(a?.affiliation),
          orcid: PublicationMetadataNormalizer.normalizeOrcid(a?.orcid)
        };
      })
      .filter((a): a is NormalizedAuthor => Boolean(a));

    if (fromArray.length > 0) return fromArray;

    const fallbackName = PublicationMetadataNormalizer.cleanText(input.authorName);
    if (!fallbackName) return [];

    const parts = PublicationMetadataNormalizer.deriveGivenFamily(fallbackName);
    return [
      {
        name: fallbackName,
        givenName: parts.givenName,
        familyName: parts.familyName,
        affiliation: PublicationMetadataNormalizer.cleanText(input.affiliation),
        orcid: PublicationMetadataNormalizer.normalizeOrcid(input.orcid)
      }
    ];
  }

  /** Splits "Given Middle Family" into given/family (last token = family). */
  public static deriveGivenFamily(fullName: string): { givenName: string; familyName: string } {
    const tokens = fullName.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    if (tokens.length <= 1) {
      return { givenName: fullName.trim(), familyName: fullName.trim() };
    }
    const familyName = tokens[tokens.length - 1];
    const givenName = tokens.slice(0, -1).join(' ');
    return { givenName, familyName };
  }

  /**
   * Normalizes an ORCID identifier. Accepts bare IDs or URLs, validates the
   * ISO/IEC 7064:2003 MOD 11-2 checksum. Returns undefined when invalid.
   */
  public static normalizeOrcid(raw?: string | null): string | undefined {
    if (!raw) return undefined;
    let value = String(raw).trim();
    value = value.replace(/^https?:\/\/(sandbox\.)?orcid\.org\//i, '');
    value = value.replace(/\/.*$/, '').toUpperCase();
    if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(value)) return undefined;

    // ISO/IEC 7064 MOD 11-2 checksum validation.
    const digits = value.replace(/-/g, '');
    let total = 0;
    for (let i = 0; i < digits.length - 1; i++) {
      total = (total + Number(digits[i])) * 2;
    }
    const remainder = total % 11;
    const expected = (12 - remainder) % 11;
    const expectedChar = expected === 10 ? 'X' : String(expected);
    if (digits[digits.length - 1] !== expectedChar) return undefined;

    return value;
  }

  /**
   * Normalizes a DOI. Strips resolver URLs and whitespace. Returns undefined
   * for values that are not syntactically valid DOIs. Preservation rule:
   * existing valid DOIs are carried through verbatim — never regenerated.
   */
  public static normalizeDoi(raw?: string | null): string | undefined {
    if (!raw) return undefined;
    let value = String(raw).trim();
    value = value.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
    value = value.replace(/^doi:/i, '');
    if (!/^10\.\d{4,9}\/\S+$/i.test(value)) return undefined;
    return value;
  }

  /** Coerces a date input into YYYY-MM-DD (defaults to today). */
  public static toDateStr(value?: string | Date | null): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    if (typeof value === 'string' && value.trim()) {
      const asDate = new Date(value);
      if (!Number.isNaN(asDate.getTime())) return asDate.toISOString().slice(0, 10);
      const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return new Date().toISOString().slice(0, 10);
  }

  // ─── Provider Converters ───────────────────────────────────────────────────

  /**
   * Converts to the Zenodo deposit input contract (ApasificPublicationMetadata)
   * consumed by PublicationDepositService -> ZenodoMapper.
   */
  public static toApasificPublicationMetadata(meta: NormalizedPublicationMetadata): ApasificPublicationMetadata {
    return {
      title: meta.title,
      authors: meta.authors.map((a) => ({
        name: a.name,
        affiliation: a.affiliation || meta.affiliation || '',
        ...(a.orcid ? { orcid: a.orcid } : {})
      })),
      abstract: meta.abstractHtml || meta.abstractPlain,
      keywords: meta.keywords,
      license: meta.license,
      publicationDate: meta.publicationDate,
      journalName: meta.journal.name,
      volume: meta.volume || '',
      issue: meta.issue || ''
    };
  }

  /**
   * Converts to the Crossref deposit contract. The DOI must be the preserved
   * (existing or freshly assigned) identifier — callers must never pass a
   * regenerated DOI for an article that already has one.
   */
  public static toCrossrefDepositMetadata(meta: NormalizedPublicationMetadata, doi: string): CrossrefDepositMetadata {
    return {
      journalTitle: meta.journal.name,
      issn: meta.journal.issn || '',
      volume: meta.volume || '',
      issue: meta.issue || '',
      articleTitle: meta.title,
      doi,
      publicationYear: meta.publicationYear,
      publicationDate: meta.publicationDate,
      url: meta.articleUrl || `https://doi.org/${doi}`,
      authors: meta.authors.map((a) => ({
        givenName: a.givenName || a.name,
        surname: a.familyName || a.name,
        ...(a.orcid ? { orcid: a.orcid } : {})
      }))
    };
  }

  /** Converts to the ORCID work contract. */
  public static toOrcidWork(meta: NormalizedPublicationMetadata, doi: string): ORCIDWorkMetadata {
    return {
      title: meta.title,
      type: 'journal-article',
      journalTitle: meta.journal.name,
      publicationDate: meta.publicationDate,
      doi,
      url: meta.articleUrl || `https://doi.org/${doi}`
    };
  }

  /** Converts to the DataCite artifact contract (supplementary artifacts). */
  public static toDataCiteArtifactMetadata(
    meta: NormalizedPublicationMetadata,
    options: {
      artifactUrl: string;
      relatedPublicationDoi: string;
      resourceType?: ResearchResourceType;
      title?: string;
    }
  ): DataCiteArtifactMetadata {
    return {
      title: options.title || `${meta.title} — Supplementary Artifact`,
      creators: meta.authors.map((a) => ({
        name: a.name,
        ...(a.orcid ? { orcid: a.orcid } : {})
      })),
      publisher: meta.journal.publisher || meta.journal.name,
      publicationYear: meta.publicationYear,
      resourceType: options.resourceType || 'Dataset',
      relatedPublicationDoi: options.relatedPublicationDoi,
      artifactUrl: options.artifactUrl
    };
  }
}
