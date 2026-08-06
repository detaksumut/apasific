/**
 * Publication Date Resolver
 * 
 * Centralized service to resolve the official publication date of an article.
 * Guarantees consistent date logic across the website, cover generator, 
 * Crossref DOI metadata, Zenodo depositions, and OAI-PMH indexing feeds.
 */

/**
 * Resolves the official publication date as a Date object.
 * Applies a strict constraint: if the published_at date is in the future
 * compared to the current system time, it falls back to created_at to preserve
 * academic metadata integrity.
 */
export function resolvePublicationDate(article: {
  published_at?: string | Date | null;
  created_at?: string | Date | null;
}): Date {
  const now = new Date();
  
  if (article.published_at) {
    const pubDate = new Date(article.published_at);
    // Future date constraint validation
    if (pubDate.getTime() <= now.getTime()) {
      return pubDate;
    }
    console.warn(
      `[PublicationDateResolver] Warning: published_at (${article.published_at}) is in the future. ` +
      `Falling back to created_at.`
    );
  }

  const fallbackDate = article.created_at ? new Date(article.created_at) : new Date();
  return fallbackDate;
}

/**
 * Formats the resolved publication date to an ISO Date string (YYYY-MM-DD)
 * commonly required by external repositories like Zenodo and Crossref.
 */
export function resolvePublicationDateString(article: {
  published_at?: string | Date | null;
  created_at?: string | Date | null;
}): string {
  const dateObj = resolvePublicationDate(article);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
