'use server';

import { sendWa } from '@/utils/sendWa';

export async function resendWaAction(phone: string, title: string) {
  if (!phone || phone === '-') {
    return { success: false, error: 'Nomor WhatsApp tidak tersedia' };
  }

  const waMessage = `Terimakasih telah Submit naskah di ASIA.\nJudul: ${title}\n\nTim Redaksi kami akan segera memproses naskah Anda.`;
  
  try {
    const waResult = await sendWa(phone, waMessage);
    if (waResult) {
      return { success: true };
    } else {
      return { success: false, error: 'Gagal mengirim pesan dari Fonnte. Perangkat mungkin terputus (Device Not Connected) atau nomor tidak valid.' };
    }
  } catch (error: any) {
    console.error('Failed to resend WA:', error);
    return { success: false, error: error.message || 'Gagal mengirim pesan' };
  }
}
