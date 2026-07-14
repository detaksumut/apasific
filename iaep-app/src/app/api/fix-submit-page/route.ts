import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const uuids = {
      "1": "5f6bca5a-39e2-442b-a2e0-5b3f35614b4e",
      "2": "4f4ad30b-1fab-4c43-ab96-227f0d7d5977",
      "3": "71809c3b-44dd-46cb-a553-636fe1395b46",
      "4": "bdbd934b-a76b-42a5-8553-2444b2b7b45a",
      "5": "31f8f2cc-7036-40cd-8f7c-fedf25eda4ec",
      "6": "1e64461f-a671-431b-a739-2c01b4b865ac",
      "7": "c212a65d-a0dc-4410-879a-352932014a52",
      "8": "6e3a2c2c-0e6c-4e18-82bd-e0fdc2d1ac5d",
      "9": "ad2edb51-7f51-455c-9000-6aaab590387f",
      "10": "a1dbfeee-da95-4565-9373-330feeca7901",
      "11": "bdff93b5-9e6a-43ec-9ae1-633001cbfba1",
      "12": "033cce77-8836-492c-8fff-a27a911b4701",
      "13": "8fc81b02-780f-4611-869b-294a3f9b7749",
      "14": "08c59804-37e5-476f-9166-5d86f3dabc0d",
      "15": "5c3b5789-043a-48b4-89de-792599db95ac",
      "16": "00270d77-49ea-447e-804e-2a0c44c66fa3"
    };

    const filePath = path.join(process.cwd(), "src/app/dashboard/submit/page.tsx");
    let content = fs.readFileSync(filePath, "utf-8");

    // We use a regex boundary so it only replaces exact '1', '2', etc.
    for (let i = 1; i <= 16; i++) {
      const regex = new RegExp(`id: '${i}'`, 'g');
      content = content.replace(regex, `id: '${uuids[i.toString()]}'`);
    }

    content = content.replace(`journal_id: '1'`, `journal_id: '${uuids["1"]}'`);
    // Also, some fields might have used parseInt. We need to check if there are others.

    fs.writeFileSync(filePath, content, "utf-8");
    return NextResponse.json({ success: true, message: "page.tsx updated with UUIDs" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
