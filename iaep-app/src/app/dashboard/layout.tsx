import { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { normalizeRole } from "@/lib/roles";
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let userRole = "";
  let userName = "User";
  let isAuthenticated = false;

  try {
    // Canonical Identity Source
    // Dashboard chrome must use the same identity/role resolution
    // as the dashboard page and all protected application flows.
    const identity = await getCurrentUser();

    if (identity) {
      isAuthenticated = true;
const rawRole = identity.roles?.[0] || "";
      userRole = normalizeRole(rawRole) || rawRole;

      const configuredSuperAdminEmail =
        process.env.SUPER_ADMIN_CANONICAL_EMAIL ||
        process.env.SUPER_ADMIN_EMAIL;

      if (
        identity.email?.toLowerCase() ===
        configuredSuperAdminEmail?.toLowerCase()
      ) {
        userRole = "SUPER_ADMIN";
      }
      userName = identity.full_name || identity.email || userName;
}
  } catch (error) {
    console.error("Dashboard identity resolution failed:", error);
  }
  // Block access if not authenticated via either Supabase or Firebase
  if (!isAuthenticated) {
    redirect("/auth/login");
  }

  const requestHeaders = await headers();
  const dashboardPath =
    requestHeaders.get("x-dashboard-path") || "/dashboard";

  const normalizedUserRole = normalizeRole(userRole) || userRole;

  // REVIEWER ISOLATION
  // Reviewer hanya boleh mengakses Reviewer Portal.
  if (
    normalizedUserRole === "REVIEWER" &&
    !dashboardPath.startsWith("/dashboard/reviews")
  ) {
    redirect("/dashboard/reviews");
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#07070e", overflow: "hidden" }}>
      <Sidebar role={userRole} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar userName={userName} role={userRole} />
        <main
          style={{
            flex: 1,
            overflowX: "hidden",
            overflowY: "auto",
            background: "#07070e",
            padding: "28px 32px",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}















