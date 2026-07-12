"use client";

import { useState, useEffect } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users/list');
        const data = await res.json();
        
        if (data.success && data.users && data.users.length > 0) {
          const mappedUsers = data.users.map((u: any) => ({
            id: u.id,
            name: u.full_name || u.name,
            email: u.email,
            role: u.role === "author" ? "Author" : u.role === "reviewer" ? "Reviewer" : u.role === "admin" ? "Admin" : u.role || "Author",
            journal: u.role === "reviewer" ? "APASIFIC IAEP" : u.journal || "RJRAKP", 
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
      await fetch('/api/users/list', { 
        method: 'POST', 
        body: JSON.stringify({ action: 'edit', user: editFormData }) 
      });
      // Update local state for demo
      setUsers(users.map(u => u.id === editFormData.id ? editFormData : u));
    } catch (e) {
      console.error(e);
    }
    setIsEditOpen(false);
    showToast("User details successfully updated!");
  };

  const handleRevoke = async (id: number | string, name: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "Revoked" } : u));
    showToast(`Access revoked for ${name}.`);
    try {
      await fetch('/api/users/list', { method: 'POST', body: JSON.stringify({ action: 'revoke', userId: id }) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) return;
    setUsers(users.filter(u => u.id !== id));
    showToast(`User ${name} berhasil dihapus.`);
    try {
      await fetch('/api/users/list', { method: 'POST', body: JSON.stringify({ action: 'delete', userId: id }) });
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: number | string, name: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: "Active" } : u));
    showToast(`User ${name} berhasil disetujui (Approved).`);
    try {
      await fetch('/api/users/list', { method: 'POST', body: JSON.stringify({ action: 'approve', userId: id }) });
    } catch (e) {
      console.error(e);
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
        <div className="flex gap-3">
          <div className="relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search users by email..." className="bg-[#18182e] border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#c9a84c] w-64" />
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
          onClick={() => setActiveTab('All')}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'All' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          All Users
        </button>
        <button 
          onClick={() => setActiveTab('Reviewer')}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Reviewer' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Reviewers
        </button>
        <button 
          onClick={() => setActiveTab('Author')}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Author' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Authors
        </button>
        <button 
          onClick={() => setActiveTab('Editor')}
          className={`px-4 py-3 font-bold transition-colors ${activeTab === 'Editor' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c]' : 'text-gray-400 hover:text-white border-b-2 border-transparent'}`}
        >
          Editors & Admins
        </button>
      </div>

      <div className="bg-[#18182e] rounded-2xl shadow-xl border border-gray-800 overflow-hidden mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-5 font-semibold">User Details</th>
                <th className="p-5 font-semibold">Global Role</th>
                <th className="p-5 font-semibold">Assigned Journals</th>
                <th className="p-5 font-semibold">Status</th>
                <th className="p-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.filter(u => {
                if (activeTab === 'All') return true;
                if (activeTab === 'Editor') return u.role.toLowerCase() === 'editor' || u.role.toLowerCase() === 'admin';
                return u.role.toLowerCase() === activeTab.toLowerCase();
              }).map((user) => (
                <tr key={user.id} className="hover:bg-[#1a1a2e] transition-colors">
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
              ))}
            </tbody>
          </table>
        </div>
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
                  <option>Author</option>
                  <option>Reviewer</option>
                  <option>Editor</option>
                  <option>Journal Manager</option>
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
                  <input value={editFormData.phone || ''} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">ID Akademik</label>
                  <input value={editFormData.orcid || ''} onChange={e => setEditFormData({...editFormData, orcid: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Google Scholar</label>
                  <input value={editFormData.googleScholar || ''} onChange={e => setEditFormData({...editFormData, googleScholar: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Scopus</label>
                  <input value={editFormData.scopus || ''} onChange={e => setEditFormData({...editFormData, scopus: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Web of Science (WoS)</label>
                  <input value={editFormData.wos || ''} onChange={e => setEditFormData({...editFormData, wos: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">SINTA</label>
                  <input value={editFormData.sinta || ''} onChange={e => setEditFormData({...editFormData, sinta: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Change Role</label>
                  <select value={editFormData.role || 'Author'} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="w-full bg-[#0a0a14] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#c9a84c]">
                    <option value="Author">Author</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
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
    </div>
  );
}
