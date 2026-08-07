import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function generateRandomCode(prefix: string) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("exam_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam sessions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { candidate_id, certification_field } = await req.json();

    if (!candidate_id || !certification_field) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const assessor_code = generateRandomCode('ASC');
    const candidate_code = generateRandomCode('CAN');

    // random UUID for url slug
    const id = crypto.randomUUID();

    const { data, error } = await supabase
      .from("exam_sessions")
      .insert([
        {
          id,
          candidate_id,
          certification_field,
          assessor_code,
          candidate_code,
          status: 'DRAFT',
          exam_data: {},
          answer_data: {},
          score: null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating exam session:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
