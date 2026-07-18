'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { resendWaAction } from '@/app/actions/resend-wa';

export default function ResendWaButton({ phone, title }: { phone: string, title: string }) {
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    if (phone === '-' || !phone) {
      alert('Nomor WhatsApp tidak tersedia untuk naskah ini.');
      return;
    }
    
    setIsSending(true);
    setStatus('idle');
    
    const res = await resendWaAction(phone, title);
    
    setIsSending(false);
    if (res.success) {
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      alert('Gagal: ' + res.error);
    }
  };

  if (phone === '-' || !phone) return null;

  return (
    <button
      onClick={handleSend}
      disabled={isSending || status === 'success'}
      title="Kirim Ulang Resi WA"
      className={`flex items-center justify-center p-2 rounded-lg transition-all border ${
        status === 'success' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' :
        status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' :
        'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white'
      }`}
    >
      {isSending ? (
         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </button>
  );
}
