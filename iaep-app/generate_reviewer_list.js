const fs = require('fs');

let reviewers = [];

// Check apasific_registered_users.json
try {
    const data = JSON.parse(fs.readFileSync('./apasific_registered_users.json', 'utf8'));
    const revs = data.filter(u => u.role === 'reviewer');
    reviewers = reviewers.concat(revs);
} catch(e) {
    console.log("Error reading apasific_registered_users.json");
}

// Check add_bulk_reviewers.js
try {
    const jsContent = fs.readFileSync('./add_bulk_reviewers.js', 'utf8');
    const matches = jsContent.match(/\{[\s\S]*?\}/g);
    if(matches) {
        matches.forEach(m => {
            try {
                // Use a safe eval-like approach or strict JSON parse if it's already strict
                const obj = new Function("return " + m)();
                if (obj.role === 'reviewer') {
                    // avoid duplicates by email
                    if (!reviewers.find(x => x.email === obj.email)) {
                        reviewers.push(obj);
                    }
                }
            } catch(err) {}
        });
    }
} catch (e) {
    console.log("Error reading add_bulk_reviewers.js");
}

let md = "# Daftar Reviewer\n\n";
md += "| Nama | Disiplin Keilmuan (Field) | No HP |\n";
md += "|---|---|---|\n";

reviewers.forEach(r => {
    const name = r.full_name || r.name || "-";
    const field = r.academic_field || r.field || r.discipline || "-";
    const phone = r.phone_number || r.phone || "-";
    md += `| ${name} | ${field} | ${phone} |\n`;
});

// Create artifact
const artifactDir = "C:\\Users\\BI News\\.gemini\\antigravity-ide\\brain\\744031f1-2716-462f-b082-5a385f4e6387";
if (!fs.existsSync(artifactDir)){
    fs.mkdirSync(artifactDir, { recursive: true });
}
fs.writeFileSync(`${artifactDir}\\reviewers_list.md`, md);
console.log(`Successfully generated reviewers_list.md with ${reviewers.length} reviewers.`);
