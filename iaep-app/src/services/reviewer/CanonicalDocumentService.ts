import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
const pdfParse = require('pdf-parse');

export interface CanonicalParagraph {
  paragraph_hash: string;
  page_number: number;
  paragraph_text: string;
}

export class CanonicalDocumentService {
  private static getSupabaseAdmin() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  }

  /**
   * Generates SHA256 hash from paragraph text
   */
  public static generateHash(text: string): string {
    return crypto.createHash('sha256').update(text.trim()).digest('hex');
  }

  /**
   * Extracts text from a PDF url, splits into paragraphs with page numbers,
   * generates SHA256 hashes, and caches them in the database.
   */
  public static async processAndCacheDocument(
    submissionId: string,
    pdfUrl: string
  ): Promise<{ success: boolean; paragraphs?: CanonicalParagraph[]; error?: string }> {
    const supabase = this.getSupabaseAdmin();

    try {
      // 1. Check if canonical paragraphs already cached for this submission
      const { data: cached } = await supabase
        .from('submission_canonical_paragraphs')
        .select('paragraph_hash, page_number, paragraph_text')
        .eq('submission_id', submissionId);

      if (cached && cached.length > 0) {
        console.log(`[CanonicalService] Found ${cached.length} cached paragraphs for submission ${submissionId}`);
        return { success: true, paragraphs: cached };
      }

      // 2. Fetch the PDF file
      console.log(`[CanonicalService] Downloading PDF from: ${pdfUrl}`);
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to download PDF: status=${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Parse PDF with page segmentation callback
      const paragraphs: CanonicalParagraph[] = [];

      // Custom pager callback for pdf-parse to track page numbers
      const renderPageCallback = (pageData: any) => {
        return pageData.getTextContent().then((textContent: any) => {
          let lastY = -1;
          let text = '';
          const pageNum = pageData.pageIndex + 1; // 1-based page index

          for (const item of textContent.items) {
            // Segment paragraphs by significant vertical gaps or standard layout lines
            if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 12) {
              text += '\n';
            }
            text += item.str;
            lastY = item.transform[5];
          }

          // Split raw page text into clean paragraphs
          const rawLines = text.split('\n');
          let currentParagraph = '';

          for (const line of rawLines) {
            const cleanLine = line.trim();
            if (cleanLine.length === 0) {
              if (currentParagraph.trim().length > 15) {
                paragraphs.push({
                  paragraph_hash: this.generateHash(currentParagraph),
                  page_number: pageNum,
                  paragraph_text: currentParagraph.trim()
                });
                currentParagraph = '';
              }
            } else {
              currentParagraph += (currentParagraph ? ' ' : '') + cleanLine;
            }
          }

          if (currentParagraph.trim().length > 15) {
            paragraphs.push({
              paragraph_hash: this.generateHash(currentParagraph),
              page_number: pageNum,
              paragraph_text: currentParagraph.trim()
            });
          }

          return text;
        });
      };

      await pdfParse(buffer, {
        pagerender: renderPageCallback
      });

      if (paragraphs.length === 0) {
        throw new Error('No paragraphs could be parsed from the document.');
      }

      // 4. Save structured canonical paragraphs to Supabase
      console.log(`[CanonicalService] Saving ${paragraphs.length} paragraphs to database...`);
      const insertRows = paragraphs.map(p => ({
        submission_id: submissionId,
        paragraph_hash: p.paragraph_hash,
        page_number: p.page_number,
        paragraph_text: p.paragraph_text
      }));

      const { error: insertErr } = await supabase
        .from('submission_canonical_paragraphs')
        .upsert(insertRows, { onConflict: 'submission_id, paragraph_hash' });

      if (insertErr) {
        throw insertErr;
      }

      return { success: true, paragraphs };
    } catch (e: any) {
      console.error('[CanonicalService] Processing failed:', e);
      return { success: false, error: e.message };
    }
  }

  /**
   * Fetches cached canonical paragraphs from the database
   */
  public static async getCanonicalParagraphs(submissionId: string): Promise<CanonicalParagraph[]> {
    const supabase = this.getSupabaseAdmin();
    const { data } = await supabase
      .from('submission_canonical_paragraphs')
      .select('paragraph_hash, page_number, paragraph_text')
      .eq('submission_id', submissionId)
      .order('page_number', { ascending: true });

    return data || [];
  }
}
