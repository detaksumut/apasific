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
    const body = await req.json();
    const { text, submissionId, pageCount } = body;

    if (!text || text.trim().length < 100) {
      return NextResponse.json({ error: 'Teks naskah terlalu pendek.' }, { status: 400 });
    }

    const pageInfo = pageCount
      ? `Jumlah halaman naskah: ${pageCount} halaman.`
      : `Jumlah halaman tidak diketahui.`;

    const prompt = `Kamu adalah reviewer akademik ahli. Baca naskah berikut dan berikan penilaian skor untuk setiap kriteria dengan skala 0-10.

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

    const baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '');
    const apiKey = process.env.NINE_ROUTER_API_KEY || 'sk-254-local';

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
        temperature: 0
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ultimateai-score] UltimateAI error:', errText);
      return NextResponse.json({ error: `UltimateAI error: ${response.status}` }, { status: 502 });
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
