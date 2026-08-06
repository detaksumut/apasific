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
    <div className="min-h-screen bg-white">
      <GovernanceHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-6">APASIFIC Press</h1>
        
        <div className="prose prose-blue max-w-none text-gray-700">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">About the Publisher</h2>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Publisher Responsibilities & Transparency Statement</h2>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Organizational Structure</h2>
            <p>
              Untuk memastikan independensi editorial, struktur operasional administratif dipisahkan secara tegas dari jaringan penilai akademis dan dewan redaksi peer-review.
            </p>
            <PublisherStructureDiagram />
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2">Contact Information</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-2"><strong>Penerbit Resmi:</strong> PT. Bernas Sumut Jaya</p>
              <p className="mb-2"><strong>Email Utama:</strong> admin@apasific.com</p>
              <p className="mb-2"><strong>Website Portal:</strong> <a href="https://apasific.com" className="text-blue-600 hover:underline">https://apasific.com</a></p>
              <p className="mb-0"><strong>Alamat Redaksi:</strong> Jl. Setia Budi No. 123, Komplek Bernas Building, Kota Medan, Sumatera Utara, 20132, Indonesia.</p>
            </div>
          </section>
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
