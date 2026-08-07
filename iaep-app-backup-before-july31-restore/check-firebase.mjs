import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    }

    const db = admin.firestore();
    const docRef = db.collection('submissions').doc('54fc4573-0a3f-4cac-b62f-d4ffdd90f86d');
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('FIRESTORE DATA:', doc.data());
    } else {
      console.log('Doc not found in Firestore.');
    }
  } catch (err) {
    console.error('ERROR:', err);
  }
}
run();
