const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

fs.readdir(publicDir, (err, files) => {
  if (err) {
    console.error('Error reading public dir:', err);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.html') {
      const filePath = path.join(publicDir, file);
      
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading ${file}:`, err);
          return;
        }

        // Replace all instances of href="index.html" or href='./index.html' or href="index.html#..."
        let updated = data.replace(/href=["']index\.html(["'])/g, 'href="/"');
        updated = updated.replace(/href=["']index\.html#(.*?)["']/g, 'href="/#$1"');

        if (data !== updated) {
          fs.writeFile(filePath, updated, 'utf8', err => {
            if (err) {
              console.error(`Error writing ${file}:`, err);
            } else {
              console.log(`Updated links in ${file}`);
            }
          });
        }
      });
    }
  });
});
