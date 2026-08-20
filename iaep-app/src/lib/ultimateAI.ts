export const ultimateAIAnalysis = async (text: string) => {
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
      messages: [{
        role: 'user',
        content: `Analisis artikel berikut secara mendalam:

${text}

Berikan output dengan format berikut:
1. Ringkasan:
2. Tujuan Penelitian:
3. Metodologi:
4. Temuan Utama:
5. Kesimpulan:
6. Catatan Analisis:
7. Kelemahan/Keterbatasan:`
      }],
      stream: false,
      temperature: 0
    })
  });

  if (!response.ok) {
    throw new Error(`UltimateAI HTTP ${response.status}: ${await response.text()}`);
  }

  const json = await response.json();

  const fullContent =
    json.choices?.[0]?.message?.content || '';

  return {
    rawContent: fullContent,
    provider: '9Router',
    model: 'UltimateAI',
    status: 'COMPLETED',
    inputLength: text.length
  };
};
