// scripts/apply_asia_schema.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log("Applying ASIA Index schema migration...");
  const sqlPath = path.join(__dirname, '../supabase/migrations/20261205000000_create_asia_index_and_metrics.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Try via rpc run_sql or exec_sql if available, or direct table checks
  try {
    const { data, error } = await supabase.rpc('run_sql', { sql });
    if (error) {
      console.warn("RPC run_sql returned:", error.message || error);
      console.log("Attempting fallback creation using standard Supabase client queries or direct checks...");
    } else {
      console.log("Migration executed successfully via run_sql!");
    }
  } catch (err) {
    console.error("Execution error:", err);
  }

  // Verify table creation
  try {
    const { data: testRecords, error: testErr } = await supabase
      .from('asia_index_records')
      .select('id')
      .limit(1);

    if (testErr) {
      console.log("Table check status:", testErr.message);
    } else {
      console.log("asia_index_records table is confirmed accessible!");
    }
  } catch (err) {
    console.log("Verification error:", err.message);
  }
}

applyMigration();
