import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || '21474443';
    
    const res = await fetch(`https://zenodo.org/api/records/${id}`);
    if (!res.ok) {
      return NextResponse.json({ error: `Zenodo error: ${res.statusText}` }, { status: res.status });
    }
    const data = await res.json();
    
    // Write raw JSON to a hardcoded path in the workspace
    const filePath = 'd:\\Users\\apasific\\iaep-app\\check-result.txt';
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: `Saved raw JSON to ${filePath}`, stats: data.stats });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
