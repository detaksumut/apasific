const { getFirestore } = require('./src/utils/firebase/db');
async function run() {
  const db = getFirestore();
  const snap = await db.collection('submissions').get();
  console.log("Total docs:", snap.size);
  snap.forEach(doc => {
    const d = doc.data();
    console.log(`- ${doc.id} | status: ${d.status} | jID: ${d.journal_id} | title: ${d.title?.substring(0,20)}`);
  });
}
run();
