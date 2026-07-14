import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const usersToMigrate: any[] = [];
    let migratedCount = 0;
    let failedCount = 0;

    // 1. Read Authors JSON
    const dataFile = path.join(process.cwd(), 'apasific_registered_users.json');
    if (fs.existsSync(dataFile)) {
      const localUsers = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      usersToMigrate.push(...localUsers);
    }

    // 2. Read Reviewers JSON
    const reviewersFile = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
    if (fs.existsSync(reviewersFile)) {
      const reviewersData = JSON.parse(fs.readFileSync(reviewersFile, 'utf8'));
      for (let newR of reviewersData) {
        if (!usersToMigrate.find(u => u.email.toLowerCase() === newR.email.toLowerCase())) {
          usersToMigrate.push({
            id: `reviewer-${newR.email}`,
            full_name: newR.full_name,
            email: newR.email,
            role: newR.role || 'reviewer',
            status: newR.status || 'Active',
            password: 'ReviewerPassword123!',
            university: newR.university || '',
            phone_number: newR.phone_number || ''
          });
        }
      }
    }

    // Add super admin just in case
    usersToMigrate.push({
      email: "detaksumut@gmail.com",
      full_name: "Super Admin",
      role: "admin",
      password: "Mikr@210669Mpi"
    });

    const results = [];

    // 3. Migrate Users
    for (const user of usersToMigrate) {
      if (!user.email) continue;
      const emailLower = user.email.toLowerCase().trim();
      const password = user.password || 'Apasific2026!'; // Default fallback password if none exists

      // Create in Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailLower,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: user.full_name || 'User' }
      });

      let userId;
      if (authError) {
        if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
          // If already exists, fetch their ID
          const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
          const existing = existingUsers.users.find(u => u.email === emailLower);
          if (existing) {
             userId = existing.id;
          }
        } else {
          results.push({ email: emailLower, success: false, error: authError.message });
          failedCount++;
          continue;
        }
      } else if (authUser?.user) {
        userId = authUser.user.id;
      }

      // Upsert into public.profiles
      if (userId) {
        const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
          id: userId,
          full_name: user.full_name || 'User',
          role: user.role === 'admin' ? 'admin' : (user.role || 'author'),
          phone: user.phone_number || null,
          academic_field: user.university || null
        }, { onConflict: 'id' });

        if (profileError) {
          results.push({ email: emailLower, success: false, error: 'Profile: ' + profileError.message });
          failedCount++;
        } else {
          results.push({ email: emailLower, success: true });
          migratedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migrated ${migratedCount} users. Failed ${failedCount} users.`,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
