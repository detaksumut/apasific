import Link from "next/link";

export default function PendingReviews() {
  const assignments = [
    {
      id: 1,
      submissionId: 1045,
      title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
      round: 1,
      dateAssigned: "2026-07-02",
      dateDue: "2026-07-30",
      status: "pending",
    },
    {
      id: 2,
      submissionId: 1089,
      title: "Sustainable Development Goals in Pacific Island Nations: A Policy Analysis",
      round: 2,
      dateAssigned: "2026-07-04",
      dateDue: "2026-08-01",
      status: "pending",
    },
  ];

  const daysLeft = (due: string) => {
    const diff = Math.ceil((new Date(due).getTime() - Date.now()) / 86400000);
    return diff;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", margin: "0 0 5px" }}>
          Review <span style={{ color: "#c9a84c" }}>Pending</span>
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", margin: 0 }}>
          Naskah yang menunggu ulasan dari Anda.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 20px", minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f59e0b", fontFamily: "system-ui" }}>{assignments.length}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Perlu Direview</div>
        </div>
        <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 20px", minWidth: 120 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ef4444", fontFamily: "system-ui" }}>
            {assignments.filter(a => daysLeft(a.dateDue) <= 7).length}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Hampir Jatuh Tempo</div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Judul Naskah", "Putaran", "Ditugaskan", "Jatuh Tempo", "Aksi"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px", fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.3)", letterSpacing: "1px", textAlign: "left",
                }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "48px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  Tidak ada review yang pending. Kerja bagus!
                </td>
              </tr>
            ) : assignments.map(a => {
              const left = daysLeft(a.dateDue);
              const urgent = left <= 7;
              return (
                <tr key={a.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>ID Submission: #{a.submissionId}</div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: "rgba(66,133,244,0.15)", color: "#60a5fa",
                    }}>
                      Putaran {a.round}
                    </span>
                  </td>
                  <td style={{ padding: "16px", fontSize: 13, color: "rgba(255,255,255,0.45)" }}>{a.dateAssigned}</td>
                  <td style={{ padding: "16px" }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block",
                      background: urgent ? "rgba(239,68,68,0.15)" : "rgba(52,168,83,0.12)",
                      color: urgent ? "#f87171" : "#4ade80",
                    }}>
                      {a.dateDue}
                    </div>
                    <div style={{ fontSize: 10, color: urgent ? "#f87171" : "rgba(255,255,255,0.3)", marginTop: 3 }}>
                      {left > 0 ? `${left} hari lagi` : "Sudah lewat!"}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Link href={`/dashboard/reviews/${a.id}`} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                      background: "linear-gradient(135deg,#c9a84c,#e8c96a)",
                      color: "#0d0d0d", textDecoration: "none",
                      boxShadow: "0 2px 10px rgba(201,168,76,0.25)",
                      transition: "all 0.2s",
                    }}>
                      Mulai Review →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
