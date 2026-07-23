import React from 'react';
import { Clock, Download, FileCheck } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AcceptanceLetter() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth/login');

  const supabase = await createClient();

  let searchId = user.id;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(searchId)) {
      const hex = Buffer.from(searchId).toString('hex').padEnd(32, '0').slice(0, 32);
      searchId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
  }

  // Fetch submissions that belong to the user
  const { data: supabaseSubmissions } = await supabase
    .from('submissions')
    .select('*, journals(name)')
    .in('author_id', [user.id, searchId])
    .order('created_at', { ascending: false });

  let loas = supabaseSubmissions ? [...supabaseSubmissions] : [];

  // Pure Supabase SSOT Read (No Firestore read lag)

  loas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="pb-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold text-white tracking-tight">Letter of Acceptance (LoA)</h1>
        <p className="text-zinc-400 mt-2 text-sm">Unduh dokumen Letter of Acceptance (LoA) untuk artikel Anda yang telah disetujui (Accepted).</p>
      </div>

      {/* LoA List */}
      <div className="space-y-4">
        {loas.length === 0 ? (
           <div className="text-center p-8 bg-zinc-900/40 border border-zinc-800 rounded-xl">
             <p className="text-zinc-500">Anda belum memiliki naskah yang disubmit.</p>
           </div>
        ) : (
          loas.map((loa) => {
            const isAccepted = ['Accepted', 'Copyediting', 'Production', 'Production Completed', 'Published'].includes(loa.status);
            
            return (
              <div key={loa.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-zinc-900/60 hover:border-emerald-500/30 transition-all group">
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-1 bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                      {loa.journals?.name || 'Jurnal'}
                    </span>
                    <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-1 rounded border ${isAccepted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                      STATUS: {loa.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors leading-relaxed">
                    {loa.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <FileCheck className="w-3.5 h-3.5" /> Disubmit: {new Date(loa.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>

                <div className="flex-shrink-0 w-full md:w-auto">
                  {!isAccepted ? (
                    <div className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 font-medium px-5 py-2.5 rounded-md text-sm">
                      <Clock className="w-4 h-4" /> Belum Terbit (Masih Proses)
                    </div>
                  ) : (
                    <Link 
                      href={`/dashboard/loa/print/${loa.id}`} 
                      target="_blank"
                      className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-md text-sm shadow-sm ring-1 ring-emerald-500/50 transition-all"
                    >
                      <Download className="w-4 h-4" /> Cetak/Unduh LoA (PDF)
                    </Link>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
