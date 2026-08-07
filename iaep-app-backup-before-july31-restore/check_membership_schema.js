const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient('https://aroasmlrlpjbjokvxlgo.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg');

async function check() {
  try {
    const { data, error } = await supabase.from('membership_applications').select('*').limit(1);
    if (error) {
        fs.writeFileSync('schema_output.txt', 'Error: ' + JSON.stringify(error));
    } else if (data && data.length > 0) {
        fs.writeFileSync('schema_output.txt', 'Keys: ' + Object.keys(data[0]).join(', '));
    } else {
        fs.writeFileSync('schema_output.txt', 'No data found, trying to insert a dummy row and catch error to get schema...');
        // try to insert an invalid row to get a postgres schema error, or just query information_schema if we had postgres connection string.
        // wait, let's just query with options
        const { data: cols, error: colError } = await supabase.rpc('get_schema_columns', { table_name: 'membership_applications' });
        fs.writeFileSync('schema_output.txt', 'No data found. RPC error: ' + JSON.stringify(colError));
    }
  } catch(e) {
    fs.writeFileSync('schema_output.txt', 'Exception: ' + e.message);
  }
}
check();
