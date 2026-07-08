"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
                            <a 
                              href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo, ini dari Admin ASIA (Association of Asia Pacific Academician). Kami ingin menginformasikan terkait pendaftaran membership Anda.')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-400 p-1 rounded-full transition-colors"
                              title="Chat WhatsApp"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437-9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                              </svg>
                            </a>
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
