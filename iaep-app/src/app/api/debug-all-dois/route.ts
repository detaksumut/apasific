import { NextResponse } from "next/server";
import { getFirestore } from "@/utils/firebase/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const result: any = {};
    
    // Check if there are other collections like 'articles', 'published_articles', 'pkm'
    const collections = await db.listCollections();
    result.collections = collections.map((c: any) => c.id);
    
    for (const col of collections) {
      if (['submissions', 'published_articles', 'articles', 'issues', 'journal_issues'].includes(col.id)) {
        const snap = await col.get();
        const docsWithDoi = snap.docs.map((d: any) => ({id: d.id, ...d.data()})).filter((d: any) => d.doi);
        result[col.id] = {
           total: snap.size,
           with_doi: docsWithDoi.length,
           docs: docsWithDoi
        };
      }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
