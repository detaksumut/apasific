"use client";

import React, { useState, useEffect } from "react";
import { Star, ShieldAlert, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  articleId?: string;
  title?: string;
  abstract?: string;
  doi?: string;
}

export default function ArticleScreeningReportCard({ articleId }: Props) {
  const [screeningData, setScreeningData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!articleId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchScreening() {
      try {
        const res = await fetch(`/api/article/tri-source-assessment?submissionId=${encodeURIComponent(articleId!)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && isMounted) {
          if (data.screening) {
            setScreeningData(data.screening);
          }
        }
      } catch (e) {
        // silent fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchScreening();
    return () => {
      isMounted = false;
    };
  }, [articleId]);

  // Missing persisted screening is shown as unavailable, never as a synthetic rating.
  const active = screeningData || {
    novelty_rating: null,
    methodology_rating: null,
    clarity_rating: null,
    confidence_score: null,
    summary_evaluation: "Belum ada hasil SCREEN tersimpan untuk naskah ini. Jangan menafsirkan keadaan ini sebagai penilaian positif atau negatif.",
    suggested_improvements: "Jalankan proses screening dan simpan hasilnya sebelum menggunakan indikator ini dalam penilaian tri-source.",
    model_name: null,
    prompt_version: null
  };

  const renderStars = (rating: number) => {
    const total = 5;
    if (typeof rating !== "number" || !Number.isFinite(rating)) {
      return <span className="text-xs text-amber-300">Belum tersedia</span>;
    }
    const score = Math.max(1, Math.min(5, Math.round(rating)));
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(total)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < score ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
          />
        ))}
        <span className="text-xs font-bold text-zinc-300 ml-1.5">{score}/5</span>
      </div>
    );
  };

  return (
    <div className="bg-[#111120] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
              Hasil Analisis Sistem atas Data Telaah
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                System Assessment Report
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Evaluasi berbasis sistem terhadap data telaah substantif dan metodologis naskah</p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 bg-[#16162a] border border-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{screeningData ? "STATUS: DATA SCREENING TERSIMPAN" : "STATUS: SCREENING BELUM TERSEDIA"}</span>
        </div>
      </div>

      {/* Transparency & Governance Disclaimer: does not imply verification of missing records. */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-4 text-xs leading-relaxed text-sky-100/90 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-sky-300 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-sky-200 font-semibold block mb-1 uppercase tracking-wider">
            Transparansi Penilaian & Tata Kelola Editorial:
          </strong>
          Sistem menyajikan indikator berdasarkan data screening yang tersimpan dan tersedia. Status tersimpan tidak dengan sendirinya membuktikan validitas atau verifikasi independen atas data tersebut. Jika data belum tersedia, indikator tidak boleh ditafsirkan sebagai penilaian positif maupun negatif. <strong>Keluaran sistem tidak menggantikan kewenangan Dewan Redaksi dalam menetapkan keputusan editorial.</strong>
        </div>
      </div>

      {/* Main Grid: Metrik (Kiri) & Ringkasan/Saran (Kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
        
        {/* Metrik Penilaian (4 cols) */}
        <div className="md:col-span-4 bg-[#16162a] border border-gray-850 rounded-2xl p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-1.5 mb-1">
              Hasil Analisis Sistem
            </h4>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Komputasi sistem berdasarkan kriteria editorial baku jurnal.
            </p>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Kebaruan (Novelty)</span>
              </div>
              {renderStars(active.novelty_rating)}
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Metodologi (Methodology)</span>
              </div>
              {renderStars(active.methodology_rating)}
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                <span>Kejelasan (Clarity)</span>
              </div>
              {renderStars(active.clarity_rating)}
            </div>

            <div className="pt-2 border-t border-gray-800">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-zinc-400">Tingkat Keselarasan Naskah</span>
                <span className="font-bold text-emerald-400">{typeof active.confidence_score === "number" ? `${active.confidence_score}%` : "Belum tersedia"}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, typeof active.confidence_score === "number" ? active.confidence_score : 0))}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-zinc-500 block mt-1">Script Alignment Index</span>
            </div>
          </div>
        </div>

        {/* Evaluasi Ringkasan & Saran Pelengkap (8 cols) */}
        <div className="md:col-span-8 space-y-4">
          
          {/* Evaluasi Ringkasan */}
          <div className="bg-[#16162a] border border-gray-850 rounded-2xl p-5">
            <div className="mb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Evaluasi Ringkasan (Evaluation Summary)
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                System-generated synthesis based on verified peer-review data.
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {active.summary_evaluation}
            </p>
          </div>

          {/* Saran Pelengkap & Rekomendasi Riset */}
          <div className="bg-[#16162a] border border-gray-850 rounded-2xl p-5">
            <div className="mb-2">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-sky-400" />
                Saran Pelengkap & Rekomendasi Riset
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                System-generated complementary recommendations for future research expansion.
              </span>
            </div>
            <div className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {active.suggested_improvements}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
