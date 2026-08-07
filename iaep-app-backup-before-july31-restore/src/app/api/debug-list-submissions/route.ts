import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: supabaseSubs, error: sbError } = await supabase
    .from("submissions")
    .select("id, submission_id, title, status, author")
    .limit(50);

  let firestoreSubs = [];
  let fsError = null;
  try {
    const { getFirestore } = await import("@/utils/firebase/db");
    const db = getFirestore();
    const snapshot = await db.collection("submissions").limit(50).get();
    firestoreSubs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      title: doc.data().title,
      status: doc.data().status,
      author: doc.data().author
    }));
  } catch (e: any) {
    fsError = e.message;
  }

  return NextResponse.json({
    supabase: {
      data: supabaseSubs,
      error: sbError
    },
    firestore: {
      data: firestoreSubs,
      error: fsError
    }
  });
}
