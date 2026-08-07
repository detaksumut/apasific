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
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        }
      }
      
      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin initialized successfully.');
      } else {
        console.warn('Firebase Admin key not found, skipping Firestore admin init.');
        return null;
      }
    } catch (error: any) {
      console.warn('Firebase Admin initialization skipped:', error.message);
      return null;
    }
  }
  return admin.apps.length ? admin : null;
}
