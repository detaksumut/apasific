import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const submissionId = searchParams.get('submissionId') || searchParams.get('id');

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId required' }, { status: 400 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: setting, error: queryError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', `ultimateai_score_${submissionId}`)
      .maybeSingle();

    if (queryError) {
      console.error('[ultimateai-score] Failed to load saved assessment:', queryError.message);
      return NextResponse.json({ success: false, error: 'Gagal membaca penilaian tersimpan.' }, { status: 502 });
    }

    if (setting?.value) {
      const assessment = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
      const scoreFields = [
        'topic_relevance', 'article_structure', 'abstract', 'research_gap',
        'methodology', 'data_statistics', 'discussion', 'conclusion', 'references'
      ] as const;
      const invalidFields = scoreFields.filter((key) =>
        typeof assessment?.[key] !== 'number' || !Number.isFinite(assessment[key]) ||
        assessment[key] < 0 || assessment[key] > 10
      );
      const validRecommendations = ['Accept', 'Minor Revision', 'Major Revision', 'Reject'];

      if (invalidFields.length > 0 || !validRecommendations.includes(assessment?.recommendation)) {
        console.error('[ultimateai-score] Saved assessment failed validation:', invalidFields);
        return NextResponse.json({
          success: false,
          error: 'Penilaian tersimpan tidak valid dan tidak dapat ditampilkan sebagai hasil resmi.',
          invalidFields
        }, { status: 502 });
      }

      // Recompute derived fields instead of trusting stale stored values.
      assessment.overall_score = Math.round(
        (scoreFields.reduce((sum, key) => sum + assessment[key], 0) / scoreFields.length) * 10
      ) / 10;
      assessment.direct_acceptance = assessment.overall_score >= 7.5;
      return NextResponse.json({ success: true, assessment });
    }

    return NextResponse.json({ success: false, message: 'No assessment found' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, submissionId, pageCount } = body;

    if (!text || text.trim().length < 100) {
      return NextResponse.json({ error: 'Teks naskah terlalu pendek.' }, { status: 400 });
    }

    const pageInfo = pageCount
      ? `Jumlah halaman naskah: ${pageCount} halaman.`
      : `Jumlah halaman tidak diketahui.`;

    const prompt = `Kamu adalah reviewer akademik untuk penilaian awal APASIFIC. Nilai hanya berdasarkan bukti yang benar-benar tercantum pada naskah yang diberikan. Jangan mengarang data, metode, temuan, sitasi, atau detail yang tidak tersedia. Jika informasi suatu kriteria tidak cukup, berikan skor konservatif yang sesuai dengan bukti yang tersedia; jangan menganggap informasi yang tidak terlihat sebagai bukti bahwa kualitasnya baik. Terapkan rubrik secara konsisten dan gunakan skala 0-10 untuk setiap kriteria. Rekomendasi harus selaras dengan sembilan skor.

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
  "direct_acceptance": <true jika overall_score >= 7.5, false jika tidak>,
  "overall_score": <rata-rata dari semua 9 skor di atas, dibulatkan 1 desimal>,
  "recommendation": "<Accept | Minor Revision | Major Revision | Reject>"
}`;

    const configuredBaseUrl = process.env.NINE_ROUTER_BASE_URL;
    if (!configuredBaseUrl) {
      console.error('[ultimateai-score] NINE_ROUTER_BASE_URL is not configured.');
      return NextResponse.json({
        success: false,
        code: 'NINE_ROUTER_BASE_URL_MISSING',
        error: 'Endpoint 9Router belum dikonfigurasi untuk server produksi. Tidak ada skor baru yang dibuat.'
      }, { status: 503 });
    }
    const baseUrl = configuredBaseUrl.replace(/\/$/, '');
    const apiKey = process.env.NINE_ROUTER_API_KEY;
    if (!apiKey) {
      console.error('[ultimateai-score] NINE_ROUTER_API_KEY is not configured.');
      return NextResponse.json({
        success: false,
        code: 'NINE_ROUTER_API_KEY_MISSING',
        error: 'Kredensial 9Router belum dikonfigurasi. Tidak ada skor baru yang dibuat.'
      }, { status: 503 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);
    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.NINE_ROUTER_MODEL || 'cx/gpt-5.6-terra',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
          temperature: 0
        }),
        signal: controller.signal
      });
    } catch (providerError: any) {
      const timedOut = providerError?.name === 'AbortError';
      console.error('[ultimateai-score] Provider fetch failed:', {
        name: providerError?.name,
        message: providerError?.message,
        timedOut,
        baseUrl
      });
      return NextResponse.json({
        success: false,
        code: timedOut ? 'AI_PROVIDER_TIMEOUT' : 'AI_PROVIDER_FETCH_FAILED',
        error: timedOut
          ? 'Koneksi ke 9Router melewati batas waktu 45 detik. Pastikan tunnel HTTPS aktif dan dapat diakses dari server produksi.'
          : 'Server APASIFIC tidak dapat menjangkau 9Router. Periksa NINE_ROUTER_BASE_URL di Vercel dan pastikan URL Tunnel HTTPS aktif serta dapat diakses dari internet.'
      }, { status: 503 });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      // Log a bounded excerpt for diagnostics; never return raw upstream HTML or secrets to the browser.
      console.error('[ultimateai-score] Upstream provider response:', {
        status: response.status,
        bodyExcerpt: errText.slice(0, 500)
      });

      if (response.status === 400) {
        return NextResponse.json({
          success: false,
          code: 'AI_PROVIDER_BAD_REQUEST',
          error: '9Router menolak format permintaan atau nama model (HTTP 400). Periksa NINE_ROUTER_MODEL dan kompatibilitas endpoint OpenAI /chat/completions. Tidak ada skor baru yang disimpan.'
        }, { status: 502 });
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          success: false,
          code: 'AI_PROVIDER_AUTH_ERROR',
          error: '9Router menolak autentikasi (HTTP ' + response.status + '). Periksa NINE_ROUTER_API_KEY dan izin gateway. Tidak ada skor baru yang disimpan.'
        }, { status: 502 });
      }

      if (response.status === 429) {
        return NextResponse.json({
          success: false,
          code: 'AI_PROVIDER_RATE_LIMIT_OR_QUOTA',
          error: 'Layanan AI menolak permintaan karena batas pemakaian atau kuota. Periksa kuota provider dan coba lagi setelah tersedia.'
        }, { status: 503 });
      }

      if (response.status === 530) {
        return NextResponse.json({
          success: false,
          code: 'AI_PROVIDER_GATEWAY_530',
          error: 'Gateway layanan AI mengembalikan HTTP 530. Ini belum membuktikan kuota habis; periksa koneksi gateway, endpoint provider, dan log provider. Tidak ada skor baru yang disimpan.'
        }, { status: 503 });
      }

      return NextResponse.json({
        success: false,
        code: 'AI_PROVIDER_HTTP_ERROR',
        error: `Layanan AI mengembalikan HTTP ${response.status}. Tidak ada skor baru yang disimpan.`
      }, { status: 503 });
    }

    const json = await response.json();
    const rawContent = json.choices?.[0]?.message?.content || '';

    // Parse JSON from response — strip markdown fences if present
    const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    let assessment;
    try {
      assessment = JSON.parse(cleaned);
    } catch {
      // Try extracting JSON block if wrapped in text
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        assessment = JSON.parse(match[0]);
      } else {
        console.error('[ultimateai-score] Failed to parse JSON:', rawContent);
        return NextResponse.json({ error: 'Gagal memparse respons UltimateAI.' }, { status: 500 });
      }
    }

    // Reject malformed model output before it can be persisted or shown as an assessment.
    const scoreFields = [
      'topic_relevance', 'article_structure', 'abstract', 'research_gap',
      'methodology', 'data_statistics', 'discussion', 'conclusion', 'references'
    ] as const;
    const invalidFields = scoreFields.filter((key) =>
      typeof assessment?.[key] !== 'number' ||
      !Number.isFinite(assessment[key]) ||
      assessment[key] < 0 ||
      assessment[key] > 10
    );

    if (invalidFields.length > 0) {
      console.error('[ultimateai-score] Invalid score fields:', invalidFields);
      return NextResponse.json({
        error: 'Respons AI tidak memenuhi format penilaian yang valid. Analisis tidak disimpan.',
        invalidFields
      }, { status: 502 });
    }

    const calculatedOverall = Math.round(
      (scoreFields.reduce((sum, key) => sum + assessment[key], 0) / scoreFields.length) * 10
    ) / 10;
    assessment.overall_score = calculatedOverall;
    assessment.direct_acceptance = calculatedOverall >= 7.5;

    if (!['Accept', 'Minor Revision', 'Major Revision', 'Reject'].includes(assessment.recommendation)) {
      return NextResponse.json({
        error: 'Respons AI tidak memuat recommendation yang valid. Analisis tidak disimpan.'
      }, { status: 502 });
    }

    // Persist assessment to Supabase system_settings if submissionId is provided
    if (submissionId && assessment) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabaseAdmin.from('system_settings').upsert({
          key: `ultimateai_score_${submissionId}`,
          value: assessment
        }, { onConflict: 'key' });
      } catch (saveErr) {
        console.warn('[ultimateai-score] Failed to save assessment to system_settings:', saveErr);
      }
    }

    return NextResponse.json({ success: true, assessment });
  } catch (error: any) {
    console.error('[ultimateai-score] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
