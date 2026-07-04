import RegisterWizard, { RoleType } from "@/components/auth/RegisterWizard";
import Link from "next/link";

export default function MembershipAuth() {
  const roles = [
    { value: "member" as RoleType, label: "General Member" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-8">
        <Link href="/" className="text-[#c9a84c] hover:text-white transition-colors">
          ← Back to Home
        </Link>
      </div>
      
      <div className="text-center max-w-3xl mb-8">
        <h1 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-white mb-4">
          Membership <span className="text-[#c9a84c]">Platform</span>
        </h1>
        <p className="text-[#8888aa]">
          Create your Unified Identity. Join APASIFIC to get your Digital Member Card and Academic Profile.
        </p>
      </div>

      <RegisterWizard title="Register for Membership" availableRoles={roles} defaultRole="member" />
    </div>
  );
}
