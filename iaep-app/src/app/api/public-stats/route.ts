import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SEC-03: Service role key must be provided via environment variables only.
// No hardcoded fallback secrets are permitted.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL is not configured.');
}
if (!supabaseKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured. Refusing to start with a fallback secret.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    let membersCount = 0;
    let countriesCount = 0;
    let publicationsCount = 0;

    // 1. Get Users and Countries from system_settings apasific_registered_users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    if (!usersError && usersData?.value) {
      try {
        const users = typeof usersData.value === 'string' ? JSON.parse(usersData.value) : usersData.value;
        if (Array.isArray(users)) {
          membersCount = users.length;
          
          // Calculate unique countries
          const uniqueCountries = new Set();
          users.forEach((u: any) => {
            if (u.country) {
              uniqueCountries.add(u.country.trim().toUpperCase());
            }
          });
          countriesCount = uniqueCountries.size;
        }
      } catch (e) {
        console.error('Error parsing users data:', e);
      }
    }

    // 2. Get Publications count from submissions table
    const { count: pubCount, error: pubError } = await supabaseAdmin
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    if (!pubError && pubCount !== null) {
      publicationsCount = pubCount;
    }

    return NextResponse.json({
      members: membersCount,
      countries: countriesCount,
      publications: publicationsCount
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("Failed to fetch public stats:", error);
    return NextResponse.json({ 
      members: 0, 
      countries: 0, 
      publications: 0,
      error: "Failed to load stats"
    }, { status: 500, headers: corsHeaders });
  }
}
