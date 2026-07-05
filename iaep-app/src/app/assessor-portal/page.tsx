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
        setError(data.error || "Invalid Access Code.");
      }
    } catch (err) {
      setError("An error occurred while logging in.");
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
      setError("Please add at least one question.");
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
        setError(data.error || "Failed to submit exam.");
      }
    } catch (err) {
      setError("An error occurred while submitting.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="assessor-wrap">
        <div className="assessor-card success-card">
          <h1>✅ Exam Generated Successfully</h1>
          <p>The exam questions and time limit have been securely saved for candidate <strong>{candidate?.name}</strong>.</p>
          <p>The candidate's status is now "Token Emailed". They can take the exam on the certification page using their Candidate ID and Email.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Generate Another Exam</button>
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
            <h2>Assessor Portal</h2>
            <p>Enter your system-generated Access Code to configure a candidate's exam.</p>
          </div>
          <form onSubmit={handleLogin} className="assessor-form">
            <div className="form-group">
              <label>Access Code</label>
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
              {loading ? "Authenticating..." : "Access Portal"}
            </button>
          </form>
        </div>
      ) : (
        <div className="assessor-dashboard">
          <div className="dashboard-header">
            <div>
              <h2>Exam Configuration Studio</h2>
              <p>Designing Multiple Choice Exam for:</p>
              <h3 style={{ color: "#c9a84c", margin: "4px 0" }}>{candidate.name} ({candidate.id})</h3>
              <p style={{ opacity: 0.7 }}>Scheme: {candidate.cert}</p>
            </div>
            <div className="timer-config">
              <label>Time Limit (Minutes)</label>
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
              <h3>📝 Draft New Question</h3>
              <form onSubmit={addQuestion} className="question-form">
                <div className="form-group">
                  <label>Question Text</label>
                  <textarea 
                    rows={3} 
                    value={qText} 
                    onChange={e => setQText(e.target.value)} 
                    placeholder="Type the question here..." 
                    required 
                  />
                </div>
                
                <div className="options-grid">
                  <div className="form-group">
                    <label>Option A</label>
                    <input type="text" value={optA} onChange={e => setOptA(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Option B</label>
                    <input type="text" value={optB} onChange={e => setOptB(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Option C</label>
                    <input type="text" value={optC} onChange={e => setOptC(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Option D</label>
                    <input type="text" value={optD} onChange={e => setOptD(e.target.value)} required />
                  </div>
                </div>

                <div className="answer-row">
                  <div className="form-group">
                    <label>Correct Answer</label>
                    <select value={correctAns} onChange={e => setCorrectAns(e.target.value as any)}>
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Score (Points)</label>
                    <input type="number" value={score} onChange={e => setScore(Number(e.target.value))} min={1} required />
                  </div>
                </div>

                <button type="submit" className="btn-secondary">+ Add Question to Exam</button>
              </form>
            </div>

            <div className="preview-panel">
              <h3>📋 Exam Paper Preview</h3>
              <p style={{ opacity: 0.7, marginBottom: "16px", fontSize: "14px" }}>Total Questions: {questions.length} | Max Score: {questions.reduce((a, b) => a + b.score, 0)}</p>
              
              <div className="q-list">
                {questions.length === 0 ? (
                  <div className="empty-state">No questions added yet.</div>
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
                      <div className="q-footer">Points: {q.score}</div>
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
                {submitting ? "Saving Exam..." : "Finalize & Generate Exam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
