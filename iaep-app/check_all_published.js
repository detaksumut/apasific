const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  try {
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // 1. Get count of submissions by status
    const { data: statusCounts, error: error1 } = await supabase
      .from('submissions')
      .select('status');
      
    if (error1) throw error1;
    
    const counts = {};
    statusCounts.forEach(s => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    
    console.log("=== SUBMISSION COUNTS BY STATUS ===");
    console.log(counts);
    
    // 2. Fetch all published / Published submissions
    const { data: publishedList, error: error2 } = await supabase
      .from('submissions')
      .select('id, title, status, stage, journal_id, zenodo_id, doi, author, created_at')
      .in('status', ['Published', 'published']);
      
    if (error2) throw error2;
    
    console.log(`\n=== TOTAL PUBLISHED SUBMISSIONS IN SUPABASE: ${publishedList.length} ===`);
    publishedList.forEach((p, idx) => {
      console.log(`${idx + 1}. Title: "${p.title}"`);
      console.log(`   ID: ${p.id} | Status: ${p.status} | Stage: ${p.stage}`);
      console.log(`   Journal ID: ${p.journal_id} | Zenodo ID: ${p.zenodo_id} | DOI: ${p.doi} | Author: ${p.author}`);
      console.log(`   Created At: ${p.created_at}`);
      console.log("----------------------------------------");
    });
    
  } catch (err) {
    console.error("Error running script:", err);
  }
}

run();
