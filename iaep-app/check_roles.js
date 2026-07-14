const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('apasific_registered_users.json', 'utf8'));
  
  // Find users that have both reviewer and author roles (either in a role array, or string, or duplicated emails)
  let duplicatedEmails = {};
  data.forEach(user => {
    const email = (user.email || '').toLowerCase();
    const role = (user.role || '').toLowerCase();
    
    if (!duplicatedEmails[email]) {
      duplicatedEmails[email] = new Set();
    }
    // If role is a string with multiple roles (e.g. "reviewer, author")
    role.split(',').forEach(r => duplicatedEmails[email].add(r.trim()));
  });

  let reviewersWhoAreAuthors = 0;
  let overlappingEmails = [];

  for (const [email, roles] of Object.entries(duplicatedEmails)) {
    if (roles.has('reviewer') && roles.has('author')) {
      reviewersWhoAreAuthors++;
      overlappingEmails.push(email);
    }
  }

  const result = `Total users: ${data.length}\nReviewers who are also authors: ${reviewersWhoAreAuthors}\nEmails: ${overlappingEmails.join(', ')}`;
  fs.writeFileSync('check_roles_result.txt', result);
  console.log("Check complete, results written to check_roles_result.txt");
} catch(err) {
  fs.writeFileSync('check_roles_result.txt', `Error: ${err.message}`);
}
