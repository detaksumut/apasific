import React from "react";

interface DynamicCoverProps {
  title: string;
  author: string;
  journalName: string;
  doi: string;
  hueRotate?: string; // e.g., "hue-rotate-[45deg]"
  volume?: string;
  edisi?: string;
  month?: string;
  year?: string;
  customBgUrl?: string | null;
}

export default function DynamicCover({
  title,
  author,
  journalName,
  doi,
  hueRotate = "hue-rotate-0",
  volume = "1",
  edisi = "1",
  month = "JULY",
  year = "2026",
  customBgUrl = null,
}: DynamicCoverProps) {
  const journalCode = journalName ? journalName.split(' ')[0].toUpperCase() : '';
  
  let bgImage = "url('/coverPKM.png')";
  if (customBgUrl) {
    bgImage = `url('${customBgUrl}')`;
  } else if (journalCode === 'AJITE') {
    bgImage = "url('/coverAJITE.png')";
  } else if (journalCode === 'AJAF') {
    bgImage = "url('/coverAJAF.png')";
  }

  return (
    <div 
      className={`relative w-full aspect-[1/1.5] rounded-xl overflow-hidden shadow-2xl group-hover:scale-105 transition-transform duration-500 bg-[#06142e] ${hueRotate}`}
      style={{ containerType: 'inline-size' }}
    >
      {/* Background Template */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: bgImage }}
      />
      
      {/* Overlay Gelap opsional agar teks putih lebih terbaca */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Kontainer Teks Utama */}
      <div className="absolute inset-0 flex flex-col p-[8cqw]">
        
        {/* NAMA JURNAL (Di bawah INTERNATIONAL JOURNAL OF yang ada di background) */}
        {/* Posisi background 'INTERNATIONAL JOURNAL OF' ada di ~40cqw */}
        <div className="absolute top-[50cqw] left-[8cqw] w-[42cqw]">
          <h2 className="text-[4.5cqw] font-bold text-[#f0c05a] uppercase tracking-wider leading-tight font-serif line-clamp-1 text-shadow-md">
            {journalName ? journalName.split(' ')[0] : ''}
          </h2>
        </div>

        {/* JUDUL ARTIKEL (Dibatasi lebarnya sangat ketat agar tidak menabrak globe & gedung) */}
        <div className="absolute top-[58cqw] left-[8cqw] w-[38cqw]">
          <h1 className="text-[2.8cqw] font-medium text-white leading-snug line-clamp-6 text-shadow-lg drop-shadow-md">
            {title || "Untitled Article"}
          </h1>
        </div>

        {/* AUTHOR (Disembunyikan sesuai permintaan) */}
        {/*
        <div className="absolute top-[94cqw] left-[8cqw] w-[38cqw]">
          <p className="text-[1.8cqw] font-medium text-white line-clamp-5 drop-shadow-md leading-snug">
            {author || "Anonymous"}
          </p>
        </div>
        */}

        {/* DOI (Dipindah ke atas di samping logo ASIA) */}
        {doi && (
          <div className="absolute top-[17cqw] left-[33cqw] w-[35cqw] z-10">
            <p className="text-[2.2cqw] font-bold text-[#f0c05a] tracking-wider mb-0.5">DOI</p>
            <a 
              href={`https://doi.org/${doi.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[2.6cqw] font-mono text-zinc-200 drop-shadow-md break-all hover:text-[#f0c05a] hover:underline transition-colors block cursor-pointer"
            >
              {doi}
            </a>
          </div>
        )}

        {/* VOLUME & EDISI (Di samping ikon kalender kiri) */}
        <div className="absolute top-[137.5cqw] left-[26cqw] w-[20cqw]">
          {volume && <p className="text-[1.8cqw] font-bold text-zinc-300 tracking-wider uppercase mb-0.5">VOL {volume}</p>}
          {edisi && <p className="text-[1.8cqw] font-bold text-zinc-300 tracking-wider uppercase">EDISI {edisi}</p>}
        </div>

        {/* BULAN & TAHUN (Di samping ikon kalender tengah) */}
        <div className="absolute top-[137.5cqw] left-[52cqw] w-[20cqw]">
          <p className="text-[1.8cqw] font-bold text-zinc-300 tracking-wider uppercase mb-0.5">{month}</p>
          <p className="text-[1.8cqw] font-bold text-zinc-300 tracking-wider uppercase">{year}</p>
        </div>

      </div>
    </div>
  );
}
