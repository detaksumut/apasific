// Cek apakah ezah ada di Firebase menggunakan firebase-admin
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const keyPath = path.join(__dirname, '..', 'firebase-admin-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const TARGETS = ['ezah@uum.edu.my', 'arifatul@uum.edu.my', 'aidi@uum.edu.my', 'parida@apasific.org', 'danil@apasific.org'];

async function check() {
  console.log('=== FIREBASE AUTH CHECK ===\n');
  for (const email of TARGETS) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      console.log(`✅ IN FIREBASE: ${email}`);
      console.log(`   uid: ${user.uid}`);
      console.log(`   disabled: ${user.disabled}`);
      console.log(`   emailVerified: ${user.emailVerified}`);
    } catch (e) {
      if (e.code === 'auth/user-not-found') {
        console.log(`❌ NOT in Firebase: ${email}`);
      } else {
        console.log(`⚠️  Error for ${email}: ${e.code} — ${e.message}`);
      }
    }
    console.log('');
  }
}

check().catch(console.error);
