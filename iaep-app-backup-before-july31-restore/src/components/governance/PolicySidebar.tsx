// src/components/governance/PolicySidebar.tsx
import Link from 'next/link';

export const PolicySidebar = () => {
  const policies = [
    { name: 'Peer Review Policy', path: '/policies/peer-review' },
    { name: 'Publication Ethics', path: '/policies/ethics' },
    { name: 'Plagiarism Policy', path: '/policies/plagiarism' },
    { name: 'Conflict of Interest', path: '/policies/conflict-of-interest' },
    { name: 'Open Access Policy', path: '/policies/open-access' },
    { name: 'Copyright Policy', path: '/policies/copyright' },
    { name: 'Digital Preservation', path: '/policies/preservation' },
    { name: 'Research Integrity', path: '/policies/research-integrity' },
    { name: 'Editorial Independence', path: '/policies/editorial-independence' },
    { name: 'Data Availability', path: '/policies/data-availability' },
    { name: 'AI Usage Policy', path: '/policies/ai-use' },
    { name: 'Corrections & Retractions', path: '/policies/corrections-retractions' },
    { name: 'Complaints Policy', path: '/policies/complaints' },
  ];

  return (
    <div className="w-64 shrink-0 pr-8 border-r border-gray-200 hidden md:block">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Governance Policies</h3>
      <nav className="flex flex-col space-y-1">
        {policies.map((policy) => (
          <Link
            key={policy.path}
            href={policy.path}
            className="px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors"
          >
            {policy.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};
