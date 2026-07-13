import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

// 11 Authors
const rawAuthors = `7/11/2026 7:34:57	Prof. Dr. Rika Dwi Ayu Parmitasari, SE, M.Com	Female	Universitas Islam Negeri Alauddin Makassar Indonesia	DR	rparmitasari@uin-alauddin.ac.id	081343814626	57192940248	4o61ZVMAAAAJ	0000-0003-2714-9123
7/11/2026 10:39:22	Aryo Prakoso	Male	University of Jember	DR	aryo.fisip@unej.ac.id	+6285731499131	5931322210	https://scholar.google.com/citations?user=hT_VIgYAAAAJ&hl=id	https://orcid.org/0000-0002-4683-8218
7/11/2026 11:49:54	Dr. HJ. SUBADRIYAH, S.E., M.Si.	Female	UNIVERSITAS ISLAM NAHDLATUL ULAMA JEPARA	DR	subadriyah@unisnu.ac.id	08112742922	57207845594	KaRTCcsAAAAJ	https://orcid.org/0000-0001-6994-6644
7/11/2026 11:58:15	Imam Gunanjar, S.E., M.M.	Male	Universitas Samudra	Master	imamgunanjar@unsam.ac.id	085277719602	60142907700	owKlW6wAAAAJ	0009-0004-6714-4452
7/11/2026 12:27:44	Hadi Jauhari	Male	Politeknik Negeri Sriwijaya	DR	ha.di@polsri.ac.id	081367163993	57194244234	WkNvivgAAAAJ	0000-0002-4059-4371
7/11/2026 14:34:45	Ikbar Pratama	Male	Universitas Medan Area	DR	ikbar.p@gmail.com	081376666352	57220929541	Y_NdcAoAAAAJ	https://orcid.org/0000-0002-7897-2737
7/11/2026 14:44:54	TRI DESSY FADILLAH	Female	Institut Syekh Abdul Halim. 	Master	T.dessy91@gmail.com.	+62 852-6257-1664	Scopus Link	https://scholar.google.com/citations?user=91y1puwAAAAJ&hl=id&oi=ao	https://orcid.org/0009-0002-3319-086X
7/11/2026 15:05:47	Dr. Surna Lastri, SE, M.Si, CTT, CSBA	Female	Universitas Muhammadiyah Aceh	DR	surna.lastri@unmuha.ac.id	0811689748	57669510400	Google Scholar Link	https://orcid.org/0000-0001-9602-9446
7/11/2026 18:07:18	Dr.Wisang Candra Bintari,SE.,MM	Female	Universitas Muhammadiyah Sorong	DR	binaricandra@gmail.com	082399711010	57188496923	6147164	0009-0009-1488-4963
7/12/2026 8:57:20	Dr. Ni Nyoman Ayu Suryandari, SE., M.Si., Ak., CA	Female	Universitas Mahasaraswati Denpasar	DR	ayusuryandari@unmas.ac.id	081337154769	57218585288	zviYldQAAAAJ	0000-0001-7103-779X
7/13/2026 9:56:32	Assoc.Prof.Petty Aprilia Sari,S.E.,M.Ak.	Female	Institut Putra Perdana Indonesia	Master	pettyapriliasari@gmail.com	085326289990	59136382000	8AFgrTYAAAAJ	0009-0006-1797-8568`;

// Extract ID from URL if necessary
function cleanId(str: string) {
  if (!str) return "";
  const match = str.match(/user=([^&]+)/);
  if (match) return match[1];
  const orcidMatch = str.match(/orcid\.org\/(.*)/);
  if (orcidMatch) return orcidMatch[1];
  const scopusMatch = str.match(/authorId=([0-9]+)/);
  if (scopusMatch) return scopusMatch[1];
  if (str.length > 50) return ""; // Ignore huge links
  return str.trim();
}

function formatPhone(phone: string) {
  if (!phone) return phone;
  let p = phone.replace(/[^0-9+]/g, '');
  if (p.startsWith('08')) {
    p = '+62' + p.substring(1);
  } else if (p.startsWith('62')) {
    p = '+' + p;
  } else if (p.startsWith('8')) {
    p = '+62' + p;
  }
  return p;
}

