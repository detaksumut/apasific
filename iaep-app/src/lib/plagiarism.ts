// src/lib/plagiarism.ts

export interface PlagiarismResult {
  sentence: string;
  isPlagiarized: boolean;
  wordCount: number;
  sources?: string[];
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
  // Regex untuk mencari header "Daftar Pustaka" atau "Referensi" dsb.
  const regex = /(?:\n|^)\s*(?:DAFTAR PUSTAKA|REFERENSI|REFERENCES|BIBLIOGRAPHY)\s*(?:\n|$)/i;
  const match = text.match(regex);
  
  if (match && match.index !== undefined) {
    return text.substring(0, match.index);
  }
  return text;
}

/**
 * Memecah teks menjadi paragraf.
 */
export function extractParagraphs(text: string): string[] {
  const rawParagraphs = text.split(/\n+/);
  return rawParagraphs
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

/**
 * Menghitung jumlah kata dalam sebuah string.
 */
export function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length === 1 && words[0] === '' ? 0 : words.length;
}

/**
 * Melakukan pengecekan plagiarisme ke Google Custom Search API.
 */
export async function checkParagraphPlagiarism(paragraph: string): Promise<string[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY;
  const cx = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    console.warn("API Key Google Search tidak ditemukan. Menggunakan mode simulasi.");
    await new Promise(resolve => setTimeout(resolve, 500));
    if (Math.random() > 0.8) {
      return ["https://example.com/source-1"];
    }
    return [];
  }

  try {
    const query = encodeURIComponent(`"${paragraph}"`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${apiKey}&cx=${cx}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Gagal memanggil Google API:", await response.text());
      return [];
    }
    
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => item.link);
    }
    return [];
  } catch (error) {
    console.error("Error saat mengecek ke Google:", error);
    return [];
  }
}
