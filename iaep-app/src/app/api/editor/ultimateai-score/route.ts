import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { isEditorOrAbove } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const SCORE_FIELDS = ['topic_relevance', 'article_structure', 'abstract', 'research_gap', 'methodology', 'data_statistics', 'discussion', 'conclusion', 'references'] as const;

async function requireEditor() {
  const user: any = await getCurrentUser();
  if (!user?.id) return { response: NextResponse.json({ error: 'Akses ditolak: pengguna tidak terautentikasi.' }, { status: 401 }) };
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const role = roles.length ? String(roles[0]).toLowerCase() : String(user.role || '').toLowerCase();
  if (!isEditorOrAbove(role)) return { response: NextResponse.json({ error: 'Akses ditolak: hanya Editor atau di atasnya.' }, { status: 403 }) };
  return { user };
}

function normalizeText(value: string) { return value.normalize('NFKC').replace(/\s+/g, ' ').trim().toLocaleLowerCase(); }

function validateAssessment(raw: any, manuscript: string, pageCount: number | null) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !raw.evidence || typeof raw.evidence !== 'object') throw new Error('Keluaran AI tidak memiliki struktur bukti yang valid.');
  const normalized = normalizeText(manuscript);
  const scores: number[] = [];
  const evidence: Record<string, { quote: string; rationale: string }> = {};
  for (const field of SCORE_FIELDS) {
    const score = raw[field];
    if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 10) throw new Error('Skor ' + field + ' harus berupa angka 0–10.');
    const item = raw.evidence[field];
    if (!item || typeof item.quote !== 'string' || typeof item.rationale !== 'string') throw new Error('Bukti/alasan ' + field + ' tidak lengkap.');
    const quote = item.quote.trim(), rationale = item.rationale.trim();
    if (quote.length < 12 || !rationale || !normalized.includes(normalizeText(quote))) throw new Error('Kutipan bukti ' + field + ' kosong, terlalu pendek, atau tidak ditemukan persis pada teks naskah.');
    scores.push(score); evidence[field] = { quote, rationale };
  }
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
  const recommendation = overall >= 8.5 ? 'Accept' : overall >= 7.5 ? 'Minor Revision' : overall >= 6 ? 'Major Revision' : 'Reject';
  return { ...Object.fromEntries(SCORE_FIELDS.map((field) => [field, raw[field]])), page_count: pageCount, page_count_available: pageCount !== null, overall_score: overall, recommendation, direct_acceptance: null, editor_decision_required: true, evidence, assessment_integrity: { evidence_quotes_verified: true, scoring_engine: 'deterministic-server-validation', recommendation_is_advisory: true, note: 'Skor rata-rata dan rekomendasi dihitung server. Keputusan final tetap pada Editor.' } };
}

