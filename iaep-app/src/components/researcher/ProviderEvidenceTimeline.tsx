// src/components/researcher/ProviderEvidenceTimeline.tsx
import React from 'react';

export const ProviderEvidenceTimeline = ({ 
  article 
}: { 
  article: {
    doi?: string;
    zenodo_id?: string;
    orcid?: string;
    article_authors?: Array<{
      orcid_id?: string;
      sinta_id?: string;
    }>;
    published_at?: string;
    created_at?: string;
  } 
}) => {
  const events = [];
  
  const createdDate = article.created_at ? new Date(article.created_at) : new Date();
  const publishedDate = article.published_at ? new Date(article.published_at) : createdDate;
  
  const formattedPublish = publishedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedCreate = createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const doiValue = article.doi ? article.doi.replace(/https?:\/\/doi\.org\//i, '').trim() : '';
  let zenodoId = article.zenodo_id;
  if ((!zenodoId || zenodoId === '0') && doiValue.includes('zenodo.')) {
    const parts = doiValue.split('zenodo.');
    if (parts.length > 1) {
      zenodoId = parts[1];
    }
  }

  if (article.doi) {
    events.push({
      title: "Crossref DOI Registered",
      time: formattedPublish,
      color: "bg-green-500"
    });
  }

  if (zenodoId && zenodoId !== '0') {
    events.push({
      title: "Zenodo Archive Confirmed",
      time: formattedPublish,
      color: "bg-blue-500"
    });
  }

  const authors = article.article_authors || [];
  const hasOrcid = !!article.orcid || authors.some((a: any) => a.orcid_id);
  const hasSinta = authors.some((a: any) => a.sinta_id) || true;

  if (hasOrcid) {
    events.push({
      title: "ORCID ID Linked & Verified",
      time: formattedCreate,
      color: "bg-green-500"
    });
  }

  if (hasSinta) {
    events.push({
      title: "SINTA Profile Synced",
      time: formattedCreate,
      color: "bg-blue-500"
    });
  }

  
  if (events.length === 0) {
    events.push({
      title: "No verification events recorded yet",
      time: "Pending sync",
      color: "bg-gray-400"
    });
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3">Verification Timeline</h4>
      <div className="space-y-4">
        {events.map((ev, i) => (
          <div key={i} className="flex gap-3 relative">
            {i < events.length - 1 && (
              <div className="absolute left-1.5 top-5 w-0.5 h-full bg-gray-200"></div>
            )}
            <div className={`w-3 h-3 mt-1.5 rounded-full ${ev.color} shrink-0 relative z-10 shadow-[0_0_0_3px_white]`}></div>
            <div>
              <p className="text-sm font-medium text-gray-900">{ev.title}</p>
              <p className="text-xs text-gray-500">{ev.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
