const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'apasific_registered_users.json');

try {
  // 1. Baca isi file database JSON
  const rawData = fs.readFileSync(dataFile, 'utf8');
  let users = JSON.parse(rawData);
  
  let updatedCount = 0;

  // 2. Lakukan standarisasi kolom
  users = users.map(user => {
    let updated = false;

    // STANDARISASI: field / discipline -> academic_field
    if (user.field && !user.academic_field) {
      user.academic_field = user.field;
      delete user.field;
      updated = true;
    }
    if (user.discipline && !user.academic_field) {
      user.academic_field = user.discipline;
      delete user.discipline;
      updated = true;
    }

    // Hapus sisa-sisa key lama jika academic_field sudah ada
    if (user.academic_field) {
      if (user.field) delete user.field;
      if (user.discipline) delete user.discipline;
    }

    // STANDARISASI: phone -> phone_number
    if (user.phone && !user.phone_number) {
      user.phone_number = user.phone;
      delete user.phone;
      updated = true;
    }
    if (user.phone_number && user.phone) {
       delete user.phone; // Bersihkan duplikasi
    }

    if (updated) {
      updatedCount++;
    }

    return user;
  });

  // 3. Simpan kembali ke file
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2), 'utf8');
  
  console.log(`Berhasil menstandarkan data! Sebanyak ${updatedCount} akun telah diperbaiki skemanya.`);
  console.log(`Semua kolom field/discipline kini menjadi 'academic_field', dan phone menjadi 'phone_number'.`);

} catch (error) {
  console.error("Terjadi kesalahan saat memproses data:", error);
}
