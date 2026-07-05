"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.toLowerCase().trim();
    
    if (emailLower === 'detaksumut@gmail.com' && password === 'Mikr@210669Mpi') {
      document.cookie = "mock_user=admin; path=/";
      document.cookie = "mock_user_name=Super Admin; path=/";
      window.location.href = '/dashboard/admin';
      return;
    }
    if (emailLower === 'marahman2169@gmail.com') {
      document.cookie = "mock_user=editor; path=/";
      document.cookie = "mock_user_name=M. A. Rahman (Editor); path=/";
      window.location.href = '/dashboard/editor';
      return;
    }
    if (emailLower === 'kadinmedan1@gmail.com') {
      document.cookie = "mock_user=reviewer; path=/";
      document.cookie = "mock_user_name=Kadin Medan (Reviewer); path=/";
      window.location.href = '/dashboard/reviews/pending';
      return;
    }
    if (emailLower === 'kadsumut@gmail.com') {
      document.cookie = "mock_user=submitter; path=/";
      document.cookie = "mock_user_name=Kad Sumut (Author); path=/";
      window.location.href = '/dashboard';
      return;
    }

    try {
      const storedUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const matchedUser = storedUsers.find(
        (u: any) => u.email.toLowerCase().trim() === emailLower && u.password === password
      );

      if (matchedUser) {
        let mockRole = "submitter";
        let redirectPath = "/dashboard";
        
        if (matchedUser.role === "editor") {
          mockRole = "editor";
          redirectPath = "/dashboard/editor";
        } else if (matchedUser.role === "reviewer") {
          mockRole = "reviewer";
          redirectPath = "/dashboard/reviews/pending";
        } else if (matchedUser.role === "admin") {
          mockRole = "admin";
          redirectPath = "/dashboard/admin";
        }

        document.cookie = `mock_user=${mockRole}; path=/`;
        document.cookie = `mock_user_name=${matchedUser.fullName}; path=/`;
        window.location.href = redirectPath;
        return;
      }
    } catch (err) {
      console.error("Local storage error:", err);
    }

    alert("Email atau password salah.");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center">
      <div className="w-full max-w-lg">

        <Link
          href="/"
          className="text-[#c9a84c] hover:text-white transition-colors mb-10 inline-flex items-center gap-2 text-sm font-medium"
        >
          ← Kembali ke Beranda
        </Link>

        <div className="bg-[#12121f] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-[rgba(201,168,76,0.25)] overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-[#18182e] px-10 py-8 text-center border-b border-[rgba(201,168,76,0.2)]">
            <h2 className="text-2xl font-bold text-white tracking-wide">Login APASIFIC IAEP</h2>
            <p className="text-[#8888aa] text-sm mt-2">Integrated Academic Ecosystem Platform</p>
          </div>

          {/* ── Form Body ── */}
          <div className="px-10 py-10">

            {/* ORCID */}
            <button
              type="button"
              className="w-full bg-[#a3c94c] hover:bg-[#8eb83b] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-8"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 19.5c-4.14 0-7.5-3.36-7.5-7.5S7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm-3.5-7.5h7M8.5 8h7m-7 8h7" />
              </svg>
              Login dengan ORCID
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-[#2a2a3f]" />
              <span className="flex-shrink-0 mx-5 text-[#8888aa] text-xs font-bold tracking-widest">
                ATAU EMAIL
              </span>
              <div className="flex-grow border-t border-[#2a2a3f]" />
            </div>

            {/* Email + Password Form */}
            <form onSubmit={handleLogin} className="space-y-6">

              <div>
                <label className="block text-[#8888aa] text-xs font-bold mb-2 tracking-widest">
                  EMAIL
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full bg-[#0d0d1a] border border-[#2a2a3f] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#444]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8888aa] text-xs font-bold mb-2 tracking-widest">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0d0d1a] border border-[#2a2a3f] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#c9a84c] transition-colors placeholder:text-[#444]"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center text-[#8888aa] text-xs cursor-pointer select-none gap-2">
                  <input type="checkbox" className="accent-[#c9a84c]" />
                  Ingat saya
                </label>
                <a href="#" className="text-[#c9a84c] hover:text-white text-xs font-bold transition-colors">
                  Lupa Password?
                </a>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#c9a84c] hover:bg-[#b8963e] text-black font-bold py-3 rounded-lg transition-colors tracking-wide"
                >
                  Login
                </button>
              </div>

            </form>

            <div className="text-center mt-8 text-[#8888aa] text-sm">
              Belum memiliki akun?{" "}
              <Link href="/auth/register" className="text-[#c9a84c] hover:text-white font-bold transition-colors">
                Daftar sekarang
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
