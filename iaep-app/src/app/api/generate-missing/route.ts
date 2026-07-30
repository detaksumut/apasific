import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const res = await fetch('http://localhost:3000/api/users/list', { cache: 'no-store' });
    const data = await res.json();
    
    if (!data || !data.users) {
      return NextResponse.json({ error: 'No users found' });
    }
    
    const dbReviewers = data.users.filter((u: any) => u.role === 'reviewer');
    
    const pagePath = path.join(process.cwd(), 'src/app/journal/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    const missing: string[] = [];
    
    for (const r of dbReviewers) {
      // Create a normalized search string
      const name = (r.full_name || '').trim();
      if (!name) continue;
      
      // Simple exact or partial match
      if (!pageContent.includes(name) && !pageContent.toLowerCase().includes(name.toLowerCase())) {
        missing.push(`{ pos: "Reviewer Board", name: "${name}", country: "${r.country || 'Indonesia'}", photo: "" },`);
      }
    }
    
    return NextResponse.json({ 
      totalDbReviewers: dbReviewers.length,
      missingCount: missing.length,
      missingCode: missing.join('\n')
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
