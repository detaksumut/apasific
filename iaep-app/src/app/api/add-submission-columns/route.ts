import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const results: any = { steps: [] };

    // Tambahkan kolom-kolom yang mungkin belum ada di tabel submissions
    const columnsToAdd = [
      { name: 'file_url_galley', type: 'text' },
      { name: 'cover_file_url', type: 'text' },
      { name: 'revised_file_url', type: 'text' },
      { name: 'volume', type: 'text' },
      { name: 'issue', type: 'text' },
      { name: 'issn', type: 'text' },
      { name: 'zenodo_id', type: 'text' },
    ];

    for (const col of columnsToAdd) {
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', {
          sql: `ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
        });
        if (error) {
          results.steps.push({ column: col.name, status: 'error', message: error.message });
        } else {
          results.steps.push({ column: col.name, status: 'added' });
        }
      } catch (e: any) {
        results.steps.push({ column: col.name, status: 'catch_error', message: e.message });
      }
    }

    return NextResponse.json({ success: true, ...results });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
