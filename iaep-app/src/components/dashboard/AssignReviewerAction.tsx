"use client";

import React, { useState } from 'react';
import { UserPlus, Search, X, CheckCircle, GraduationCap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AssignReviewerAction({ article, reviewers }: { article: any, reviewers: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleAssign = async (reviewerId: string) => {
    setIsAssigning(reviewerId);
    
    try {
      // 1. Create the assignment
      const { error: assignError } = await supabase
        .from('review_assignments')
        .insert({
          submission_id: article.id,
          reviewer_id: reviewerId,
          status: 'pending'
        });

      if (assignError) throw assignError;

      // 2. Update submission status if it's Awaiting Reviewers
      if (article.status === 'Awaiting Reviewers') {
        await supabase
          .from('submissions')
          .update({ status: 'Under Review' })
          .eq('id', article.id);
      }

      setIsOpen(false);
      router.refresh(); // Refresh page to show updated status
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      alert("Terjadi kesalahan saat menugaskan reviewer.");
    } finally {
      setIsAssigning(null);
    }
  };

  // Filter reviewers based on name and field of science
  const filteredReviewers = reviewers.filter(r => {
    const matchesName = (r.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesField = (r.academic_field || '').toLowerCase().includes(fieldFilter.toLowerCase());
    return matchesName && matchesField;
  });

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-black bg-[#c9a84c] hover:bg-[#e8c97a] rounded-lg transition-colors shadow-[0_0_15px_rgba(201,168,76,0.2)]"
      >
        <UserPlus className="w-4 h-4" /> Pilih & Tugaskan Reviewer
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-bold text-white">Tugaskan Reviewer</h2>
                <p className="text-sm text-zinc-400 mt-1">Naskah: <span className="text-[#c9a84c]">{article.title}</span></p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-6 border-b border-zinc-800 bg-zinc-950/50 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <GraduationCap className="w-4 h-4 text-[#c9a84c] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={fieldFilter}
                  onChange={(e) => setFieldFilter(e.target.value)}
                  placeholder="Filter Field of Science (ex. Accounting, Law)..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] transition-all"
                />
              </div>
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama reviewer atau universitas..." 
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-500 transition-all"
                />
              </div>
            </div>

            {/* Modal Body / Reviewer List */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredReviewers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-white font-medium mb-1">Tidak ada reviewer yang cocok</h3>
                  <p className="text-zinc-500 text-sm">Coba sesuaikan kata kunci pencarian atau filter bidang ilmu Anda.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReviewers.map(reviewer => (
                    <div key={reviewer.id} className="p-4 border border-zinc-800 rounded-xl bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors flex flex-col justify-between">
                      <div className="mb-4">
                        <h3 className="font-bold text-white text-base">{reviewer.full_name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <span className="text-xs text-zinc-400 flex items-start gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 mt-0.5 text-[#c9a84c] shrink-0" />
                            <span className="font-medium text-zinc-300">Bidang: {reviewer.academic_field || '-'}</span>
                          </span>
                          <span className="text-xs text-zinc-500">Univ: {reviewer.university || '-'}</span>
                          <span className="text-xs text-zinc-500">Negara: {reviewer.country || '-'}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleAssign(reviewer.id)}
                        disabled={isAssigning !== null}
                        className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2
                          ${isAssigning === reviewer.id 
                            ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                            : 'bg-zinc-800 text-white hover:bg-[#c9a84c] hover:text-black border border-zinc-700 hover:border-[#c9a84c]'
                          }
                        `}
                      >
                        {isAssigning === reviewer.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                            Menugaskan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Pilih Reviewer Ini
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
