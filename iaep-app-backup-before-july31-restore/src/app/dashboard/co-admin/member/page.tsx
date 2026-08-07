"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { approveUser } from "@/app/actions/coAdminActions";
import { UserCheck, Users, GraduationCap, PenTool, Search } from "lucide-react";

export default function PendaftaranMemberPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("author");
  
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "Pending")
      .order("created_at", { ascending: false });
    
    if (data) {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const pendingAuthors = users.filter(u => (u.role || "").toLowerCase().includes("author"));
  const pendingReviewers = users.filter(u => (u.role || "").toLowerCase().includes("reviewer"));
  const pendingMembers = users.filter(u => (u.role || "").toLowerCase().includes("member"));

  const getActiveList = () => {
    if (activeTab === "author") return pendingAuthors;
    if (activeTab === "reviewer") return pendingReviewers;
    if (activeTab === "member") return pendingMembers;
    return [];
  };

  const activeList = getActiveList();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">Pendaftaran Member</h1>
        <p className="text-zinc-400 mt-2 text-sm">Moderasi pendaftaran akun baru pada platform APASIFIC.</p>
      </div>

      <div className="flex gap-4 border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab("author")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'author' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}
        >
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Pending Author ({pendingAuthors.length})
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("reviewer")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'reviewer' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Pending Reviewer ({pendingReviewers.length})
          </div>
        </button>
        <button 
          onClick={() => setActiveTab("member")}
          className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'member' ? 'border-[#c9a84c] text-[#c9a84c]' : 'border-transparent text-zinc-400 hover:text-zinc-300'}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Pending Membership ({pendingMembers.length})
          </div>
        </button>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-500 animate-pulse">Memuat data pendaftaran...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-800/50 text-zinc-300 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4">Instansi/Universitas</th>
                  <th className="px-6 py-4">Email & No. WA</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {activeList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Search className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                      <p className="text-zinc-400">Tidak ada pendaftaran pending di kategori ini.</p>
                    </td>
                  </tr>
                ) : (
                  activeList.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium mb-1">{user.full_name || "Tanpa Nama"}</div>
                        <span className="text-xs text-zinc-500 capitalize">{user.role || activeTab}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-zinc-300">{user.university || user.institution || "-"}</div>
                        {user.academic_field && <div className="text-xs text-zinc-500 mt-1">Bidang: {user.academic_field}</div>}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div>{user.email || "-"}</div>
                        <div className="text-xs text-zinc-500 mt-1">{user.phone || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleApprove(user.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        >
                          <UserCheck className="w-4 h-4" />
                          Setujui Pendaftaran
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
