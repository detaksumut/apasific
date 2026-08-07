import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('submissions')
      .select('id, title, file_url, file_url_galley, status')
      .eq('id', '7375625f-3137-3834-3533-303330323837')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message });
    }

    const results = [];
    const urls = [
      { name: 'file_url', url: data.file_url },
      { name: 'file_url_galley', url: data.file_url_galley }
    ].filter(item => Boolean(item.url));

    for (const item of urls) {
      try {
        const res = await fetch(item.url!, { method: 'GET' });
        const buf = await res.arrayBuffer();
        results.push({
          name: item.name,
          url: item.url,
          status: res.status,
          size_bytes: buf.byteLength,
          empty: buf.byteLength === 0
        });
      } catch (e: any) {
        results.push({
          name: item.name,
          url: item.url,
          error: e.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      submission: data,
      files_check: results
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
