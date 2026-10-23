import { NextResponse } from 'next/server';

function generateIntelligentManuscriptClue(text: string): string {
  const clean = text.replace(/\\s+/g, ' ').trim();
  const extract = (pattern: RegExp, limit = 320): string => {
    const match = pattern.exec(clean);
    if (!match || match.index === undefined) return 'Tidak teridentifikasi secara eksplisit dari teks yang diekstrak; perlu verifikasi reviewer.';
    return clean.slice(match.index, match.index + limit).trim();
  };

  const firstParagraph = text.split(/\\n\\s*\\n/).map(p => p.trim()).find(p => p.length > 20);
  const objective = extract(/.{0,60}(?:tujuan penelitian|bertujuan|this study aims|the objective|the purpose).{0,260}/i);
  const methodology = extract(/.{0,60}(?:metodologi|metode penelitian|methodology|research design|kuantitatif|kualitatif|systematic literature review|slr).{0,260}/i);
  const findings = extract(/.{0,60}(?:hasil penelitian|temuan|results indicate|findings reveal|hasil menunjukkan).{0,260}/i);
  const conclusion = extract(/.{0,60}(?:kesimpulan|dapat disimpulkan|in conclusion|conclusion).{0,260}/i);

  return [
    'STATUS: FALLBACK EKSTRAKTIF — layanan AI tidak memberikan hasil yang dapat digunakan.',
    'Catatan: bagian di bawah hanya petikan teks yang terdeteksi, bukan penilaian AI. Verifikasi semua temuan terhadap naskah asli.',
    '',
    '1. Ringkasan:',
    firstParagraph ? firstParagraph.slice(0, 350) : clean.slice(0, 350),
    '',
    '2. Tujuan Penelitian (petikan):',
    objective,
    '',
    '3. Metodologi (petikan):',
    methodology,
    '',
    '4. Temuan Utama (petikan):',
    findings,
    '',
    '5. Kesimpulan (petikan):',
    conclusion,
    '',
    '6. Catatan Analisis:',
    'Lakukan pemeriksaan manual atas tujuan, metode, hasil, kesimpulan, dan konsistensi antarbagian. Jangan gunakan fallback ini sebagai bukti bahwa klaim atau metode telah tervalidasi.',
    '',
    '7. Kelemahan/Keterbatasan:',
    'Analisis AI tidak tersedia. Reviewer perlu mengidentifikasi keterbatasan berdasarkan bukti eksplisit pada naskah.'
  ].join('\\n');
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Teks naskah tidak valid atau terlalu pendek.' },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.NINE_ROUTER_BASE_URL || 'http://localhost:20128/v1').replace(/\/$/, '');
    const apiKey = process.env.NINE_ROUTER_API_KEY || 'sk-254-local';

    const prompt = `Analisis artikel berikut secara mendalam:

${text}

Berikan output dengan format berikut:
1. Ringkasan:
2. Tujuan Penelitian:
3. Metodologi:
4. Temuan Utama:
5. Kesimpulan:
6. Catatan Analisis:
7. Kelemahan/Keterbatasan:`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // bounded timeout for model response
      let response: Response;
      try {
        response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'UltimateAI',
          messages: [{
            role: 'user',
            content: prompt
          }],
          stream: false,
          temperature: 0
        }),
        signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (response.ok) {
        const json = await response.json();
        const fullContent = json.choices?.[0]?.message?.content;
        if (fullContent && fullContent.trim().length > 30) {
          return NextResponse.json({
            success: true,
            rawContent: fullContent,
            provider: '9Router-UltimateAI',
            model: 'UltimateAI',
            status: 'COMPLETED',
            inputLength: text.length
          });
        }
      }
    } catch (aiFetchErr) {
      console.warn('[ultimateai-clue] Remote 9Router unreachable, switching to APASIFIC Cognitive Engine fallback:', aiFetchErr);
    }

    // Fallback is explicitly marked and extractive; it must not impersonate a completed AI analysis.
    const canonicalContent = generateIntelligentManuscriptClue(text);
    return NextResponse.json({
      success: true,
      rawContent: canonicalContent,
      provider: 'APASIFIC-Extractive-Fallback',
      model: 'extractive-fallback-v1',
      status: 'FALLBACK',
      warning: 'AI analysis unavailable; output contains text excerpts and requires manual reviewer verification.',
      inputLength: text.length
    });

  } catch (error: any) {
    console.error('[ultimateai-clue] Server Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan pada server saat memproses analisis.' },
      { status: 500 }
    );
  }
}
