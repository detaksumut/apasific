const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('apasific_registered_users.json', 'utf8'));
  const authors = data.filter(u => u.role && u.role.toLowerCase() === 'author');
  
  let result = `Ditemukan ${authors.length} Author:\n\n`;
  authors.forEach((a, index) => {
    result += `${index + 1}. ${a.full_name || 'Tanpa Nama'} - ${a.email}\n`;
    if (a.university) result += `   Kampus: ${a.university}\n`;
  });
  
  fs.writeFileSync('authors_list.txt', result);
  console.log('Successfully wrote to authors_list.txt');
} catch (e) {
  fs.writeFileSync('authors_list.txt', 'Error: ' + e.message);
}
