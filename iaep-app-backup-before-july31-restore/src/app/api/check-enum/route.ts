import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aroasmlrlpjbjokvxlgo.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg'
  );

  const { data, error } = await supabase.rpc('get_enum_values', { enum_type_name: 'review_assignment_status' });

  // If rpc fails, try raw query using standard postgres schema
  if (error) {
     const { data: qData, error: qError } = await supabase.from('review_assignments').select('status').limit(10);
     return NextResponse.json({ type: 'table_scan', data: qData, error: qError });
  }

  return NextResponse.json({ type: 'rpc', data, error });
}
