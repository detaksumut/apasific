import React from 'react';

export const PublisherVerification = () => {
  return (
    <div className="bg-[#070714] border border-blue-950/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden mt-6 text-xs sm:text-sm font-sans">
      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-blue-950/60 pb-2 mb-4">
        PUBLISHER VERIFICATION
      </h3>
      <div className="bg-[#0b0c16]/80 border border-blue-950/30 rounded-2xl p-4 space-y-2">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div>
            <p className="text-gray-400">Publisher: <span className="font-bold text-white">PT Bernas Sumut Jaya</span></p>
            <p className="text-gray-400">Legal Entity: <span className="font-bold text-white">AHU-0034291.AH.01.01.2026</span></p>
            <p className="text-gray-400">KBLI: <span className="font-bold text-white">58110 (Penerbitan Buku/Jurnal) & 63121 (Penerbitan Portal Web Digital)</span></p>
            <p className="text-gray-400 flex items-center gap-1">Status: <span className="font-bold text-green-500">Verified</span></p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <span className="text-[10px] text-gray-500 italic">Evidence: AHU Online System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
