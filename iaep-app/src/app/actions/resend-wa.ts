'use server';

import { sendWa } from '@/utils/sendWa';

export async function resendWaAction(phone: string, title: string) {
  if (!phone || phone === '-') {
    return { success: false, error: 'Nomor WhatsApp tidak tersedia' };
  }

  const waMessage = `Terimakasih telah Submit naskah di ASIA.\nJudul: ${title}\n\nTim Redaksi kami akan segera memproses naskah Anda.`;
  const logoUrl = "https://apasific.org/logo-apasific.png";
  
  try {
    await sendWa(phone, waMessage, logoUrl);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to resend WA:', error);
    return { success: false, error: error.message || 'Gagal mengirim pesan' };
  }
}
