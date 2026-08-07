import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/client";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const result: any = { supabase_users: null };
    
    // Check if there is a profiles table in Supabase
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(100);
    result.profiles = profiles;
    result.profiles_error = pError;

    // Search for kadsumut in any relevant table
    // Example: users
    const { data: users, error: uError } = await supabase.from('users').select('*').limit(100);
    result.users = users;
    result.users_error = uError;

    // Example: reviewers
    const { data: reviewers, error: rError } = await supabase.from('reviewers').select('*').limit(100);
    result.reviewers = reviewers;
    result.reviewers_error = rError;

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
