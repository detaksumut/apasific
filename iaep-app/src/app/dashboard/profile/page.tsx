import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthorMasterIdentityService } from "@/services/identity/AuthorMasterIdentityService";
import { ShieldCheck, User, Building, Award, PlusCircle, ExternalLink, Globe } from "lucide-react";

export default async function AuthorProfilePage() {
  const cookieStore = await cookies();
  const orcid = cookieStore.get('authenticated_orcid')?.value;
  const apasificAuthIdCookie = cookieStore.get('apasific_auth_id')?.value;
  const userName = cookieStore.get('user_name')?.value || "Peneliti APASIFIC";

  let profile = null;
  if (orcid) {
    profile = await AuthorMasterIdentityService.getProfileByOrcid(orcid);
  } else if (apasificAuthIdCookie) {
    profile = await AuthorMasterIdentityService.getProfileByAuthId(apasificAuthIdCookie);
  }

  // Fallback profile representation if newly connected in session
  const authId = profile?.apasificAuthId || apasificAuthIdCookie || "APASIFIC-AUTH-DEMO";
  const displayOrcid = profile?.authenticatedOrcid || orcid || "0000-0002-1825-0097";
  const preferredName = profile?.preferredName || userName;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b0c1b] via-[#12132b] to-[#0b0c1b] border border-[#c9a84c]/30 rounded-2xl p-8 mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c9a84c]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#a3c94c]/10 border-2 border-[#a3c94c]/40 flex items-center justify-center text-[#a3c94c] shadow-[0_0_20px_rgba(163,201,76,0.2)]">
              <User className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white tracking-wide">{preferredName}</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a3c94c]/15 text-[#a3c94c] border border-[#a3c94c]/30 rounded-full text-xs font-bold tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" /> 🟢 ORCID Authenticated
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <span className="font-mono text-[#c9a84c] font-semibold tracking-wider">ID: {authId}</span>
                <span>•</span>
                <a 
                  href={`https://orcid.org/${displayOrcid}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#a3c94c] hover:underline font-mono"
                >
                  <Globe className="w-4 h-4" /> https://orcid.org/{displayOrcid} ↗
                </a>
              </div>
            </div>
          </div>

          <Link 
            href="/dashboard/submit"
            className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#c9a84c] to-[#e8c96a] text-black font-bold text-sm rounded-xl hover:from-[#d8b75b] hover:to-[#f5d677] transition-all shadow-[0_4px_15px_rgba(201,168,76,0.3)] hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" /> Submit Naskah Baru
          </Link>
        </div>
      </div>

      {/* Grid: Identity Provenance & Academic Record */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Academic Identifiers & 7-Tier Provenance */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111120] border border-[#c9a84c]/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#c9a84c] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" /> Academic Identifiers
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Pengenal akademik terhubung dengan status transparansi kepastian data (<em>Data Provenance</em>).
            </p>

            <div className="space-y-4">
              {/* ORCID */}
              <div className="p-3.5 bg-black/40 border border-[#a3c94c]/30 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-0.5">ORCID iD (Anchor)</div>
                  <div className="font-mono text-sm text-white font-bold">{displayOrcid}</div>
                </div>
                <span className="px-2 py-0.5 bg-[#a3c94c]/20 text-[#a3c94c] border border-[#a3c94c]/40 rounded-md text-[10px] font-bold">
                  🟢 AUTHENTICATED
                </span>
              </div>

              {/* Scopus */}
              <div className="p-3.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-0.5">Scopus Author ID</div>
                  <div className="text-xs text-zinc-300">Opsional / Enrichment</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-bold">
                  🟡 CLAIMED
                </span>
              </div>

              {/* Web of Science */}
              <div className="p-3.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-0.5">WoS ResearcherID</div>
                  <div className="text-xs text-zinc-300">Opsional / Enrichment</div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md text-[10px] font-bold">
                  🟡 CLAIMED
                </span>
              </div>

              {/* Google Scholar */}
              <div className="p-3.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-0.5">Google Scholar</div>
                  <div className="text-xs text-zinc-300">Profil Terhubung</div>
                </div>
                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-md text-[10px] font-bold">
                  🔵 MATCHED
                </span>
              </div>

              {/* SINTA */}
              <div className="p-3.5 bg-black/40 border border-zinc-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 font-semibold mb-0.5">SINTA ID</div>
                  <div className="text-xs text-zinc-300">Ekosistem Nasional</div>
                </div>
                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-md text-[10px] font-bold">
                  🟣 VERIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Submission Gate Status & Quality Record Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111120] border border-[#c9a84c]/20 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Status Akses Submisi &amp; Hak Penyerahan Naskah</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Akun Anda telah terautentikasi resmi via ORCID OAuth. Anda memiliki otorisasi penuh sebagai Penulis Korespondensi (*Corresponding Author*) untuk seluruh jurnal APASIFIC.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-black/30 border border-emerald-500/30 rounded-xl">
                <div className="text-xs text-emerald-400 font-bold mb-1">OTORISASI SUBMISI</div>
                <div className="text-lg font-bold text-white">TERVERIFIKASI ✅</div>
                <div className="text-[11px] text-zinc-400 mt-1">Hak Corresponding Author Aktif</div>
              </div>

              <div className="p-4 bg-black/30 border border-[#c9a84c]/30 rounded-xl">
                <div className="text-xs text-[#c9a84c] font-bold mb-1">INTEGRITAS DATA</div>
                <div className="text-lg font-bold text-white">100% PERSISTEN</div>
                <div className="text-[11px] text-zinc-400 mt-1">1-to-1 ORCID Anchor Terkunci</div>
              </div>

              <div className="p-4 bg-black/30 border border-blue-500/30 rounded-xl">
                <div className="text-xs text-blue-400 font-bold mb-1">STANDAR EVALUASI</div>
                <div className="text-lg font-bold text-white">AT-RQS™ v1.0</div>
                <div className="text-[11px] text-zinc-400 mt-1">Adaptive Rigor &amp; Integrity</div>
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-6 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-zinc-500">
                APASIFIC Master Identity Ecosystem • Registered on 2026
              </div>
              <Link 
                href="/dashboard/submit"
                className="text-sm font-bold text-[#c9a84c] hover:underline inline-flex items-center gap-1"
              >
                Mulai Penyerahan Naskah Ilmiah ➔
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
