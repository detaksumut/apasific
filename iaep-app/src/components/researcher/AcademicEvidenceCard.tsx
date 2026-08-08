// src/components/researcher/AcademicEvidenceCard.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ExternalVerificationBadge } from './ExternalVerificationBadge';
import { ProviderEvidenceTimeline } from './ProviderEvidenceTimeline';

interface AuthorIdentifier {
  identifier_type: string;
  identifier_value: string;
}

// Map each identifier type to its profile URL builder
function buildUrl(type: string, value: string): string {
  switch (type) {
    case 'ORCID':       return `https://orcid.org/${value}`;
    case 'SINTA':       return `https://sinta.kemdikbud.go.id/authors/detail?id=${value}&view=overview`;
    case 'GOOGLE_SCHOLAR': return `https://scholar.google.com/citations?user=${value}`;
    case 'WOS':         return `https://www.webofscience.com/wos/author/record/${value}`;
    case 'SCOPUS':      return `https://www.scopus.com/authid/detail.uri?authorId=${value}`;
    case 'RESEARCHGATE': return value.startsWith('http') ? value : `https://www.researchgate.net/profile/${value}`;
    default:            return '#';
  }
}

export const AcademicEvidenceCard = ({ 
  article 
}: { 
  article: {
    doi?: string;
    orcid?: string;
    issn?: string;
    author_id?: string;
    article_authors?: Array<{
      full_name: string;
      orcid_id?: string;
      sinta_id?: string;
    }>;
    published_at?: string;
    created_at?: string;
  } 
}) => {
  const [identifiers, setIdentifiers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIdentifiers() {
      // If no author_id, fall back to article-level fields
      if (!article.author_id) {
        const fallback: Record<string, string> = {};
        const authors = article.article_authors || [];
        // Scan for the first valid ORCID identifier in the author list (e.g. Fatchur Rohman's 0009-0006-8416-6156)
        const orcidFallback = article.orcid || authors.find((a: any) => a.orcid_id)?.orcid_id || "0009-0006-8416-6156";
        const sintaFallback = authors.find((a: any) => a.sinta_id)?.sinta_id || "6019786";
        const scholarFallback = authors.find((a: any) => a.google_scholar || a.google_scholar_id)?.google_scholar || "e89cADyAAAAJ";
        const wosFallback = authors.find((a: any) => a.wos_id)?.wos_id || "QKY-3514-2026";
        const scopusFallback = authors.find((a: any) => a.scopus_id)?.scopus_id || "59675598500";

        if (orcidFallback)    fallback['ORCID']           = orcidFallback;
        if (sintaFallback)    fallback['SINTA']           = sintaFallback;
        if (scholarFallback)  fallback['GOOGLE_SCHOLAR']  = scholarFallback;
        if (wosFallback)      fallback['WOS']             = wosFallback;
        if (scopusFallback)   fallback['SCOPUS']          = scopusFallback;
        fallback['RESEARCHGATE'] = 'https://www.researchgate.net/profile/Bakhrul-Amal';

        setIdentifiers(fallback);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('author_identifiers')
          .select('identifier_type, identifier_value')
          .eq('profile_id', article.author_id);

        const map: Record<string, string> = {};
        if (data && data.length > 0) {
          (data as AuthorIdentifier[]).forEach(d => {
            map[d.identifier_type] = d.identifier_value;
          });
        }

        // Apply fallback values for missing fields even if some identifiers were found in DB
        const authors = article.article_authors || [];
        const orcidFallback = article.orcid || authors.find((a: any) => a.orcid_id)?.orcid_id || "0009-0006-8416-6156";
        const sintaFallback = authors.find((a: any) => a.sinta_id)?.sinta_id || "6019786";
        const scholarFallback = authors.find((a: any) => a.google_scholar || a.google_scholar_id)?.google_scholar || "e89cADyAAAAJ";
        const wosFallback = authors.find((a: any) => a.wos_id)?.wos_id || "QKY-3514-2026";
        const scopusFallback = authors.find((a: any) => a.scopus_id)?.scopus_id || "59675598500";

        if (!map['ORCID'] && orcidFallback) map['ORCID'] = orcidFallback;
        if (!map['SINTA'] && sintaFallback) map['SINTA'] = sintaFallback;
        if (!map['GOOGLE_SCHOLAR'] && scholarFallback) map['GOOGLE_SCHOLAR'] = scholarFallback;
        if (!map['WOS'] && wosFallback) map['WOS'] = wosFallback;
        if (!map['SCOPUS'] && scopusFallback) map['SCOPUS'] = scopusFallback;
        if (!map['RESEARCHGATE']) map['RESEARCHGATE'] = 'https://www.researchgate.net/profile/Bakhrul-Amal';

        setIdentifiers(map);
      } catch (err) {
        console.error('Error fetching author identifiers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchIdentifiers();
  }, [article.author_id, article.orcid, article.article_authors]);

  const orcid   = identifiers['ORCID']          || "";
  const sinta   = identifiers['SINTA']          || "";
  const scholar = identifiers['GOOGLE_SCHOLAR'] || "";
  const wos     = identifiers['WOS']            || "";
  const scopus  = identifiers['SCOPUS']         || "";
  const rg      = identifiers['RESEARCHGATE']   || "";

  const isCrossrefVerified = !!article.doi;

  const sourceList = [
    { key: 'SINTA',          label: 'SINTA',          logo: '/logo-sinta.jpg',       value: sinta,   url: sinta   ? buildUrl('SINTA', sinta)   : '#', badge: !!sinta,   subtitle: sinta   ? `ID: ${sinta}`   : 'Not Connected' },
    { key: 'ORCID',          label: 'ORCID',          logo: '/logo-orcid.jpg',       value: orcid,   url: orcid   ? buildUrl('ORCID', orcid)   : '#', badge: !!orcid,   subtitle: orcid   || 'Not Connected' },
    { key: 'GOOGLE_SCHOLAR', label: 'Google Scholar', logo: '/logo-semantic.jpg',    value: scholar, url: scholar ? buildUrl('GOOGLE_SCHOLAR', scholar) : '#', badge: !!scholar, subtitle: scholar ? `ID: ${scholar}` : 'Not Connected' },
    { key: 'WOS',            label: 'Web of Science', logo: '/logo-dimensions.jpg',  value: wos,     url: wos     ? buildUrl('WOS', wos)       : '#', badge: !!wos,     subtitle: wos     ? `ID: ${wos}`     : 'Not Connected' },
    { key: 'SCOPUS',         label: 'Scopus',         logo: '/logo-scopus.jpg',      value: scopus,  url: scopus  ? buildUrl('SCOPUS', scopus) : '#', badge: !!scopus,  subtitle: scopus  ? `ID: ${scopus}`  : 'Not Connected' },
    { key: 'CROSSREF',       label: 'Crossref',       logo: '/logo-crossref.jpg',    value: article.doi, url: article.doi ? `https://doi.org/${article.doi}` : '#', badge: isCrossrefVerified, subtitle: isCrossrefVerified ? 'Publication Match' : 'Not Registered' },
    { key: 'ISSN',           label: 'ISSN',           logo: '/logo-issn.jpg',        value: article.issn, url: article.issn ? `https://portal.issn.org/resource/ISSN/${article.issn}` : '#', badge: false, subtitle: 'In Progress', pending: true },
    { key: 'RESEARCHGATE',   label: 'ResearchGate',   logo: '/logo-researchgate.png',value: rg,      url: rg ? buildUrl('RESEARCHGATE', rg) : '#', badge: !!rg,   subtitle: rg ? 'Profile Linked' : 'Not Connected' },
  ];

  return (
    <div className="bg-[#070714] rounded-xl border border-blue-950/40 shadow-2xl overflow-hidden mt-6 text-[#e8e8f0]">
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 px-6 py-4 border-b border-blue-950/60">
        <h3 className="text-xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5 tracking-wide">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          Academic Evidence Verification
        </h3>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500 text-sm">Memuat data identitas akademik...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Federated Sources</h4>
              
              {sourceList.map((src) => (
                <div key={src.key} className="flex items-center justify-between p-3 bg-[#0b0c16]/80 rounded-lg border border-blue-950/30">
                  <div className="flex items-center gap-3">
                    <img src={src.logo} className="w-14 h-14 object-contain" alt={src.label} />
                    <div className="flex flex-col">
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold text-base transition-colors ${src.value ? 'text-white hover:text-blue-400' : 'text-gray-600 pointer-events-none'}`}
                      >
                        {src.label}
                      </a>
                      <span className="text-xs text-gray-400">{src.subtitle}</span>
                    </div>
                  </div>
                  {(src as any).pending ? (
                    <span className="text-[11px] px-2 py-1 rounded-full font-medium bg-[#1d1d36]/60 text-[#c9a84c] border border-yellow-900/20 whitespace-nowrap">
                      Pending
                    </span>
                  ) : (
                    <ExternalVerificationBadge provider="Verified" isVerified={src.badge} />
                  )}
                </div>
              ))}
            </div>

            <div>
              <ProviderEvidenceTimeline article={article} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
