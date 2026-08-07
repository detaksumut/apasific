import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('http://localhost:3000/api/users/list', { cache: 'no-store' });
    const data = await res.json();
    
    if (data && data.users) {
      const reviewers = data.users.filter((u: any) => u.role === 'reviewer');
      return NextResponse.json({ 
        totalUsers: data.users.length,
        totalReviewers: reviewers.length,
      });
    }
    return NextResponse.json({ error: 'No users found in API response' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
