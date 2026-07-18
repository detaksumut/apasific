const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aroasmlrlpjbjokvxlgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findEko() {
  // Check users table in public schema
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .ilike('full_name', '%Eko%');
    
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Public Users found:', users);
  }
}

findEko();
