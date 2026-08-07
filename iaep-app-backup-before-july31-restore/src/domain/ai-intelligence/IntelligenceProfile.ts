/**
 * Primary Aggregate: IntelligenceProfile
 * Represents the semantic AI understanding of a researcher (Graph Node).
 * Contains vector embeddings for advanced similarity searches.
 */
export interface IntelligenceProfile {
  id: string;
  researcherId: string;
  expertiseVector: number[] | null; // e.g., 1536-dimensional array
  knowledgeEmbedding: number[] | null;
  createdAt: Date;
  updatedAt: Date;
}
