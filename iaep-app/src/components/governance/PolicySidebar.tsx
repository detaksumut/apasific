// src/components/governance/PolicySidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PolicySidebar = () => {
  const pathname = usePathname();
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
    <div className="w-68 shrink-0 pr-6 border-r border-[#c9a84c]/20 hidden md:block">
      <h3 className="text-xs font-bold text-[#c9a84c] uppercase tracking-wider mb-6 pl-3">
        Governance Policies
      </h3>
      <nav className="flex flex-col space-y-1">
        {policies.map((policy) => {
          const isActive = pathname === policy.path;
          return (
            <Link
              key={policy.path}
              href={policy.path}
              className={`px-3 py-2.5 text-sm rounded-lg transition-all duration-200 block ${
                isActive
                  ? 'text-[#e8c97a] bg-[#12121f] font-semibold border-l-3 border-[#c9a84c] shadow-[inset_0_0_12px_rgba(201,168,76,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {policy.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

