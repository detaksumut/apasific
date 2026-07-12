import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const newReviewers = [
    {
      email: "kiljamilawati.akbar@uin-alauddin.ac.id",
      full_name: "Dr. Kiljamilawati, MH",
      university: "Universitas Islam Negeri Alauddin Makassar",
      country: "Indonesia",
      role: "reviewer",
      status: "Active",
      joined: new Date().toISOString()
    },
    {
      email: "ikbar.p@gmail.com",
      full_name: "Ikbar Pratama",
      university: "Universitas Medan Area",
      country: "Indonesia",
      role: "reviewer",
      status: "Active",
      joined: new Date().toISOString()
    },
    {
      email: "T.dessy91@gmail.com",
      full_name: "tri dessy fadillah",
      university: "Institut Syekh Abdul Halim Hasan (IAHN) Binjai",
      country: "Indonesia",
      role: "reviewer",
      status: "Active",
      joined: new Date().toISOString()
    },
    {
      email: "adrianusnggoro567@gmail.com",
      full_name: "Adrianus Marselus Nggoro",
      university: "Universitas Katolik Indonesia Santu Paulus Ruteng",
      country: "Indonesia",
      role: "reviewer",
      status: "Active",
      joined: new Date().toISOString()
    },
    {
      email: "binaricandra@gmail.com",
      full_name: "Dr.Wisanf Candra Bintari.S.E.,M.M",
      university: "Universitas Muhammadiyah Sorong",
      country: "Indonesia",
      role: "reviewer",
      status: "Active",
      joined: new Date().toISOString()
    }
  ];

  try {
    for (let r of newReviewers) {
      const password = "ReviewerPassword123!";
      // 1. Create User in Supabase Auth (Using Admin API if available, else standard signup)
      const { data: authData } = await supabaseAdmin.auth.admin.createUser({
        email: r.email,
        password: password,
        email_confirm: true,
        user_metadata: { full_name: r.full_name }
      }).catch(async (e) => {
         // Fallback to regular signup if no service_role key
         return await supabaseAdmin.auth.signUp({
           email: r.email,
           password: password,
           options: { data: { full_name: r.full_name } }
         });
      });

      (r as any).id = authData?.user?.id || `demo-user-${Date.now()}-${Math.random()}`;
      (r as any).password = password;
      
      // 2. Insert into profiles
      if (authData?.user?.id) {
         await supabaseAdmin.from('profiles').upsert({
           id: authData.user.id,
           full_name: r.full_name,
           university: r.university,
           role: 'reviewer'
         });
      }
    }

    // 3. Update system_settings for mock login
    const { data: settingsData } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'apasific_registered_users')
      .single();

    let existingUsers = [];
    if (settingsData && settingsData.value) {
      existingUsers = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : settingsData.value;
    }

    for (let newR of newReviewers) {
      const exists = existingUsers.find((u: any) => u.email.toLowerCase() === newR.email.toLowerCase());
      if (!exists) {
        existingUsers.push(newR);
      }
    }

    await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(existingUsers) });

    return NextResponse.json({ success: true, message: "Reviewers successfully added!", data: newReviewers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
