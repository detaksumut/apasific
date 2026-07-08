const fs = require('fs');
const filePath = 'd:\\Users\\apasific\\iaep-app\\public\\main.js';
let content = fs.readFileSync(filePath, 'utf8');

const target1 = `    const submitBtn = container.querySelector('#certSubmitBtn');

    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    try {`;

const replacement1 = `    const submitBtn = container.querySelector('#certSubmitBtn');
    const fileInput = container.querySelector('#certPaymentReceipt');

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      alert('Harap upload bukti transfer pembayaran!');
      return;
    }

    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    try {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      const base64String = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });`;

const target2 = `        body: JSON.stringify({
          name,
          email,
          phone,
          cert: \`\${cert} — \${certSchemeMap[fieldKey]?.name || fieldKey}\`,
          method: "Central Registration",
          schedule: scheduleRaw,
          status: "Awaiting Verification"
        })
      });`;

const replacement2 = `        body: JSON.stringify({
          name,
          email,
          phone,
          cert: \`\${cert} — \${certSchemeMap[fieldKey]?.name || fieldKey}\`,
          method: "Central Registration",
          schedule: scheduleRaw,
          status: "Awaiting Verification",
          buktiTransfer: base64String
        })
      });`;

// Normalize line endings to avoid matching issues
content = content.replace(/\r\n/g, '\n');

if (content.includes(target1) && content.includes(target2)) {
  let newContent = content.replace(target1, replacement1);
  newContent = newContent.replace(target2, replacement2);
  fs.writeFileSync(filePath, newContent);
  console.log("SUCCESS: Patched main.js");
} else {
  console.log("ERROR: Could not find target strings to patch.");
}
