"use client";

import { useState, useEffect } from "react";

interface Question {
  id: string;
  scheme: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  score: number;
}

interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cert: string;
  method: string;
  schedule: string;
  status: string;
  zoomLink?: string;
}

const initialQuestions: Question[] = [
  {
    id: "Q-001",
    scheme: "Certified Research & Innovation Professional (CRIP)",
    questionText: "What is the primary purpose of a double-blind peer review in academic publishing?",
    options: {
      A: "To hide the identity of both authors and reviewers to prevent bias",
      B: "To double the speed of review processing",
      C: "To allow authors to edit their work twice before publishing",
      D: "To ensure that two editors review the submission"
    },
    correctAnswer: "A",
    score: 10
  },
  {
    id: "Q-002",
    scheme: "Certified Scholarly Publishing Specialist (CSPS)",
    questionText: "Which index requires a minimum of 2 years of publication history before a journal can apply?",
    options: {
      A: "Google Scholar",
      B: "Scopus / Web of Science",
      C: "ISSN Portal",
      D: "Crossref DOI"
    },
    correctAnswer: "B",
    score: 10
  },
  {
    id: "Q-003",
    scheme: "Certified Academic Quality Auditor (CAQA)",
    questionText: "Under ASIA guidelines, what is the main objective of the Quality Assurance & Accreditation Board?",
    options: {
      A: "To coordinate international student exchanges",
      B: "To accredit curriculum, study programs, and higher education partners",
      C: "To manage financial royalties for book publishing",
      D: "To conduct online AI training sessions"
    },
    correctAnswer: "B",
    score: 10
  }
];

const initialCandidates: Candidate[] = [
  { id: "C-901", name: "Dr. Amanda Lee", phone: "+6281370062009", cert: "Professional (P-CRIP)", method: "Online Interview (Zoom)", schedule: "20 July 2026, 10:00", status: "Awaiting Zoom Link" },
  { id: "C-902", name: "Prof. Salim Wijaya", phone: "+6281234567890", cert: "Senior Fellow (SF-CAEM)", method: "Multiple Choice Exam", schedule: "22 July 2026, 14:00", status: "Token Emailed" },
  { id: "C-903", name: "Rina Kartika, M.Si.", phone: "+6289876543210", cert: "Associate (A-CSPS)", method: "Online Interview (Zoom)", schedule: "25 July 2026, 09:30", status: "Awaiting Zoom Link" }
];

const getWhatsAppText = (c: Candidate) => {
  const base = `Halo ${c.name}, kami dari Board of Certification ASIACERT (APASIFIC). `;
  if (c.status === "Awaiting Zoom Link") {
    return base + `Registrasi Anda untuk sertifikasi ${c.cert} telah kami terima. Kami akan segera mengirimkan tautan Zoom ujian wawancara Anda.`;
  }
  if (c.status === "Zoom Link Sent") {
    return base + `Berikut adalah tautan Zoom Meeting untuk ujian wawancara Anda: ${c.zoomLink || ''}\nJadwal: ${c.schedule}. Harap hadir tepat waktu.`;
  }
  if (c.status === "Token Emailed") {
    return base + `Token dan petunjuk untuk Ujian Pilihan Berganda (MCQ) Anda telah dikirimkan ke email Anda. Jadwal ujian: ${c.schedule}.`;
  }
  if (c.status === "PASSED") {
    return base + `Selamat! Anda dinyatakan LULUS ujian sertifikasi ${c.cert}. Sertifikat digital resmi Anda akan diterbitkan segera.`;
  }
  if (c.status === "FAILED") {
    return base + `Kami menginformasikan bahwa Anda belum memenuhi standar kelulusan untuk sertifikasi ${c.cert}. Anda dapat mengajukan pendaftaran ulang di gelombang berikutnya.`;
  }
  return base + `Menghubungi terkait pendaftaran sertifikasi ${c.cert} Anda.`;
};

