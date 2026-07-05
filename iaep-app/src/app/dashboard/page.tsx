import { createClient } from "@/utils/supabase/server";

export default async function DashboardHome() {
  let profile = {
    fullName: "Dr. John Doe",
    email: "john.doe@university.edu",
    role: "Author",
    university: "National University of Singapore",
    country: "Singapore",
    orcid: "0000-1111-2222-3333",
    sinta: "6543210"
  };

  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: dbProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (dbProfile) {
        profile = {
          fullName: dbProfile.full_name || "N/A",
          email: dbProfile.email || user.email || "N/A",
          role: dbProfile.role || "Member",
          university: dbProfile.university || "N/A",
          country: dbProfile.country || "N/A",
          orcid: dbProfile.orcid_id || "N/A",
          sinta: dbProfile.sinta_id || "N/A"
        };
      }
    }
  } catch (error) {
    console.log("Using fallback profile data");
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Academic Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Full Name</div>
              <div className="text-gray-900 font-medium">{profile.fullName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</div>
              <div className="text-gray-900 font-medium">{profile.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Institution</div>
              <div className="text-gray-900 font-medium">{profile.university}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Country</div>
              <div className="text-gray-900 font-medium">{profile.country}</div>
            </div>
          </div>

          <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Academic IDs</h3>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white px-3 py-1.5 rounded shadow-sm text-sm border border-gray-200">
                <span className="text-gray-500 mr-2">ORCID</span>
                <span className="font-mono text-gray-800">{profile.orcid}</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded shadow-sm text-sm border border-gray-200">
                <span className="text-gray-500 mr-2">SINTA</span>
                <span className="font-mono text-gray-800">{profile.sinta}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions / Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Platform Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Membership</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-600">Role</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{profile.role}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12121f] rounded-xl shadow-sm p-6 text-white border border-green-500/20">
            <h3 className="font-bold text-green-400 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              My Earnings (Royalties)
            </h3>
            <div className="text-3xl font-bold text-white mb-1">Rp 2.100.000</div>
            <p className="text-xs text-gray-400 mb-4">From 42 article downloads</p>
            <button className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded transition-colors text-sm">
              Withdraw Funds
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#0d0d1a] to-[#1a1a2e] rounded-xl shadow-sm p-6 text-white border border-[#c9a84c]/20">
            <h3 className="font-bold text-[#c9a84c] mb-2">Ready to Publish?</h3>
            <p className="text-gray-300 text-sm mb-4">Submit your manuscript to our Double Blind Peer Review System.</p>
            <button className="w-full bg-[#c9a84c] hover:bg-[#b0923d] text-black font-semibold py-2 rounded transition-colors text-sm">
              Submit Manuscript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
