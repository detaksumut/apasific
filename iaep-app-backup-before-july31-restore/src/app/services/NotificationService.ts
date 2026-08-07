import { sendWa } from '@/utils/sendWa';

export interface DecisionNotificationParams {
    authorPhone: string;
    editorialNote: string;
    decision: 'Accepted' | 'Needs Revision' | 'Declined';
    journalName: string;
    articleTitle: string;
}

export class WhatsAppProvider {
    static async send(phone: string, message: string): Promise<boolean> {
        try {
            // Remove non-numeric characters and format to Indonesian code (62)
            let formattedPhone = phone.replace(/[^0-9]/g, "");
            if (formattedPhone.startsWith("0")) {
                formattedPhone = "62" + formattedPhone.substring(1);
            }
            
            // Fonnte abstraction
            const res = await sendWa(formattedPhone, message);
            return res;
        } catch (error) {
            console.error("WhatsAppProvider Error:", error);
            return false;
        }
    }
}

export class NotificationService {
    static async sendDecisionNotification(params: DecisionNotificationParams): Promise<boolean> {
        if (!params.authorPhone) return false;

        let message = `*Notifikasi Keputusan Editorial*\nJurnal: ${params.journalName}\n\n`;
        message += `Yth. Penulis,\nNaskah Anda yang berjudul *"${params.articleTitle}"* telah melalui proses review.\n\n`;
        
        if (params.decision === 'Accepted') {
            message += `*KEPUTUSAN: DITERIMA (ACCEPTED)*\nSelamat, naskah Anda dinyatakan lulus dan akan dilanjutkan ke tahap Copyediting.\n\n`;
        } else if (params.decision === 'Needs Revision') {
            message += `*KEPUTUSAN: REVISI DIPERLUKAN*\nNaskah Anda membutuhkan revisi berdasarkan masukan dari Reviewer/Editor.\n\n`;
        } else if (params.decision === 'Declined') {
            message += `*KEPUTUSAN: DITOLAK (DECLINED)*\nMohon maaf, naskah Anda belum dapat diterbitkan di jurnal kami.\n\n`;
        }

        if (params.editorialNote) {
            message += `*Catatan Editor / Reviewer:*\n${params.editorialNote}\n\n`;
        }

        message += `Silakan login ke sistem untuk melihat detail lengkap.\nTerima kasih.`;

        // Delegating to WhatsApp Provider
        return await WhatsAppProvider.send(params.authorPhone, message);
    }
}
