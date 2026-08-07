// Polyfill WebSocket for Node.js < 22 to satisfy Supabase JS SDK
global.WebSocket = require('ws');

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
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
} catch (e) {
  console.warn("Failed to parse .env.local file:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables missing in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanLegacyAuthors() {
  console.log("Starting cleanup of legacy Unknown/Unknown Author records...");

  const { data, error } = await supabase
    .from('article_authors')
    .delete()
    .in('full_name', ['Unknown', 'Unknown Author', 'unknown', 'unknown author', 'Penulis Tidak Diketahui']);

  if (error) {
    console.error("Failed to delete legacy author rows:", error.message);
  } else {
    console.log("Successfully deleted legacy placeholder author rows from database.");
  }
}

cleanLegacyAuthors();
