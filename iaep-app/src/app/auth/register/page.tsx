import Link from "next/link";

export default function RegisterSelection() {
  const cards = [
    {
      id: "author",
      title: "Penulis (Author)",
      desc: "Daftar untuk mengirimkan manuskrip jurnal umum, Tugas Jurnal, atau opini akademik.",
      badge: "Akses Langsung Disetujui",
      badgeColor: "text-green-500 bg-green-500/10",
      icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v15H6.5a2.5 2.5 0 0 0-2.5 2.5z" />,
      link: "/auth/publication?role=author"
    },
    {
      id: "reviewer",
      title: "Reviewer",
      desc: "Daftar sebagai Mitra Bebestari untuk membantu evaluasi naskah akademik (Double Blind).",
      badge: "Menunggu Verifikasi Admin",
      badgeColor: "text-yellow-500 bg-yellow-500/10",
      icon: <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m14-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 10v-2a4 4 0 0 0-3-3.87m-4-12.25A4 4 0 0 1 23 11" />,
      link: "/auth/publication?role=reviewer"
    },
    {
      id: "editor",
      title: "Editor",
      desc: "Daftar sebagai Dewan Redaksi untuk mengelola penerbitan. Membutuhkan rekam jejak editorial.",
      badge: "Menunggu Verifikasi Admin",
      badgeColor: "text-yellow-500 bg-yellow-500/10",
      icon: <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />,
      link: "/auth/publication?role=editor"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <Link href="/" className="text-[#c9a84c] hover:text-white transition-colors mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-[#12121f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(201,168,76,0.2)] p-10">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-['Cinzel'] mb-4">Pilih Jenis Registrasi</h1>
            <p className="text-[#8888aa] max-w-2xl mx-auto">
              Silakan pilih peran Anda dalam APASIFIC Integrated Academic Ecosystem Platform. Setiap peran memiliki form dan persyaratan verifikasi yang berbeda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {cards.map((card) => (
              <Link key={card.id} href={card.link} className="block group">
                <div className="h-full bg-[#18182e] border border-[rgba(201,168,76,0.15)] rounded-xl p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-[#c9a84c] hover:shadow-[0_0_30px_rgba(201,168,76,0.15)] hover:-translate-y-1">
                  <div className="w-16 h-16 bg-[#0d0d1a] border border-[#333] rounded-full flex items-center justify-center mb-6 group-hover:border-[#c9a84c] group-hover:text-[#c9a84c] text-[#8888aa] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {card.icon}
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#c9a84c] transition-colors">{card.title}</h3>
                  
                  <p className="text-[#8888aa] text-sm mb-8 flex-grow">
                    {card.desc}
                  </p>
                  
                  <div className={`px-4 py-1.5 rounded-full text-xs font-semibold ${card.badgeColor}`}>
                    {card.badge}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center pt-8 border-t border-[rgba(201,168,76,0.1)] text-[#8888aa]">
            Sudah memiliki akun? <Link href="/auth/login" className="text-[#c9a84c] hover:text-white font-bold transition-colors">Login di sini</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
