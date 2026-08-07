require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

async function addReviewers() {
  try {
    // Attempt to register them to Supabase Auth so they have real accounts
    for (let r of newReviewers) {
      const password = "ReviewerPassword123!";
      const { data, error } = await supabase.auth.signUp({
        email: r.email,
        password: password,
        options: {
          data: { full_name: r.full_name }
        }
      });
      r.id = data?.user?.id || `demo-user-${Date.now()}`;
      r.password = password; // store mock password for demo fallback
      
      // Also try to insert into profiles
      if (data?.user?.id) {
         await supabase.from('profiles').upsert({
           id: data.user.id,
           full_name: r.full_name,
           university: r.university,
           role: 'reviewer'
         });
      }
    }

    // Now update the system_settings for the mock fallback login
    const { data: settingsData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'registered_users')
      .single();

    let existingUsers = [];
    if (settingsData && settingsData.value) {
      existingUsers = typeof settingsData.value === 'string' ? JSON.parse(settingsData.value) : settingsData.value;
    }

    // Filter out if they already exist
    for (let newR of newReviewers) {
      const exists = existingUsers.find(u => u.email.toLowerCase() === newR.email.toLowerCase());
      if (!exists) {
        existingUsers.push(newR);
      }
    }

    const { error: updateError } = await supabase
      .from('system_settings')
      .upsert({ key: 'registered_users', value: JSON.stringify(existingUsers) });

    if (updateError) {
      console.error("Error updating system settings:", updateError);
    } else {
      console.log("Successfully added reviewers!");
    }
  } catch (e) {
    console.error("Script error:", e);
  }
}

addReviewers();
