/**
 * APASIFIC SYSTEM MANAGEMENT METADATA™
 * Permanent Legacy Research Identity Record
 * 
 * Standard: APASIFIC System Metadata Standard v1.0
 * Authority: APASIFIC Research Quality & Intelligence Ecosystem
 */

export interface ResearchIdentifier {
  name: string;
  id: string;
  type: string;
  status: 'ACTIVE' | 'REGISTERED' | 'VERIFIED';
  url: string;
  badgeColor: string;
}

export interface SystemManagementMetadataConfig {
  recordId: string;
  registryTitle: string;
  governanceScope: string;
  identifiers: {
    orcid: ResearchIdentifier;
    scopus: ResearchIdentifier;
    wos: ResearchIdentifier;
    googleScholar: ResearchIdentifier;
    sinta: ResearchIdentifier;
  };
  governance: {
    steward: string;
    standard: string;
    version: string;
    integrityStatus: string;
    authority: string;
  };
  roleDeclaration: {
    en: string;
    id: string;
  };
}

export const APASIFIC_SYSTEM_MANAGEMENT_METADATA: SystemManagementMetadataConfig = {
  recordId: 'APASIFIC-RIR-000001',
  registryTitle: 'APASIFIC Research Identity Registry™',
  governanceScope: 'Permanent Legacy Research Identity Record',
  identifiers: {
    orcid: {
      name: 'ORCID iD',
      id: '0009-0006-8416-6156',
      type: 'Persistent Research Identifier',
      status: 'VERIFIED',
      url: 'https://orcid.org/0009-0006-8416-6156',
      badgeColor: '#a6ce39'
    },
    scopus: {
      name: 'Scopus Author ID',
      id: '59675598500',
      type: 'Author Profile Identifier',
      status: 'REGISTERED',
      url: 'https://www.scopus.com/authid/detail.uri?authorId=59675598500',
      badgeColor: '#ff7700'
    },
    wos: {
      name: 'Web of Science ResearcherID',
      id: 'QKY-3514-2026',
      type: 'Researcher Profile Identifier',
      status: 'REGISTERED',
      url: 'https://www.webofscience.com/wos/author/record/QKY-3514-2026',
      badgeColor: '#5c3d99'
    },
    googleScholar: {
      name: 'Google Scholar Profile ID',
      id: 'e89cADYAAAAJ',
      type: 'Scholar Profile Identifier',
      status: 'REGISTERED',
      url: 'https://scholar.google.com/citations?user=e89cADYAAAAJ',
      badgeColor: '#4285f4'
    },
    sinta: {
      name: 'SINTA Author ID',
      id: '6019786',
      type: 'National Research Profile Identifier',
      status: 'REGISTERED',
      url: 'https://sinta.kemdiktisaintek.go.id/authors/profile/6019786',
      badgeColor: '#10b981'
    }
  },
  governance: {
    steward: 'APASIFIC',
    standard: 'APASIFIC System Metadata Standard',
    version: 'v1.0',
    integrityStatus: 'VERIFIED',
    authority: 'APASIFIC Research Quality & Intelligence Ecosystem'
  },
  roleDeclaration: {
    en: "APASIFIC System Management Metadata™ is a permanent governance and provenance record of the APASIFIC publishing ecosystem. The Research Identity Registry and associated research identifiers represent system-level governance and do not constitute authorship, co-authorship, or scientific contribution to an individual article unless such contribution is explicitly declared in the article's official Contributor Statement.",
    id: "APASIFIC System Management Metadata™ merupakan rekaman permanen tata kelola dan provenance ekosistem publikasi APASIFIC. Research Identity Registry beserta identitas peneliti yang tercantum merupakan tata kelola tingkat sistem dan tidak secara otomatis menunjukkan status sebagai penulis, co-author, atau kontributor ilmiah pada suatu artikel, kecuali dinyatakan secara eksplisit dalam Contributor Statement resmi artikel."
  }
};

/**
 * Returns JSON-LD PropertyValue array for Machine-Readable Schema Interoperability
 */
export function getSystemManagementJsonLdProperties() {
  return [
    {
      "@type": "PropertyValue",
      "name": "APASIFIC System Management Record ID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.recordId
    },
    {
      "@type": "PropertyValue",
      "name": "Research Identity Registry",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.registryTitle
    },
    {
      "@type": "PropertyValue",
      "name": "ORCID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.identifiers.orcid.id
    },
    {
      "@type": "PropertyValue",
      "name": "Scopus Author ID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.identifiers.scopus.id
    },
    {
      "@type": "PropertyValue",
      "name": "Web of Science ResearcherID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.identifiers.wos.id
    },
    {
      "@type": "PropertyValue",
      "name": "Google Scholar Profile ID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.identifiers.googleScholar.id
    },
    {
      "@type": "PropertyValue",
      "name": "SINTA Author ID",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.identifiers.sinta.id
    },
    {
      "@type": "PropertyValue",
      "name": "Metadata Steward",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.governance.steward
    },
    {
      "@type": "PropertyValue",
      "name": "Metadata Version",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.governance.version
    },
    {
      "@type": "PropertyValue",
      "name": "Verification Authority",
      "value": APASIFIC_SYSTEM_MANAGEMENT_METADATA.governance.authority
    }
  ];
}
