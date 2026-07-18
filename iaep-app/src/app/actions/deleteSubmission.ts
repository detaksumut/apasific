"use server";

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteSubmissionById(submissionId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Allow deletion for demo/admin purposes
        if (!user) {
            // Optional: fallback auth logic if needed
        }

        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );

        // Delete from Supabase
        await supabaseAdmin.from('submissions').delete().eq('id', submissionId);

        // Delete from Firestore
        try {
            const { getFirestore } = await import('@/utils/firebase/db');
            const db = getFirestore();
            await db.collection('submissions').doc(submissionId).delete();
        } catch (e) {
            console.error("Failed to delete from Firestore", e);
        }

        revalidatePath('/dashboard/editor');
        return { success: true };
    } catch (e: any) {
        console.error("Delete failed", e);
        return { success: false, error: e.message };
    }
}
