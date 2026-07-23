export function getFirestore() {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  return admin.firestore();
}
