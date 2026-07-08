"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function TransactionsDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showProof, setShowProof] = useState<string | null>(null);

  // Realistic Mock Data for UI Demonstration
  const [transactions, setTransactions] = useState([
    {
      id: "TRX-1092-A",
      user: "Budi Santoso",
      email: "budi.s@univ.edu",
      articleTitle: "The Impact of Artificial Intelligence on Regional Economic Policies in ASEAN",
      amount: 50000,
      date: "2026-07-09T08:14:00",
      status: "pending",
      proofImage: "https://via.placeholder.com/400x800/222222/c9a84c?text=Bukti+Transfer+BNI+Budi"
    },
    {
      id: "TRX-1093-B",
      user: "Siti Rahma",
      email: "siti.rahma@research.id",
      articleTitle: "KOMITE SEKOLAH DAN PROBLEMATIKA IMPLEMENTASINYA",
      amount: 50000,
      date: "2026-07-09T09:30:00",
      status: "pending",
      proofImage: "https://via.placeholder.com/400x800/222222/c9a84c?text=Bukti+Transfer+BNI+Siti"
    },
    {
      id: "TRX-1094-C",
      user: "John Doe",
      email: "johndoe@academia.net",
      articleTitle: "Dari Artificial Intelligence menuju Synthetic Intelligence",
      amount: 50000,
      date: "2026-07-09T10:05:00",
      status: "pending",
      proofImage: "https://via.placeholder.com/400x800/222222/c9a84c?text=Bukti+Transfer+BNI+John"
    },
    {
      id: "TRX-1090-D",
      user: "Ahmad Zain",
      email: "ahmadzain@inst.ac.id",
      articleTitle: "Transformasi Digital dalam Pemerintahan Daerah",
      amount: 50000,
      date: "2026-07-08T14:20:00",
      status: "approved",
      proofImage: ""
    }
  ]);

  const pendingCount = transactions.filter(t => t.status === "pending").length;
  const approvedCount = transactions.filter(t => t.status === "approved").length;
  const filteredData = transactions.filter(t => t.status === activeTab);

  const handleAction = (id: string, newStatus: string) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (newStatus === "approved") {
      // Menyimulasikan persetujuan real-time via localStorage agar tab pengguna otomatis bereaksi
      localStorage.setItem('apasific_payment_approved', Date.now().toString());
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center bg-[#12121f] p-6 rounded-2xl border border-[#c9a84c]/20">
        <div>
          <h1 className="text-3xl font-bold font-['Cinzel'] text-white">Transfer Proofs Monitoring</h1>
          <p className="text-gray-400 mt-2">Manage and verify user payments for premium article downloads.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#1a1a2e] border border-gray-700 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-yellow-500">{pendingCount}</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">Pending</div>
          </div>
          <div className="bg-[#1a1a2e] border border-gray-700 p-4 rounded-xl text-center">
            <div className="text-3xl font-black text-green-500">{approvedCount}</div>
            <div className="text-xs text-gray-500 font-bold uppercase mt-1">Approved</div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 bg-[#12121f] p-2 rounded-xl border border-gray-800 w-max">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "pending"
              ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Menunggu Verifikasi ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab("approved")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "approved"
              ? "bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Disetujui ({approvedCount})
        </button>
      </div>

      <div className="bg-[#12121f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0f] border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider font-bold">
                <th className="p-5">ID & Waktu</th>
                <th className="p-5">Informasi Pembeli</th>
                <th className="p-5">Artikel</th>
                <th className="p-5">Jumlah</th>
                <th className="p-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                    Tidak ada data transaksi.
                  </td>
                </tr>
              ) : (
                filteredData.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5">
                      <div className="font-bold text-gray-300">{trx.id}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(trx.date).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-white">{trx.user}</div>
                      <div className="text-xs text-gray-400 mt-1">{trx.email}</div>
                    </td>
                    <td className="p-5 max-w-xs">
                      <div className="text-sm text-gray-300 truncate" title={trx.articleTitle}>{trx.articleTitle}</div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-[#c9a84c]">Rp {trx.amount.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-5 text-right">
                      {trx.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setShowProof(trx.proofImage)}
                            className="p-2 bg-blue-900/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-blue-500/30"
                            title="Lihat Bukti Transfer"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleAction(trx.id, "approved")}
                            className="p-2 bg-green-900/30 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors border border-green-500/30"
                            title="Setujui Pembayaran"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleAction(trx.id, "rejected")}
                            className="p-2 bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-500/30"
                            title="Tolak Pembayaran"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Disetujui
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Image Modal */}
      {showProof && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-[#12121f] p-2 rounded-2xl border border-gray-700 max-w-sm w-full relative">
            <button 
              onClick={() => setShowProof(null)}
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-2 hover:bg-red-500 z-10 shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center p-4 border-b border-gray-800 mb-2">
              <h3 className="text-lg font-bold text-white">Bukti Transfer</h3>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={showProof} 
              alt="Bukti Transfer" 
              className="w-full h-auto max-h-[70vh] object-cover rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
