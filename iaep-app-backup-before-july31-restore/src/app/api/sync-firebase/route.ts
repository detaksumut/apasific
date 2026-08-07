import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebase/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const admin = getFirebaseAdmin();
    if (!admin) return NextResponse.json({ success: false, message: 'Firebase admin not available' });
    const usersPath = path.join(process.cwd(), 'apasific_registered_users.json');
    
    if (!fs.existsSync(usersPath)) {
        return NextResponse.json({ success: false, message: 'File JSON tidak ditemukan' });
    }

    const fileContent = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(fileContent);
    
    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    const { getFirestore } = require('@/utils/firebase/db');
    const db = getFirestore();

    for (const user of users) {
      if (!user.email || !user.password) continue;
      
      try {
        let firebaseUser;
        // Cek apakah user sudah ada
        try {
            firebaseUser = await admin.auth().getUserByEmail(user.email.toLowerCase().trim());
        } catch (e: any) {
            // Jika error auth/user-not-found, berarti belum ada, kita buat baru
            if (e.code === 'auth/user-not-found') {
                firebaseUser = await admin.auth().createUser({
                    email: user.email.toLowerCase().trim(),
                    password: user.password.trim(),
                    displayName: user.nama || user.name || user.full_name || 'User',
                });
                successCount++;
            } else {
                throw e; // Error lain
            }
        }

        // SEKARANG: Masukkan juga ke Firebase Database (Firestore) tabel profiles!
        if (firebaseUser) {
            await db.collection('profiles').doc(firebaseUser.uid).set({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                full_name: user.nama || user.name || user.full_name || 'User',
                role: user.role || 'author',
                phone: user.phone || user.phone_number || '',
                university: user.university || user.institution || '',
                country: user.country || '',
                orcid_id: user.orcid_id || user.orcid || '',
                scopus_id: user.scopus_id || user.scopus || '',
                sinta_id: user.sinta_id || user.sinta || '',
                created_at: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true }); // Pakai merge agar jika data sudah ada tidak tertimpa semua
        }
        
      } catch (err: any) {
        failCount++;
        errors.push({ email: user.email, error: err.message });
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Sync selesai',
        total_diimport: successCount,
        gagal: failCount,
        errors
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
