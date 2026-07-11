"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, PenTool, Edit, ShieldCheck } from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>("author");
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    // Read the mock_user cookie which contains their actual database role
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const role = getCookie("mock_user") || "author";
    const name = getCookie("mock_user_name") || "User";
    setUserRole(role);
    setUserName(decodeURIComponent(name));
  }, []);

  const handleSelectRole = (selectedRole: string) => {
    document.cookie = `active_portal_role=${selectedRole}; path=/; max-age=2592000`;
    
    // Redirect based on selected role
    if (selectedRole === "author") {
      router.push("/dashboard");
    } else if (selectedRole === "reviewer") {
      router.push("/dashboard/reviews");
    } else if (selectedRole === "editor") {
      router.push("/dashboard/editor");
    } else if (selectedRole === "admin") {
      router.push("/dashboard/admin");
    }
  };

  // Determine what options this user is allowed to see based on their DB role
  const allowedRoles = ["author"];
  if (userRole === "reviewer" || userRole === "editor" || userRole === "admin") allowedRoles.push("reviewer");
  if (userRole === "editor" || userRole === "admin") allowedRoles.push("editor");
  if (userRole === "admin") allowedRoles.push("admin");

  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-3">Selamat Datang, {userName}</h1>
          <p className="text-zinc-400">Anda memiliki akses ke beberapa portal. Silakan pilih portal yang ingin Anda masuki saat ini.</p>
        </div>

        <div className="grid gap-4">
          {allowedRoles.includes("author") && (
            <button 
              onClick={() => handleSelectRole("author")}
              className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#c9a84c]/10 flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#c9a84c]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-[#c9a84c] transition-colors">Portal Penulis (Author)</h3>
                  <p className="text-zinc-400 text-sm">Kirim naskah baru dan pantau status publikasi Anda.</p>
                </div>
              </div>
            </button>
          )}

          {allowedRoles.includes("reviewer") && (
            <button 
              onClick={() => handleSelectRole("reviewer")}
              className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-500/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <PenTool className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-emerald-500 transition-colors">Portal Reviewer</h3>
                  <p className="text-zinc-400 text-sm">Tinjau naskah yang ditugaskan dan berikan penilaian Anda.</p>
                </div>
              </div>
            </button>
          )}

          {allowedRoles.includes("editor") && (
            <button 
              onClick={() => handleSelectRole("editor")}
              className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Edit className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-blue-500 transition-colors">Portal Editorial</h3>
                  <p className="text-zinc-400 text-sm">Kelola seluruh naskah yang masuk dan tugaskan reviewer.</p>
                </div>
              </div>
            </button>
          )}

          {allowedRoles.includes("admin") && (
            <button 
              onClick={() => handleSelectRole("admin")}
              className="group flex items-center justify-between p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-amber-500 hover:bg-amber-500/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-amber-500 transition-colors">Portal Administrasi</h3>
                  <p className="text-zinc-400 text-sm">Kelola sistem, jurnal, pengguna, dan pengaturan global.</p>
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
