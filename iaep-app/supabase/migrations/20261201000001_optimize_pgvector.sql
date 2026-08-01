-- supabase/migrations/20261201000001_optimize_pgvector.sql

-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Assume we have an embeddings table for AI Knowledge Graph and Expert Discovery
-- CREATE TABLE ai_embeddings ( id uuid, entity_type text, entity_id uuid, embedding vector(1536) );

-- Implement HNSW (Hierarchical Navigable Small World) index for lightning-fast approximate nearest neighbor (ANN) search.
-- Replaces Exact Nearest Neighbor (KNN) which degrades at scale.

CREATE INDEX IF NOT EXISTS idx_ai_embeddings_hnsw 
ON ai_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Note:
-- 'm' defines the maximum number of connections per layer.
-- 'ef_construction' determines the size of the dynamic list for the nearest neighbors during index creation.
-- This setup drastically accelerates Expert Discovery & Document Matching in the APASIFIC Intelligence engine.
