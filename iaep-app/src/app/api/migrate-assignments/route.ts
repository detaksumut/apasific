import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

function unhexUuid(uuidStr: string): string {
    if (!uuidStr) return "";
    try {
        const hex = uuidStr.replace(/-/g, "").replace(/0+$/, "");
        if (/^[0-9a-f]+$/i.test(hex) && hex.length >= 8) {
            return Buffer.from(hex, "hex").toString("utf8");
        }
    } catch(e) {}
    return uuidStr;
}

export async function GET() {
    try {
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co",
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
        );

        // Fetch all profiles to lookup by email or unhexed ID
        const { data: profiles } = await supabaseAdmin.from('profiles').select('id, email, full_name');
        const profilesMap = new Map();
        if (profiles) {
            profiles.forEach(p => {
                profilesMap.set(p.id, p);
                if (p.email) profilesMap.set(p.email.toLowerCase(), p);
            });
        }

        // Fetch all review_assignments
        const { data: assignments } = await supabaseAdmin.from('review_assignments').select('*');
        
        let sbMigrated = 0;
        let fbMigrated = 0;
        let logs: string[] = [];
        
        const db = getFirestore();

        if (assignments) {
            for (const assign of assignments) {
                let needsUpdate = false;
                let trueReviewerId = assign.reviewer_id;
                let trueReviewerEmail = assign.reviewer_email;

                // 1. Is it a fake UUID?
                const unhexed = unhexUuid(assign.reviewer_id);
                if (unhexed !== assign.reviewer_id) {
                    // It was padded! Let's find the true profile
                    let matchedProfile = null;
                    if (unhexed.includes('@')) {
                        matchedProfile = profilesMap.get(unhexed.toLowerCase());
                    } else if (unhexed.includes('demo-user-') || unhexed.includes('marahaman') || unhexed.includes('kadsumut')) {
                        // Hardcode lookup for known old string IDs or search by partial
                        // Wait, if we can't find it directly, maybe we can search the profiles list
                        // For the specific bug, it was kadsumut/marahaman
                        const found = profiles?.find(p => p.email === 'kadsumut@gmail.com');
                        if (found) matchedProfile = found;
                    }

                    if (matchedProfile) {
                        trueReviewerId = matchedProfile.id;
                        trueReviewerEmail = matchedProfile.email || trueReviewerEmail;
                        needsUpdate = true;
                        logs.push(`Migrated fake UUID for assignment ${assign.id}. Unhexed: ${unhexed} -> True ID: ${trueReviewerId}`);
                    } else {
                        logs.push(`Warning: Could not find true profile for unhexed ID ${unhexed} in assignment ${assign.id}`);
                    }
                }

                // 2. Is email missing but we know the true UUID?
                if (!assign.reviewer_email && profilesMap.has(trueReviewerId)) {
                    const prof = profilesMap.get(trueReviewerId);
                    if (prof.email) {
                        trueReviewerEmail = prof.email;
                        needsUpdate = true;
                        logs.push(`Populated missing email for assignment ${assign.id} -> ${trueReviewerEmail}`);
                    }
                }

                // Perform Update
                if (needsUpdate) {
                    // Update Supabase
                    await supabaseAdmin
                        .from('review_assignments')
                        .update({
                            reviewer_id: trueReviewerId,
                            reviewer_email: trueReviewerEmail
                        })
                        .eq('id', assign.id);
                    sbMigrated++;

                    // Update Firestore (try using the same ID, or search by submission_id + old reviewer_id)
                    try {
                        const snap = await db.collection('review_assignments')
                            .where('submission_id', '==', assign.submission_id)
                            .where('reviewer_id', '==', assign.reviewer_id)
                            .get();
                        
                        snap.forEach(async (doc: any) => {
                            await db.collection('review_assignments').doc(doc.id).update({
                                reviewer_id: trueReviewerId,
                                reviewer_email: trueReviewerEmail
                            });
                            fbMigrated++;
                        });
                    } catch (e) {
                        logs.push(`Firestore update failed for assignment ${assign.id}`);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migrated ${sbMigrated} Supabase rows and ${fbMigrated} Firestore documents.`,
            logs
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
