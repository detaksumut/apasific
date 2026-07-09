"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrgMember {
  no: number;
  level: string;
  position: string;
  name: string;
  division: string;
  photo?: string;
}

export default function OrgStructureAdminPage() {
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<OrgMember | null>(null);
  const [formData, setFormData] = useState<Partial<OrgMember>>({});
  const [saving, setSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/org-structure');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: OrgMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      position: member.position,
      division: member.division,
      photo: member.photo
    });
    setPhotoPreview(member.photo || '');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPhotoPreview(base64);
        setFormData({ ...formData, photo: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setFormData({ ...formData, photo: '' });
  };

  const handleSave = async () => {
    if (!editingMember) return;
    setSaving(true);
    try {
      const res = await fetch('/api/org-structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          no: editingMember.no,
          ...formData
        })
      });
      if (res.ok) {
        await fetchData();
        setEditingMember(null);
      } else {
        alert("Failed to save");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "40px", color: "#e8e8f0" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "40px", color: "#e8e8f0", background: "#05050a", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#c9a84c", marginBottom: "8px" }}>Organization Structure</h1>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>Manage member positions, names, and photos</p>
        </div>
        <Link href="/dashboard/admin">
          <button style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 20px", 
            color: "#e8e8f0", borderRadius: "8px", cursor: "pointer", transition: "all 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Back to Dashboard
          </button>
        </Link>
      </div>

      <div style={{
        background: "rgba(13,13,26,0.8)",
        border: "1px solid rgba(201,168,76,0.15)",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 100px 1fr 1fr 1fr 100px",
          padding: "16px 24px",
          borderBottom: "1px solid rgba(201,168,76,0.15)",
          background: "rgba(201,168,76,0.06)",
        }}>
          {["No.", "Photo", "Position", "Name", "Division", "Actions"].map((h, i) => (
            <div key={i} style={{ fontSize: "12px", fontWeight: 700, color: "#c9a84c", textTransform: "uppercase" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {members.map((m, i) => (
          <div key={m.no} style={{
            display: "grid",
            gridTemplateColumns: "60px 100px 1fr 1fr 1fr 100px",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
            alignItems: "center",
          }}>
            <div style={{ fontSize: "14px", color: "#4b5563" }}>{String(m.no).padStart(2, "0")}</div>
            <div>
              <img 
                src={m.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || m.position)}&background=131326&color=c9a84c&bold=true`}
                alt="Photo"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(201,168,76,0.3)" }}
              />
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{m.position}</div>
            <div style={{ fontSize: "14px", color: m.name ? "#e8e8f0" : "#6b7280" }}>{m.name || "—"}</div>
            <div style={{ fontSize: "13px", color: "#9ca3af" }}>{m.division}</div>
            <div>
              <button 
                onClick={() => handleEdit(m)}
                style={{
                  background: "rgba(201,168,76,0.1)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.4)",
                  padding: "6px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,0.2)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(201,168,76,0.1)"}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 99999,
          padding: "20px"
        }}>
          <div style={{
            background: "#0d0d1a", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "24px",
            width: "100%", maxWidth: "500px", padding: "32px",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#c9a84c", marginBottom: "24px" }}>
              Edit {editingMember.level}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <img 
                  src={photoPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || editingMember.position)}&background=131326&color=c9a84c&bold=true`}
                  alt="Preview"
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #c9a84c" }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{
                    background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: "8px", 
                    color: "#e8e8f0", fontSize: "13px", cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)",
                    textAlign: "center"
                  }}>
                    Upload New Photo
                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                  </label>
                  {photoPreview && (
                    <button onClick={handleRemovePhoto} style={{
                      background: "transparent", color: "#ef4444", border: "none", fontSize: "12px", cursor: "pointer"
                    }}>
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Position / Jabatan</label>
                <input 
                  type="text" 
                  value={formData.position || ''} 
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px", borderRadius: "8px", color: "#e8e8f0", outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Name</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px", borderRadius: "8px", color: "#e8e8f0", outline: "none"
                  }}
                  placeholder="Leave empty for TBA"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>Division / Bidang</label>
                <input 
                  type="text" 
                  value={formData.division || ''} 
                  onChange={(e) => setFormData({...formData, division: e.target.value})}
                  style={{
                    width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px", borderRadius: "8px", color: "#e8e8f0", outline: "none"
                  }}
                />
              </div>

            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "32px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setEditingMember(null)}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 24px",
                  borderRadius: "8px", color: "#e8e8f0", cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: "#c9a84c", border: "none", padding: "10px 24px",
                  borderRadius: "8px", color: "#05050a", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
