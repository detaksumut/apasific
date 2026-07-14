import { getFirebaseAdmin } from './server';

export function getFirestore() {
  const admin = getFirebaseAdmin();
  return admin.firestore();
}
