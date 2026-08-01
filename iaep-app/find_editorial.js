const fs = require('fs');
const path = require('path');

function findFiles(dir, matchStr, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, matchStr, fileList);
    } else if (file.toLowerCase().includes(matchStr)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const found = findFiles('d:/Users/apasific/iaep-app/src/app', 'editorial');
fs.writeFileSync('d:/Users/apasific/iaep-app/found_editorial.json', JSON.stringify(found, null, 2));
