"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SendMembershipWaButton from "@/components/SendMembershipWaButton";

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/membership");
      const data = await res.json();
      if (data.applications) {
        setMembers(data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/membership?action=updateStatus&id=${id}&status=${status}`);
      if (res.ok) {
        fetchMembers(); // refresh
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data member ini secara permanen?")) return;

    try {
      const res = await fetch(`/api/membership?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchMembers();
      } else {
        alert("Gagal menghapus data");
      }
    } catch (e: any) {
      console.error(e);
      alert("Terjadi kesalahan");
    }
  };

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#c9a84c]">Monitoring Pendaftaran Member</h1>
          <p className="text-sm text-gray-400 mt-1">Kelola data pendaftar baru dan verifikasi bukti transfer administrasi.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Memuat data...</div>
      ) : (
        <div className="bg-[#0a0a0f] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#12121a] text-[#c9a84c] uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
                  <th className="px-6 py-4 font-semibold">Email & Kontak</th>
                  <th className="px-6 py-4 font-semibold">Level & Institusi</th>
                  <th className="px-6 py-4 font-semibold">Bukti Transfer</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Belum ada pendaftar member.</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{member.full_name}</td>
                      <td className="px-6 py-4">
                        <div>{member.email}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{member.phone || '-'}</span>
                          {member.phone && (
                            <SendMembershipWaButton phone={member.phone} name={member.full_name} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[#c9a84c] font-semibold">{member.academic_level}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]" title={member.university}>{member.university}</div>
                      </td>
                      <td className="px-6 py-4">
                        {member.bukti_transfer_url ? (
                          <button 
                            onClick={() => setSelectedReceipt(member.bukti_transfer_url)}
                            className="bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20 px-3 py-1.5 rounded-md hover:bg-[#c9a84c]/20 transition-colors text-xs font-semibold flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Bukti
                          </button>
                        ) : (
                          <span className="text-gray-500 text-xs italic">Tidak ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          member.status === 'Approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          member.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {member.status !== 'Approved' && (
                          <button onClick={() => updateStatus(member.id, 'Approved')} className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-3 py-1.5 rounded transition-colors">
                            Terima
                          </button>
                        )}
                        {member.status !== 'Rejected' && (
                          <button onClick={() => updateStatus(member.id, 'Rejected')} className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1.5 rounded transition-colors">
                            Tolak
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-xs bg-gray-800 text-gray-400 hover:bg-red-900/50 hover:text-red-500 px-2 py-1.5 rounded transition-colors ml-2"
                          title="Hapus Data"
                        >
                          <svg className="w-3.5 h-3.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal View Receipt */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0f] border border-gray-800 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-[#c9a84c] font-bold">Bukti Transfer</h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-4 flex justify-center bg-black/50">
              {selectedReceipt.startsWith("data:application/pdf") ? (
                <iframe src={selectedReceipt} className="w-full h-[600px] border-0" />
              ) : (
                <img src={selectedReceipt} alt="Bukti Transfer" className="max-w-full max-h-[70vh] object-contain rounded" />
              )}
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <a href={selectedReceipt} download="bukti_transfer" className="bg-[#c9a84c] text-black px-4 py-2 rounded font-semibold hover:bg-[#e8c97a] transition-colors text-sm">
                Unduh Gambar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
