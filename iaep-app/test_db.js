import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read from env file
const envFile = fs.readFileSync(".env.local", "utf8");
let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";

envFile.split("\n").forEach(line => {
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) SUPABASE_URL = line.split("=")[1].trim();
  if (line.startsWith("NEXT_PUBLIC_SUPABASE_ANON_KEY=")) SUPABASE_ANON_KEY = line.split("=")[1].trim();
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase
    .from("leadership")
    .select("*");

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
