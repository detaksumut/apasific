import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, FileDown, UploadCloud, Clock, Check } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import AuthorRevisedUpload from '@/components/dashboard/AuthorRevisedUpload';

export default async function AuthorSubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();

  // 1. Fetch submission — try Supabase first, fallback to Firestore
  let submission: any = null;

  const { data: sbSub } = await supabase
    .from('submissions')
    .select('*, journals(name)')
    .eq('id', id)
    .single();

  if (sbSub) {
    submission = sbSub;
  }

  if (!submission) return notFound();

  // 2. Fetch completed reviews
  const { data: reviews } = await supabase
    .from('review_assignments')
    .select('*')
    .eq('submission_id', id)
    .eq('status', 'completed');

  // 3. Fetch submission history (Supabase)
  const { data: sbHistory } = await supabase
    .from('submission_history')
    .select('*')
    .eq('submission_id', id)
    .order('created_at', { ascending: true });

  let historyData: any[] = sbHistory || [];

  // Also fetch from Firestore history if none found in Supabase
  if (historyData.length === 0) {
    try {
      const { getFirestore } = await import('@/utils/firebase/db');
      const db = getFirestore();
      const fbHistSnap = await db.collection('submission_history').where('submission_id', '==', id).orderBy('created_at', 'asc').get();
      historyData = fbHistSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate ? doc.data().created_at.toDate().toISOString() : new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Firestore history fetch failed:', e);
    }
  }

  const isRevision = submission.status?.toLowerCase().includes('revision') || submission.status?.toLowerCase().includes('resubmit');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <Link href="/dashboard/submissions" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Submisi
      </Link>

      {/* Header & Cover Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
        <div className={submission.cover_file_url ? "md:col-span-8" : "md:col-span-12"}>
          {/* Main Info Card */}
          <div className="bg-black/40 border border-zinc-800 rounded-2xl p-8 h-full relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <FileText className="w-48 h-48" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-3 py-1 rounded-md">#{submission.id.includes('-') ? submission.id.split('-')[0] : submission.id.slice(0, 12)}</span>
                  <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{submission.journals?.name || 'Jurnal'}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4">{submission.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                   <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Status: <strong className="text-white">{submission.status}</strong></span>
                   <span>•</span>
                   <span>Dikirim: {new Date(submission.created_at).toLocaleDateString('id-ID')}</span>
                </div>
            </div>
          </div>
        </div>

        {submission.cover_file_url && (
          <div className="md:col-span-4 flex flex-col items-center">
            <div className="bg-black/40 border border-zinc-800 rounded-2xl p-4 w-full flex flex-col items-center shadow-2xl">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Sampul Depan (Cover)</span>
              <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-lg w-full max-w-[200px] aspect-[1/1.414] relative" style={{ containerType: 'inline-size' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={submission.cover_file_url} alt="Cover Artikel" className="w-full h-full object-cover relative z-0" />
                {submission.doi && (
                  <a 
                    href={submission.doi.includes('zenodo.') ? `https://zenodo.org/records/${submission.doi.split('zenodo.')[1]}` : `https://doi.org/${submission.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute z-10 font-bold flex items-center hover:underline hover:text-emerald-300 transition-colors" 
                    style={{
                      top: (() => {
                        let hasScope = false;
                        try {
                          if (submission?.abstract) {
                            const parsed = JSON.parse(submission.abstract);
                            if (parsed.scope || (parsed.keywords && parsed.keywords.includes('Scope:'))) hasScope = true;
                          }
                        } catch(e) {}
                        const doiY = hasScope ? 440 : 370;
                        const topEdge = doiY - 32;
                        return `${(topEdge / 1754) * 100}%`;
                      })(),
                      left: 0,
                      width: '100%',
                      backgroundColor: 'transparent',
                      display: 'flex',
                      justifyContent: 'center',
                      fontSize: '1.8cqw',
                      textDecoration: 'none',
                      lineHeight: '1.2',
                      color: 'transparent'
                    }}
                  >
                    {submission.doi}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isRevision && (
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-500 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-yellow-500 mb-2">Naskah Memerlukan Perbaikan (Revisi)</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                        Editor telah meninjau hasil pemeriksaan dari Reviewer dan memutuskan bahwa naskah Anda memerlukan perbaikan sebelum dapat diproses ke tahap selanjutnya. Silakan baca catatan di bawah ini dan unggah naskah yang telah direvisi.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Reviewer Notes Section */}
      {(isRevision || submission.status === 'Reviewed' || submission.status === 'Accepted') && reviews && reviews.length > 0 && (
          <div className="space-y-6 mb-10">
              <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-3">Catatan Pemeriksaan (Reviewer)</h3>
              
              {reviews.map((rev: any, idx: number) => (
                  <div key={rev.id} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                      <h4 className="text-emerald-500 font-bold mb-4">Reviewer {idx + 1}</h4>
                      
                      {rev.comments_for_author && (
                          <div className="mb-4">
                              <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Komentar Umum:</h5>
                              <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                  {rev.comments_for_author}
                              </div>
                          </div>
                      )}

                      {rev.correction_notes && (
                          <div className="mb-4">
                              <h5 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Catatan Koreksi Spesifik:</h5>
                              <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                                  {rev.correction_notes}
                              </div>
                          </div>
                      )}

                      {(rev.annotated_file_url || rev.review_file_url) && (
                          <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                              <div>
                                  <h5 className="text-sm font-bold text-white mb-1">File Beranotasi dari Reviewer</h5>
                                  <p className="text-xs text-zinc-500">File PDF ini berisi coretan atau catatan langsung pada naskah.</p>
                              </div>
                              <a 
                                href={rev.annotated_file_url || rev.review_file_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm font-bold transition-colors"
                              >
                                  <FileDown className="w-4 h-4" /> Download PDF
                              </a>
                          </div>
                      )}
                  </div>
              ))}
          </div>
      )}

      {/* Upload Revised Manuscript */}
      {isRevision && (
          <AuthorRevisedUpload submissionId={submission.id} />
      )}

      {/* Submission Timeline / History */}
      {historyData && historyData.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold text-white border-b border-zinc-800 pb-3 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-500" />
            Riwayat Perjalanan Naskah (Timeline)
          </h3>
          <div className="relative border-l border-zinc-800 ml-3 space-y-8 pb-4">
            {historyData.map((item: any, idx: number) => {
               const isLast = idx === historyData.length - 1;
               return (
                 <div key={item.id} className="relative pl-8">
                   {/* Timeline dot */}
                   <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[#0b0c10] ${isLast ? 'bg-emerald-500' : 'bg-zinc-700'}`}></span>
                   
                   <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                     <div>
                       <h4 className={`text-base font-bold ${isLast ? 'text-emerald-400' : 'text-zinc-200'}`}>
                         {item.action}
                       </h4>
                       {item.details && (
                         <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
                           {item.details}
                         </p>
                       )}
                     </div>
                     <span className="text-xs font-mono text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 whitespace-nowrap self-start">
                       {new Date(item.created_at).toLocaleString('id-ID', {
                         day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                       })}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
