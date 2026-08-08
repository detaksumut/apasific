// src/app/api/article/[id]/pdf/route.ts
// Stable PDF redirect endpoint for scholarly crawlers.
// Crawlers and citation managers store THIS URL (permanent), not the Supabase signed URL.
// On each request, generates a fresh signed URL and redirects.
//
// URL: GET /api/article/{id}/pdf
// Returns: 302 redirect to fresh signed PDF URL
// Access: Public, no auth required, CORS open

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Extract the Supabase storage path from a signed or public URL
// e.g. "https://xxx.supabase.co/storage/v1/object/sign/manuscripts/abc/file.pdf?token=..."
//   → "manuscripts/abc/file.pdf"
function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    // Match: /storage/v1/object/sign/{bucket}/{path}
    // or:    /storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/(?:sign|public)\/([^/]+)\/(.+?)(?:\?|$)/);
    if (match) {
      return { bucket: match[1], path: match[2] };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch only published articles
  const { data: article, error } = await supabase
    .from('submissions')
    .select('id, title, file_url_galley, file_url, status')
    .eq('id', id)
    .eq('status', 'Published')
    .maybeSingle();

  if (error || !article) {
    return NextResponse.json(
      { error: 'Article not found or not published' },
      { status: 404 }
    );
  }

  const storedUrl = article.file_url_galley || article.file_url || '';

  if (!storedUrl) {
    return NextResponse.json(
      { error: 'No PDF available for this article' },
      { status: 404 }
    );
  }

  // If already a non-expiring public URL (e.g. /storage/v1/object/public/...), redirect directly
  if (storedUrl.includes('/object/public/')) {
    return NextResponse.redirect(storedUrl, { status: 302 });
  }

  // For signed URLs: extract the path and generate a fresh signed URL (1 hour for redirect)
  const storageRef = extractStoragePath(storedUrl);

  if (storageRef) {
    const { data: signedData, error: signErr } = await supabase.storage
      .from(storageRef.bucket)
      .createSignedUrl(storageRef.path, 60 * 60); // 1 hour — crawlers follow redirect immediately

    if (signErr || !signedData?.signedUrl) {
      // Fallback: redirect to stored URL directly even if it may have expired
      return NextResponse.redirect(storedUrl, { status: 302 });
    }

    return NextResponse.redirect(signedData.signedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store', // Never cache the redirect itself — always get a fresh URL
        'Access-Control-Allow-Origin': '*',
        'X-Article-Id': id,
        'X-Content-Type': 'application/pdf',
      }
    });
  }

  // Fallback: redirect to whatever URL is stored
  return NextResponse.redirect(storedUrl, { status: 302 });
}
