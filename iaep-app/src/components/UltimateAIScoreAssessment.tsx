"use client";

import { useState, useEffect } from "react";

interface Props {
  submissionId: string;
  pageCount?: number | null;
}

interface Assessment {
  topic_relevance: number;
  article_structure: number;
  abstract: number;
  research_gap: number;
  methodology: number;
  data_statistics: number;
  discussion: number;
  conclusion: number;
  references: number;
  page_count: number | null;
  page_count_available: boolean;
  direct_acceptance: boolean;
  overall_score: number;
  recommendation: string;
}

const SCORE_LABELS: [string, keyof Assessment][] = [
  ["Topik & Relevansi", "topic_relevance"],
  ["Struktur Artikel", "article_structure"],
  ["Abstract", "abstract"],
  ["Research Gap", "research_gap"],
  ["Metodologi", "methodology"],
  ["Data & Statistik", "data_statistics"],
  ["Discussion", "discussion"],
  ["Conclusion", "conclusion"],
  ["References", "references"],
];

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round((score / 10) * 100);
  const color =
    score >= 8 ? "#10b981" : score >= 6 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold w-8 text-right"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    Accept: { bg: "#d1fae5", text: "#065f46", label: "✅ Accept" },
    "Minor Revision": { bg: "#fef3c7", text: "#92400e", label: "🟡 Minor Revision" },
    "Major Revision": { bg: "#fee2e2", text: "#991b1b", label: "🔴 Major Revision" },
    Reject: { bg: "#fce7f3", text: "#9d174d", label: "❌ Reject" },
  };
  const style = map[rec] || { bg: "#f3f4f6", text: "#374151", label: rec };
  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

export default function UltimateAIScoreAssessment({
  submissionId,
  pageCount = null,
}: Props) {
  const [manuscriptText, setManuscriptText] = useState("");
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load saved assessment if available
  useEffect(() => {
    if (!submissionId) return;
    let isMounted = true;

    async function loadSavedAssessment() {
      try {
        const res = await fetch(`/api/editor/ultimateai-score?submissionId=${encodeURIComponent(submissionId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.assessment && isMounted) {
          setAssessment(data.assessment);
        }
      } catch (err) {
        // silent
      }
    }

    loadSavedAssessment();
    return () => {
      isMounted = false;
    };
  }, [submissionId]);

  const canAnalyze = manuscriptText.trim().length >= 100;

  async function handleAnalyze() {
    if (!canAnalyze || loading) return;
    setLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const res = await fetch("/api/editor/ultimateai-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: manuscriptText,
          submissionId,
          pageCount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menganalisis.");
      }
      setAssessment(data.assessment);
    } catch (e: any) {
      setError(e.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 border border-blue-100 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center gap-2">
        <span className="text-white text-sm font-bold tracking-wide">
          🤖 UltimateAI — Assessment Score
        </span>
        <span className="ml-auto text-[10px] text-blue-200 font-medium">
          Skor 0–10 per kategori
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Textarea */}
        {!assessment && (
          <>
            <p className="text-xs text-gray-500">
              Tempelkan teks naskah lengkap untuk dianalisis UltimateAI.
            </p>
            <textarea
              rows={6}
              value={manuscriptText}
              onChange={(e) => setManuscriptText(e.target.value)}
              placeholder="Tempel teks naskah di sini..."
              className="w-full text-xs border border-blue-200 rounded-lg p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y text-gray-800 placeholder-gray-400"
              data-gramm="false"
              spellCheck={false}
            />
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze || loading}
              className="w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-white"
              style={{
                background:
                  canAnalyze && !loading
                    ? "linear-gradient(90deg, #1d4ed8, #4f46e5)"
                    : "#9ca3af",
                cursor: canAnalyze && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Menganalisis...
                </span>
              ) : (
                "Analisis Score"
              )}
            </button>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {assessment && (
          <div className="space-y-3">
            {/* Overall */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-blue-100 shadow-sm">
              <div>
                <p className="text-[11px] text-gray-400 uppercase font-semibold">
                  OVERALL SCORE
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    {assessment.overall_score}
                  </span>
                  <span className="text-xs text-gray-400">/10</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <RecommendationBadge rec={assessment.recommendation} />
                <div className="text-[10px] text-emerald-600 font-semibold">
                  {assessment.direct_acceptance ? "✅ Layak Diterima Langsung" : "Perlu Peninjauan Lanjutan"}
                </div>
              </div>
            </div>

            {/* Page Count */}
            <div className="text-[11px] text-gray-500 bg-white/70 rounded px-3 py-1.5 border border-blue-50">
              <span className="font-semibold">Jumlah Halaman: </span>
              {assessment.page_count_available
                ? `${assessment.page_count} halaman`
                : "Tidak terdeteksi"}
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm space-y-2">
              <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-1">
                RINCIAN SKOR
              </p>
              {SCORE_LABELS.map(([label, key]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                    <span>{label}</span>
                  </div>
                  <ScoreBar score={assessment[key] as number} />
                </div>
              ))}
            </div>

            {/* Re-analyze button */}
            <button
              onClick={() => setAssessment(null)}
              className="w-full text-xs text-blue-600 hover:text-blue-800 underline text-center py-1 transition-colors"
            >
              Analisis Ulang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
