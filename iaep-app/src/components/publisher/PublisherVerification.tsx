import React from 'react';

export const PublisherVerification = () => {
  return (
    <div className="bg-[#111120] border border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 text-xs sm:text-sm font-sans">
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-850 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Publisher Verification</span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Official Entity
        </span>
      </h4>
      <div className="bg-[#16162a] border border-gray-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Publisher</span>
            <span className="font-bold text-white text-sm">PT Bernas Sumut Jaya</span>
          </div>
          <div>
            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Legal Entity (Kemenkumham)</span>
            <span className="font-bold text-cyan-300 font-mono text-xs sm:text-sm">AHU-0034291.AH.01.01.2026</span>
          </div>
          <div>
            <span className="block text-gray-500 text-[10px] uppercase font-bold mb-0.5">Klasifikasi KBLI</span>
            <span className="font-medium text-gray-300 text-xs">58110 (Penerbitan Buku/Jurnal) &amp; 63121 (Portal Web)</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Status:</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30 text-xs">
              Verified
            </span>
          </div>
          <span className="text-xs text-gray-500 italic">Evidence: AHU Online</span>
        </div>
      </div>
    </div>
  );
};

