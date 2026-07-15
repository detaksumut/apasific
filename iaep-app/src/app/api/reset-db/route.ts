import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import * as admin from "firebase-admin";

export async function GET() {
  try {
    // 1. Supabase Initialization
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!supabaseServiceRole) {
      return NextResponse.json({ error: "Missing Supabase service role key" }, { status: 500 });
    }
    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceRole);

    // 2. Firebase Initialization
    if (!admin.apps.length) {
      let serviceAccount;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
        return NextResponse.json({ error: "Missing FIREBASE_SERVICE_ACCOUNT_KEY in environment variables" }, { status: 500 });
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    const db = admin.firestore();

    const submissionId = "sub_1784062294881_r2jx1m4";
    const results: string[] = [];

    // Convert submissionId to UUID format for Supabase
    let supabaseSubId = submissionId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(supabaseSubId)) {
      const hex = Buffer.from(supabaseSubId).toString('hex').padEnd(32, '0').slice(0, 32);
      supabaseSubId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
    }

    // Reset Firestore Status
    try {
      await db.collection("submissions").doc(submissionId).update({
        status: "Assigned to Publish",
        stage: "Production",
        doi: admin.firestore.FieldValue.delete(),
        zenodo_id: admin.firestore.FieldValue.delete(),
        updated_at: new Date()
      });
      results.push("Firestore: Reverted submission status, deleted doi/zenodo_id.");
    } catch (e: any) {
      results.push(`Firestore Error: ${e.message}`);
    }

    // Reset Supabase Status
    try {
      const { error } = await supabase
        .from("submissions")
        .update({
          status: "Assigned to Publish",
          doi: null,
          zenodo_id: null,
          updated_at: new Date().toISOString()
        })
        .eq("id", supabaseSubId);
      if (error) throw error;
      results.push("Supabase: Reverted submission status, cleared doi/zenodo_id.");
    } catch (e: any) {
      results.push(`Supabase Error: ${e.message}`);
    }

    // Delete Firestore Certificates
    try {
      const certQuery = await db.collection("certificates").where("reference_id", "==", submissionId).get();
      if (!certQuery.empty) {
        const batch = db.batch();
        certQuery.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        results.push(`Firestore: Deleted ${certQuery.size} certificate(s).`);
      } else {
        results.push("Firestore: No certificates to delete.");
      }
    } catch (e: any) {
      results.push(`Firestore Cert Error: ${e.message}`);
    }

    // Delete Supabase Certificates
    try {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("reference_id", supabaseSubId);
      if (error) {
        // Fallback: also try deleting with the original non-uuid string just in case
        const { error: error2 } = await supabase
          .from("certificates")
          .delete()
          .eq("reference_id", submissionId);
        if (error2) throw error;
      }
      results.push("Supabase: Deleted certificate(s).");
    } catch (e: any) {
      results.push(`Supabase Cert Error: ${e.message}`);
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
