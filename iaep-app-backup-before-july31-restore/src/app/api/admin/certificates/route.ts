// File ini sudah tidak digunakan (obsolete) karena logikanya sudah dipindahkan ke Server Component di page.tsx
// File ini dikosongkan agar tidak menyebabkan error TypeScript saat Vercel melakukan proses build.

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Obsolete route" });
}
