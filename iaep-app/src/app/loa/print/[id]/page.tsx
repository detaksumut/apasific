"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'react-qr-code';

export default function PrintLoa() {
  const { id } = useParams() as { id: string };
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      try {
        const res = await fetch(`/api/author/submission-detail?id=${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.submission) setSubmission(json.submission);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSub();
  }, [id]);

  useEffect(() => {
    if (submission && !loading) {
      setTimeout(() => { window.print(); }, 800);
    }
  }, [submission, loading]);

  if (loading) return <div className="p-8 text-center text-zinc-500">Memuat data LoA...</div>;
  if (!submission) return <div className="p-8 text-center text-red-500">Naskah tidak ditemukan.</div>;

  const dateIssued = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const authorName = submission.profiles?.full_name || 'Author';
  const qrData = `Verified by APASIFIC. LOA ID: ${submission.id}. Date: ${dateIssued}. Author: ${authorName}. Journal: ${submission.journals?.name || 'APASIFIC Journal'}`;

  return (
    <div className="bg-white text-black min-h-screen font-serif" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
      <div className="max-w-[210mm] mx-auto p-[20mm] bg-white">
        
        {/* Letterhead */}
        <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-apasific.png" alt="Logo APASIFIC" className="h-24 w-auto object-contain" />
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-widest text-[#1a1a2e]">APASIFIC</h1>
              <p className="text-sm font-semibold tracking-wider text-gray-600 uppercase mt-1">Association of Asia Pacific Academician</p>
            </div>
          </div>
          <div className="text-right text-xs text-gray-500 flex flex-col justify-end h-full">
            <p>Email: contact@apasific.org</p>
            <p>Website: www.apasific.org</p>
          </div>
        </div>

        {/* Letter Info */}
        <div className="flex justify-between items-start mb-10 text-sm">
          <div>
            <p>Nomor: {submission.id.split('-')[0].toUpperCase()}/LoA/APASIFIC/{new Date().getFullYear()}</p>
            <p>Hal: <strong>Letter of Acceptance (LoA)</strong></p>
          </div>
          <div className="text-right">
            <p>Tanggal: {dateIssued}</p>
          </div>
        </div>

        {/* Recipient */}
        <div className="mb-8 text-sm">
          <p>Kepada Yth,</p>
          <p className="font-bold text-base mt-1">{authorName}</p>
          <p>Penulis Utama (Corresponding Author)</p>
        </div>

        {/* Body */}
        <div className="space-y-4 text-justify text-sm leading-relaxed">
          <p>
            Dengan hormat,
          </p>
          <p>
            Berdasarkan hasil proses <em>peer-review</em> dan evaluasi editorial secara saksama, kami dari Dewan Redaksi <strong>{submission.journals?.name || 'APASIFIC Journal'}</strong> menyatakan bahwa naskah Anda dengan rincian sebagai berikut:
          </p>
          
          <div className="pl-6 py-2">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 w-32 align-top font-semibold">Judul Naskah</td>
                  <td className="py-1 w-4 align-top">:</td>
                  <td className="py-1 font-bold italic">{submission.title}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top font-semibold">ID Naskah</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 uppercase">{submission.id.split('-')[0]}</td>
                </tr>
                <tr>
                  <td className="py-1 align-top font-semibold">Jurnal Tujuan</td>
                  <td className="py-1 align-top">:</td>
                  <td className="py-1 font-bold">{submission.journals?.name || 'APASIFIC Journal'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p>
            Telah kami nyatakan <strong>DITERIMA (ACCEPTED)</strong> untuk dipublikasikan. Naskah ini dinilai telah memenuhi standar akademis dan pedoman penulisan jurnal kami. Saat ini, naskah sedang dalam proses penyuntingan akhir (Copyediting & Layouting) dan akan segera diterbitkan pada edisi mendatang.
          </p>
          <p>
            Surat Penerimaan (Letter of Acceptance) ini diberikan sebagai bukti resmi bahwa artikel Anda telah melalui tahapan review dan disetujui untuk publikasi ilmiah.
          </p>
          <p>
            Kami mengucapkan selamat atas pencapaian ini dan terima kasih atas kepercayaan Anda memilih jurnal kami sebagai wadah publikasi karya ilmiah Anda. Kami menantikan karya-karya terbaik Anda selanjutnya.
          </p>
        </div>

        {/* Signatures */}
        {(() => {
          const journalName = submission.journals?.name || '';
          let eic = {
            name: 'Dr. Bahkrul Khair Alam, M.Si',
            title: 'Pemimpin Redaksi – APASIFIC',
            photo: '/images/org/member-15-1783582450456.jpeg'
          };

          if (journalName.includes('AJITE') || journalName.includes('IT & Engineering')) {
            eic = {
              name: 'DR. Eko Cahyo Mayndarto, SE, M.Si, Ak',
              title: 'Editor in Chief – AJITE',
              photo: '/images/org/member-34-1783583131708.jpeg'
            };
          } else if (journalName.includes('AJBA') || journalName.includes('Business Administration')) {
            eic = {
              name: 'Dr. Arfan Ikhsan Lubis, SE, M.Si, CATr',
              title: 'Editor in Chief – AJBA',
              photo: '/images/org/member-5-1783581594909.jpeg'
            };
          }

          return (
            <div className="mt-16 flex justify-between items-end">
              {/* Left: Info verification */}
              <div className="text-left text-xs text-gray-400 max-w-[200px]">
                <p className="font-semibold text-gray-600 mb-1">Verifikasi Dokumen:</p>
                <p>Scan QR Code untuk memverifikasi keaslian surat ini melalui sistem APASIFIC.</p>
              </div>

              {/* Right: Signature block */}
              <div className="text-center w-64 flex flex-col items-center">
                <p className="text-sm">Hormat kami,</p>
                <p className="text-sm font-bold mb-4">{eic.title}</p>
                
                <div className="mb-4 bg-white p-2 border border-gray-200 rounded">
                  <QRCode value={qrData} size={100} level="M" />
                </div>
                
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={eic.photo} alt="EIC Signature" className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 mb-2 grayscale" />
                <p className="font-bold border-b border-gray-400 inline-block px-4">{eic.name}</p>
                <p className="text-xs text-gray-500 mt-1">{eic.title}</p>
                <p className="text-xs text-gray-400">{journalName}</p>
              </div>
            </div>
          );
        })()}

      </div>

      <style>{`
        @media print {
          body { background: white; }
          nav, header, footer, .sidebar, button { display: none !important; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </div>
  );
}
