import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/utils/firebase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = getFirebaseAdmin();
    const result: any = { auth_user: null };
    
    try {
      const user = await admin.auth().getUserByEmail('kadsumut@gmail.com');
      result.auth_user = {
         uid: user.uid,
         email: user.email,
         displayName: user.displayName,
         customClaims: user.customClaims
      };
    } catch(e: any) {
      result.auth_error = e.message;
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
