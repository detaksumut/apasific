"use client";

export default function Topbar({ userName, role }: { userName: string, role: string }) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
      <div className="flex items-center">
        <button className="text-gray-500 focus:outline-none md:hidden">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-500">
          <span className="sr-only">Notifications</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-700">{userName}</div>
            <div className="flex items-center justify-end gap-2 mt-0.5">
              <span className="text-xs text-gray-500 capitalize">{role}</span>
              <span className="text-gray-300">|</span>
              <button 
                onClick={() => {
                  document.cookie = "mock_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                  window.location.href = "/";
                }} 
                className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-[#c9a84c] text-white flex items-center justify-center font-bold">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