export default function CertificationsAdmin() {
  const [activeTab, setActiveTab] = useState<"candidates" | "questions">("candidates");
  
  // States for Candidates
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [zoomInputs, setZoomInputs] = useState<Record<string, string>>({});

  // States for Question Bank
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedScheme, setSelectedScheme] = useState("Certified Research & Innovation Professional (CRIP)");
  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAns, setCorrectAns] = useState<"A" | "B" | "C" | "D">("A");
  const [score, setScore] = useState(10);
  const [filterScheme, setFilterScheme] = useState("All");

  const schemes = [
    "Certified Research & Innovation Professional (CRIP)",
    "Certified Academic Event Manager (CAEM)",
    "Certified Scholarly Publishing Specialist (CSPS)",
    "Certified Academic Mobility Advisor (CAMA)",
    "Certified Science & Technology Innovator (CSTI)",
    "Certified Community Development Practitioner (CCDP)",
    "Certified Academic Quality Auditor (CAQA)",
    "Certified Digital Education & AI Educator (CDAE)",
    "Certified Early-Career Scholar (CECS)",
    "Certified Academic Leadership & Excellence Fellow (CALEF)"
  ];

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/certifications/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (e) { console.error(e); }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/certifications/questions");
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchCandidates();
    fetchQuestions();
  }, []);

  // Handler to assign Zoom link
  const handleAssignZoom = async (id: string) => {
    const link = zoomInputs[id];
    if (!link) return;

    const cand = candidates.find(c => c.id === id);
    if (!cand) return;

    try {
      const res = await fetch("/api/certifications/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cand.id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          cert: cand.cert,
          method: cand.method,
          schedule: cand.schedule,
          status: "Zoom Link Sent",
          zoomLink: link
        })
      });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (e) { console.error(e); }
  };

  // Handler to mark pass/fail
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;

    try {
      const res = await fetch("/api/certifications/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cand.id,
          name: cand.name,
          email: cand.email,
          phone: cand.phone,
          cert: cand.cert,
          method: cand.method,
          schedule: cand.schedule,
          status: newStatus,
          zoomLink: cand.zoomLink
        })
      });
      if (res.ok) {
        fetchCandidates();
      }
    } catch (e) { console.error(e); }
  };

  // Handler to add a new question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText || !optA || !optB || !optC || !optD) return;

    const payload = {
      scheme: selectedScheme,
      questionText,
      options: { A: optA, B: optB, C: optC, D: optD },
      correctAnswer: correctAns,
      score: Number(score)
    };

    try {
      const res = await fetch("/api/certifications/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchQuestions();
        // Reset inputs
        setQuestionText("");
        setOptA("");
        setOptB("");
        setOptC("");
        setOptD("");
        setCorrectAns("A");
        setScore(10);
      }
    } catch (err) { console.error(err); }
  };

  // Handler to delete a question
  const handleDeleteQuestion = async (id: string) => {
    try {
      const res = await fetch(`/api/certifications/questions?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) { console.error(e); }
  };

  const filteredQuestions = filterScheme === "All" ? questions : questions.filter(q => q.scheme === filterScheme);

  return (
    <div className="adm-cert-wrap">
      {/* Header */}
      <div className="adm-cert-header">
        <div>
          <h1 className="adm-cert-title">Certification Exam Management</h1>
          <p className="adm-cert-subtitle">Manage candidate enrollments and configure Multiple Choice Question Banks for assessors.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        <button className={`adm-tab-btn ${activeTab === "candidates" ? "active" : ""}`} onClick={() => setActiveTab("candidates")}>
          👤 Candidates Registry
          <span className="adm-tab-badge">{candidates.length}</span>
        </button>
        <button className={`adm-tab-btn ${activeTab === "questions" ? "active" : ""}`} onClick={() => setActiveTab("questions")}>
          📚 MCQ Question Bank Editor
          <span className="adm-tab-badge">{questions.length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="adm-panel">
        {activeTab === "candidates" && (
          <div className="adm-tab-content">
            <h3 className="adm-sec-title">Active Candidate Registrations</h3>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr className="adm-thead">
                    <th>Candidate</th>
                    <th>Phone / WhatsApp</th>
                    <th>Certification / Scheme</th>
                    <th>Method</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions / Zoom Link</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id} className="adm-tr">
                      <td>
                        <div className="cand-name">{c.name}</div>
                        <div className="cand-id">ID: {c.id}</div>
                        {c.email && <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>{c.email}</div>}
                      </td>
                      <td>
                        {c.phone ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <span style={{ fontSize: "12px", fontFamily: "monospace", color: "rgba(255,255,255,0.8)" }}>{c.phone}</span>
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(getWhatsAppText(c))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "3px 8px",
                                background: "#25D366",
                                color: "#000",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 700,
                                textDecoration: "none",
                                width: "fit-content",
                                transition: "opacity 0.2s"
                              }}
                              onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
                              onMouseOut={e => e.currentTarget.style.opacity = "1"}
                              title="Kirim Pesan WhatsApp"
                            >
                              💬 Kirim WA
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <div className="cand-cert">{c.cert}</div>
                      </td>
                      <td>
                        <span className={`cand-method ${c.method.toLowerCase().includes("zoom") || c.method.toLowerCase().includes("interview") ? "zoom" : "mcq"}`}>
                          {c.method.toLowerCase().includes("zoom") || c.method.toLowerCase().includes("interview") ? "💻 Online Interview" : 
                           c.method.toLowerCase().includes("central") ? "🏛️ Central Hub Registry" : "📝 Multiple Choice"}
                        </span>
                      </td>
                      <td>
                        <div className="cand-sched">{c.schedule}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${c.status.toLowerCase().replace(/ /g, "-")}`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {c.method.includes("Zoom") && c.status === "Awaiting Zoom Link" ? (
                          <div className="zoom-assign-row">
                            <input
                              type="text"
                              className="zoom-input"
                              placeholder="Paste Zoom URL..."
                              value={zoomInputs[c.id] || ""}
                              onChange={e => setZoomInputs({ ...zoomInputs, [c.id]: e.target.value })}
                            />
                            <button className="zoom-btn" onClick={() => handleAssignZoom(c.id)}>Send</button>
                          </div>
                        ) : c.status === "Zoom Link Sent" || c.status === "Token Emailed" ? (
                          <div className="action-btns-row">
                            <button className="action-btn pass" onClick={() => handleUpdateStatus(c.id, "PASSED")}>✓ Pass</button>
                            <button className="action-btn fail" onClick={() => handleUpdateStatus(c.id, "FAILED")}>✗ Fail</button>
                          </div>
                        ) : (
                          <span className="action-done">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="adm-tab-content grid-2">
            {/* Left: Create Question Form */}
            <div className="adm-form-wrap">
              <h3 className="adm-sec-title">Add New MCQ to Question Bank</h3>
              <form className="adm-form" onSubmit={handleAddQuestion}>
                <div className="form-group">
                  <label className="form-label">Certification Scheme</label>
                  <select className="form-select" value={selectedScheme} onChange={e => setSelectedScheme(e.target.value)}>
                    {schemes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Enter the question query..."
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-options-grid">
                  <div className="form-group">
                    <label className="form-label">Option A</label>
                    <input type="text" className="form-input" placeholder="Choice A" value={optA} onChange={e => setOptA(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option B</label>
                    <input type="text" className="form-input" placeholder="Choice B" value={optB} onChange={e => setOptB(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option C</label>
                    <input type="text" className="form-input" placeholder="Choice C" value={optC} onChange={e => setOptC(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Option D</label>
                    <input type="text" className="form-input" placeholder="Choice D" value={optD} onChange={e => setOptD(e.target.value)} required />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Correct Answer</label>
                    <select className="form-select" value={correctAns} onChange={e => setCorrectAns(e.target.value as any)}>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Score Weight</label>
                    <input type="number" className="form-input" value={score} onChange={e => setScore(Number(e.target.value))} min={1} required />
                  </div>
                </div>

                <button type="submit" className="form-submit-btn">✓ Save to Question Bank</button>
              </form>
            </div>

            {/* Right: Question List */}
            <div className="adm-list-wrap">
              <div className="list-header-row">
                <h3 className="adm-sec-title">Question List</h3>
                <select className="form-select filter-select" value={filterScheme} onChange={e => setFilterScheme(e.target.value)}>
                  <option value="All">All Schemes</option>
                  {schemes.map(s => <option key={s} value={s}>{s.split(" ")[0]} ({s.substring(s.lastIndexOf("(") + 1, s.lastIndexOf(")"))})</option>)}
                </select>
              </div>

              <div className="question-list">
                {filteredQuestions.length === 0 ? (
                  <div className="list-empty">No questions found in this scheme.</div>
                ) : (
                  filteredQuestions.map(q => (
                    <div key={q.id} className="q-card">
                      <div className="q-card-header">
                        <span className="q-id">{q.id}</span>
                        <span className="q-scheme">{q.scheme.split(" ")[0]} ({q.scheme.substring(q.scheme.lastIndexOf("(") + 1, q.scheme.lastIndexOf(")"))})</span>
                        <button className="q-del-btn" onClick={() => handleDeleteQuestion(q.id)}>Delete</button>
                      </div>
                      <div className="q-text">{q.questionText}</div>
                      <div className="q-options">
                        {Object.entries(q.options).map(([key, val]) => (
                          <div key={key} className={`q-opt ${q.correctAnswer === key ? "correct" : ""}`}>
                            <strong>{key}:</strong> {val}
                          </div>
                        ))}
                      </div>
                      <div className="q-score">Weight: {q.score} Points</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .adm-cert-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 60px;
          font-family: 'Inter', sans-serif;
        }
        .adm-cert-header {
          margin-bottom: 8px;
        }
        .adm-cert-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f0f8;
          margin: 0 0 6px;
        }
        .adm-cert-subtitle {
          font-size: 13.5px;
          color: rgba(255,255,255,0.35);
          margin: 0;
        }

        /* Tabs */
        .adm-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 1px;
        }
        .adm-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          font-size: 13.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-tab-btn:hover {
          color: rgba(255,255,255,0.8);
        }
        .adm-tab-btn.active {
          color: #c9a84c;
          border-color: #c9a84c;
        }
        .adm-tab-badge {
          font-size: 10.5px;
          font-weight: 700;
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.45);
          padding: 1px 6px;
          border-radius: 20px;
        }
        .adm-tab-btn.active .adm-tab-badge {
          background: rgba(201,168,76,0.15);
          color: #c9a84c;
        }

        /* Panel */
        .adm-panel {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .adm-tab-content {
          padding: 24px;
        }
        .adm-tab-content.grid-2 {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 24px;
        }
        @media (max-width: 1000px) {
          .adm-tab-content.grid-2 { grid-template-columns: 1fr; }
        }
        .adm-sec-title {
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 18px;
        }

        /* Table */
        .adm-table-wrap {
          overflow-x: auto;
        }
        .adm-table {
          width: 100%;
          border-collapse: collapse;
        }
        .adm-thead th {
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.01);
        }
        .adm-tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .adm-tr:last-child { border-bottom: none; }
        .adm-tr:hover { background: rgba(255,255,255,0.02); }
        .adm-tr td {
          padding: 16px;
          vertical-align: middle;
        }
        .cand-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .cand-id { font-size: 11px; color: rgba(255,255,255,0.25); font-family: monospace; }
        .cand-cert { font-size: 13px; color: #c9a84c; font-weight: 500; }
        .cand-sched { font-size: 13px; color: rgba(255,255,255,0.4); }
        .cand-method {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .cand-method.zoom { background: rgba(96,165,250,0.08); color: #60a5fa; }
        .cand-method.mcq { background: rgba(167,139,250,0.08); color: #a78bfa; }
        .status-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 20px;
        }
        .status-badge.awaiting-zoom-link { background: rgba(245,158,11,0.08); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
        .status-badge.zoom-link-sent { background: rgba(96,165,250,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
        .status-badge.token-emailed { background: rgba(52,211,153,0.08); color: #34d399; border: 1px solid rgba(52,211,153,0.2); }
        .status-badge.passed { background: rgba(52,211,153,0.12); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
        .status-badge.failed { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.3); }

        /* Zoom assign */
        .zoom-assign-row {
          display: inline-flex;
          gap: 6px;
          width: 220px;
        }
        .zoom-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px;
          padding: 5px 8px;
          font-size: 11.5px;
          color: #fff;
          outline: none;
        }
        .zoom-input:focus { border-color: rgba(201,168,76,0.3); }
        .zoom-btn {
          background: #c9a84c;
          color: #000;
          border: none;
          font-size: 11.5px;
          font-weight: 700;
          padding: 0 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .action-btns-row {
          display: inline-flex;
          gap: 6px;
        }
        .action-btn {
          border: none;
          border-radius: 6px;
          padding: 5px 12px;
          font-size: 11.5px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .action-btn:hover { opacity: 0.85; }
        .action-btn.pass { background: #34d399; color: #000; }
        .action-btn.fail { background: #f87171; color: #000; }
        .action-done { color: rgba(255,255,255,0.15); font-size: 12px; }

        /* Form creator */
        .adm-form-wrap {
          border-right: 1px solid rgba(255,255,255,0.06);
          padding-right: 24px;
        }
        @media (max-width: 1000px) {
          .adm-form-wrap { border-right: none; padding-right: 0; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 24px; }
        }
        .adm-form { display: flex; flex-direction: column; gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 10.5px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; }
        .form-select, .form-input, .form-textarea {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 13px;
          color: #fff;
          outline: none;
        }
        .form-select option { background: #05050a; color: #fff; }
        .form-select:focus, .form-input:focus, .form-textarea:focus { border-color: rgba(201,168,76,0.35); }
        .form-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 120px; gap: 12px; }
        .form-submit-btn {
          background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
          color: #000;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .form-submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(201,168,76,0.25); }

        /* List wrap */
        .list-header-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
        .filter-select { font-size: 11.5px; padding: 6px 10px; width: 220px; }
        .question-list { display: flex; flex-direction: column; gap: 12px; max-height: 520px; overflow-y: auto; }
        .q-card { background: rgba(255,255,255,0.015); border: 1px solid rgba(255,255,255,0.05); border-radius: 10px; padding: 16px; }
        .q-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .q-id { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.25); font-family: monospace; }
        .q-scheme { font-size: 10px; font-weight: 700; background: rgba(201,168,76,0.1); color: #c9a84c; padding: 2px 6px; border-radius: 20px; }
        .q-del-btn { margin-left: auto; background: transparent; border: none; color: #f87171; font-size: 11.5px; font-weight: 600; cursor: pointer; opacity: 0.6; transition: opacity 0.15s; }
        .q-del-btn:hover { opacity: 1; }
        .q-text { font-size: 13.5px; font-weight: 600; color: #fff; margin-bottom: 10px; line-height: 1.5; }
        .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        @media (max-width: 700px) { .q-options { grid-template-columns: 1fr; } }
        .q-opt { font-size: 12px; color: rgba(255,255,255,0.4); padding: 6px 10px; border-radius: 6px; background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); }
        .q-opt.correct { background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.15); color: #34d399; }
        .q-score { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 600; }
        .list-empty { text-align: center; padding: 40px; color: rgba(255,255,255,0.2); font-size: 13.5px; }
      `}</style>
    </div>
  );
}
