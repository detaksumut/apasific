const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
global.WebSocket = require('ws');

async function sync() {
  try {
    console.log("=======================================");
    console.log("MEMULAI SINKRONISASI 53 REVIEWER KE RJRAKP...");
    console.log("=======================================");

    // 1. Read RJRAKP .env keys
    const envPath = 'd:/Users/RJRAKP/rjrakp/.env';
    if (!fs.existsSync(envPath)) {
      console.error('File .env RJRAKP tidak ditemukan di', envPath);
      return;
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    let supabaseUrl = '';
    let serviceRoleKey = '';
    
    envContent.split('\n').forEach(line => {
      const tLine = line.trim();
      if (tLine.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = tLine.split('=')[1].trim();
      if (tLine.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) serviceRoleKey = tLine.split('=')[1].trim();
    });

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Kunci VITE_SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env RJRAKP');
      return;
    }

    console.log("Kunci Service Role RJRAKP ditemukan. Menghubungkan ke Supabase...");
    // 2. Connect to RJRAKP Supabase
    const rjrakpAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 3. Read reviewers_data.json
    const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
    if (!fs.existsSync(reviewersFile)) {
      console.error('Data reviewers tidak ditemukan di', reviewersFile);
      return;
    }
    const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));

    let successCount = 0;
    
    // 4. Inject each reviewer
    for (let i = 0; i < reviewersData.length; i++) {
      const r = reviewersData[i];
      if (!r.email) continue;
      
      process.stdout.write(`[${i+1}/${reviewersData.length}] Memproses ${r.email}... `);
      
      try {
        // 4a. Create auth user
        const { data: authData, error: authError } = await rjrakpAdmin.auth.admin.createUser({
          email: r.email,
          password: 'ReviewerPassword123!',
          email_confirm: true,
          user_metadata: { full_name: r.full_name }
        });

        if (authError && !authError.message.includes('already')) {
           console.log(`GAGAL (Auth): ${authError.message}`);
           continue;
        }

        let userId = authData?.user?.id;
        if (!userId) {
           const { data: existingUser } = await rjrakpAdmin.auth.admin.listUsers();
           const match = existingUser?.users?.find(u => u.email === r.email);
           if (match) userId = match.id;
        }

        if (userId) {
          // 4b. Insert into users table
          const { error: userError } = await rjrakpAdmin.from('users').upsert({
            id: userId,
            full_name: r.full_name,
            email: r.email,
            phone: r.phone || '',
            role: 'reviewer',
            status: 'APPROVED',
            institution: r.university || '',
            faculty: '',
            degree_level: '',
            scopus_id: '',
            wos_id: '',
            sinta_id: ''
          });
          
          if (userError) {
             console.log(`GAGAL (Users Table): ${userError.message}`);
             continue;
          }

          // 4c. Insert into reviewer_profiles table
          const { error: profileError } = await rjrakpAdmin.from('reviewer_profiles').upsert({
            user_id: userId,
            affiliation: r.university || '',
            faculty: '',
            education_level: '',
            expertise_area: r.field || 'General Reviewer',
            orcid_id: '',
            google_scholar: '',
            scopus_id: '',
            sinta_id: '',
            wos_id: ''
          }, { onConflict: 'user_id' });

          if (profileError) {
             console.log(`GAGAL (Profiles Table): ${profileError.message}`);
             continue;
          }
          
          console.log("BERHASIL!");
          successCount++;
        }
      } catch (err) {
        console.log(`ERROR: ${err.message}`);
      }
    }

    console.log("=======================================");
    console.log(`SELESAI! ${successCount} dari ${reviewersData.length} Reviewer berhasil dimasukkan ke RJRAKP.`);
    console.log("=======================================");

  } catch (error) {
    console.error("Terjadi kesalahan:", error.message);
  }
}

sync();
