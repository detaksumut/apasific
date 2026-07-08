const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, 'public', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf-8');

// Remove data-aos="fade-right" and data-aos="fade-left"
mainJs = mainJs.replace(/ketuaCard\.setAttribute\('data-aos',\s*'fade-right'\);/, '');
mainJs = mainJs.replace(/sekCard\.setAttribute\('data-aos',\s*'fade-left'\);/, '');

// Inject custom CSS animation instead
mainJs = mainJs.replace(
  /ketuaCard\.style\.cssText = '(.*?)';/, 
  "ketuaCard.style.cssText = '$1 animation: card-fade-in-up 1s ease-out forwards;';"
);
mainJs = mainJs.replace(
  /sekCard\.style\.cssText = '(.*?)';/, 
  "sekCard.style.cssText = '$1 animation: card-fade-in-up 1.2s ease-out forwards;';"
);

// Add the keyframes at the top of the function
mainJs = mainJs.replace(
  'function initDynamicLeadership() {',
  `function initDynamicLeadership() {
  if (!document.getElementById('dynamic-card-styles')) {
    const style = document.createElement('style');
    style.id = 'dynamic-card-styles';
    style.innerHTML = \`
      @keyframes card-fade-in-up {
        0% { opacity: 0; transform: translateY(30px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    \`;
    document.head.appendChild(style);
  }`
);

fs.writeFileSync(mainJsPath, mainJs, 'utf-8');
console.log('Successfully patched main.js without using AOS!');
