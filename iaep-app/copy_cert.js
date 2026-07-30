const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'src/app/dashboard/admin/certifications/page.tsx');
const destDir = path.join(__dirname, 'src/app/dashboard/co-admin/sertifikasi');
const dest = path.join(destDir, 'page.tsx');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}
fs.copyFileSync(src, dest);
console.log("Copied successfully");
