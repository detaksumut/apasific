"use client";

import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [userName, setUserName] = useState("Dr. John Doe");
  const [userRole, setUserRole] = useState("Author");
  const [email, setEmail] = useState("author@example.com");

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-[#18182e] px-8 py-6 border-b border-[#c9a84c]/30">
          <h1 className="text-2xl font-bold text-white font-['Cinzel']">My Profile</h1>
          <p className="text-gray-400 mt-1">Manage your personal information and account settings</p>
        </div>
        
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-[#c9a84c] text-white rounded-full flex items-center justify-center text-5xl font-bold shadow-lg">
                {userName.charAt(0)}
              </div>
              <button className="text-sm font-semibold text-blue-600 hover:underline">Change Picture</button>
            </div>

            {/* Profile Form */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={userName} readOnly className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={email} readOnly className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Role</label>
                  <input type="text" value={userRole} readOnly className="w-full border border-gray-300 bg-gray-50 rounded-lg p-2.5 text-gray-800 font-semibold text-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Affiliation / Institution</label>
                  <input type="text" defaultValue="APASIFIC Network" className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:border-[#c9a84c] focus:outline-none" />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Biography</h3>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:border-[#c9a84c] focus:outline-none" placeholder="Write a short biography about your academic background..."></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button className="bg-[#0d0d1a] hover:bg-[#1a1a2e] text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
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
