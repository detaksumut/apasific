import { NextResponse } from 'next/server';

export async function GET() {
  const payload = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ";
  const decoded = Buffer.from(payload, 'base64').toString('utf8');
  return NextResponse.json({ decoded });
}
