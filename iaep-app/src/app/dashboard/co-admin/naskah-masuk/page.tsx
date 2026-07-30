"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { lolosAdministrasi } from "@/app/actions/coAdminActions";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function NaskahMasukPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("*, journals(name)")
      .in("status", ["Submitted", "submitted", "queued", "pending"])
      .order("created_at", { ascending: false });
    
    if (data) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const handleLolosAdministrasi = async (id: string) => {
    try {
      await lolosAdministrasi(id);
      fetchSubmissions();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  if (loading) {
    return <div className="text-zinc-400 p-8 text-center animate-pulse">Loading naskah masuk...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">Naskah Masuk (Screening)</h1>
        <p className="text-zinc-400 mt-2 text-sm">Review kelengkapan administrasi naskah baru sebelum ditugaskan ke Reviewer.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-800/50 text-zinc-300 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Judul & Penulis</th>
                <th className="px-6 py-4">Jurnal & Scope</th>
                <th className="px-6 py-4">Waktu Submit</th>
                <th className="px-6 py-4">File Naskah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                    <p className="text-zinc-400">Tidak ada naskah baru yang masuk.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  let authorName = "Penulis Tidak Diketahui";
                  try {
                    const parsed = JSON.parse(sub.abstract || "{}");
                    if (parsed.authors && parsed.authors.length > 0) {
                      authorName = parsed.authors[0].full_name;
                    }
                  } catch (e) {}

                  return (
                    <tr key={sub.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium mb-1 line-clamp-2">{sub.title || "Tanpa Judul"}</div>
                        <div className="text-zinc-500 text-xs flex items-center gap-1">
                          {authorName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md font-medium text-xs mb-1">
                          {sub.journals?.name || "Jurnal Tidak Diketahui"}
                        </span>
                        <div className="text-xs text-zinc-500">{sub.scope || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {sub.pdf_url && (
                            <a href={sub.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Title Page
                            </a>
                          )}
                          {sub.anonymous_pdf_url && (
                            <a href={sub.anonymous_pdf_url} target="_blank" rel="noreferrer" className="text-xs text-teal-400 hover:underline flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Anonymous
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 text-yellow-400 rounded-full font-medium text-xs">
                          <Clock className="w-3 h-3" /> {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleLolosAdministrasi(sub.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Lolos Administrasi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
