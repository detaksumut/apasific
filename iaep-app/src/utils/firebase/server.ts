import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      // Load credential directly from file using fs to avoid Next.js Webpack require errors
      const serviceAccountPath = path.join(process.cwd(), 'firebase-admin-key.json');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin initialization error', error);
    }
  }
  return admin;
}
