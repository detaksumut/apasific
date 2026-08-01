// src/components/governance/PublisherStructureDiagram.tsx
import React from 'react';

export const PublisherStructureDiagram = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 font-mono text-sm overflow-x-auto my-6 text-gray-800 shadow-inner">
      <pre className="whitespace-pre">
{`APASIFIC Press
│
├── Publisher Office
│     │
│     ├── Editorial Board
│     │     │
│     │     ├── Journal Management
│     │     │
│     │     └── Peer Review Network
│     │
│     └── Production & Metadata Office`}
      </pre>
    </div>
  );
};
