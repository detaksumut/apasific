import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function sync() {
  const localData = JSON.parse(fs.readFileSync('apasific_registered_users.json', 'utf8'));
  
  // also merge reviewers one last time just to be absolutely sure
  const revs = JSON.parse(fs.readFileSync('src/app/api/users/list/reviewers_data.json', 'utf8'));
  for (const r of revs) {
    const user = localData.find(u => u.email.toLowerCase() === r.email.toLowerCase());
    if (user) {
      if (!user.phone_number) user.phone_number = r.phone;
    }
  }

  // Update Supabase
  const res = await supabaseAdmin
    .from('system_settings')
    .upsert({ key: 'apasific_registered_users', value: JSON.stringify(localData) });
  
  fs.writeFileSync('apasific_registered_users.json', JSON.stringify(localData, null, 2));

  console.log("Supabase synced. Status:", res.status);
}

sync();
