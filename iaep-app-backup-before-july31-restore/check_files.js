require('dotenv').config({path: 'd:/Users/apasific/iaep-app/.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('submission_files').select('submission_id, file_name, storage_path, file_size').order('created_at', { ascending: false }).limit(2);
  console.log("=== FILE TERBARU YANG DIUPLOAD ===");
  console.log(data);
}
run();
