// src/lib/plagiarism.ts

export interface PlagiarismResult {
  sentence: string;
  isPlagiarized: boolean;
  wordCount: number;
  sources?: string[];
  similarityScore?: number;
  classification?: string;
  phrasesChecked?: string[];
}

export interface PlagiarismReport {
  totalParagraphs: number;
  checkedParagraphs: number;
  plagiarizedParagraphs: number;
  plagiarismPercentage: number;
  results: PlagiarismResult[];
}

/**
 * Membuang bagian Daftar Pustaka atau Referensi dari teks.
 */
export function removeBibliography(text: string): string {
  const regex = /(?:\n|^)\s*(?:DAFTAR PUSTAKA|REFERENSI|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|$)/i;
  const match = text.match(regex);
  if (match && match.index !== undefined) {
    return text.substring(0, match.index);
  }
  return text;
}

/**
 * Memecah teks menjadi potongan (chunk/block) tepat 100 kata.
 */
export function extractParagraphs(text: string): string[] {
  const rawParagraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
  const chunks: string[] = [];
  const chunkSize = 100;
  
  for (const p of rawParagraphs) {
    const words = p.split(/\s+/).filter(w => w.length > 0);
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
  }
  return chunks;
}

/**
 * Menghitung jumlah kata dalam sebuah string.
 */
export function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

/**
 * Memotong blok teks secara berurutan menjadi bagian-bagian berukuran ~25 kata.
 */
function extractPhrases(block: string): string[] {
  const words = block.trim().split(/\s+/);
  const phrases: string[] = [];
  const chunkSize = 25;

  if (words.length <= chunkSize) {
    return [block];
  }

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunkWords = words.slice(i, i + chunkSize);
    // Abaikan jika sisa potongan terlalu pendek (kurang dari 10 kata) untuk menghemat API
    if (chunkWords.length >= 10) {
      phrases.push(chunkWords.join(' '));
    }
  }

  return Array.from(new Set(phrases));
}

export interface CheckResult {
  sources: string[];
  similarityScore: number;
  classification: string;
  phrasesChecked: string[];
}

let currentGoogleKeyIndex = 0;

/**
 * Melakukan pengecekan plagiarisme ke Google Custom Search / Bing menggunakan teknik Phrase Sampling.
 */
export async function checkParagraphPlagiarism(block: string): Promise<CheckResult> {
  const apiKeyStr = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const apiKeys = apiKeyStr ? apiKeyStr.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  const cx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX;
  const bingApiKey = process.env.NEXT_PUBLIC_BING_SEARCH_API_KEY;

  const phrases = extractPhrases(block);
  let allSources: string[] = [];
  let matchCount = 0;

  if (apiKeys.length === 0 && !cx && !bingApiKey) {
    console.warn("API Key tidak ditemukan. Menggunakan mode simulasi.");
    await new Promise(resolve => setTimeout(resolve, 500));
    const isPlagiarized = Math.random() > 0.8;
    return {
      sources: isPlagiarized ? ["https://example.com/source-simulasi"] : [],
      similarityScore: isPlagiarized ? 85 : 0,
      classification: isPlagiarized ? "High Similarity" : "Low Similarity",
      phrasesChecked: phrases
    };
  }

  // Tembak setiap frasa ke API
  for (const phrase of phrases) {
    const query = encodeURIComponent(`"${phrase}"`);
    let found = false;

    // 1. Google CSE (Round-Robin Multiple API Keys)
    if (apiKeys.length > 0 && cx) {
      try {
        const activeKey = apiKeys[currentGoogleKeyIndex % apiKeys.length];
        currentGoogleKeyIndex++; // Putar ke kunci berikutnya untuk pencarian selanjutnya

        const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${activeKey}&cx=${cx}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            allSources.push(...data.items.map((item: any) => item.link));
            found = true;
          }
        }
      } catch (e) {
        // Gunakan console.warn agar Next.js tidak memunculkan layar merah saat kena blokir CORS/Limit
        console.warn("Google API gagal diakses (kemungkinan kuota habis atau diblokir browser).");
      }
    }

    // 2. Bing API
    if (!found && bingApiKey) {
      try {
        const url = `https://api.bing.microsoft.com/v7.0/search?q=${query}`;
        const response = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': bingApiKey } });
        if (response.ok) {
          const data = await response.json();
          if (data.webPages && data.webPages.value && data.webPages.value.length > 0) {
            allSources.push(...data.webPages.value.map((item: any) => item.url));
            found = true;
          }
        }
      } catch (e) {
        console.error("Bing API error:", e);
      }
    }

    if (found) {
      matchCount++;
    }
  }

  // Hitung similarity berdasarkan berapa frasa yang tembus Exact Match
  const score = Math.round((matchCount / phrases.length) * 100);
  let classification = "Low Similarity";
  if (score >= 90) classification = "Exact Copy";
  else if (score >= 70) classification = "High Similarity";
  else if (score >= 40) classification = "Partial Similarity";

  return {
    sources: Array.from(new Set(allSources)), // Buang URL ganda
    similarityScore: score,
    classification,
    phrasesChecked: phrases
  };
}
