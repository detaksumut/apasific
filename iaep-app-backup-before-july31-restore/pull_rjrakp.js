import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://abmjieqcumlskannfkdl.supabase.co';
const supabaseKey = 'sb_publishable_Zvx-3Ezgb1jnAZsDGXyUOg_96PqXzRN';
const supabase = createClient(supabaseUrl, supabaseKey);

async function pullData() {
  console.log('Fetching publications from RJRAKP...');
  const { data, error } = await supabase
    .from('publications')
    .select(`
      id,
      publication_date,
      doi,
      pdf_url,
      volume_number,
      issue_number,
      view_count,
      download_count,
      articles!inner (
        id,
        title,
        abstract,
        authors:article_authors(
            profiles(full_name)
        ),
        journals(name, slug)
      )
    `);

  if (error) {
    console.error('Error fetching data:', error);
  } else {
    console.log(`Fetched ${data.length} articles.`);
    fs.writeFileSync('rjrakp_articles.json', JSON.stringify(data, null, 2));
    console.log('Saved to rjrakp_articles.json');
  }
}

pullData();
