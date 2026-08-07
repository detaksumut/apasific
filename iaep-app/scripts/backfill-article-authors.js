// Polyfill WebSocket for Node.js < 22 to satisfy Supabase JS SDK
global.WebSocket = require('ws');

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid external 'dotenv' library dependency
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove surrounding quotes if present
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.warn("Failed to parse .env.local file:", e);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase environment variables missing in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log("Starting backfill for article authors...");

  // 1. Fetch all submissions
  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*');

  if (error) {
    console.error("Error fetching submissions:", error);
    process.exit(1);
  }

  console.log(`Analyzing ${submissions.length} submissions...`);

  let migratedCount = 0;

  for (const sub of submissions) {
    const rawAbstract = sub.abstract || '';
    if (typeof rawAbstract === 'string' && rawAbstract.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawAbstract);
        const authors = parsed.authors || [];
        const abstractEn = parsed.abstract_en || parsed.abstract || '';
        const keywords = parsed.keywords || '';

        console.log(`Migrating submission ${sub.id}: "${sub.title}"`);
        console.log(`Found ${authors.length} authors in JSON.`);

        if (authors.length > 0) {
          const authorsData = authors.map((author, idx) => ({
            article_id: sub.id,
            full_name: author.full_name || 'Author',
            email: author.email || null,
            affiliation: author.affiliation || null,
            orcid_id: author.orcid || null,
            is_corresponding: !!author.is_corresponding,
            author_order: idx + 1
          }));

          // Idempotent insert: only insert if no authors exist for this article
          const { data: existingAuthors } = await supabase
            .from('article_authors')
            .select('id')
            .eq('article_id', sub.id);

          if (!existingAuthors || existingAuthors.length === 0) {
            const { error: insertErr } = await supabase
              .from('article_authors')
              .insert(authorsData);

            if (insertErr) {
              console.error(`Failed to insert authors for submission ${sub.id}:`, insertErr.message);
              continue;
            }
            console.log(`Successfully migrated authors for submission ${sub.id}`);
          } else {
            console.log(`Authors already present in article_authors for submission ${sub.id}. Skipping author insert.`);
          }
        }

        // Clean abstract column to hold only plain text abstract, and populate keywords if empty
        const updateFields = { abstract: abstractEn };
        if (!sub.keywords && keywords) {
          updateFields.keywords = keywords;
        }

        const { error: updateErr } = await supabase
          .from('submissions')
          .update(updateFields)
          .eq('id', sub.id);

        if (updateErr) {
          console.error(`Failed to normalize abstract for submission ${sub.id}:`, updateErr.message);
        } else {
          console.log(`Abstract normalized to plain text for submission ${sub.id}`);
          migratedCount++;
        }
      } catch (parseErr) {
        console.error(`Failed to parse abstract JSON for submission ${sub.id}:`, parseErr);
      }
    }
  }

  console.log(`Backfill completed. Normalized ${migratedCount} legacy records.`);
}

backfill();
