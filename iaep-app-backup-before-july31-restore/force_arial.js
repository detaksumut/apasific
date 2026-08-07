const fs = require('fs');
const path = require('path');

function forceArial(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace CSS syntax
  content = content.replace(/font-family:\s*[^;]+;/g, 'font-family: Arial, Helvetica, sans-serif !important;');
  
  // Replace JS inline style syntax (double quotes)
  content = content.replace(/fontFamily:\s*"[^"]+"/g, 'fontFamily: "Arial, Helvetica, sans-serif"');
  
  // Replace JS inline style syntax (single quotes)
  content = content.replace(/fontFamily:\s*'[^']+'/g, 'fontFamily: "Arial, Helvetica, sans-serif"');
  
  // Also strip Tailwind font utility classes from all tsx files
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    content = content.replace(/\bfont-serif\b/g, 'font-sans');
    content = content.replace(/\bfont-\['Cinzel'\]\b/g, '');
    content = content.replace(/\bfont-mono\b/g, 'font-sans');
  }
  
  fs.writeFileSync(fullPath, content);
  console.log(`Updated ${filePath}`);
}

const files = [
  'src/app/globals.css',
  'src/app/landing.css',
  'src/app/journals/page.tsx',
  'src/app/journal/page.tsx',
  'src/app/page.tsx',
  'src/components/dashboard/Sidebar.tsx',
  'src/components/dashboard/Topbar.tsx'
];

files.forEach(forceArial);

// Also recursively check pages to strip Tailwind font classes
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      forceArial(fullPath);
    }
  }
}

walkDir('src/app');
walkDir('src/components');
walkDir('src/pages');
