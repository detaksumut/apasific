const { getFirestore } = require('./src/utils/firebase/db');
async function testFirestore() {
  const db = getFirestore();
  try {
    const fbSnap = await db.collection('submissions').where('status', 'in', ['Accepted', 'Published']).get();
    console.log("Firestore docs found:", fbSnap.size);
    fbSnap.forEach(doc => console.log(doc.id, doc.data().status));
  } catch(e) {
    console.error("Firestore error:", e);
  }
}
testFirestore();
