const fs = require('fs');
try {
  const envConfig = fs.readFileSync('.env.local', 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
} catch(e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function updateJournal() {
  console.log("Updating journal name in Supabase...");
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/journals?name=ilike.*Business%20Administration*`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ name: 'AJBA - Journal of Management and Business Administration' })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Error updating:", err);
    } else {
      const data = await res.json();
      console.log("Successfully updated:", data);
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

updateJournal();
