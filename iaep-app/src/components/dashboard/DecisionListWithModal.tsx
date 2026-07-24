"use client";

import { useState } from "react";
import { Eye, Search, FileSignature, X, ExternalLink, Download, FileText, CheckCircle, Clock } from "lucide-react";

export default function DecisionListWithModal({ articles }: { articles: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const filteredArticles = articles.filter(article => {
    const titleMatch = (article.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = (article.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const journalMatch = (article.journals?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || authorMatch || journalMatch;
  });

  return (
    <>
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-[#c9a84c]" />
            Daftar Keputusan Editorial
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari naskah..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
            />
          </div>
        </div>
        
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileSignature className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-white font-medium mb-1">Tidak ada naskah ditemukan</h3>
            <p className="text-zinc-500 text-sm">Tidak ada riwayat keputusan yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filteredArticles.map((article: any) => (
              <div key={article.id} className="p-6 hover:bg-zinc-800/30 transition-colors group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {article.journals?.name || "Jurnal Tidak Diketahui"}
                      </span>
                      {['accepted', 'Accepted'].includes(article.status) ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Accepted
                        </span>
                      ) : ['Published', 'Production Completed'].includes(article.status) || Boolean(article.doi) ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Published
                        </span>
                      ) : ['Reviewed', 'Revision Required'].includes(article.status) ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Reviewed
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Rejected
                        </span>
                      )}
                      {article.doi && (
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
                          DOI: {article.doi}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#c9a84c] transition-colors line-clamp-1">
                      {article.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Penulis: <span className="text-zinc-300">{article.profiles?.full_name || 'Penulis'}</span> &bull; 
                      Tanggal Keputusan: {new Date(article.updated_at || article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedArticle(article)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 hover:border-[#c9a84c]/50 rounded-lg transition-all border border-zinc-700 active:scale-95 shadow-sm"
                      title="Lihat Rincian Catatan & Berkas"
                    >
                      <Eye className="w-4 h-4 text-[#c9a84c]" /> Lihat Catatan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Rincian Catatan Editorial */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl space-y-6 p-6 md:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {selectedArticle.journals?.name || "Jurnal APASIFIC"}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {['Published', 'Production Completed'].includes(selectedArticle.status) || selectedArticle.doi ? 'Published' : selectedArticle.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-2 leading-snug">
                  {selectedArticle.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-xl transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="space-y-6 text-sm text-zinc-300">
              
              {/* Meta Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Penulis Utama</span>
                  <span className="text-white font-medium">{selectedArticle.profiles?.full_name || 'Penulis Submisi'}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Tanggal Keputusan</span>
                  <span className="text-white font-medium">{new Date(selectedArticle.updated_at || selectedArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                {selectedArticle.doi && (
                  <div className="col-span-1 sm:col-span-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">DOI Publikasi Official</span>
                    <a 
                      href={`https://doi.org/${selectedArticle.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300 font-mono text-xs flex items-center gap-1 hover:underline"
                    >
                      https://doi.org/{selectedArticle.doi} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Catatan Reviewer & Editorial */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#c9a84c] uppercase tracking-wider flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4" /> Catatan & Ulasan Reviewer
                </h4>
                {selectedArticle.assignments && selectedArticle.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedArticle.assignments.map((assign: any, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white text-xs">
                            {assign.reviewer_name || assign.reviewer_email || `Reviewer ${idx + 1}`}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Rekomendasi: {assign.recommendation || assign.decision || 'Accept Submission'}
                          </span>
                        </div>
                        {assign.comments_for_editor && (
                          <div>
                            <span className="text-xs text-zinc-400 font-medium block">Catatan untuk Editor:</span>
                            <p className="text-zinc-200 text-xs mt-0.5 italic">{assign.comments_for_editor}</p>
                          </div>
                        )}
                        {assign.comments_for_author && (
                          <div>
                            <span className="text-xs text-zinc-400 font-medium block">Catatan untuk Penulis:</span>
                            <p className="text-zinc-300 text-xs mt-0.5">{assign.comments_for_author}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-950/40 rounded-xl border border-zinc-800/60 text-zinc-400 italic text-xs">
                    Naskah ini telah dipublikasikan resmi dengan seluruh tahapan ulasan yang disetujui tim Editor.
                  </div>
                )}
              </div>

              {/* Berkas & File Lampiran */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Berkas Naskah & Dokumen Terkait
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedArticle.file_url && (
                    <a 
                      href={selectedArticle.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg border border-zinc-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#c9a84c]" /> Unduh File Naskah Asli
                    </a>
                  )}
                  {selectedArticle.galley_file_url && (
                    <a 
                      href={selectedArticle.galley_file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-xs text-blue-300 rounded-lg border border-blue-500/30 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" /> Unduh Galley PDF Terbitan
                    </a>
                  )}
                  {selectedArticle.doi && (
                    <a 
                      href={`/publication`} 
                      target="_blank" 
                      className="flex items-center gap-2 px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-xs text-teal-300 rounded-lg border border-teal-500/30 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-teal-400" /> Lihat Publikasi Jurnal
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white rounded-xl transition-colors border border-zinc-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
