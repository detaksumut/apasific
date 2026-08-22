export const ultimateAIAnalysis = async (text: string) => {
  // Call through Next.js Server API Route so Vercel environment variables
  // (NINE_ROUTER_BASE_URL) are securely utilized and Mixed Content is prevented.
  const response = await fetch('/api/reviewer/ultimateai-clue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `UltimateAI HTTP ${response.status}`);
  }

  const data = await response.json();

  return {
    rawContent: data.rawContent || '',
    provider: data.provider || '9Router',
    model: data.model || 'UltimateAI',
    status: data.status || 'COMPLETED',
    inputLength: text.length
  };
};
