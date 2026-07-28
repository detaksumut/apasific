import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ views: 0, downloads: 0 });
  
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    
    if (!db) {
      return NextResponse.json({ views: 0, downloads: 0, note: "Firebase not configured locally" });
    }

    const doc = await db.collection('article_metrics').doc(id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ views: 0, downloads: 0 });
    }
    return NextResponse.json(doc.data());
  } catch (e: any) {
    return NextResponse.json({ views: 0, downloads: 0, error: e.message });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  
  if (!id || !type) return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  
  try {
    const { getFirestore } = await import('@/utils/firebase/db');
    const db = getFirestore();
    
    if (!db) {
      return NextResponse.json({ success: true, note: "Mocked success due to missing Firebase config" });
    }

    const timeout = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), ms));
    
    const docRef = db.collection('article_metrics').doc(id);
    const country = searchParams.get('country') || 'Indonesia';
    
    const executeDb = async () => {
      const doc = await docRef.get();
      if (!doc.exists) {
        await docRef.set({
          views: type === 'view' ? 1 : 0,
          downloads: type === 'download' ? 1 : 0,
          countries: type === 'view' ? { [country]: 1 } : {}
        });
      } else {
        const current = doc.data();
        const countries = current?.countries || {};
        if (type === 'view') {
          countries[country] = (countries[country] || 0) + 1;
        }
        await docRef.update({
          views: type === 'view' ? (current?.views || 0) + 1 : (current?.views || 0),
          downloads: type === 'download' ? (current?.downloads || 0) + 1 : (current?.downloads || 0),
          countries: countries
        });
      }
    };

    await Promise.race([executeDb(), timeout(2000)]);
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.warn("Metrics POST error (ignored):", e.message);
    // Return 200 anyway so the frontend doesn't complain about metrics failing
    return NextResponse.json({ success: true, warning: e.message });
  }
}
