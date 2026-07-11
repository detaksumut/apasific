"use client";
import React, { useState } from 'react';
import { CreditCard, Lock, Save, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    npwp: '',
    hasReferral: 'tidak'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [bankSaved, setBankSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 3000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Header Section */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-3">Profil & Rekening</h1>
        <p className="text-[#8888aa] text-sm">Kelola informasi data diri, rekening pembayaran reward, dan keamanan akun Anda.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Bank Account Form */}
        <div style={{ backgroundColor: '#111120', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #1f2937' }} className="shadow-2xl">
          <div style={{ backgroundColor: '#18182e', padding: '1.25rem 2rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CreditCard className="w-5 h-5 text-[#c9a84c]" />
            <h3 className="font-bold text-white text-lg font-['Cinzel']">Data Rekening Bank <span className="text-gray-400 font-normal text-sm ml-1 font-sans">(Untuk Penyaluran Reward Publikasi)</span></h3>
          </div>
          
          <form onSubmit={handleBankSubmit} style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="block text-sm font-medium text-gray-400">Nama Bank <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={bankData.bankName}
                  onChange={(e) => setBankData({...bankData, bankName: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Contoh: BCA, BSI, Mandiri" 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="block text-sm font-medium text-gray-400">Nomor Rekening <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({...bankData, accountNumber: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Contoh: 1234567890" 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="block text-sm font-medium text-gray-400">Nama Pemilik Rekening <span className="text-gray-600 font-normal">(Sesuai Buku Tabungan)</span> <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  value={bankData.accountName}
                  onChange={(e) => setBankData({...bankData, accountName: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Contoh: Budi Santoso" 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="block text-sm font-medium text-gray-400">NPWP <span className="text-gray-600 font-normal">(Opsional)</span></label>
                <input 
                  type="text"
                  value={bankData.npwp}
                  onChange={(e) => setBankData({...bankData, npwp: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Contoh: 12.345.678.9-012.000" 
                />
              </div>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.25rem', backgroundColor: '#18182e', border: '1px solid #1f2937', borderRadius: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 500, color: '#9ca3af' }}>
                Apakah Anda memiliki Rujukan Mitra? <span className="text-red-500">*</span>
                <div className="group relative cursor-help">
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 pointer-events-none border border-gray-700">
                    Pilih 'Ya' jika Anda mempublikasikan artikel melalui agensi atau mitra yang bekerjasama dengan APASIFIC.
                  </div>
                </div>
              </label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} className="group">
                  <input 
                    type="radio" name="referral" value="ya" 
                    checked={bankData.hasReferral === 'ya'}
                    onChange={(e) => setBankData({...bankData, hasReferral: e.target.value})}
                    className="w-4 h-4 text-[#c9a84c] bg-[#0a0a14] border-gray-700 focus:ring-[#c9a84c]" 
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Ya, Ada Rujukan</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="radio" name="referral" value="tidak" 
                    checked={bankData.hasReferral === 'tidak'}
                    onChange={(e) => setBankData({...bankData, hasReferral: e.target.value})}
                    className="w-4 h-4 text-[#c9a84c] bg-[#0a0a14] border-gray-700 focus:ring-[#c9a84c]" 
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">Tidak Ada</span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#c9a84c', color: 'black', fontWeight: 'bold', padding: '0.875rem 2rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', width: 'fit-content' }}
              className="hover:bg-[#b0923d] transition-colors w-full md:w-auto"
            >
              {bankSaved ? <><CheckCircle2 className="w-5 h-5 text-black" /> Berhasil Disimpan</> : <><Save className="w-5 h-5" /> Simpan Data Rekening</>}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{ backgroundColor: '#111120', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #1f2937' }} className="shadow-2xl">
          <div style={{ backgroundColor: '#18182e', padding: '1.25rem 2rem', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Lock className="w-5 h-5 text-[#c9a84c]" />
            <h3 className="font-bold text-white text-lg font-['Cinzel']">Ubah Password</h3>
          </div>
          
          <form onSubmit={handlePasswordSubmit} style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem', maxWidth: '36rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label className="block text-sm font-medium text-gray-400">Password Baru</label>
                <input 
                  type="password" required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Masukkan password baru" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Konfirmasi Password Baru</label>
                <input 
                  type="password" required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c9a84c] transition-colors" 
                  placeholder="Ulangi password baru" 
                />
              </div>
            </div>

            <button 
              type="submit"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: 'transparent', border: '1px solid #374151', color: 'white', fontWeight: 600, padding: '0.875rem 2rem', borderRadius: '0.5rem', cursor: 'pointer', width: 'fit-content' }}
              className="hover:bg-gray-800 transition-colors w-full md:w-auto"
            >
              {passwordSaved ? <><CheckCircle2 className="w-5 h-5 text-[#c9a84c]" /> Password Diperbarui</> : <><Save className="w-5 h-5" /> Simpan Password</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
