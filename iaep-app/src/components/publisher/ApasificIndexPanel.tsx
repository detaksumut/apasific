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

const IndexerCard: React.FC<IndexerCardProps> = ({ logo, alt, title, status, statusColor, description, linkText, linkHref }) => (
  <div className="bg-[#16162a]/80 border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-[#c9a84c]/60 transition-all duration-300 ease-in-out shadow-lg hover:shadow-2xl">
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div className={`h-12 w-12 flex items-center justify-center rounded-lg ${logo.includes('sinta') || logo.includes('zenodo') ? 'bg-white' : ''} p-1`}>
          <img src={logo} alt={alt} className="h-8 object-contain" />
        </div>
        <div>
          <h4 className="font-bold text-gray-100 text-md">{title}</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor} tracking-widest uppercase`}>
            {status}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);
  const indexers = [
    {
      logo: "/logo-google.png",
      alt: "Google Scholar",
      title: "Google Scholar",
      status: "Aktif",
      statusColor: "bg-green-900/50 text-green-300",
      description: "Publikasi APASIFIC telah aktif dan artikel baru terindeksasi melalui Google Scholar.",
      linkText: "Lihat di Google Scholar",
    },
    {
      logo: "/logo-crossref.jpg",
      alt: "Crossref",
      title: "DOI / Crossref",
      status: "Dikirim 2026",
      statusColor: "bg-yellow-900/50 text-yellow-300",
      description: "Pendaftaran DOI Crossref APASIFIC sedang diproses untuk identifikasi permanen publikasi.",
      linkText: "Pelajari tentang DOI",
    },
    {
      logo: "/logo-issn.jpg",
      alt: "ISSN",
      title: "ISSN Portal",
      status: "Dalam Antrian",
      statusColor: "bg-yellow-900/50 text-yellow-300",
      description: "Pengajuan ISSN APASIFIC telah dilakukan dan saat ini berada dalam antrian proses.",
      linkText: "Cek Status ISSN",
    },
    {
        logo: "/logo-zenodo.jpg",
        alt: "Zenodo",
        title: "Zenodo",
        status: "Aktif",
        statusColor: "bg-green-900/50 text-green-300",
        description: "Repositori publikasi APASIFIC yang menyediakan penyimpanan terbuka dan DOI untuk rekam publikasi.",
        linkText: "Jelajahi di Zenodo"
    },
    {
        logo: "/logo-openaire.jpg",
        alt: "OpenAIRE",
        title: "OpenAIRE",
        status: "Terhubung",
        statusColor: "bg-blue-900/50 text-blue-300",
        description: "Publikasi APASIFIC telah terhubung melalui ekosistem Zenodo dan OpenAIRE untuk discovery ilmiah.",
        linkText: "Pelajari Keterbukaan"
    },
    {
        logo: "/logo-orcid.jpg",
        alt: "ORCID",
        title: "ORCID",
        status: "Terintegrasi",
        statusColor: "bg-green-900/50 text-green-300",
        description: "Identitas peneliti dan publikasi APASIFIC terintegrasi melalui persistensi researcher identifier ORCID.",
        linkText: "Verifikasi Integrasi"
    },
    {
        logo: "/logo-sinta.jpg",
        alt: "SINTA",
        title: "SINTA",
        status: "Menunggu ISSN & Akreditasi",
        statusColor: "bg-yellow-900/50 text-yellow-300",
        description: "Proses SINTA menunggu ISSN jurnal dan pemenuhan persyaratan akreditasi.",
        linkText: "Lihat Persyaratan"
    },
    {
        logo: "/logo-doaj.jpg",
        alt: "DOAJ",
        title: "DOAJ",
        status: "Menunggu ISSN",
        statusColor: "bg-yellow-900/50 text-yellow-300",
        description: "Pengajuan DOAJ dilakukan setelah ISSN tersedia dan seluruh persyaratan kelayakan terpenuhi.",
        linkText: "Kriteria DOAJ"
    },
    {
      logo: "/logo-scopus.jpg",
      alt: "Scopus",
      title: "Scopus",
      status: "Peta Jalan 2028",
      statusColor: "bg-gray-700 text-gray-300",
      description: "Indeksasi panel Scopus merupakan target pengembangan setelah persyaratan editorial dan rekam publikasi terpenuhi.",
      linkText: "Lihat Peta Jalan"
    },    {
      logo: "/logo-WoS.png",
      alt: "Web of Science",
      title: "Web of Science",
      status: "Peta Jalan 2028",
      statusColor: "bg-gray-700 text-gray-300",
      description: "Web of Science merupakan target pengembangan setelah persyaratan editorial dan rekam publikasi terpenuhi.",
      linkText: "Lihat Peta Jalan"
    }
  ];


export const ApasificIndexPanel = () => {


  return (
    <div className="bg-[#0D0D1B] py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-[#c9a84c] tracking-widest uppercase">Publikasi Akademik</h2>
          <p className="mt-2 text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Status Indeks Jurnal
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
                    Perjalanan Indeksasi Dimulai
                </a>
            </div>
            <p className="text-sm text-gray-400 mb-8 max-w-4xl">
              Semua jurnal ASIA telah resmi memulai proses pendaftaran basis data internasional. Hasil dan penahapan tunduk pada jadwal peninjauan masing-masing badan.
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
