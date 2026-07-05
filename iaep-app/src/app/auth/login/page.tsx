"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const emailLower = email.toLowerCase().trim();
    
    // 1. Check default hardcoded testing accounts:
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

    // 2. Check localStorage for custom registered users:
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

    alert("Email atau password salah untuk percobaan mock ini.");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <Link href="/" className="text-[#c9a84c] hover:text-white transition-colors mb-8 inline-block">
          ← Back to Home
        </Link>
        
        <div className="bg-[#12121f] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-[rgba(201,168,76,0.2)] overflow-hidden">
          <div className="bg-[#18182e] p-6 text-center border-b border-[rgba(201,168,76,0.2)]">
            <h2 className="text-2xl font-bold text-white">Login APASIFIC IAEP</h2>
            <p className="text-[#8888aa] text-sm mt-1">Integrated Academic Ecosystem Platform</p>
          </div>

          <div className="p-8">
            <button className="w-full bg-[#a3c94c] hover:bg-[#8eb83b] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 19.5c-4.14 0-7.5-3.36-7.5-7.5S7.86 4.5 12 4.5s7.5 3.36 7.5 7.5-3.36 7.5-7.5 7.5zm-3.5-7.5h7M8.5 8h7m-7 8h7"/></svg>
              Login dengan ORCID
            </button>

            <div className="relative flex items-center py-4 mb-4">
              <div className="flex-grow border-t border-[#333]"></div>
              <span className="flex-shrink-0 mx-4 text-[#8888aa] text-xs font-bold">ATAU EMAIL</span>
              <div className="flex-grow border-t border-[#333]"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[#8888aa] text-xs font-bold mb-2">EMAIL</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0d0d1a] border border-[#333] text-white rounded-lg p-3 focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-[#8888aa] text-xs font-bold mb-2">PASSWORD</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0d0d1a] border border-[#333] text-white rounded-lg p-3 focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  required 
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center text-[#8888aa] text-xs">
                  <input type="checkbox" className="mr-2 accent-[#c9a84c]" /> Ingat saya
                </label>
                <a href="#" className="text-[#c9a84c] hover:text-white text-xs font-bold transition-colors">Lupa Password?</a>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white font-bold py-3 rounded-lg transition-colors">
                  Login
                </button>
              </div>
            </form>

            <div className="text-center mt-6 text-[#8888aa] text-sm">
              Belum memiliki akun? <Link href="/auth/register" className="text-[#c9a84c] hover:text-white font-bold transition-colors">Daftar sekarang</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
