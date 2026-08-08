global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log("==========================================================");
  console.log(" APPLYING AI INSPECTION SCHEMA TO SUPABASE");
  console.log("==========================================================");

  // Since we cannot run raw DDL via standard supabase-js client directly without RPC,
  // we will execute SQL commands using RPC 'exec_sql' if available, or we check table presence.
  // Standard way: check if we can run it via postgres functions.
  
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'supabase/20260808_create_ai_inspection_tables.sql'), 'utf8');

  // Let's call RPC functions if any postgres management function exists
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.log("⚠️ Direct RPC Exec SQL not supported or failed. Attempting alternative check...");
    console.log("Error details:", error.message);
    console.log("\nHarap jalankan query SQL berikut secara manual di Supabase SQL Editor:");
    console.log("----------------------------------------------------------");
    console.log(sql);
    console.log("----------------------------------------------------------");
  } else {
    console.log("✅ DDL berhasil diterapkan ke Supabase!");
  }
}

run();