export async function GET() {
  try {
    const DATA_FILE = path.join(process.cwd(), 'apasific_registered_users.json');
    let users: any[] = [];
    if (fs.existsSync(DATA_FILE)) {
      users = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }

    const { data } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
    let supabaseUsers: any[] = [];
    if (data && data.value) {
      supabaseUsers = Array.isArray(data.value) ? data.value : JSON.parse(data.value as string);
    } else {
      supabaseUsers = [...users];
    }

    const authorsLines = rawAuthors.split('\n').map(l => l.trim()).filter(Boolean);
    let addedCount = 0;
    let updatedCount = 0;

    const processUser = (email: string, updates: any) => {
      let sbUser = supabaseUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (sbUser) {
        Object.assign(sbUser, updates);
        updatedCount++;
      } else {
        supabaseUsers.push({
          id: `import-${Date.now()}-${Math.random()}`,
          email,
          password: "DefaultPassword123!",
          role: "author",
          status: "Active",
          journal: "APASIFIC IAEP",
          ...updates
        });
        addedCount++;
      }

      let localUser = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (localUser) {
        Object.assign(localUser, updates);
      } else {
        users.push({
          id: `import-${Date.now()}-${Math.random()}`,
          email,
          password: "DefaultPassword123!",
          role: "author",
          status: "Active",
          journal: "APASIFIC IAEP",
          ...updates
        });
      }
    };

    // Process Authors
    for (let line of authorsLines) {
      const parts = line.split('\t');
      if (parts.length >= 10) {
        processUser(parts[5].trim(), {
          joined: parts[0].trim(),
          full_name: parts[1].trim(),
          university: parts[3].trim(),
          country: "Indonesia",
          phone_number: parts[6].trim(),
          scopus_id: cleanId(parts[7]),
          google_scholar_id: cleanId(parts[8]),
          orcid_id: cleanId(parts[9]),
          role: "author"
        });
      }
    }

    // Since Reviewers are already mostly in the system, we can update them similarly if needed.
    // However, the previous script (fix-phones) already restored their phones.
    // If the user wants the reviewers updated completely with new lines, we could parse that too,
    // but the issue was the authors were completely missing and reviewers had no phones.
    
    // Read reviewers_data.json to fix any missing phones
    const REVIEWERS_FILE = path.join(process.cwd(), 'src/app/api/users/list/reviewers_data.json');
    if (fs.existsSync(REVIEWERS_FILE)) {
      const reviewers = JSON.parse(fs.readFileSync(REVIEWERS_FILE, 'utf8'));
      for (const rev of reviewers) {
        if (rev.email) {
          processUser(rev.email.trim(), {
            joined: rev.date,
            full_name: rev.full_name,
            university: rev.university,
            country: rev.country,
            phone_number: formatPhone(rev.phone),
            role: "reviewer"
          });
        }
      }
    }
    
    // Formatting existing phones in case they were already saved without +
    for (let u of users) {
      if (u.phone_number) u.phone_number = formatPhone(u.phone_number);
      if (u.phone) u.phone = formatPhone(u.phone);
    }
    for (let u of supabaseUsers) {
      if (u.phone_number) u.phone_number = formatPhone(u.phone_number);
      if (u.phone) u.phone = formatPhone(u.phone);
    }
    
    // MERGE LOCAL USERS INTO SUPABASE
    // (This guarantees the 17 dummy reviewers from add-asiacert-reviewers get uploaded)
    for (const localU of users) {
      const existsInSb = supabaseUsers.find((su: any) => su.email.toLowerCase() === localU.email.toLowerCase());
      if (!existsInSb) {
        supabaseUsers.push(localU);
        addedCount++;
      }
    }
    
    // Save to local
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));

    // Save to Supabase
    await supabaseAdmin
      .from('system_settings')
      .upsert({ key: 'apasific_registered_users', value: JSON.stringify(supabaseUsers) });

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil memproses data: ${addedCount} author baru ditambahkan, ${updatedCount} data diperbarui di Supabase & lokal.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
