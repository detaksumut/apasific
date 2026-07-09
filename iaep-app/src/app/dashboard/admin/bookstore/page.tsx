"use client";

import { useState } from "react";

export default function AdminBookstore() {
  const [books, setBooks] = useState([
    { id: 1, title: "Advanced Artificial Intelligence in Economics", author: "Prof. Ahmad Fauzi, Ph.D.", year: "2025", category: "Monograph", price: "Rp 150.000", status: "Published", stock: 45 },
    { id: 2, title: "Sustainable Business Strategies in ASEAN", author: "Dr. Sarah Jenkins, M.B.A.", year: "2026", category: "Academic Book", price: "Rp 200.000", status: "Published", stock: 12 },
    { id: 3, title: "Journal of Digital Transformation (Vol. 4)", author: "Multiple Authors", year: "2026", category: "Journal", price: "Rp 75.000", status: "Published", stock: 100 },
    { id: 4, title: "International Conference on Islamic Finance", author: "ASIA Proceedings", year: "2024", category: "Proceedings", price: "Free", status: "Archived", stock: 999 },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFormOpen(false);
    showToast("Buku baru berhasil diunggah! (Demo)");
  };

  const handleDelete = (id: number, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus buku "${title}"?`)) return;
    setBooks(books.filter(b => b.id !== id));
    showToast(`Buku "${title}" berhasil dihapus.`);
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
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Manajemen Toko Buku</h1>
          <p className="text-[#8888aa]">Kelola katalog buku, harga, dan ketersediaan stok untuk toko daring ASIA.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Cari buku..." className="pl-10 pr-4 py-2 bg-[#12121f] border border-[#2a2a3e] rounded-lg text-white focus:outline-none focus:border-[#c9a84c] transition-colors w-64" />
          </div>
          <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 bg-[#c9a84c] text-black font-semibold rounded-lg hover:bg-[#e8c97a] transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Tambah Buku Baru
          </button>
        </div>
      </div>

      <div className="bg-[#12121f] rounded-xl border border-[#2a2a3e] overflow-hidden shadow-lg shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#1a1a2e] text-gray-400 border-b border-[#2a2a3e]">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Judul & Penulis</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Kategori</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Harga</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Stok</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3e]">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-[#18182a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white mb-0.5">{book.title}</div>
                    <div className="text-xs text-gray-500">{book.author} | {book.year}</div>
                  </td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs border border-blue-500/20">{book.category}</span></td>
                  <td className="px-6 py-4 font-mono">{book.price}</td>
                  <td className="px-6 py-4 font-mono">{book.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs border ${
                      book.status === 'Published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#c9a84c] hover:text-[#e8c97a] mr-4 text-sm font-medium transition-colors">Edit</button>
                    <button onClick={() => handleDelete(book.id, book.title)} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data buku.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL - TAMBAH BUKU */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12121f] rounded-xl border border-[#2a2a3e] w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center p-6 border-b border-[#2a2a3e] bg-[#1a1a2e]">
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Formulir Buku Baru</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Judul Buku</label>
                  <input type="text" required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Masukkan judul..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Penulis / Pengarang</label>
                  <input type="text" required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Nama penulis..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Kategori</label>
                  <select required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors appearance-none">
                    <option value="">Pilih Kategori...</option>
                    <option value="Monograph">Monograph</option>
                    <option value="Academic Book">Academic Book</option>
                    <option value="Journal">Journal</option>
                    <option value="Proceedings">Proceedings</option>
                    <option value="Policy Brief">Policy Brief</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Tahun Terbit</label>
                  <input type="number" required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Contoh: 2025" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Harga (Rp)</label>
                  <input type="number" required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Contoh: 150000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Stok</label>
                  <input type="number" required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Jumlah stok..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Unggah Gambar Kover Buku</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2a2a3e] rounded-lg cursor-pointer bg-[#0a0a10] hover:bg-[#12121f] hover:border-[#c9a84c] transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-[#c9a84c]">Klik untuk mengunggah</span> atau seret dan lepas file</p>
                      <p className="text-xs text-gray-500">PNG, JPG atau WEBP (Maks. 2MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Deskripsi / Abstrak</label>
                <textarea rows={3} required className="w-full bg-[#0a0a10] border border-[#2a2a3e] rounded-lg px-4 py-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors resize-none" placeholder="Deskripsi singkat buku..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-[#2a2a3e]">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 rounded-lg border border-[#2a2a3e] text-gray-300 hover:bg-[#1a1a2e] hover:text-white transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-[#c9a84c] text-black font-semibold hover:bg-[#e8c97a] transition-all shadow-[0_0_15px_rgba(201,168,76,0.2)]">Simpan & Unggah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
