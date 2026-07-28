const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkArticle() {
  const articleId = '7375625f-3137-3834-3535-333935303538';
  
  const { data, error } = await supabase
    .from('submissions')
    .select('id, title, status, stage, volume, issue, author, updated_at')
    .eq('id', articleId)
    .single();
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('=== DATA DI DATABASE ===');
    console.log('Status:', data.status);
    console.log('Stage:', data.stage);
    console.log('Volume:', data.volume);
    console.log('Issue:', data.issue);
    console.log('Author:', data.author);
    console.log('Updated_at:', data.updated_at);
  }
}

checkArticle();
