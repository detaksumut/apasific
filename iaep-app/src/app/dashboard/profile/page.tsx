"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Dr. M A Rahman");
  const [userRole, setUserRole] = useState("Author");
  const [email, setEmail] = useState("author@example.com");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    // Read the mock_user cookie to display the correct profile
    const cookies = document.cookie.split("; ");
    const mockUserCookie = cookies.find(row => row.startsWith("mock_user="));
    if (mockUserCookie) {
      const val = mockUserCookie.split("=")[1];
      if (val === "editor") {
        setUserName("M. A. Rahman");
        setUserRole("Editor");
        setEmail("marahman2169@gmail.com");
      } else if (val === "reviewer") {
        setUserName("Kadin Medan");
        setUserRole("Reviewer");
        setEmail("kadinmedan1@gmail.com");
      } else if (val === "submitter") {
        setUserName("Kad Sumut");
        setUserRole("Author");
        setEmail("kadsumut@gmail.com");
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      <div className="bg-[#18182e] shadow-xl border border-gray-800 rounded-xl overflow-hidden">
        <div className="bg-[#111120] px-8 py-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white font-['Cinzel']">My Profile</h1>
          <p className="text-[#8888aa] mt-1">Manage your personal information and account settings</p>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-gradient-to-br from-[#c9a84c] to-[#9a7a30] text-white rounded-full flex items-center justify-center text-5xl font-bold shadow-lg shadow-[#c9a84c]/20 border-4 border-[#111120]">
                {userName.charAt(0)}
              </div>
              <button 
                onClick={() => showToast("Picture upload dialog opened! (Demo)")}
                className="text-sm font-semibold text-[#c9a84c] hover:text-white transition-colors"
              >
                Change Picture
              </button>
            </div>

            {/* Profile Form */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Full Name</label>
                  <input type="text" value={userName} readOnly className="w-full border border-gray-700 bg-[#0a0a14] rounded-lg p-2.5 text-gray-300 focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Email Address</label>
                  <input type="email" value={email} readOnly className="w-full border border-gray-700 bg-[#0a0a14] rounded-lg p-2.5 text-gray-300 focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Current Role</label>
                  <input type="text" value={userRole} readOnly className="w-full border border-[#c9a84c]/50 bg-[#0a0a14] rounded-lg p-2.5 font-bold text-[#c9a84c] focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Affiliation / Institution</label>
                  <input type="text" defaultValue="APASIFIC Network" className="w-full border border-gray-700 bg-[#111120] rounded-lg p-2.5 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" />
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 mt-6">
                <h3 className="text-lg font-bold text-white mb-4">Biography</h3>
                <textarea rows={4} className="w-full border border-gray-700 bg-[#111120] rounded-lg p-3 text-white focus:border-[#c9a84c] focus:outline-none transition-colors" placeholder="Write a short biography about your academic background..."></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => showToast("Profile settings successfully saved! (Demo)")}
                  className="bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-[#c9a84c]/20 transition-all"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
