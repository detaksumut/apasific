const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, 'apasific_registered_users.json');
const bulkFile = path.join(__dirname, 'add_bulk_reviewers.js');

try {
  let dbUsers = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  const bulkJs = fs.readFileSync(bulkFile, 'utf8');

  // Parse add_bulk_reviewers.js
  const matches = bulkJs.match(/\{[\s\S]*?\}/g);
  let bulkUsers = [];
  if (matches) {
    matches.forEach(m => {
      try {
        const obj = new Function("return " + m)();
        if (obj && obj.email) bulkUsers.push(obj);
      } catch(e) {}
    });
  }

  let fixedCount = 0;

  // Restore missing academic_field
  dbUsers = dbUsers.map(user => {
    if (user.role === 'reviewer' && !user.academic_field) {
      // Cari di data mentah bulk
      const backup = bulkUsers.find(b => b.email.toLowerCase() === user.email.toLowerCase());
      if (backup && backup.field) {
        user.academic_field = backup.field;
        fixedCount++;
      }
    }
    return user;
  });

  fs.writeFileSync(dbFile, JSON.stringify(dbUsers, null, 2), 'utf8');
  console.log(`Berhasil memulihkan ${fixedCount} Disiplin Keilmuan yang hilang dari data mentah!`);
} catch(e) {
  console.log("Error:", e);
}
