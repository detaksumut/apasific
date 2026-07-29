const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const tLine = line.trim();
    if (tLine.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = tLine.split('=')[1].trim();
    }
    if (tLine.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      serviceRoleKey = tLine.split('=')[1].trim();
    }
  });
}

const assignmentId = '769c61dc-d801-4251-8a9d-3f04fbace238';

async function testUpdate() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  
  // Fetch the assignment first
  const { data: assignment, error: fetchErr } = await supabaseAdmin
    .from('review_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();
    
  if (fetchErr) {
    console.error('Fetch Error:', fetchErr);
    return;
  }
  
  console.log('Current Assignment State:', assignment);
  
  // Try updating
  const payload = {
    status: 'completed',
    recommendation: 'accepted',
    comments_for_editor: 'Test comment editor',
    comments_for_author: 'Test comment author',
    correction_notes: 'Test correction notes',
    completed_at: new Date().toISOString(),
    updated_at: new Date() // Test with JS Date object like in the code
  };
  
  console.log('Attempting update with payload:', payload);
  const { data: updateData, error: updateErr } = await supabaseAdmin
    .from('review_assignments')
    .update(payload)
    .eq('id', assignmentId)
    .select();
    
  if (updateErr) {
    console.error('Update Error:', updateErr);
  } else {
    console.log('Update Success! Result:', updateData);
  }
}

testUpdate();
