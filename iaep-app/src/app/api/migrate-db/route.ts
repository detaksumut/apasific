import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// Peta semua role ke nilai yang valid di database
function mapRole(role: string | undefined): string {
  if (!role) return 'author';
  const r = role.toLowerCase().trim();
  if (r.includes('admin')) return 'admin';
  if (r.includes('reviewer')) return 'reviewer';
  if (r.includes('editor')) return 'editor';
  if (r.includes('author')) return 'author';
  return 'author'; // default fallback
}

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 1. Baca semua user dari system_settings
    const { data: settingsData } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    if (!settingsData?.value) {
      return NextResponse.json({ success: false, error: 'No users in system_settings' });
    }

    const users: any[] = Array.isArray(settingsData.value)
      ? settingsData.value
      : JSON.parse(settingsData.value as string);

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const user of users) {
      try {
        if (!user.email) { skipped++; continue; }

        // Cek apakah user sudah ada di profiles (by email)
        const { data: existing } = await supabaseAdmin
          .from('profiles')
          .select('id, email')
          .eq('email', user.email)
          .maybeSingle();

        // Generate deterministic UUID dari user ID
        let profileId = user.id;
        if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
          const str = (user.id || user.email).toString();
          const hex = Buffer.from(str).toString('hex').padEnd(32, '0').slice(0, 32);
          profileId = `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
        }

        const profileData = {
          id: existing?.id || profileId,
          email: user.email,
          full_name: user.full_name || user.name || 'User',
          role: mapRole(user.role),
          phone: user.phone_number || user.phone || null,
          university: user.university || null,
          country: user.country || null,
          discipline: user.discipline || null,
          orcid_id: user.orcid_id || null,
          status: user.status || 'Active',
        };

        if (existing) {
          // Update existing profile dengan email
          await supabaseAdmin
            .from('profiles')
            .update({ email: user.email, phone: profileData.phone, university: profileData.university,
                      country: profileData.country, discipline: profileData.discipline,
                      orcid_id: profileData.orcid_id, status: profileData.status })
            .eq('id', existing.id);
          updated++;
        } else {
          // Insert baru
          const { error } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });
          if (error) {
            errors.push(`${user.email}: ${error.message}`);
          } else {
            inserted++;
          }
        }
      } catch (e: any) {
        errors.push(`${user.email}: ${e.message}`);
      }
    }

    // Fix 5: Backfill author_email di submissions dari profiles
    const { data: subs } = await supabaseAdmin
      .from('submissions')
      .select('id, author_id')
      .is('author_email', null)
      .not('author_id', 'is', null);

    let subUpdated = 0;
    if (subs) {
      for (const sub of subs) {
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('email, full_name')
          .eq('id', sub.author_id)
          .maybeSingle();
        
        if (prof?.email) {
          await supabaseAdmin
            .from('submissions')
            .update({ author_email: prof.email, author_name: prof.full_name })
            .eq('id', sub.id);
          subUpdated++;
        }
      }
    }

    // Backfill reviewer_email di submissions dari review_assignments
    const { data: assignments } = await supabaseAdmin
      .from('review_assignments')
      .select('submission_id, reviewer_email, reviewer_name')
      .not('reviewer_email', 'is', null);

    let reviewerUpdated = 0;
    if (assignments) {
      for (const assign of assignments) {
        await supabaseAdmin
          .from('submissions')
          .update({ reviewer_email: assign.reviewer_email, reviewer_name: assign.reviewer_name })
          .eq('id', assign.submission_id)
          .is('reviewer_email', null);
        reviewerUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      total_users_in_settings: users.length,
      profiles_inserted: inserted,
      profiles_updated: updated,
      profiles_skipped: skipped,
      submissions_author_backfilled: subUpdated,
      submissions_reviewer_backfilled: reviewerUpdated,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
