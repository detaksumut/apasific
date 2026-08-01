-- APASIFIC Academic Hub - Scholarly Ecosystem Provider Model
-- Phase C.1: Provider Health Governance

CREATE TABLE IF NOT EXISTS public.provider_health_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES public.scholarly_providers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DEGRADED', 'RATE_LIMITED', 'AUTH_FAILED', 'UNAVAILABLE', 'MAINTENANCE')),
    failure_count INTEGER DEFAULT 0,
    success_rate NUMERIC(5,2) DEFAULT 100.00,
    last_response_code INTEGER,
    health_message TEXT,
    last_check TIMESTAMPTZ DEFAULT NOW(),
    latency_ms INTEGER,
    last_error TEXT,
    last_success_sync TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index to ensure one active health record per provider if we only want the current state, 
-- or we can use it as a log. Based on the schema fields like 'updated_at', it represents current state.
CREATE UNIQUE INDEX idx_provider_health_unique ON public.provider_health_status (provider_id);

-- Enable RLS
ALTER TABLE public.provider_health_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Health status is viewable by everyone" ON public.provider_health_status FOR SELECT USING (true);
-- In a real app, only system roles should update this, but we'll allow authenticated for now
CREATE POLICY "Health status updatable by authenticated" ON public.provider_health_status FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Health status insertable by authenticated" ON public.provider_health_status FOR INSERT TO authenticated WITH CHECK (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_health_status_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_status_updated_at
BEFORE UPDATE ON public.provider_health_status
FOR EACH ROW EXECUTE PROCEDURE update_health_status_updated_at_column();

-- Seed Initial Health Data for Elsevier Ecosystem
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.scholarly_providers LOOP
        INSERT INTO public.provider_health_status (
            provider_id, 
            status, 
            health_message,
            last_success_sync
        ) VALUES (
            r.id, 
            'ACTIVE', 
            'Initialized via Phase C.1 Migration',
            NOW()
        ) ON CONFLICT (provider_id) DO NOTHING;
    END LOOP;
END $$;
