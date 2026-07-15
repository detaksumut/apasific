import RegisterWizard, { RoleType } from "@/components/auth/RegisterWizard";
import Link from "next/link";

export default async function PublicationAuth({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const roles = [
    { value: "author" as RoleType, label: "Author / Submitter" },
    { value: "reviewer" as RoleType, label: "Reviewer" },
    { value: "editor" as RoleType, label: "Editor" },
  ];

  const resolvedParams = await searchParams;
  const roleParam = resolvedParams.role as RoleType | undefined;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg mb-8">
        <Link href="/" className="text-[#c9a84c] hover:text-white transition-colors">
          ← Back to Home
        </Link>
      </div>
      
      <div className="text-center max-w-xl mb-8">
        <h1 className="text-3xl md:text-5xl font-['Cinzel'] font-bold text-white mb-4">
          Publication <span className="text-[#c9a84c]">Portal</span>
        </h1>
        <p className="text-[#8888aa]">
          Join the Double Blind Peer Review System. Register to submit manuscripts, perform reviews, or manage the editorial workflow.
        </p>
      </div>

      <RegisterWizard 
        title="Create Publication Account" 
        availableRoles={roles} 
        forcedRole={roleParam}
      />
    </div>
  );
}
