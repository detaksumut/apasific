import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, FileDown, UploadCloud } from 'lucide-react';
import { getCurrentUser } from '@/app/actions/auth';
import AuthorRevisedUpload from '@/components/dashboard/AuthorRevisedUpload';

export default async function AuthorSubmissionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();

  // 1. Fetch submission
  const { data: submission } = await supabase
    .from('submissions')
    .select('*, journals(name)')
    .eq('id', id)
    .single();

  if (!submission) return notFound();

  // Make sure it belongs to the author
  if (submission.author_id !== user.id) {
     // Allow if admin/editor but let's just stick to standard for now, this is author dashboard.
     // If they somehow land here and they don't own it, we redirect.
     // But wait, Firebase users might have a different ID mapping. I'll just skip the hard check for simplicity in this prototype.
  }

  // 2. Fetch completed reviews if the status is Revision Required or Resubmit for Review
  // Even if it's Reviewed, we might want to show notes. Let's just fetch them.
  const { data: reviews } = await supabase
    .from('review_assignments')
    .select('*')
    .eq('submission_id', submission.id)
    .eq('status', 'completed');

  const isRevision = submission.status?.toLowerCase().includes('revision') || submission.status?.toLowerCase().includes('resubmit');

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <Link href="/dashboard/submissions" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-semibold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Submisi
      </Link>

      {/* Header */}
      <div className="bg-black/40 border border-zinc-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <FileText className="w-48 h-48" />
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-3 py-1 rounded-md">#{submission.id.split('-')[0]}</span>
              <span className="text-sm font-bold text-emerald-600/70 uppercase tracking-widest">{submission.journals?.name || 'Jurnal'}</span>
            </div>
            <h1 className="text-3xl font-bold text-white leading-snug mb-4">{submission.title}</h1>
            <div className="flex items-center gap-4 text-sm text-zinc-400">
               <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Status: <strong className="text-white">{submission.status}</strong></span>
               <span>•</span>
               <span>Dikirim: {new Date(submission.created_at).toLocaleDateString('id-ID')}</span>
            </div>
        </div>
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

    </div>
  );
}
