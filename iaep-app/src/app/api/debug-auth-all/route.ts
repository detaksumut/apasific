import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/utils/firebase/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = getFirebaseAdmin();
    const result: any = { all_auth_users: [] };
    
    // Fetch all users
    let listUsersResult = await admin.auth().listUsers(1000);
    for (const userRecord of listUsersResult.users) {
        if (
           (userRecord.email && userRecord.email.toLowerCase().includes('kadsumut')) ||
           (userRecord.displayName && userRecord.displayName.toLowerCase().includes('kadsumut')) ||
           (userRecord.customClaims && (userRecord.customClaims as any).role === 'reviewer')
        ) {
            result.all_auth_users.push({
               uid: userRecord.uid,
               email: userRecord.email,
               displayName: userRecord.displayName,
               claims: userRecord.customClaims
            });
        }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
