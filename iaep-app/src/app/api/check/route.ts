import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const file = path.join(process.cwd(), 'apasific_registered_users.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  let rolesByEmail: Record<string, Set<string>> = {};
  data.forEach((u: any) => {
    const email = (u.email || '').toLowerCase().trim();
    if (!rolesByEmail[email]) rolesByEmail[email] = new Set<string>();
    const role = (u.role || '').toLowerCase();
    rolesByEmail[email].add(role);
  });
  
  let overlaps: string[] = [];
  for (let [email, roles] of Object.entries(rolesByEmail)) {
    if (roles.has('reviewer') && roles.has('author')) {
      overlaps.push(email);
    }
  }
  
  return NextResponse.json({
    totalUsers: data.length,
    overlapsCount: overlaps.length,
    overlaps
  });
}
