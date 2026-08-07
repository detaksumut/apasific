-- supabase/migrations/20261201000000_optimize_global_indexes.sql

-- 1. Researcher High-Value Indexes
CREATE INDEX IF NOT EXISTS idx_researcher_id ON researchers(id);
CREATE INDEX IF NOT EXISTS idx_researcher_institution ON researchers(institution_id);

-- Reputation searches are often ordered by score
CREATE INDEX IF NOT EXISTS idx_reputation_score_desc ON reputations(score DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_researcher ON reputations(researcher_id);

-- 2. Publication Global Search Indexes
-- B-Tree for exact matches
CREATE INDEX IF NOT EXISTS idx_publication_doi ON publications(doi);
CREATE INDEX IF NOT EXISTS idx_publication_author ON publications(author_id);
-- BRIN index for highly ordered time-series data like publication dates
CREATE INDEX IF NOT EXISTS idx_publication_date_brin ON publications USING BRIN (publication_date);
-- Sort acceleration for citation counts
CREATE INDEX IF NOT EXISTS idx_publication_citations ON publications(citation_count DESC);

-- 3. JSONB Metadata Indexing (GIN)
-- Useful for deep searching inside unstructured JSON blobs in the academic ecosystem
CREATE INDEX IF NOT EXISTS idx_publication_metadata_gin ON publications USING GIN (metadata);
