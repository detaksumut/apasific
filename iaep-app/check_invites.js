const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkInvites() {
  console.log("=== CHECKING RECENT INVITATIONS IN SUBMISSION_HISTORY ===");
  try {
    const resH = await fetch(`${url}/rest/v1/submission_history?action=ilike.%25invite%25&order=created_at.desc&limit=10`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const history = await resH.json();
    if (!Array.isArray(history)) {
        console.log("History API Response:", history);
    } else {
        history.forEach(h => {
            console.log(`[${new Date(h.created_at).toLocaleString()}] Submission ${h.submission_id.substring(0,8)}... : ${h.action}`);
        });
    }

    console.log("\n=== CHECKING RECENT ASSIGNMENTS IN REVIEWER_ASSIGNMENTS ===");
    const resA = await fetch(`${url}/rest/v1/reviewer_assignments?order=created_at.desc&limit=10`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const assignments = await resA.json();
    if (!Array.isArray(assignments)) {
        console.log("Assignments API Response:", assignments);
    } else {
        assignments.forEach(a => {
            console.log(`[${new Date(a.created_at).toLocaleString()}] Submission ${a.submission_id.substring(0,8)}... assigned to ${a.reviewer_id} - Status: ${a.status}`);
        });
    }
  } catch(e) { console.error("Error:", e.message); }
}

checkInvites();
