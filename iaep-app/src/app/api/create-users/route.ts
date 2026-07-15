import { NextResponse } from 'next/server';
import { signUpUser } from '@/app/actions/auth';

export async function GET() {
  const usersToCreate = [
    { fullName: "Kun Syafi'i Habibi", email: "kun@apasific.org", role: "Layout Editor" },
    { fullName: "Rizky Al Ridho", email: "rizky@apasific.org", role: "Cover Editor" },
    { fullName: "Parida Hannum", email: "parida@apasific.org", role: "Publish Editor" },
    { fullName: "Muhammad Danil", email: "danil@apasific.org", role: "Supervisor" }
  ];
  
  let resultLog = "";

  for (const u of usersToCreate) {
    resultLog += `Creating user ${u.fullName} (${u.email})...\n`;
    
    const formData = {
        email: u.email,
        password: "mikrosistem",
        fullName: u.fullName,
        phone: "+628000000000",
        country: "Indonesia",
        university: "APASIFIC",
        discipline: "Publishing",
        role: u.role,
        orcid: "",
        googleScholar: "",
        scopus: "",
        wos: "",
        sinta: ""
    };
    
    const result = await signUpUser(formData);
    
    if (result.success !== false) { // signUpUser always returns {success: true} or modifies state anyway if errors are ignored
       resultLog += `- Success for ${u.email}\n`;
    } else {
       resultLog += `- Error for ${u.email}: ${result.error}\n`;
    }
  }
  
  return NextResponse.json({ result: resultLog });
}
