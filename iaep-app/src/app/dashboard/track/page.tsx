"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ChevronDown, ChevronUp, CheckCircle2, Circle, FileText } from "lucide-react";

type HistoryEntry = { id: string; action: string; details?: string; created_at: string };
type Submission = { id: string; title: string; status: string; created_at: string; journals?: { name: string }; history?: HistoryEntry[] };

const STAGES = [
  "Naskah Disubmit",
  "Diterima Editor",
  "Ditugaskan ke Reviewer",
  "Proses Review",
  "Review Selesai",
  "Keputusan Editor",
  "Terbit LOA",
  "Proses Layout Editor",
  "Proses Cover Editor",
  "Proses Publish Editor",
  "Verifikasi Supervisor",
  "Validasi Akhir Editor",
  "Diterbitkan",
];

function matchStage(action: string): number {
  const a = action.toLowerCase();
  if (a.includes("submitted") || a.includes("disubmit")) return 0;
  if (a.includes("assigned to reviewer") || a.includes("reviewer assigned")) return 2;
  if (a.includes("review") && a.includes("completed")) return 4;
  if (a.includes("review")) return 3;
  if (a.includes("editor decision") && a.includes("accepted")) return 6;
  if (a.includes("editor decision")) return 5;
  if (a.includes("stage updated") && a.includes("layout")) return 7;
  if (a.includes("stage updated") && a.includes("cover")) return 8;
  if (a.includes("stage updated") && a.includes("publish")) return 9;
  if (a.includes("supervisor") || a.includes("production completed")) return 10;
  if (a.includes("final validation") || a.includes("kembali ke editor") || a.includes("final check")) return 11;
  if (a.includes("published")) return 12;
  return -1;
}

function getImpliedStage(status: string): number {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s === "published") return 12;
  if (s === "final validation") return 11;
  if (s === "production completed") return 10;
  if (s === "production") return 9;
  if (s === "copyediting") return 7;
  if (s === "accepted") return 6;
  if (s === "in review") return 3;
  return 0;
}

export default function TrackProcess() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load(isSilent = false) {
      if (isSilent) setIsLiveSyncing(true);
      try {
        const res = await fetch("/api/author/submissions");
        if (!res.ok) { 
           if (isMounted) window.location.href = "/auth/login"; 
           return; 
        }
        const json = await res.json();
        const subs: Submission[] = json.submissions || [];

        // Fetch history for each submission
        await Promise.all(subs.map(async (sub) => {
          const hRes = await fetch(`/api/author/submission-history?id=${sub.id}`);
          if (hRes.ok) {
            const hJson = await hRes.json();
            sub.history = hJson.history || [];
          } else {
            sub.history = [];
          }
        }));

        if (isMounted) setSubmissions(subs);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsLiveSyncing(false);
        }
      }
    }
    
    // Initial load
    load(false);

    // Auto refresh every 10 seconds for "live" feel
    const intervalId = setInterval(() => {
      load(true);
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pt-12 text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Memuat riwayat perjalanan naskah...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Clock className="w-7 h-7 text-emerald-500" />
            Lacak Proses Naskah
          </h1>
          <p className="text-zinc-400 mt-2 text-sm">
            Pantau perjalanan setiap naskah Anda secara lengkap — dari submit hingga terbit.
          </p>
        </div>
        
        {/* Live Sync Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full self-start md:self-auto">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${isLiveSyncing ? 'animate-ping' : ''}`}></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-500/80">
            {isLiveSyncing ? 'Sinkronisasi...' : 'Live Sync Aktif'}
          </span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center p-12 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 font-medium">Belum ada naskah yang disubmit.</p>
          <Link href="/dashboard/submit" className="inline-block mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors">
            Submit Naskah Pertama
          </Link>
        </div>
      ) : (
        submissions.map(sub => {
          const history = sub.history || [];
          const reachedStages = new Set<number>();
          history.forEach(h => {
            const idx = matchStage(h.action);
            if (idx >= 0) reachedStages.add(idx);
          });
          // Always mark stage 0 (submitted)
          reachedStages.add(0);

          // Mark all stages up to implied stage based on status
          const impliedMax = getImpliedStage(sub.status);
          for (let i = 0; i <= impliedMax; i++) {
            reachedStages.add(i);
          }

          const maxReached = reachedStages.size > 0 ? Math.max(...reachedStages) : 0;
          const isOpen = expanded[sub.id] ?? true;

          return (
            <div key={sub.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
              {/* Card Header */}
              <button
                onClick={() => toggle(sub.id)}
                className="w-full flex items-start justify-between gap-4 p-6 text-left hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded border border-zinc-700">
                      {sub.journals?.name || "Jurnal"}
                    </span>
                    <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${
                      sub.status === "Published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : sub.status === "Rejected" ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {sub.status || "Pending"}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">{sub.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Disubmit: {new Date(sub.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex-shrink-0 text-zinc-500 mt-1">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Timeline Body */}
              {isOpen && (
                <div className="px-6 pb-8 border-t border-zinc-800/60">
                  {/* Progress Bar */}
                  <div className="mt-6 mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500">Progress</span>
                      <span className="text-xs text-emerald-400 font-bold">{Math.round((maxReached / (STAGES.length - 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-1.5 rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((maxReached / (STAGES.length - 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vertical Stepper */}
                  <div className="relative border-l-2 border-zinc-800 ml-2 space-y-0">
                    {STAGES.map((stage, idx) => {
                      const done = reachedStages.has(idx);
                      const isCurrent = idx === maxReached && sub.status !== "Published";
                      const histEntry = history.find(h => matchStage(h.action) === idx);

                      return (
                        <div key={idx} className="relative pl-8 pb-6 last:pb-0">
                          {/* Dot */}
                          <span className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            done ? "bg-emerald-500 border-emerald-600" :
                            isCurrent ? "bg-amber-500 border-amber-600 animate-pulse" :
                            "bg-zinc-800 border-zinc-700"
                          }`}>
                            {done && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>

                          <div>
                            <h4 className={`text-sm font-semibold ${done ? "text-emerald-400" : isCurrent ? "text-amber-400" : "text-zinc-600"}`}>
                              {stage}
                            </h4>
                            {histEntry && (
                              <p className="text-xs text-zinc-500 mt-0.5">
                                {new Date(histEntry.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                {histEntry.details && <span className="block text-zinc-500 mt-0.5 italic">{histEntry.details}</span>}
                              </p>
                            )}
                            {!histEntry && !done && (
                              <p className="text-xs text-zinc-700 mt-0.5">Menunggu proses...</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Raw History Log */}
                  {history.length > 0 && (
                    <details className="mt-8 group">
                      <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300 transition-colors select-none flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Lihat Log Aktivitas Lengkap ({history.length} catatan)
                      </summary>
                      <div className="mt-4 space-y-3">
                        {history.map((h) => (
                          <div key={h.id} className="flex justify-between gap-4 py-2 border-b border-zinc-800/60 last:border-0">
                            <div>
                              <p className="text-xs font-semibold text-zinc-300">{h.action}</p>
                              {h.details && <p className="text-xs text-zinc-500 mt-0.5">{h.details}</p>}
                            </div>
                            <span className="text-xs font-mono text-zinc-600 whitespace-nowrap flex-shrink-0">
                              {new Date(h.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  <div className="mt-6">
                    <Link
                      href={`/dashboard/submissions/${sub.id}`}
                      className="inline-flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Lihat Detail Naskah & Catatan Reviewer
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
