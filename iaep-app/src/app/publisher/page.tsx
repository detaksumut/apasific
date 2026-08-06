import React from 'react';
import { GovernanceHeader } from '@/components/governance/GovernanceHeader';
import { PublisherStructureDiagram } from '@/components/governance/PublisherStructureDiagram';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APASIFIC Press | Academic Publisher',
  description: 'Independent Open Access Academic Publisher dedicated to global scholarly communication.',
};

export default function PublisherPage() {
  return (
    <div className="min-h-screen bg-[#080810] text-[#e8e8f0]">
      <GovernanceHeader />
      
      {/* Publisher custom typography override style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .pub-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #c9a84c;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(201,168,76,0.2);
          padding-bottom: 0.5rem;
        }
        .pub-content p {
          color: #a0aec0;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .pub-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .pub-content li {
          color: #a0aec0;
          margin-bottom: 0.5rem;
        }
        .pub-content strong {
          color: #e8c97a;
        }
        .pub-content code {
          background-color: rgba(255,255,255,0.05);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          color: #e8c97a;
        }
      `}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center">
        <div className="w-full max-w-3xl">
          <h1 className="text-4xl font-serif font-bold text-[#c9a84c] mb-6 tracking-wide text-center md:text-left">APASIFIC Press</h1>
          
          <div className="pub-content bg-[#0d0d1a] border border-[#c9a84c]/15 p-8 md:p-12 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 border-b border-[#c9a84c]/20 pb-2">About the Publisher</h2>
            <p>
              <strong>PT. Bernas Sumut Jaya</strong> adalah entitas hukum resmi penerbit ilmiah independen yang menaungi <strong>APASIFIC Press</strong>. Berkomitmen tinggi untuk memajukan komunikasi ilmiah di tingkat Asia Pasifik dan global melalui platform jurnal open-access yang terakreditasi dan terkelola secara profesional.
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Penerbit Resmi:</strong> PT. Bernas Sumut Jaya</li>
              <li><strong>Nomor Keputusan AHU:</strong> AHU-003707.AH.01.30.Tahun 2024</li>
              <li><strong>KBLI Usaha:</strong> 
                <ul className="list-circle pl-5 mt-1 space-y-1">
                  <li><code>58130</code> (Penerbitan Surat Kabar, Jurnal, Buletin, dan Majalah)</li>
                  <li><code>63121</code> (Penerbitan Portal Web Digital)</li>
                </ul>
              </li>
              <li><strong>Model Penerbitan:</strong> Open Access Scholarly Publishing</li>
              <li><strong>Model Akses:</strong> Diamond Open Access (Bebas Biaya bagi Penulis & Pembaca)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 border-b border-[#c9a84c]/20 pb-2">Publisher Responsibilities & Transparency Statement</h2>
            <p>
              PT. Bernas Sumut Jaya dan APASIFIC Press mematuhi standar transparansi penerbitan ilmiah internasional (DOAJ & COPE). Kami menjamin kebebasan editorial dewan redaksi jurnal dan melindungi integritas akademik secara konsisten.
            </p>
            <p>Penerbit menjamin dan menyediakan:</p>
            <ul className="list-disc pl-5 mt-4 space-y-1">
              <li>Transparansi kepemilikan dan legalitas hukum penerbit</li>
              <li>Otoritas independen bagi dewan redaksi jurnal</li>
              <li>Proses peer review buta ganda (Double-Blind) yang ketat</li>
              <li>Lisensi CC BY 4.0 dengan biaya publikasi Rp 0 (Gratis APC)</li>
              <li>Penyimpanan arsip digital jangka panjang yang aman (Crossref & Zenodo)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 border-b border-[#c9a84c]/20 pb-2">Organizational Structure</h2>
            <p>
              Untuk memastikan independensi editorial, struktur operasional administratif dipisahkan secara tegas dari jaringan penilai akademis dan dewan redaksi peer-review.
            </p>
            <PublisherStructureDiagram />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-[#c9a84c] mb-4 border-b border-[#c9a84c]/20 pb-2">Contact Information</h2>
            <div className="bg-[#12121f] p-6 rounded-xl border border-[#c9a84c]/20">
              <p className="mb-2"><strong>Penerbit Resmi:</strong> PT. Bernas Sumut Jaya</p>
              <p className="mb-2"><strong>Email Utama:</strong> admin@apasific.com</p>
              <p className="mb-2"><strong>Website Portal:</strong> <a href="https://apasific.com" className="text-[#e8c97a] hover:underline">https://apasific.com</a></p>
              <p className="mb-0"><strong>Alamat Redaksi:</strong> TOWER ASIA, Jl. Perjuangan No. 80 B, Kel. Sei Kera Hilir, Kec. Medan Perjuangan, Medan – Sumatera Utara, 20222, Indonesia.</p>
            </div>
          </section>
        </div>
      </div>
      </main>

      {/* Basic JSON-LD for Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "APASIFIC Press",
            "url": "https://apasific.com",
            "logo": "https://apasific.com/logo.png",
            "sameAs": [
              "https://crossref.org",
              "https://orcid.org"
            ]
          })
        }}
      />
    </div>
  );
}
