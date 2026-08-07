import { NextResponse } from 'next/server';
import { getSubmissionDetailsEditor } from '@/app/actions/editor';
import { createDeposition } from '@/utils/zenodo';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

export const dynamic = 'force-dynamic';

function uploadFileWithHttps(bucketUrl: string, fileName: string, buffer: Buffer, token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const targetUrl = `${bucketUrl}/${encodeURIComponent(fileName)}`;
    const parsedUrl = new URL(targetUrl);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': buffer.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve({ success: true, statusCode: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ success: true, statusCode: res.statusCode, raw: data });
          }
        } else {
          resolve({ success: false, statusCode: res.statusCode, error: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(buffer);
    req.end();
  });
}

export async function GET() {
  const log: any[] = [];
  try {
    const submissionId = '7375625f-3137-3834-3533-303330323837';
    const res = await getSubmissionDetailsEditor(submissionId);
    
    if (!res.success || !res.submission) {
      return NextResponse.json({ success: false, error: "Failed to load submission details" });
    }

    const fileUrl = res.submission.file_url;
    const fileName = '1784530304695_anonymous.docx';

    // Download the file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ success: false, error: "Failed to download file from Supabase signed URL" });
    }
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a draft deposition
    const metadata = {
      title: "Test IAEP Zenodo (WARP Active Verification)",
      description: "Temporary draft to verify Zenodo upload with active Cloudflare WARP.",
      creators: [{ name: "Tester, IAEP" }],
      upload_type: "publication",
      publication_type: "article",
      access_right: "open"
    };

    log.push({ step: "Creating deposition draft" });
    const deposition = await createDeposition(metadata);
    const depositionId = deposition.id;
    const bucketUrl = deposition.links?.bucket;
    const token = process.env.NEXT_PUBLIC_ZENODO_API_TOKEN || process.env.VITE_ZENODO_API_TOKEN;

    log.push({ step: "Deposition created", depositionId, bucketUrl });

    // Method 3: PUT using native Node.js https.request with active WARP
    log.push({ method: "Method 3: PUT using native Node.js https.request with active WARP" });
    const r3 = await uploadFileWithHttps(bucketUrl, fileName, buffer, token!);
    log.push({ method: "Method 3 results", r3 });

    // Write log to zenodo_debug.json
    const outPath = path.join(process.cwd(), 'zenodo_debug.json');
    fs.writeFileSync(outPath, JSON.stringify(log, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      outPath,
      log
    });
  } catch (e: any) {
    log.push({ error: e.message, stack: e.stack });
    const outPath = path.join(process.cwd(), 'zenodo_debug.json');
    fs.writeFileSync(outPath, JSON.stringify(log, null, 2), 'utf8');
    return NextResponse.json({ success: false, log });
  }
}
