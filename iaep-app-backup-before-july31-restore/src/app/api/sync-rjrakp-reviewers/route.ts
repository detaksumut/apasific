import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Read RJRAKP .env keys
    const envPath = 'd:/Users/RJRAKP/rjrakp/.env';
    if (!fs.existsSync(envPath)) {
      return NextResponse.json({ success: false, error: 'File .env RJRAKP tidak ditemukan' });
    }
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    let supabaseUrl = '';
    let serviceRoleKey = '';
    
    envContent.split('\n').forEach(line => {
      if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
      if (line.startsWith('VITE_SUPABASE_SERVICE_ROLE_KEY=')) serviceRoleKey = line.split('=')[1].trim();
    });

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, error: 'Kunci VITE_SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env RJRAKP' });
    }

    // 2. Connect to RJRAKP Supabase
    const rjrakpAdmin = createClient(supabaseUrl, serviceRoleKey);

    // 3. Read reviewers_data.json
    const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
    if (!fs.existsSync(reviewersFile)) {
      return NextResponse.json({ success: false, error: 'Data reviewers tidak ditemukan' });
    }
    const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));

    let successCount = 0;
    let errors: any[] = [];

    // 4. Inject each reviewer
    for (const r of reviewersData) {
      try {
        // Skip if email is missing
        if (!r.email) continue;
        
        // 4a. Create auth user
        const { data: authData, error: authError } = await rjrakpAdmin.auth.admin.createUser({
          email: r.email,
          password: 'ReviewerPassword123!',
          email_confirm: true,
          user_metadata: { full_name: r.full_name }
        });

        // Ignore user_already_exists error and proceed, or catch other errors
        if (authError && authError.message !== 'User already registered') {
           console.error('Auth error for', r.email, authError);
           errors.push({ email: r.email, error: authError.message });
           continue;
        }

        // If user already exists, we must get their ID
        let userId = authData?.user?.id;
        if (!userId) {
           const { data: existingUser } = await rjrakpAdmin.auth.admin.listUsers();
           const match = existingUser?.users?.find((u: any) => u.email === r.email);
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
            status: 'ACTIVE',
            institution: r.university || '',
            faculty: '',
            degree_level: '',
            scopus_id: '',
            wos_id: '',
            sinta_id: ''
          });
          
          if (userError) {
             console.error('Users table error for', r.email, userError);
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
          }, { onConflict: 'user_id' }); // Assuming user_id is unique/PK

          if (profileError) {
             console.error('Reviewer profiles table error for', r.email, profileError);
          }
          
          successCount++;
        }
      } catch (err: any) {
        errors.push({ email: r.email, error: err.message });
      }
    }

    return NextResponse.json({ success: true, injectedCount: successCount, total: reviewersData.length, errors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
