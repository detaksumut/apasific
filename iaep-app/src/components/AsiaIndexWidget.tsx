'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const ASIA_INDEX_URL = 'https://rjrakp.vercel.app/asia-index';

function AsiaSearch() {
  return (
    <div style={{
      border: '1.5px solid #c9a84c',
      background: 'linear-gradient(135deg, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0.03) 100%)',
      borderRadius: '12px',
      padding: '20px 24px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
          minWidth: '46px', height: '46px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 20 20">
            <polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#1a2f47"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: '#c9a84c', fontWeight: 800, fontSize: '1rem', margin: 0 }}>
            ⭐ ASIA Index — Pengindeks Resmi APASIFIC
          </h4>
          <p style={{ color: '#b0b8d0', fontSize: '0.78rem', margin: '3px 0 0' }}>
            Cari artikel ilmiah terverifikasi · Scopus · Zenodo · DataCite · ORCID · Crossref
          </p>
        </div>
        <span style={{
          background: 'rgba(201,168,76,0.2)', border: '1px solid #c9a84c',
          color: '#c9a84c', fontWeight: 700, fontSize: '0.68rem',
          padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
        }}>AKTIF 2026</span>
      </div>

      {/* Direct link button */}
      <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={ASIA_INDEX_URL}
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'linear-gradient(135deg, #c9a84c, #f0d080)',
            color: '#0d1b2a', fontWeight: 800, fontSize: '0.82rem',
            padding: '10px 22px', borderRadius: '8px',
            textDecoration: 'none', whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          🔍 Cari Artikel di ASIA Index ↗
        </a>
      </div>
    </div>
  );
}

export default function AsiaIndexWidget() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  const slot = typeof document !== 'undefined' ? document.getElementById('asia-index-widget-slot') : null;
  if (!slot) return null;
  return createPortal(<AsiaSearch />, slot);
}
