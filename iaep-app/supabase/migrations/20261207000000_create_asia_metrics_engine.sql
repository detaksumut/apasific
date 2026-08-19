-- supabase/migrations/20261207000000_create_asia_metrics_engine.sql
-- ASIA METRICS ENGINE: AUDIT TRAILS & HISTORICAL SNAPSHOTS
-- Additive Only - Production Safe - 4-Tier Versioning Compliant

-- 1. ASIA METRIC SNAPSHOTS TABLE
CREATE TABLE IF NOT EXISTS public.asia_metric_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_version VARCHAR(50) NOT NULL, -- e.g. '2026.Q3'
    metric_version VARCHAR(50) NOT NULL,   -- e.g. 'ASIA-METRICS-v1.2'
    formula_version VARCHAR(50) NOT NULL,  -- e.g. 'ASR-1.2-POWER-ITERATION'
    dataset_version VARCHAR(50) NOT NULL,  -- e.g. 'ASIA-CORPUS-2026.08.20'
    entity_type VARCHAR(20) NOT NULL,      -- 'ARTICLE' | 'JOURNAL'
    entity_id UUID NOT NULL,               -- article_id or journal_id
    metric_name VARCHAR(50) NOT NULL,      -- 'AAS', 'ACS', 'ASR', 'AIF', 'PERCENTILE', 'AM_QUARTILE'
    metric_value NUMERIC(10, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CALCULATED', -- 'INSUFFICIENT_DATA', 'PROVISIONAL', 'CALCULATED', 'VERIFIED'
    formula_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
    audit_hash VARCHAR(255) NOT NULL,      -- SHA-256 cryptographic audit integrity hash
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uk_asia_metric_snapshot UNIQUE (snapshot_version, entity_type, entity_id, metric_name)
);

-- 2. ASIA METRIC AUDIT TRAIL LOGS
CREATE TABLE IF NOT EXISTS public.asia_metric_audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine_run_id VARCHAR(100) NOT NULL,
    snapshot_version VARCHAR(50) NOT NULL,
    iteration_count INT DEFAULT 0,
    convergence_delta NUMERIC(12, 10),
    total_nodes INT DEFAULT 0,
    total_edges INT DEFAULT 0,
    dangling_nodes_count INT DEFAULT 0,
    integrity_status VARCHAR(50) DEFAULT 'PASSED',
    audit_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_asia_snapshot_lookup ON public.asia_metric_snapshots(entity_type, entity_id, snapshot_version);
CREATE INDEX IF NOT EXISTS idx_asia_snapshot_version ON public.asia_metric_snapshots(snapshot_version, metric_name);
CREATE INDEX IF NOT EXISTS idx_asia_audit_run ON public.asia_metric_audit_trail(engine_run_id);

-- RLS Policies
ALTER TABLE public.asia_metric_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asia_metric_audit_trail ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_metric_snapshots') THEN
        CREATE POLICY "Allow public read on asia_metric_snapshots" ON public.asia_metric_snapshots FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on asia_metric_audit_trail') THEN
        CREATE POLICY "Allow public read on asia_metric_audit_trail" ON public.asia_metric_audit_trail FOR SELECT USING (true);
    END IF;
END $$;
