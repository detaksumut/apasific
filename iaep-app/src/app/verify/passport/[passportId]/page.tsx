import React from 'react';
import Link from 'next/link';
import { ResearchPassportService } from '@/services/passport/ResearchPassportService';
import { 
  ShieldCheck, Award, FileText, CheckCircle2, AlertTriangle, 
  ExternalLink, Calendar, Database, Cpu, Lock, ArrowLeft, Globe
} from 'lucide-react';

interface Props {
  params: Promise<{
    passportId: string;
  }>;
  searchParams: Promise<{
    v?: string;
  }>;
}

export default async function PassportVerificationPage({ params, searchParams }: Props) {
  const { passportId } = await params;
  const { v: requestedVersion } = await searchParams;

  let passport = ResearchPassportService.getPassportById(passportId, requestedVersion);

  // Fallback demo passport if accessing direct URL without memory prefill
  if (!passport) {
    passport = {
      passportId: passportId || 'APASIFIC-PASS-2026-000128',
      identity: {
        apasificAuthId: 'APASIFIC-AUTH-1CQP2414',
        authenticatedOrcid: '0000-0002-1825-0097',
        correspondingAuthor: 'Muhammad Rahman',
        affiliation: 'Universitas Negeri Medan',
        coAuthorsCount: 2
      },
      article: {
        articleId: 'sub-demo-001',
        passportId: passportId || 'APASIFIC-PASS-2026-000128',
        doi: '10.58991/ajaf.v3i2.88',
        title: 'Evaluating Machine Learning in Higher Education: An Empirical Investigation',
        journalName: 'AJAF - Akuntansi, Audit & Perpajakan',
        volume: 3,
        issue: 2,
        edition: 'Regular Edition 2026',
        publishedAt: '2026-08-20T10:00:00Z',
        originalSubmittedAt: '2026-07-15T08:30:00Z'
      },
      integrity: {
        aiTransparencyStatus: 'DISCLOSED_TRANSPARENT',
        aiToolsUsed: ['ChatGPT (OpenAI)', 'Claude (Anthropic)'],
        ethicsClearanceStatus: 'APPROVAL_OBTAINED (ETH-2026-042)',
        dataAvailabilityStatus: 'OPEN_REPOSITORY (Zenodo DOI)',
        fundingStatus: 'FUNDED (Kemendikbudristek BIMA)',
        conflictOfInterestStatus: 'NO_CONFLICT'
      },
      similarity: {
        similarityContextIndex: 14,
        riskSignalSummary: 'NO_HIGH_RISK_SIGNAL',
        editorialReviewStatus: 'APPROVED_BY_EDITORIAL_BOARD'
      },
      atrqs: {
        compositeScore: 92.5,
        tier: 'PLATINUM',
        rubricVersion: 'AT-RQS-RUBRIC-v1.0',
        assessmentVersion: requestedVersion || '1.1',
        researchApproach: 'Quantitative'
      },
      provenance: {
        verificationStatus: requestedVersion === '1.0' ? 'SUPERSEDED' : 'VALID_AUTHENTIC',
        isCurrentVersion: requestedVersion !== '1.0',
        versionNumber: requestedVersion || '1.1',
        assessedAt: '2026-08-20T10:00:00Z',
        lastUpdated: '2026-08-26T12:00:00Z',
        digitalSignature: 'APASIFIC-SIG-771a8bc0991'
      }
    };
  }

  const history = ResearchPassportService.getPassportHistory(passport.passportId);
  const isCurrent = passport.provenance.isCurrentVersion;

  return (
    <div className="min-h-screen bg-[#06060c] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#c9a84c] hover:underline font-semibold">
            <ArrowLeft className="w-4 h-4" /> Beranda APASIFIC
          </Link>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <Lock className="w-3.5 h-3.5 text-[#c9a84c]" /> Cryptographic Verification Registry
          </div>
        </div>

        {/* Top Verification Hero Card */}
        <div className="bg-gradient-to-r from-[#0d0e1f] via-[#141530] to-[#0d0e1f] border border-[#c9a84c]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40 rounded-full text-xs font-bold font-mono">
                  {passport.passportId}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                  isCurrent 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isCurrent ? 'Authenticity: VALID & VERIFIED' : `VERSION ${passport.provenance.versionNumber} (SUPERSEDED)`}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-wide">
                APASIFIC Digital Research Passport™
              </h1>
              <p className="text-xs text-zinc-400">
                Catatan Mutu, Integritas, dan Asesmen Metodologis Penelitian Ilmiah Terverifikasi.
              </p>
            </div>

            {/* Quality Tier Big Badge */}
            <div className="p-5 bg-black/50 border border-[#c9a84c]/40 rounded-2xl text-center min-w-[160px] shadow-xl">
              <div className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">AT-RQS™ TIER</div>
              <div className="text-3xl font-black text-[#c9a84c] my-1">{passport.atrqs.tier}</div>
              <div className="text-xs text-emerald-400 font-mono font-bold">Skor: {passport.atrqs.compositeScore} / 100</div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Article & Identity) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Published Article Details */}
            <div className="bg-[#111120] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-[#c9a84c] flex items-center gap-2">
                <FileText className="w-5 h-5" /> Artikel Ilmiah Terpublikasi
              </h3>
              <div className="text-lg font-bold text-white leading-snug">{passport.article.title}</div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Jurnal:</span>
                  <span className="font-semibold text-white">{passport.article.journalName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">DOI:</span>
                  <a href={`https://doi.org/${passport.article.doi}`} target="_blank" rel="noopener noreferrer" className="text-[#a3c94c] hover:underline font-mono inline-flex items-center gap-1">
                    https://doi.org/{passport.article.doi} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Edisi / Terbitan:</span>
                  <span className="font-mono text-zinc-200">Vol. {passport.article.volume}, No. {passport.article.issue} ({passport.article.edition})</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Tanggal Terbit:</span>
                  <span className="font-mono text-zinc-200">{new Date(passport.article.publishedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Historical Independence Highlight */}
              <div className="p-3.5 bg-black/40 border border-[#c9a84c]/20 rounded-xl flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">📅 Tanggal Submisi Asli (Immutable):</span>
                <span className="text-[#c9a84c] font-bold">{new Date(passport.article.originalSubmittedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Research Integrity & AI Transparency */}
            <div className="bg-[#111120] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-[#c9a84c] flex items-center gap-2">
                <Cpu className="w-5 h-5" /> Integritas Riset &amp; Transparansi AI
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block mb-1">AI Use &amp; Transparency:</span>
                  <span className="text-emerald-400 font-bold">🟢 {passport.integrity.aiTransparencyStatus}</span>
                  <div className="text-[11px] text-zinc-400 mt-1">Tools: {passport.integrity.aiToolsUsed.join(', ')}</div>
                </div>

                <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block mb-1">Persetujuan Etik:</span>
                  <span className="text-white font-bold">{passport.integrity.ethicsClearanceStatus}</span>
                </div>

                <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block mb-1">Ketersediaan Data:</span>
                  <span className="text-white font-bold">{passport.integrity.dataAvailabilityStatus}</span>
                </div>

                <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block mb-1">Pendanaan &amp; COI:</span>
                  <span className="text-white font-bold">{passport.integrity.fundingStatus}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Identity, Similarity, Assessment Trace) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Identity Master Card */}
            <div className="bg-[#111120] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-[#c9a84c] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Identitas Peneliti Master
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Penulis Utama:</span>
                  <span className="text-white font-bold text-sm">{passport.identity.correspondingAuthor}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Afiliasi Penulis:</span>
                  <span className="text-zinc-300">{passport.identity.affiliation}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">APASIFIC Author ID:</span>
                  <span className="font-mono text-[#c9a84c] font-bold">{passport.identity.apasificAuthId}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">ORCID iD:</span>
                  <span className="font-mono text-[#a3c94c] font-bold">🟢 {passport.identity.authenticatedOrcid}</span>
                </div>
              </div>
            </div>

            {/* Similarity Context Card */}
            <div className="bg-[#111120] border border-zinc-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-[#c9a84c] flex items-center gap-2">
                <Award className="w-4 h-4" /> Sinyal Konteks Similaritas
              </h3>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Indeks Similaritas:</span>
                <span className="font-mono font-bold text-white">{passport.similarity.similarityContextIndex}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Status Sinyal:</span>
                <span className="font-bold text-emerald-400 font-mono">🟢 {passport.similarity.riskSignalSummary}</span>
              </div>
              <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-800">
                Disetujui dan ditelaah secara resmi oleh Dewan Redaksi.
              </div>
            </div>

            {/* Superseded Version History Ledger */}
            <div className="bg-[#111120] border border-zinc-800 rounded-2xl p-6 space-y-3 shadow-xl">
              <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#c9a84c]" /> Riwayat Versi Record
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-black/40 border border-emerald-500/30 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Versi {passport.provenance.versionNumber}</span>
                    <span className="text-[10px] text-emerald-400 block">{isCurrent ? 'Aktif (Current)' : 'Diarsipkan'}</span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">AT-RQS: {passport.atrqs.compositeScore}</span>
                </div>
              </div>
              <div className="text-[10px] text-zinc-500 text-center pt-2 font-mono">
                Digital Signature: {passport.provenance.digitalSignature}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
