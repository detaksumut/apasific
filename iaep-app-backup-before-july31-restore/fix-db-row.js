const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const entityId = '7375625f-3137-3834-3533-303330323837';
  
  // File URL is `sub_1784530302874_8ggumuu`
  const { error } = await supabase.from('submissions').update({
    file_url: 'sub_1784530302874_8ggumuu'
  }).eq('id', entityId);

  if (error) {
    console.error("Update failed:", error);
  } else {
    console.log("Database updated successfully for ID:", entityId);
  }
}

run();
