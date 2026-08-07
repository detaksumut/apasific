import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const targetEmail = 'ekocmayndarto@gmail.com';
    const newPassword = 'reviewer123';

    // Find user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) return NextResponse.json({ error: listError.message });

    const user = users?.users?.find((u: any) => u.email === targetEmail);
    if (!user) {
      return NextResponse.json({ error: `User ${targetEmail} tidak ditemukan di Supabase Auth.` });
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true
    });

    if (updateError) return NextResponse.json({ error: updateError.message });

    return NextResponse.json({
      success: true,
      message: `Password berhasil diset untuk ${targetEmail}`,
      credentials: {
        email: targetEmail,
        password: newPassword
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
