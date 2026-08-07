"use server";
import { createClient } from "@/utils/supabase/server";

export async function lolosAdministrasi(submissionId: string) {
  const supabase = await createClient();
  
  const { getCurrentUser } = await import('./auth');
  const user: any = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  // Verify user is co_admin
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('user_role')?.value?.toLowerCase() || '';
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const dbRole = (profile?.role || '').toLowerCase();
  
  const role = cookieRole || dbRole;
  if (!role.includes('co_admin') && !role.includes('co-admin') && !role.includes('admin') && !role.includes('superadmin')) {
    throw new Error("Forbidden: Only Co-Admins can screen submissions");
  }

  // Update status to 'Awaiting Reviewers'
  const { error } = await supabase
    .from('submissions')
    .update({ status: 'Awaiting Reviewers' })
    .eq('id', submissionId);

  if (error) {
    console.error("Failed to update status:", error);
    throw new Error(error.message);
  }

  return { success: true };
}

export async function approveUser(userId: string) {
  const supabase = await createClient();
  
  const { getCurrentUser } = await import('./auth');
  const user: any = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const cookieRole = cookieStore.get('user_role')?.value?.toLowerCase() || '';

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  const dbRole = (profile?.role || '').toLowerCase();
  
  const role = cookieRole || dbRole;
  if (!role.includes('co_admin') && !role.includes('co-admin') && !role.includes('admin') && !role.includes('superadmin')) {
    throw new Error("Forbidden: Only Co-Admins can approve users");
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status: 'Active' })
    .eq('id', userId);

  if (error) {
    console.error("Failed to approve user:", error);
    throw new Error(error.message);
  }

  return { success: true };
}
