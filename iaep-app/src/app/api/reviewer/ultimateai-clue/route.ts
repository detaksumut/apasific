import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 50) {
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

    const response = await fetch(`${baseUrl}/chat/completions`, {
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
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[ultimateai-clue] UltimateAI 9Router error:', errText);
      return NextResponse.json(
        { error: `UltimateAI error: ${response.status} - ${errText}` },
        { status: 502 }
      );
    }

    const json = await response.json();
    const fullContent = json.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      success: true,
      rawContent: fullContent,
      provider: '9Router',
      model: 'UltimateAI',
      status: 'COMPLETED',
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
