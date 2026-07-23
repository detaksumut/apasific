const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-admin-key.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function main() {
    const snap = await db.collection('profiles').get();
    let found = [];
    snap.docs.forEach(doc => {
       const data = doc.data();
       if (data.email === 'kadsumut@gmail.com' || (data.full_name && data.full_name.includes('Marahaman'))) {
           found.push({id: doc.id, ...data});
       }
    });
    console.log("Found profiles:", JSON.stringify(found, null, 2));

    const u = await admin.auth().getUserByEmail('kadsumut@gmail.com');
    console.log("Auth user:", u.toJSON());
}
main().catch(console.error);
