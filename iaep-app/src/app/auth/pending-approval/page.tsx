import Link from "next/link";

export default function PendingApproval() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center bg-[#05050a]">
      <div className="w-full max-w-lg bg-[#12121f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(201,168,76,0.2)] p-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#c9a84c]/20 flex items-center justify-center border border-[#c9a84c]/50">
             <svg className="w-10 h-10 text-[#c9a84c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-4">Registrasi Berhasil</h1>
        
        <p className="text-[#8888aa] mb-8 leading-relaxed">
          Akun Anda telah berhasil dibuat. Saat ini status akun Anda sedang <strong className="text-[#c9a84c]">menunggu persetujuan (approval) dari Administrator</strong>. 
          <br /><br />
          Anda akan menerima pemberitahuan melalui email setelah akun Anda diaktifkan dan dapat digunakan untuk masuk ke dashboard.
        </p>

        <Link 
          href="/" 
          className="inline-block bg-[#c9a84c] text-black font-bold px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
