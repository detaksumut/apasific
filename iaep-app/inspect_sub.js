const fs = require('fs');
const { getFirestore } = require('./src/utils/firebase/db');
const db = getFirestore();

async function run() {
  let log = "";
  const doc = await db.collection('submissions').doc('sub_1784062294881_r2jx1m4').get();
  log += "SUBMISSION DATA: " + JSON.stringify(doc.exists ? doc.data() : "NOT FOUND", null, 2) + "\n\n";
  
  const certSnapshot = await db.collection('certificates').where('reference_id', '==', 'sub_1784062294881_r2jx1m4').get();
  log += "CERTIFICATES FOUND: " + certSnapshot.size + "\n";
  certSnapshot.forEach(d => {
    log += `CERT ${d.id}: ${JSON.stringify(d.data(), null, 2)}\n`;
  });
  
  fs.writeFileSync('inspect_out.txt', log);
  console.log("LOG WRITTEN");
}

run().catch(err => {
  fs.writeFileSync('inspect_out.txt', err.stack);
});
