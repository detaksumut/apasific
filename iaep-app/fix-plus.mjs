import { createClient } from "@supabase/supabase-js";
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

function formatPhone(phone) {
  if (!phone) return phone;
  let p = phone.replace(/[^0-9+]/g, '');
  if (p.startsWith('08')) {
    p = '+62' + p.substring(1);
  } else if (p.startsWith('62')) {
    p = '+' + p;
  } else if (p.startsWith('8')) {
    p = '+62' + p;
  }
  return p;
}

async function fix() {
  const localData = JSON.parse(fs.readFileSync('apasific_registered_users.json', 'utf8'));
  
  for (const user of localData) {
    if (user.phone_number) {
      user.phone_number = formatPhone(user.phone_number);
    }
    if (user.phone) {
      user.phone = formatPhone(user.phone);
    }
  }

  // Update Supabase
  const res = await supabaseAdmin
    .from('system_settings')
    .upsert({ key: 'apasific_registered_users', value: JSON.stringify(localData) });
  
  fs.writeFileSync('apasific_registered_users.json', JSON.stringify(localData, null, 2));

  console.log("Supabase phone numbers synced. Status:", res.status);
}

fix();
