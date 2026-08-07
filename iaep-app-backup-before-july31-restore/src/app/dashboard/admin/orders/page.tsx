"use client";

import { useState } from "react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([
    { id: "ORD-202607-001", buyer: "Dr. Budi Santoso", items: "Advanced Artificial Intelligence in Economics (1x)", total: "Rp 150.000", date: "09 Jul 2026", status: "Pending" },
    { id: "ORD-202607-002", buyer: "Universitas Gadjah Mada", items: "Sustainable Business Strategies in ASEAN (5x)", total: "Rp 1.000.000", date: "08 Jul 2026", status: "Paid" },
    { id: "ORD-202607-003", buyer: "Prof. Siti Aminah", items: "Journal of Digital Transformation (1x)", total: "Rp 75.000", date: "07 Jul 2026", status: "Shipped" },
    { id: "ORD-202607-004", buyer: "Institut Teknologi Bandung", items: "The Future of Tourism & Hospitality (2x)", total: "Rp 360.000", date: "05 Jul 2026", status: "Completed" },
  ]);

  const [toastMessage, setToastMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Status pesanan ${id} berhasil diperbarui menjadi ${newStatus}.`);
    setSelectedOrder(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Paid": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Shipped": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Completed": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Pesanan & Belanja</h1>
          <p className="text-[#8888aa]">Lacak pesanan buku, konfirmasi pembayaran, dan perbarui status pengiriman.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Cari ID Pesanan/Pembeli..." className="pl-10 pr-4 py-2 bg-[#12121f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#c9a84c] transition-colors w-64" />
          </div>
          <button className="px-4 py-2 bg-[#2a2a3e] text-white font-semibold rounded-lg hover:bg-[#3a3a4e] transition-all flex items-center gap-2 border border-[#3a3a4e]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export Laporan
          </button>
        </div>
      </div>

      <div className="bg-[#12121f] rounded-xl border border-[#2a2a3e] overflow-hidden shadow-lg shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1a1a2e] text-gray-400 border-b border-[#2a2a3e]">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">ID Pesanan</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Pembeli</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Item</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total Pembayaran</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Tanggal</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#18182a] transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-[#c9a84c]">{order.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{order.buyer}</td>
                  <td className="px-6 py-4 truncate max-w-xs" title={order.items}>{order.items}</td>
                  <td className="px-6 py-4 font-mono">{order.total}</td>
                  <td className="px-6 py-4 text-gray-500">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs border font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="px-3 py-1 bg-[#2a2a3e] hover:bg-[#c9a84c] hover:text-black text-gray-300 rounded text-xs transition-colors">Perbarui</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE STATUS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12121f] rounded-xl border border-[#2a2a3e] w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-5 border-b border-[#2a2a3e] bg-[#1a1a2e]">
              <h2 className="text-lg font-bold text-white font-['Cinzel']">Update Status Pesanan</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">ID Pesanan</p>
                <p className="font-mono text-[#c9a84c] font-semibold">{selectedOrder.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pilih Status Baru:</label>
                <div className="space-y-2">
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Paid')} className="w-full text-left px-4 py-2.5 rounded border border-[#2a2a3e] hover:border-blue-500 hover:bg-blue-500/10 text-white transition-colors flex justify-between">
                    Telah Dibayar (Paid) {selectedOrder.status === 'Paid' && '✓'}
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Shipped')} className="w-full text-left px-4 py-2.5 rounded border border-[#2a2a3e] hover:border-purple-500 hover:bg-purple-500/10 text-white transition-colors flex justify-between">
                    Sedang Dikirim (Shipped) {selectedOrder.status === 'Shipped' && '✓'}
                  </button>
                  <button onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')} className="w-full text-left px-4 py-2.5 rounded border border-[#2a2a3e] hover:border-green-500 hover:bg-green-500/10 text-white transition-colors flex justify-between">
                    Selesai (Completed) {selectedOrder.status === 'Completed' && '✓'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
