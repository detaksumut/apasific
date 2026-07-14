import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      let serviceAccount;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } else {
        const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin initialization error', error);
      throw new Error(`Firebase Admin Init Error: ${error.message}`);
    }
  }
  return admin;
}
