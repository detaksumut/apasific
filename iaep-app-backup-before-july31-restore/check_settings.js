const fs = require('fs');
const envConfig = fs.readFileSync('.env.local', 'utf8').split('\n');
for (let line of envConfig) {
  if (line.includes('=')) {
    const [key, val] = line.split('=');
    process.env[key.trim()] = val.trim();
  }
}
const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws'); 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSettings() {
  const { data, error } = await supabase.from('system_settings').select('value').eq('key', 'registered_users').single();
  if (error) {
    console.error(error);
  } else {
    let users = data.value;
    if (typeof users === 'string') users = JSON.parse(users);
    console.log(`TOTAL USERS IN SYSTEM_SETTINGS: ${users.length}`);
    console.log(users.slice(-3).map(u => u.full_name));
  }
}
checkSettings();
