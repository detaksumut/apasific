-- supabase/migrations/20261101000000_create_audit_events.sql

-- Enable partitioning capability (PostgreSQL native declarative partitioning)
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  actor_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255) NOT NULL,
  resource_id VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  trace_id VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create initial partitions (can be automated via pg_partman in the future)
CREATE TABLE audit_events_2026_08 PARTITION OF audit_events
  FOR VALUES FROM ('2026-08-01 00:00:00Z') TO ('2026-09-01 00:00:00Z');

CREATE TABLE audit_events_2026_09 PARTITION OF audit_events
  FOR VALUES FROM ('2026-09-01 00:00:00Z') TO ('2026-10-01 00:00:00Z');

-- Indexes for frequent queries (actor timeline, resource timeline, tracing)
CREATE INDEX idx_audit_events_actor ON audit_events (actor_id, created_at);
CREATE INDEX idx_audit_events_resource ON audit_events (resource_type, resource_id, created_at);
CREATE INDEX idx_audit_events_trace ON audit_events (trace_id);

-- Enforce IMMUTABILITY
-- Prevent updates or deletes on the audit_events table
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit events are immutable and cannot be updated or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_audit_immutability
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW
EXECUTE FUNCTION prevent_audit_modification();
