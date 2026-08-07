export function getFirestore(): any {
  const { getFirebaseAdmin } = require('./server');
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  return admin.firestore();
}


