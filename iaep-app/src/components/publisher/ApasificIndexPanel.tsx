import React from 'react';

interface IndexerCardProps {
  logo: string;
  alt: string;
  title: string;
  status: string;
  statusColor: string;
  description: string;
  linkText: string;
  linkHref?: string;
}

const IndexerCard: React.FC<IndexerCardProps> = ({ logo, alt, title, status, statusColor, description, linkText, linkHref }) => {
  const cardBody = (
    <div className="bg-[#16162a]/80 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c9a84c]/60 transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl h-full">
      <div>
        <div className="flex items-center gap-4 mb-3">
          <div className={`h-12 w-12 flex items-center justify-center rounded-lg ${logo.includes('sinta') || logo.includes('zenodo') ? 'bg-white' : ''} p-1`}>
            <img src={logo} alt={alt} className="h-8 object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-gray-100 text-md flex items-center gap-1.5">
              {title}
              {linkHref && (
                <svg className="w-3.5 h-3.5 text-gray-400 opacity-60 group-hover:opacity-100 group-hover:text-[#c9a84c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              )}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor} tracking-widest uppercase`}>
              {status}
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-xs leading-relaxed">
          {description}
        </p>
      </div>
      {linkHref && (
        <div className="mt-3 pt-2 border-t border-gray-800/50 flex items-center justify-between text-[11px] text-[#c9a84c] font-medium">
          <span>{linkText}</span>
          <span>→</span>
        </div>
      )}
    </div>
  );

  if (linkHref) {
    return (
      <a href={linkHref} target="_blank" rel="noopener noreferrer" className="block h-full group no-underline">
        {cardBody}
      </a>
    );
  }

  return cardBody;
};

  const indexers = [
    {
      logo: "/logo-google.png",
      alt: "Google Scholar",
      title: "Google Scholar",
      status: "Active",
      statusColor: "bg-green-900/50 text-green-300",
      description: "APASIFIC publications are active and new articles are indexed through Google Scholar.",
      linkText: "View on Google Scholar",
    },
    {
      logo: "/logo-crossref.jpg",
      alt: "Crossref",
      title: "DOI / Crossref",
      status: "Submitted 2026",
      statusColor: "bg-yellow-900/50 text-yellow-300",
      description: "APASIFIC DOI registration with Crossref is being processed for permanent publication identification.",
      linkText: "Learn About DOI",
    },
    {
      logo: "/logo-issn.jpg",
      alt: "ISSN",
      title: "ISSN Portal",
      status: "In Queue",
      statusColor: "bg-yellow-900/50 text-yellow-300",
      description: "The APASIFIC ISSN application has been submitted and is currently in the processing queue.",
      linkText: "Check ISSN Status",
    },
    {
        logo: "/logo-zenodo.jpg",
        alt: "Zenodo",
        title: "Zenodo",
        status: "Active",
        statusColor: "bg-green-900/50 text-green-300",
        description: "APASIFIC publication repository providing open storage and DOI records for publications.",
        linkText: "Explore on Zenodo"
    },
    {
        logo: "/logo-openaire.jpg",
        alt: "OpenAIRE",
        title: "OpenAIRE",
        status: "Connected",
        statusColor: "bg-blue-900/50 text-blue-300",
        description: "APASIFIC publications are connected through the Zenodo and OpenAIRE ecosystem for scholarly discovery.",
        linkText: "Learn About Open Access"
    },
    {
        logo: "/logo-orcid.jpg",
        alt: "ORCID",
        title: "ORCID",
        status: "Integrated",
        statusColor: "bg-green-900/50 text-green-300",
        description: "APASIFIC researcher identities and publications are integrated through persistent ORCID researcher identifiers (0009-0006-8416-6156).",
        linkText: "View ORCID Record",
        linkHref: "https://orcid.org/0009-0006-8416-6156"
    },
    {
        logo: "/logo-sinta.jpg",
        alt: "SINTA",
        title: "SINTA",
        status: "Awaiting ISSN & Akreditasi",
        statusColor: "bg-yellow-900/50 text-yellow-300",
        description: "The SINTA process is awaiting the journal ISSN and fulfillment of accreditation requirements.",
        linkText: "View Requirements"
    },
    {
        logo: "/logo-doaj.jpg",
        alt: "DOAJ",
        title: "DOAJ",
        status: "Awaiting ISSN",
        statusColor: "bg-yellow-900/50 text-yellow-300",
        description: "The DOAJ application will proceed once the ISSN is available and all eligibility requirements are fulfilled.",
        linkText: "DOAJ Criteria"
    },
    {
      logo: "/logo-scopus.jpg",
      alt: "Scopus",
      title: "Scopus",
      status: "Verified Author Profile",
      statusColor: "bg-orange-900/60 text-orange-300 border border-orange-500/30",
      description: "Official Scopus Author Profile (ID: 59675598500) integrated via ORCID, with 7 Scopus publications and h-index 2.",
      linkText: "View Scopus Profile",
      linkHref: "https://www.scopus.com/pages/authors/59675598500"
    },
    {
      logo: "/logo-WoS.png",
      alt: "Web of Science",
      title: "Web of Science",
      status: "Verified ResearcherID",
      statusColor: "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30",
      description: "Official Web of Science ResearcherID (QKY-3514-2026) verified with Clarivate, integrating 16 scholarly publications.",
      linkText: "View Clarivate Profile",
      linkHref: "https://www.webofscience.com/wos/author/record/QKY-3514-2026"
    }
  ];


export const ApasificIndexPanel = () => {


  return (
    <div className="bg-[#0D0D1B] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-[#c9a84c] tracking-widest uppercase">Academic Publication</h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Journal Indexing Status
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-md text-gray-400">
            Jurnal akademik ASIA resmi didirikan pada tahun 2026. Kami secara aktif mengejar pengindeksan dan registrasi dengan basis data akademik internasional terkemuka dan platform akses terbuka.
          </p>
        </div>

        <div className="mt-12 bg-[#070714] border border-blue-950/40 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-blue-950/60">
                <h3 className="text-lg font-extrabold text-[#c9a84c] tracking-widest uppercase">
                    APASIFIC INDEX
                </h3>
                <a href="#" className="bg-[#c9a84c] text-black text-xs font-bold px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors">
                    Indexing Journey Begins
                </a>
            </div>
            <p className="text-sm text-gray-400 mb-8 max-w-4xl">
              All ASIA journals have officially begun the registration process with international databases. Results and stages are subject to the review schedules of each organization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {indexers.map((item, index) => (
                    <IndexerCard key={index} {...item} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
