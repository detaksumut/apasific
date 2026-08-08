import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CanonicalDocumentService } from '@/services/reviewer/CanonicalDocumentService';
import { AIProviderFactory } from '@/services/reviewer/AIProviderAdapter';

// Setup Supabase Client
const getSupabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Trigger AI Inspection & Retrieve Findings for a submission
 * GET /api/reviewer/ai-findings?submissionId=xxx
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get('submissionId');

  if (!submissionId) {
    return NextResponse.json({ success: false, error: 'submissionId is required.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    // 1. Fetch submission details
    const { data: sub } = await supabase
      .from('submissions')
      .select('id, file_url, title')
      .eq('id', submissionId)
      .single();

    if (!sub || !sub.file_url) {
      return NextResponse.json({ success: false, error: 'Naskah atau file URL tidak ditemukan.' }, { status: 404 });
    }

    // 2. Load cached findings if already processed
    const { data: existingFindings } = await supabase
      .from('ai_inspection_findings')
      .select('*')
      .eq('submission_id', submissionId);

    if (existingFindings && existingFindings.length > 0) {
      return NextResponse.json({ success: true, findings: existingFindings });
    }

    // 3. Process PDF to Canonical Paragraphs first
    const procRes = await CanonicalDocumentService.processAndCacheDocument(submissionId, sub.file_url);
    if (!procRes.success || !procRes.paragraphs) {
      return NextResponse.json({ success: false, error: procRes.error || 'Gagal memproses dokumen.' }, { status: 500 });
    }

    const paragraphs = procRes.paragraphs;

    // 4. Construct prompt for AI Inspection using Canonical Paragraphs
    const activeProvider = process.env.AI_PROVIDER_TYPE || 'gemini';
    const provider = AIProviderFactory.getProvider(activeProvider);
    const modelName = AIProviderFactory.getActiveModelName(activeProvider);

    // Build canonical text summary for the AI prompt
    const docSummaryText = paragraphs.map((p, i) => `[Para ${i}][Page ${p.page_number}][Hash ${p.paragraph_hash}]: "${p.paragraph_text}"`).join('\n\n');

    const prompt = `Anda adalah Asisten Editor Jurnal Akademik Jurnal Internasional (IAEP Platform).
Tugas Anda adalah memeriksa dokumen naskah secara mendalam dan mendeteksi kesalahan penulisan, bias teori, masalah etika, sitasi usang, atau logika metodologi yang kurang tepat.

Gunakan format JSON output yang ketat. Temukan minimal 3 dan maksimal 10 temuan penting dari dokumen di bawah ini.
Return JSON berformat array: { findings: Array<{ paragraph_hash: string, page_number: number, category: string, severity: string, confidence_score: number, finding_title: string, reason: string, action_prompt: string }> }

Penjelasan Aturan Klasifikasi:
- category: 'Technical' | 'Scientific' | 'Editorial' | 'Ethics' | 'Metadata' | 'References' | 'Language'
- severity: 'high' | 'medium' | 'low'
- paragraph_hash: Cocokkan PERSIS dengan Hash dari paragraf yang Anda kritisi di bawah.
- page_number: Nomor halaman paragraf tersebut.
- confidence_score: Tingkat keyakinan (0-100).
- reason: Analisis logis detail mengapa bagian tersebut dinilai kurang tepat/salah logika.
- action_prompt: Tulis kalimat penuntun persuasif yang netral untuk memandu Reviewer (e.g., "Tolong periksa validitas ukuran sampel..."). Jangan menuduh naskah salah, gunakan kalimat panduan.

Dokumen Naskah:
${docSummaryText}`;

    // 5. Call AI
    const rawResult = await provider.generateAssessment(prompt);
    
    // Parse result findings array (validate and save to DB)
    let aiFindings: any[] = [];
    if ((rawResult as any).findings && Array.isArray((rawResult as any).findings)) {
      aiFindings = (rawResult as any).findings;
    } else {
      // Fallback parse if structure differs slightly
      try {
        const textToParse = (rawResult as any).summary_evaluation || '';
        const parsed = JSON.parse(textToParse);
        aiFindings = parsed.findings || [];
      } catch (e) {}
    }

    if (aiFindings.length > 0) {
      const insertRows = aiFindings.map((f: any) => ({
        submission_id: submissionId,
        paragraph_hash: f.paragraph_hash,
        page_number: parseInt(f.page_number, 10) || 1,
        category: f.category || 'Editorial',
        severity: f.severity || 'low',
        confidence_score: parseInt(f.confidence_score, 10) || 85,
        finding_title: f.finding_title || 'Inspeksi Dokumen',
        reason: f.reason || '',
        action_prompt: f.action_prompt || 'Silakan periksa bagian ini.',
        provider: activeProvider,
        model: modelName,
        prompt_version: '1.0'
      }));

      const { error: saveErr } = await supabase
        .from('ai_inspection_findings')
        .insert(insertRows);

      if (saveErr) console.error('[API-Findings] Save failed:', saveErr.message);
      
      return NextResponse.json({ success: true, findings: insertRows });
    }

    return NextResponse.json({ success: true, findings: [] });
  } catch (e: any) {
    console.error('[API-Findings] Error:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

/**
 * Submit Feedback Loop response (Confirmed / False Positive / Ignored)
 * POST /api/reviewer/ai-findings
 */
export async function POST(request: NextRequest) {
  try {
    const { findingId, status, feedback } = await request.json();

    if (!findingId || !status) {
      return NextResponse.json({ success: false, error: 'findingId and status are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from('ai_inspection_findings')
      .update({
        reviewer_status: status,
        reviewer_feedback: feedback || null
      })
      .eq('id', findingId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
