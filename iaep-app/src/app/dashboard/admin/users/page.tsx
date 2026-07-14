"use client";

import { useState, useEffect } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users/list?t=' + Date.now());
        const data = await res.json();

        
        if (data.success && data.users && data.users.length > 0) {
          const mappedUsers = data.users.map((u: any) => ({
            id: u.id,
            name: u.full_name || u.name,
            email: u.email,
            role: u.role === "author" ? "Author" : u.role === "reviewer" ? "Reviewer" : u.role === "admin" ? "Admin" : u.role === "co_admin" ? "Co-Admin" : u.role || "Author",
            journal: "ASIA", 
            joined: u.joined ? new Date(u.joined).toLocaleDateString() : "Oct 2024",
            status: u.status || "Pending"
          }));
          
          setUsers(mappedUsers);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [toastMessage, setToastMessage] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isBulkWaOpen, setIsBulkWaOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleInviteSubmit = () => {
    setIsInviteOpen(false);
    showToast("Invitation email successfully sent! (Demo)");
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch('/api/users/list', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', user: editFormData }) 
      });
      const data = await res.json();
      if (data.success) {
        const updatedUser = {
          ...editFormData,
          role: editFormData.role === "author" ? "Author" : editFormData.role === "reviewer" ? "Reviewer" : editFormData.role === "admin" ? "Admin" : editFormData.role === "co_admin" ? "Co-Admin" : editFormData.role || "Author"
        };
        setUsers(users.map(u => u.id === editFormData.id ? updatedUser : u));
        showToast("User details successfully updated!");
        setIsEditOpen(false);
      } else {
        showToast("Error updating: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network Error: " + e.message);
    }
  };

  const handleRevoke = async (id: number | string, name: string) => {
    try {
      const res = await fetch('/api/users/list', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', userId: id }) 
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, status: "Revoked" } : u));
        showToast(`Access revoked for ${name}.`);
      } else {
        showToast("Error revoking: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network Error: " + e.message);
    }
  };

  const handleSendWA = async (user: any) => {
    if (!user.phone_number && !user.phone) {
      alert(`Gagal: Nomor WA untuk ${user.name} belum terdaftar di sistem.`);
      return;
    }
    const phone = user.phone_number || user.phone;
    
    try {
      showToast(`Mengirim WA ke ${user.name}...`);
      const res = await fetch('/api/users/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name || user.full_name, phone })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Berhasil! Pesan Selamat Datang telah terkirim ke WhatsApp ${user.name}.`);
      } else {
        alert("Gagal mengirim WA: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Network Error saat mengirim WA: " + e.message);
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) return;
    try {
      const res = await fetch('/api/users/list', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: id }) 
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== id));
        showToast(`User ${name} berhasil dihapus.`);
      } else {
        showToast("Error deleting: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network Error: " + e.message);
    }
  };

  const handleBulkCheckboxChange = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      showToast("Sedang mensinkronisasi data...");
      const res = await fetch('/api/import-all-users');
      const data = await res.json();
      if (data.success) {
        showToast("Sinkronisasi berhasil!");
        // Refresh users
        const res2 = await fetch('/api/users/list');
        const data2 = await res2.json();
        if (data2.success) {
          setUsers(data2.users.map((u: any) => ({ ...u, name: u.name || u.full_name })));
        }
      } else {
        alert("Gagal sinkronisasi: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Network Error: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!bulkMessage.trim()) {
      alert("Pesan tidak boleh kosong!");
      return;
    }
    
    setIsSendingBulk(true);
    const selectedUsersData = users
      .filter(u => selectedUserIds.includes(u.id))
      .map(u => ({ name: u.name || u.full_name, phone: u.phone_number || u.phone }));

    try {
      const res = await fetch('/api/users/send-bulk-wa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: bulkMessage, users: selectedUsersData })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Berhasil: ${data.message}`);
        setIsBulkWaOpen(false);
        setBulkMessage("");
        setSelectedUserIds([]); // clear selection
      } else {
        alert("Gagal: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      alert("Network Error saat mengirim pesan massal: " + e.message);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const handleApprove = async (id: number | string, name: string) => {
    try {
      const res = await fetch('/api/users/list', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', userId: id }) 
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === id ? { ...u, status: "Active" } : u));
        showToast(`User ${name} berhasil disetujui (Approved).`);
      } else {
        showToast("Gagal menyetujui: " + data.error);
      }
    } catch (e: any) {
      console.error(e);
      showToast("Network Error: " + e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-green-500/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-green-500/20 animate-fade-in-down border border-green-400 backdrop-blur-sm flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">User Management</h1>
          <p className="text-[#8888aa]">Manage global users, assign cross-journal roles, and monitor activity.</p>
        </div>
        <div className="flex gap-3 items-center">
          {selectedUserIds.length > 0 && (
            <button 
              onClick={() => {
                setBulkMessage(`Halo, Yth. {{name}}! 👋\n\nSelamat datang di keluarga besar Asia Index & Metric (Association Asia Pacific Academicians)! 🎉\n\nKami mengucapkan terima kasih yang sebesar-besarnya atas kesediaan Anda untuk bergabung di sistem publikasi akademik kami. Keahlian dan pengalaman Anda akan sangat berarti dalam menjaga kualitas serta standar integritas ilmiah jurnal-jurnal di bawah naungan APASIFIC.\n\nSalam Hormat,\nRedaksi Asia Index & Metric Association Asia Pacific Academicians 🌐 https://apasific.org`);
                setIsBulkWaOpen(true);
              }}
              className="bg-[#25D366] hover:bg-[#1ebd5a] text-black px-4 py-2 rounded-lg font-bold transition-colors flex items-center shadow-lg shadow-[#25D366]/20"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.112.551 4.17 1.597 5.986L0 24l6.155-1.576c1.748.971 3.73 1.485 5.876 1.485 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.921c-1.815 0-3.593-.487-5.15-1.409l-.369-.219-3.834.982 1.002-3.69-.24-.382c-1.014-1.614-1.549-3.486-1.549-5.419 0-5.552 4.516-10.068 10.068-10.068s10.068 4.516 10.068 10.068-4.516 10.068-10.068 10.068zm5.526-7.544c-.303-.152-1.791-.884-2.069-.985-.278-.101-.481-.152-.683.152-.202.303-.783.985-.96 1.187-.177.202-.354.227-.657.076-1.272-.635-2.298-1.168-3.23-2.716-.24-.4-.029-.62.121-.772.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.644-.935-2.251-.246-.593-.497-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.531.076-.809.38-.278.303-1.062 1.037-1.062 2.529s1.087 2.934 1.239 3.136c.152.202 2.138 3.262 5.179 4.573 1.831.79 2.529.859 3.421.722.996-.152 2.628-1.073 2.995-2.112.368-1.037.368-1.925.258-2.112-.111-.187-.414-.288-.718-.44z"/></svg>
              Bulk WA ({selectedUserIds.length})
            </button>
          )}
          <button 
            onClick={handleSyncData}
            disabled={isSyncing}
            className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center border border-gray-700"
          >
            <svg className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? "Syncing..." : "Sync Data"}
          </button>
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="Search users by email or name..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="bg-[#18182e] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#c9a84c] w-64" 
            />
          </div>
          <button 
            onClick={() => setIsInviteOpen(true)}
            className="bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-2 px-4 rounded-lg shadow-lg shadow-[#c9a84c]/20 transition-all"
          >
            Invite User
          </button>
        </div>
      </div>

      {/* TABS FOR FILTERING */}
      <div className="flex gap-4 border-b border-gray-800 pb-0">
        <button 
          onClick={() => { setActiveTab('All'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'All' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          All Users
        </button>
        <button 
          onClick={() => { setActiveTab('Reviewer'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Reviewer' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Reviewers
        </button>
        <button 
          onClick={() => { setActiveTab('Author'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Author' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Authors
        </button>
        <button 
          onClick={() => { setActiveTab('Editor'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Editor' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Editors
        </button>
        <button 
          onClick={() => { setActiveTab('Admin'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Admin' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Super Admins
        </button>
        <button 
          onClick={() => { setActiveTab('Co-Admin'); setCurrentPage(1); }}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Co-Admin' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Co-Admins
        </button>
      </div>

      <div className="bg-[#18182e] rounded-2xl shadow-xl border border-gray-800 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-5 font-semibold w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-700 bg-[#0a0a14] accent-[#c9a84c] cursor-pointer"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const visibleUsers = users.filter(u => {
                          const searchMatch = searchQuery === '' || 
                                              u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              u.name.toLowerCase().includes(searchQuery.toLowerCase());
                          if (!searchMatch) return false;
                          if (activeTab === 'All') return true;
                          if (activeTab === 'Editor') return u.role.toLowerCase() === 'editor';
                          if (activeTab === 'Admin') return u.role.toLowerCase() === 'admin';
                          if (activeTab === 'Co-Admin') return u.role.toLowerCase() === 'co-admin';
                          return u.role.toLowerCase() === activeTab.toLowerCase();
                        }).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        setSelectedUserIds(prev => [...new Set([...prev, ...visibleUsers.map(vu => vu.id)])]);
                      } else {
                        const visibleUsersIds = users.filter(u => {
                          const searchMatch = searchQuery === '' || 
                                              u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              u.name.toLowerCase().includes(searchQuery.toLowerCase());
                          if (!searchMatch) return false;
                          if (activeTab === 'All') return true;
                          if (activeTab === 'Editor') return u.role.toLowerCase() === 'editor';
                          if (activeTab === 'Admin') return u.role.toLowerCase() === 'admin';
                          if (activeTab === 'Co-Admin') return u.role.toLowerCase() === 'co-admin';
                          return u.role.toLowerCase() === activeTab.toLowerCase();
                        }).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(u => u.id);
                        setSelectedUserIds(prev => prev.filter(id => !visibleUsersIds.includes(id)));
                      }
                    }}
                  />
                </th>
                <th className="p-5 font-semibold">User Details</th>
                <th className="p-5 font-semibold">Global Role</th>
                <th className="p-5 font-semibold">Assigned Journals</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(() => {
                const filteredUsers = users.filter(u => {
                  const searchMatch = searchQuery === '' || 
                                      u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      u.name.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!searchMatch) return false;
                  
                  if (activeTab === 'All') return true;
                  if (activeTab === 'Editor') return u.role.toLowerCase() === 'editor';
                  if (activeTab === 'Admin') return u.role.toLowerCase() === 'admin';
                  if (activeTab === 'Co-Admin') return u.role.toLowerCase() === 'co-admin';
                  return u.role.toLowerCase() === activeTab.toLowerCase();
                });
                
                const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
                const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

                return paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#1a1a2e] transition-colors">
                  <td className="p-5 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleBulkCheckboxChange(user.id)}
                      className="w-4 h-4 rounded border-gray-700 bg-[#0a0a14] accent-[#c9a84c] cursor-pointer"
                    />
                  </td>
                  <td className="p-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      user.role === 'Editor' ? 'bg-purple-900/50 text-purple-300 border border-purple-700' :
                      user.role === 'Co-Admin' ? 'bg-pink-900/50 text-pink-300 border border-pink-700' :
                      user.role === 'Reviewer' ? 'bg-blue-900/50 text-blue-300 border border-blue-700' :
                      'bg-gray-800 text-gray-300 border border-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="text-sm text-gray-300 max-w-[200px] truncate">{user.journal}</div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <span className="text-sm text-gray-400">{user.status}</span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    {user.status === "Pending" && (
                      <button 
                        onClick={() => handleApprove(user.id, user.name)}
                        className="text-green-400 hover:text-green-300 px-3 py-1 bg-green-900/20 hover:bg-green-900/40 rounded transition-colors mr-2 font-bold"
                      >
                        Terima
                      </button>
                    )}
                    <button 
                      onClick={() => handleSendWA(user)}
                      className="text-[#25D366] hover:text-[#1ebd5a] px-3 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded transition-colors mr-2 flex-inline items-center gap-1"
                      title="Kirim Pesan WA Selamat Datang"
                    >
                      <svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.112.551 4.17 1.597 5.986L0 24l6.155-1.576c1.748.971 3.73 1.485 5.876 1.485 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.921c-1.815 0-3.593-.487-5.15-1.409l-.369-.219-3.834.982 1.002-3.69-.24-.382c-1.014-1.614-1.549-3.486-1.549-5.419 0-5.552 4.516-10.068 10.068-10.068s10.068 4.516 10.068 10.068-4.516 10.068-10.068 10.068zm5.526-7.544c-.303-.152-1.791-.884-2.069-.985-.278-.101-.481-.152-.683.152-.202.303-.783.985-.96 1.187-.177.202-.354.227-.657.076-1.272-.635-2.298-1.168-3.23-2.716-.24-.4-.029-.62.121-.772.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.644-.935-2.251-.246-.593-.497-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.531.076-.809.38-.278.303-1.062 1.037-1.062 2.529s1.087 2.934 1.239 3.136c.152.202 2.138 3.262 5.179 4.573 1.831.79 2.529.859 3.421.722.996-.152 2.628-1.073 2.995-2.112.368-1.037.368-1.925.258-2.112-.111-.187-.414-.288-.718-.44z"/></svg>
                      WA
                    </button>
                    <button 
                      onClick={() => { setSelectedUser(user); setEditFormData({...user}); setIsEditOpen(true); }}
                      className="text-gray-400 hover:text-white px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleRevoke(user.id, user.name)}
                      className="text-red-400 hover:text-red-300 px-3 py-1 bg-red-900/20 hover:bg-red-900/40 rounded transition-colors mr-2"
                    >
                      Revoke
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id, user.name)}
                      className="text-gray-400 hover:text-red-500 p-1.5 bg-gray-800 hover:bg-red-900/50 rounded-full transition-colors inline-flex items-center justify-center align-middle"
                      title="Delete User"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {users.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-800 bg-[#111120] flex items-center justify-between">
            {(() => {
              const filteredUsers = users.filter(u => {
                const searchMatch = searchQuery === '' || 
                                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    u.name.toLowerCase().includes(searchQuery.toLowerCase());
                if (!searchMatch) return false;

                if (activeTab === 'All') return true;
                if (activeTab === 'Editor') return u.role.toLowerCase() === 'editor';
                if (activeTab === 'Admin') return u.role.toLowerCase() === 'admin' || u.role.toLowerCase() === 'co_admin';
                return u.role.toLowerCase() === activeTab.toLowerCase();
              });
              const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
              return (
                <>
                  <span className="text-sm text-gray-400">
                    Showing <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-white">{filteredUsers.length}</span> users
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-bold bg-[#18182e] border border-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded border transition-colors ${currentPage === i + 1 ? 'bg-[#c9a84c] text-black border-[#c9a84c]' : 'bg-[#18182e] text-gray-400 border-gray-700 hover:bg-gray-800 hover:text-white'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-bold bg-[#18182e] border border-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111120] border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-aos="zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#18182e]">
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Invite New User</h2>
              <button onClick={() => setIsInviteOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input type="email" className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" placeholder="academic@university.edu" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Global Role</label>
                <select className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                  <option value="author">Author</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="co_admin">Co-Admin</option>
                  <option value="journal_manager">Journal Manager</option>
                </select>
              </div>
              <div className="pt-4">
                <button onClick={handleInviteSubmit} className="w-full bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-3 rounded-lg transition-colors">
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111120] border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" data-aos="zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#18182e]">
              <h2 className="text-xl font-bold text-white font-['Cinzel']">Edit User: {selectedUser.name}</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nama Lengkap</label>
                  <input value={editFormData.name || ''} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">No. HP/WhatsApp</label>
                  <input value={editFormData.phone_number || editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone_number: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Negara</label>
                  <input value={editFormData.country || ''} onChange={e => setEditFormData({...editFormData, country: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Institusi/Universitas</label>
                  <input value={editFormData.university || ''} onChange={e => setEditFormData({...editFormData, university: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ID Akademik (ORCID)</label>
                  <input value={editFormData.orcid_id || editFormData.orcid || ''} onChange={e => setEditFormData({...editFormData, orcid_id: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Google Scholar</label>
                  <input value={editFormData.google_scholar_id || editFormData.googleScholar || ''} onChange={e => setEditFormData({...editFormData, google_scholar_id: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Scopus</label>
                  <input value={editFormData.scopus_id || editFormData.scopus || ''} onChange={e => setEditFormData({...editFormData, scopus_id: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Web of Science (WoS)</label>
                  <input value={editFormData.wos_id || editFormData.wos || ''} onChange={e => setEditFormData({...editFormData, wos_id: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">SINTA</label>
                  <input value={editFormData.sinta_id || editFormData.sinta || ''} onChange={e => setEditFormData({...editFormData, sinta_id: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Change Role</label>
                  <select value={editFormData.role || 'author'} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                    <option value="co_admin">Co-Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Status</label>
                  <select value={editFormData.status || 'Active'} onChange={e => setEditFormData({...editFormData, status: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Revoked">Revoked</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsEditOpen(false)} className="flex-1 bg-transparent border border-gray-700 hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleEditSubmit} className="flex-1 bg-[#c9a84c] hover:bg-[#b0923d] text-black font-bold py-3 rounded-lg transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* BULK WA MODAL */}
      {isBulkWaOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111120] border border-[#25D366]/40 rounded-2xl shadow-2xl shadow-[#25D366]/20 max-w-lg w-full overflow-hidden" data-aos="zoom-in">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#18182e]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.112.551 4.17 1.597 5.986L0 24l6.155-1.576c1.748.971 3.73 1.485 5.876 1.485 6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 21.921c-1.815 0-3.593-.487-5.15-1.409l-.369-.219-3.834.982 1.002-3.69-.24-.382c-1.014-1.614-1.549-3.486-1.549-5.419 0-5.552 4.516-10.068 10.068-10.068s10.068 4.516 10.068 10.068-4.516 10.068-10.068 10.068zm5.526-7.544c-.303-.152-1.791-.884-2.069-.985-.278-.101-.481-.152-.683.152-.202.303-.783.985-.96 1.187-.177.202-.354.227-.657.076-1.272-.635-2.298-1.168-3.23-2.716-.24-.4-.029-.62.121-.772.136-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.051-.38-.025-.531-.076-.152-.683-1.644-.935-2.251-.246-.593-.497-.512-.683-.521-.177-.009-.38-.009-.582-.009-.202 0-.531.076-.809.38-.278.303-1.062 1.037-1.062 2.529s1.087 2.934 1.239 3.136c.152.202 2.138 3.262 5.179 4.573 1.831.79 2.529.859 3.421.722.996-.152 2.628-1.073 2.995-2.112.368-1.037.368-1.925.258-2.112-.111-.187-.414-.288-.718-.44z"/></svg>
                Kirim WA Massal
              </h2>
              <button onClick={() => setIsBulkWaOpen(false)} disabled={isSendingBulk} className="text-gray-400 hover:text-white disabled:opacity-50">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-[#1a1a2e] p-4 rounded-lg border border-gray-800">
                <p className="text-sm text-gray-300">
                  Anda akan mengirim pesan WhatsApp broadcast ke <strong className="text-white text-lg">{selectedUserIds.length}</strong> pengguna yang terpilih.
                  Pesan akan dikirim satu per satu untuk menghindari blokir dari WhatsApp.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  <span className="text-[#c9a84c] font-bold">Tips:</span> Anda bisa menggunakan teks <code className="bg-black px-1 rounded text-white">{"{{name}}"}</code> agar nama otomatis disesuaikan per penerima.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Pesan Broadcast</label>
                <textarea 
                  rows={8}
                  value={bulkMessage} 
                  onChange={e => setBulkMessage(e.target.value)} 
                  disabled={isSendingBulk}
                  placeholder="Ketik pesan Anda di sini..."
                  className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#25D366] resize-none" 
                />
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleBulkSubmit}
                  disabled={isSendingBulk}
                  className="w-full bg-[#25D366] hover:bg-[#1ebd5a] disabled:bg-gray-700 disabled:cursor-wait text-black font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSendingBulk ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sedang Mengirim... Mohon Tunggu
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      Kirim Pesan Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
