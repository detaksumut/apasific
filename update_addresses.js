const fs = require('fs');
const path = require('path');

const dirs = [
  'd:\\Users\\apasific',
  'd:\\Users\\apasific\\iaep-app\\public'
];

const newFooterContact = `            <div class="footer-contact" style="margin-top: 24px;">
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><strong>Akta Pendirian ASIA Kemenkumham No. C-1615.Ht.03.01-Th.2022</strong></p>
              <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.6; max-height: 250px; overflow-y: auto; padding-right: 10px; scrollbar-width: thin;">
                <p style="color: var(--gold); font-weight: bold; margin-bottom: 4px;">Kantor Pusat & Perwakilan Dalam Negeri (Indonesia)</p>
                <ul style="padding-left: 0; list-style: none; margin-bottom: 12px;">
                  <li style="margin-bottom: 6px;"><strong>1. Medan (Pusat):</strong> TOWER ASIA, Jl. Perjuangan No. 80 B, Kel. Sei Kera Hilir, Kec. Medan Perjuangan, Medan – Sumatera Utara 20222</li>
                  <li style="margin-bottom: 6px;"><strong>2. Jakarta Raya:</strong><br/>- Jl. Raya Pondok Cabe Blok B.5 No. 6 KAV.77, Pondok Cabe Udik, Pamulang, Tangerang Selatan, Banten.<br/>- Jl. Duta Harapan VI, Blok AF 14 No. 2, RT 04/RW 10, Kel. Harapan Baru, Kec. Bekasi Utara, Kota Bekasi, Jawa Barat.</li>
                  <li style="margin-bottom: 6px;"><strong>3. Jawa Timur:</strong> Jl. Ranu Klakah No. 432, Klakah, Kab. Lumajang, Jatim.</li>
                  <li style="margin-bottom: 6px;"><strong>4. Papua:</strong> Jl. Dr. Sam Ratulangi No. 11. Trikora, Kec. Jayapura Utara, Kota Jayapura, Papua 9913.</li>
                </ul>
                
                <p style="color: var(--gold); font-weight: bold; margin-bottom: 4px;">Perwakilan Luar Negeri</p>
                <ul style="padding-left: 0; list-style: none; margin-bottom: 12px;">
                  <li style="margin-bottom: 6px;"><strong>New Zealand:</strong> 230 Lowes Road Rolleston 7614 Canterbury, New Zealand.</li>
                  <li style="margin-bottom: 6px;"><strong>Malaysia:</strong> Dt2972 Jalan Kenari Jaya Utama, Taman Kenari Jaya, 76100 Durian Tunggal, Melaka.</li>
                  <li style="margin-bottom: 6px;"><strong>Thailand:</strong> TGBC 99553 8 Srinagarindra Rd, Bang Muaeng Mai, Muaeng, Samut Prakan District, Samut Prakan 10270, Thailand.</li>
                  <li style="margin-bottom: 6px;"><strong>Pakistan:</strong> Directorate General Commerce Education and Management Sciences, Rano Ghari, Chamkani Mor, Peshawar, Pakistan.</li>
                  <li style="margin-bottom: 6px;"><strong>Sri Lanka:</strong> Kirankulam- Centre, Kirankulam, Batticaloa, Sri Lanka.</li>
                </ul>
                <p style="margin-bottom: 8px; font-style: italic; color: #a1a1aa;">Standar Publikasi Internasional: Elsevier & Thomson Reuters</p>
              </div>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:admin@apasific.org" style="color: var(--gold); transition: color var(--transition);">admin@apasific.org</a></p>
              <p style="font-size: 12px; color: var(--text-muted);"><strong>Phone / WA:</strong> <a href="https://wa.me/6281370062009" target="_blank" style="color: var(--gold); transition: color var(--transition);">+62 813-7006-2009</a></p>
            </div>`;

// Regex to find the <div class="footer-contact"> ... </div> block
// We'll use a relatively generic regex that captures the div and its content up to the first div closing that isn't nested (but here it doesn't have nested divs, so we can just match till </div>)
// Let's actually use a function to replace it robustly or a more targeted regex.
const regex = /<div class="footer-contact".*?>[\s\S]*?<\/div>/;

let updatedFiles = 0;

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find if it has a footer-contact
        if (content.includes('footer-contact')) {
          // Replace it
          // Because there's a div inside footer-contact now in our new template, the naive regex might fail next time if it matches the first </div>.
          // But for the FIRST pass, the existing footer-contact only has <p> tags, so `[\s\S]*?<\/div>` will match correctly.
          const oldContent = content;
          content = content.replace(/<div class="footer-contact"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-links-col">/g, newFooterContact + '\n          </div>\n\n          <div class="footer-links-col">');
          
          if (content === oldContent) {
            // fallback if the regex above was too strict
            content = content.replace(/<div class="footer-contact" style="margin-top: 24px;">\s*<p.*?<\/p>\s*<p.*?<\/p>\s*<p.*?<\/p>\s*<\/div>/g, newFooterContact);
          }
          
          if (content !== oldContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedFiles++;
            console.log(`Updated ${filePath}`);
          } else {
             console.log(`Could not match regex in ${filePath}`);
          }
        }
      }
    }
  }
}

console.log(`Finished updating ${updatedFiles} files.`);
