import { getFirebaseAdmin } from './server';

export function getFirestore(): any {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  return admin.firestore();
}


