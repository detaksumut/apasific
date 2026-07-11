import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/data/org-structure.json");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const members = JSON.parse(fileContent);

    const eicNames = ["Arfan Ikhsan", "Tomi", "Prihat"];
    const editorNames = ["Intan Fatimah", "Zulkarnain", "Nasir"];
    const reviewerNames = ["Raja Haslinda", "Muhammad Yamin", "Rina"];

    const getMember = (names: string[]) => members.find((m: any) => names.some(n => m.name.includes(n))) || members[0];

    const eic = getMember(eicNames);
    const editor = getMember(editorNames);
    const reviewer = getMember(reviewerNames);

    const membersData = [
      {
        jabatan: "Editor In Chief",
        nama: eic.name,
        afiliasi: eic.division,
        foto: eic.photo
      },
      {
        jabatan: "Editor",
        nama: editor.name,
        afiliasi: editor.division,
        foto: editor.photo
      },
      {
        jabatan: "Reviewer",
        nama: reviewer.name,
        afiliasi: reviewer.division,
        foto: reviewer.photo
      }
    ];

    const supabase = await createClient();
    const { data: boards } = await supabase.from("leadership").select("body_name");

    const results = [];
    for (const board of boards) {
      if (board.body_name && board.body_name.startsWith("Editorial Board -")) {
        const { error } = await supabase
          .from("leadership")
          .update({ members_json: JSON.stringify(membersData) })
          .eq("body_name", board.body_name);
        results.push({ body: board.body_name, success: !error });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, fullError: error }, { status: 200 });
  }
}
