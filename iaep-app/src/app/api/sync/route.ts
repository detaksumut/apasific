import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const books = data.books;

    if (!books || !Array.isArray(books)) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    const cwd = process.cwd();
    const filePath = path.join(cwd, 'src', 'data', 'books.json');
    
    // Write new data
    fs.writeFileSync(filePath, JSON.stringify(books, null, 2));

    // Git add, commit, push
    execSync('git add src/data/books.json', { cwd });
    
    let commitOutput = "No commit made";
    try {
      commitOutput = execSync('git commit -m "fix: implement client-side canvas compression for book uploads to prevent base64 memory bloat and browser crashes"', { cwd, encoding: 'utf-8' });
    } catch(e) {}
    
    const pushOutput = execSync('git push', { cwd, encoding: 'utf-8' });

    return NextResponse.json({ success: true, commitOutput, pushOutput });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
