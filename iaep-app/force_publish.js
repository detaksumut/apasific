const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function publishArticle() {
  const articleId = '7375625f-3137-3834-3535-333935303538';
  
  console.log(`Updating article ${articleId} to Published...`);
  
  const { data, error } = await supabase
    .from('submissions')
    .update({ 
      status: 'Published',
      stage: 'Published'
    })
    .eq('id', articleId);
    
  if (error) {
    console.error('Error updating:', error);
  } else {
    console.log('Successfully updated status to Published!');
  }
}

publishArticle();
