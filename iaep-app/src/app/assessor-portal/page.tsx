"use client";

import { useState } from "react";
import "./assessor.css"; // We will create this simple CSS file

interface Question {
  id: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  score: number;
}

export default function AssessorPortal() {
  const [accessCode, setAccessCode] = useState("");
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState(60); // Default 60 minutes
  
  // Current question draft
  const [qText, setQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAns, setCorrectAns] = useState<"A" | "B" | "C" | "D">("A");
  const [score, setScore] = useState(10);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/certifications/assessor?code=${encodeURIComponent(accessCode)}`);
      const data = await res.json();
      
      if (res.ok) {
        setCandidate(data.candidate);
        if (data.candidate.exam_questions) {
          setQuestions(data.candidate.exam_questions);
        }
        if (data.candidate.exam_time_limit) {
          setTimeLimit(data.candidate.exam_time_limit);
        }
      } else {
        setError(data.error || "Kode Akses Tidak Valid.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat masuk.");
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText || !optA || !optB || !optC || !optD) return;

    const newQ: Question = {
      id: `Q-${Date.now()}`,
      questionText: qText,
      options: { A: optA, B: optB, C: optC, D: optD },
      correctAnswer: correctAns,
      score: Number(score)
    };

    setQuestions([...questions, newQ]);
    
    // Reset draft
    setQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectAns("A");
    setScore(10);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmitExam = async () => {
    if (questions.length === 0) {
      setError("Harap tambahkan setidaknya satu pertanyaan.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/certifications/assessor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessCode,
          questions,
          timeLimit: Number(timeLimit)
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Gagal mengirim ujian.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengirim.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="assessor-wrap">
        <div className="assessor-card success-card">
          <h1>✅ Ujian Berhasil Dibuat</h1>
          <p>Pertanyaan ujian dan batas waktu telah disimpan dengan aman untuk kandidat <strong>{candidate?.name}</strong>.</p>
          <p>Status kandidat sekarang "Token Diemail". Mereka dapat mengikuti ujian di halaman sertifikasi menggunakan ID Kandidat dan Email mereka.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Buat Ujian Lainnya</button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessor-wrap">
      {!candidate ? (
        <div className="assessor-card login-card">
          <div className="card-header">
            <div className="logo-box">A</div>
            <h2>Portal Asesor</h2>
            <p>Masukkan Kode Akses yang dihasilkan sistem Anda untuk mengonfigurasi ujian kandidat.</p>
          </div>
          <form onSubmit={handleLogin} className="assessor-form">
            <div className="form-group">
              <label>Kode Akses</label>
              <input 
                type="text" 
                placeholder="e.g. AX-1234" 
                value={accessCode} 
                onChange={(e) => setAccessCode(e.target.value)} 
                required 
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Mengautentikasi..." : "Akses Portal"}
            </button>
          </form>
        </div>
      ) : (
        <div className="assessor-dashboard">
          <div className="dashboard-header">
            <div>
              <h2>Studio Konfigurasi Ujian</h2>
              <p>Merancang Ujian Pilihan Ganda untuk:</p>
              <h3 style={{ color: "#c9a84c", margin: "4px 0" }}>{candidate.name} ({candidate.id})</h3>
              <p style={{ opacity: 0.7 }}>Skema: {candidate.cert}</p>
            </div>
            <div className="timer-config">
              <label>Batas Waktu (Menit)</label>
              <input 
                type="number" 
                value={timeLimit} 
                onChange={(e) => setTimeLimit(Number(e.target.value))} 
                min={5} 
              />
            </div>
          </div>

          <div className="dashboard-body">
            <div className="editor-panel">
              <h3>📝 Draf Pertanyaan Baru</h3>
              <form onSubmit={addQuestion} className="question-form">
                <div className="form-group">
                  <label>Teks Pertanyaan</label>
                  <textarea 
                    rows={3} 
                    value={qText} 
                    onChange={e => setQText(e.target.value)} 
                    placeholder="Ketik pertanyaan di sini..." 
                    required 
                  />
                </div>
                
                <div className="options-grid">
                  <div className="form-group">
                    <label>Pilihan A</label>
                    <input type="text" value={optA} onChange={e => setOptA(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Pilihan B</label>
                    <input type="text" value={optB} onChange={e => setOptB(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Pilihan C</label>
                    <input type="text" value={optC} onChange={e => setOptC(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Pilihan D</label>
                    <input type="text" value={optD} onChange={e => setOptD(e.target.value)} required />
                  </div>
                </div>

                <div className="answer-row">
                  <div className="form-group">
                    <label>Jawaban Benar</label>
                    <select value={correctAns} onChange={e => setCorrectAns(e.target.value as any)}>
                      <option value="A">Pilihan A</option>
                      <option value="B">Pilihan B</option>
                      <option value="C">Pilihan C</option>
                      <option value="D">Pilihan D</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Skor (Poin)</label>
                    <input type="number" value={score} onChange={e => setScore(Number(e.target.value))} min={1} required />
                  </div>
                </div>

                <button type="submit" className="btn-secondary">+ Tambahkan Pertanyaan ke Ujian</button>
              </form>
            </div>

            <div className="preview-panel">
              <h3>📋 Pratinjau Kertas Ujian</h3>
              <p style={{ opacity: 0.7, marginBottom: "16px", fontSize: "14px" }}>Total Pertanyaan: {questions.length} | Skor Maksimal: {questions.reduce((a, b) => a + b.score, 0)}</p>
              
              <div className="q-list">
                {questions.length === 0 ? (
                  <div className="empty-state">Belum ada pertanyaan yang ditambahkan.</div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="q-card">
                      <div className="q-header">
                        <strong>Q{idx + 1}.</strong> {q.questionText}
                        <button className="del-btn" onClick={() => removeQuestion(q.id)}>🗑️</button>
                      </div>
                      <div className="q-opts">
                        <div className={q.correctAnswer === "A" ? "correct" : ""}>A. {q.options.A}</div>
                        <div className={q.correctAnswer === "B" ? "correct" : ""}>B. {q.options.B}</div>
                        <div className={q.correctAnswer === "C" ? "correct" : ""}>C. {q.options.C}</div>
                        <div className={q.correctAnswer === "D" ? "correct" : ""}>D. {q.options.D}</div>
                      </div>
                      <div className="q-footer">Poin: {q.score}</div>
                    </div>
                  ))
                )}
              </div>

              {error && <div className="error-msg" style={{ marginTop: "16px" }}>{error}</div>}
              
              <button 
                className="btn-primary submit-exam-btn" 
                onClick={handleSubmitExam}
                disabled={submitting || questions.length === 0}
              >
                {submitting ? "Menyimpan Ujian..." : "Selesaikan & Buat Ujian"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
