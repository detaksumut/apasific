import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');
let users = [];
if (fs.existsSync(DATA_FILE)) {
  users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

const newReviewers = [
  { name: "Dr. Sazali Zainal Abidin", country: "Malaysia" },
  { name: "Dr. Amni Suhailah", country: "Malaysia" },
  { name: "Dr. Prattana Arisuk", country: "Thailand" },
  { name: "Dr. Prattana Srisuk", country: "Thailand" },
  { name: "Dr. Cliff Cheng", country: "Taiwan" },
  { name: "Dr. Ha Thuy", country: "Vietnam" },
  { name: "Dr. Hakan Aslan", country: "Turkey" },
  { name: "Dr. Wahida", country: "Malaysia" },
  { name: "Dr. Muhammad Hashim", country: "Pakistan" },
  { name: "Dr. Raja Haslinda", country: "Malaysia" },
  { name: "Dr. Nifaosan", country: "Thailand" },
  { name: "Dr. Ryan", country: "International" },
  { name: "Prof. Dr. Indra Devi", country: "Malaysia" },
  { name: "Dr. Intan Fatimah Anwar", country: "Malaysia" },
  { name: "Dr. Majo George", country: "India" },
  { name: "DR. Mohammad Sahabuddin", country: "Bangladesh" },
  { name: "Prof. Dr. Ram Al Jafri bin Saad", country: "Malaysia" }
];

let added = 0;
for (const r of newReviewers) {
  // Generate a dummy email from their name (e.g., Dr. Wahida -> wahida@apasific.org)
  const safeName = r.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dummyEmail = `${safeName}@apasific.org`;
  
  // Check if they already exist
  const exists = users.find(u => u.email === dummyEmail || u.full_name === r.name);
  if (!exists) {
    users.push({
      id: `asiacert-${Date.now()}-${Math.random()}`,
      full_name: r.name,
      email: dummyEmail,
      role: "reviewer",
      journal: "APASIFIC IAEP",
      university: "ASIACERT Board",
      country: r.country,
      status: "Active",
      joined: new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }),
      password: "ReviewerPassword123!",
      phone_number: ""
    });
    added++;
  }
}

fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
console.log(`Berhasil menambahkan ${added} reviewer dummy ke file JSON.`);
