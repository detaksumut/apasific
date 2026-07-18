'use server';

import { sendWa } from '@/utils/sendWa';

export async function sendMembershipWaAction(phone: string, name: string) {
  if (!phone || phone === '-') {
    return { success: false, error: 'Nomor WhatsApp tidak valid' };
  }

  const waMessage = `Halo ${name}, ini dari Admin ASIA (Association of Asia Pacific Academician). Kami ingin menginformasikan terkait pendaftaran membership Anda.`;
  
  try {
    const isSuccess = await sendWa(phone, waMessage);
    if (isSuccess) {
      return { success: true };
    } else {
      return { success: false, error: 'Gagal mengirim pesan melalui Fonnte' };
    }
  } catch (error: any) {
    console.error('Failed to send membership WA:', error);
    return { success: false, error: error.message || 'Gagal mengirim pesan' };
  }
}