export async function GET(req: Request) {
  try {
    const access = await requireEditor();
    if ('response' in access) return access.response;
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId') || searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase server configuration is incomplete.');
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: setting } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', `ultimateai_score_${submissionId}`)
      .maybeSingle();

    if (setting && setting.value) {
      const assessment = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      return NextResponse.json({ success: true, assessment });
    }

    return NextResponse.json({ success: false, message: 'No assessment found' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const access = await requireEditor();
    if ('response' in access) return access.response;
    const body = await req.json();
    const { text, submissionId } = body;
    const pageCount = body.pageCount == null ? null : Number(body.pageCount);
    if (typeof submissionId !== 'string' || !submissionId.trim()) return NextResponse.json({ error: 'submissionId wajib diisi.' }, { status: 400 });
    if (pageCount !== null && (!Number.isInteger(pageCount) || pageCount < 1)) return NextResponse.json({ error: 'pageCount harus bilangan bulat positif atau null.' }, { status: 400 });

    if (typeof text !== 'string' || text.trim().length < 100) {
      return NextResponse.json({ error: 'Teks naskah terlalu pendek.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase server configuration is incomplete.');
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: submission, error: submissionError } = await supabaseAdmin.from('submissions').select('id, title, abstract').eq('id', submissionId).maybeSingle();
    if (submissionError) throw new Error('Gagal memverifikasi naskah: ' + submissionError.message);
    if (!submission) return NextResponse.json({ error: 'Naskah tidak ditemukan; penilaian dibatalkan.' }, { status: 404 });

    const pageInfo = pageCount
      ? `Jumlah halaman naskah: ${pageCount} halaman.`
      : `Jumlah halaman tidak diketahui.`;

    const prompt = `Anda melakukan penilaian akademik awal berbasis bukti. Gunakan hanya teks naskah yang diberikan. Jangan mengarang metode, data, hasil, kutipan, DOI, atau kesimpulan. Setiap kriteria wajib memiliki kutipan literal minimal 12 karakter yang benar-benar muncul pada teks dan alasan ringkas. Penilaian adalah rekomendasi, bukan keputusan penerimaan final. Berikan skor 0-10 untuk sembilan kriteria. Jangan menghitung overall_score atau direct_acceptance; server menghitung rata-rata dan rekomendasi secara deterministik.

${pageInfo}

NASKAH:
${text}

Berikan output HANYA dalam format JSON berikut, tanpa teks tambahan apapun:
{
  "topic_relevance": <skor 0-10>,
  "article_structure": <skor 0-10>,
  "abstract": <skor 0-10>,
  "research_gap": <skor 0-10>,
  "methodology": <skor 0-10>,
  "data_statistics": <skor 0-10>,
  "discussion": <skor 0-10>,
  "conclusion": <skor 0-10>,
  "references": <skor 0-10>,
  "page_count": ${pageCount ?? null},
  "page_count_available": ${pageCount != null ? 'true' : 'false'},
  "evidence": { "topic_relevance": {"quote":"kutipan literal", "rationale":"alasan"}, "article_structure": {"quote":"kutipan literal", "rationale":"alasan"}, "abstract": {"quote":"kutipan literal", "rationale":"alasan"}, "research_gap": {"quote":"kutipan literal", "rationale":"alasan"}, "methodology": {"quote":"kutipan literal", "rationale":"alasan"}, "data_statistics": {"quote":"kutipan literal", "rationale":"alasan"}, "discussion": {"quote":"kutipan literal", "rationale":"alasan"}, "conclusion": {"quote":"kutipan literal", "rationale":"alasan"}, "references": {"quote":"kutipan literal", "rationale":"alasan"} }
}`;

    const baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '');
    const apiKey = process.env.NINE_ROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'NINE_ROUTER_API_KEY belum dikonfigurasi; penilaian tidak dijalankan.' }, { status: 503 });

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'UltimateAI',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        response_format: { type: 'json_object' },
        temperature: 0
      }),
      signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ultimateai-score] UltimateAI error:', errText);
      return NextResponse.json({ error: `UltimateAI error: ${response.status}` }, { status: 502 });
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content || '';

    const cleaned = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    let parsed: any;
    try { parsed = JSON.parse(cleaned); } catch { return NextResponse.json({ error: 'Keluaran AI bukan JSON valid; penilaian tidak disimpan.' }, { status: 502 }); }
    if (parsed.error) return NextResponse.json({ error: 'AI tidak dapat menyelesaikan penilaian berbasis bukti: ' + String(parsed.error) }, { status: 422 });
    let assessment: Record<string, any>;
    try { assessment = validateAssessment(parsed, text, pageCount); } catch (validationError: any) { return NextResponse.json({ error: validationError.message, assessment_saved: false }, { status: 422 }); }
    const { error: saveError } = await supabaseAdmin.from('system_settings').upsert({ key: 'ultimateai_score_' + submissionId, value: assessment }, { onConflict: 'key' });
    if (saveError) { console.error('[ultimateai-score] Failed to persist assessment:', saveError); return NextResponse.json({ error: 'Penilaian gagal disimpan; tidak dilaporkan sebagai selesai.', assessment_saved: false }, { status: 500 }); }
    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    console.error('[ultimateai-score] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
