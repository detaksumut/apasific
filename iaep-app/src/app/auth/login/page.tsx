"use client";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("detaksumut@gmail.com");
  const [password, setPassword] = useState("Mikr@210669Mpi");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const emailLower = email.toLowerCase().trim();

    setTimeout(() => {
      if (emailLower === "detaksumut@gmail.com" && password.trim() === "Mikr@210669Mpi") {
        document.cookie = "mock_user=admin; path=/; max-age=2592000";
        document.cookie = "mock_user_name=Super Admin; path=/; max-age=2592000";
        window.location.href = "/dashboard/admin";
        return;
      }
      if (emailLower === "marahman2169@gmail.com") {
        document.cookie = "mock_user=editor; path=/; max-age=2592000";
        document.cookie = "mock_user_name=M. A. Rahman (Editor); path=/; max-age=2592000";
        window.location.href = "/dashboard/editor";
        return;
      }
      if (emailLower === "kadinmedan1@gmail.com") {
        document.cookie = "mock_user=reviewer; path=/; max-age=2592000";
        document.cookie = "mock_user_name=Kadin Medan (Reviewer); path=/; max-age=2592000";
        window.location.href = "/dashboard/reviews/pending";
        return;
      }
      if (emailLower === "kadsumut@gmail.com") {
        document.cookie = "mock_user=submitter; path=/; max-age=2592000";
        document.cookie = "mock_user_name=Kad Sumut (Author); path=/; max-age=2592000";
        window.location.href = "/dashboard";
        return;
      }
      try {
        const storedUsers = JSON.parse(localStorage.getItem("mock_users") || "[]");
        const matchedUser = storedUsers.find(
          (u: any) => u.email.toLowerCase().trim() === emailLower && u.password === password
        );
        if (matchedUser) {
          let mockRole = "submitter";
          let redirectPath = "/dashboard";
          if (matchedUser.role === "editor") { mockRole = "editor"; redirectPath = "/dashboard/editor"; }
          else if (matchedUser.role === "reviewer") { mockRole = "reviewer"; redirectPath = "/dashboard/reviews/pending"; }
          else if (matchedUser.role === "admin") { mockRole = "admin"; redirectPath = "/dashboard/admin"; }
          document.cookie = `mock_user=${mockRole}; path=/; max-age=2592000`;
          document.cookie = `mock_user_name=${matchedUser.fullName}; path=/; max-age=2592000`;
          window.location.href = redirectPath;
          return;
        }
      } catch (err) { console.error(err); }
      setLoading(false);
      alert("Email atau password salah.");
    }, 800);
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: #05050a;
        }
        /* ── Left Panel ── */
        .login-left {
          display: none;
          width: 45%;
          background: linear-gradient(145deg, #0d0d1a 0%, #12122a 40%, #0a0a16 100%);
          border-right: 1px solid rgba(201,168,76,0.15);
          position: relative;
          overflow: hidden;
          padding: 60px 56px;
          flex-direction: column;
          justify-content: space-between;
        }
        @media (min-width: 900px) { .login-left { display: flex; } }
        .login-left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 480px; height: 480px;
          background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-brand-logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .login-brand-logo img {
          width: 52px; height: 52px;
          border-radius: 50%;
          object-fit: contain;
          border: 1.5px solid rgba(201,168,76,0.4);
        }
        .login-brand-name { font-size: 22px; font-weight: 800; color: #c9a84c; letter-spacing: 2px; }
        .login-brand-sub  { font-size: 11px; color: rgba(201,168,76,0.6); letter-spacing: 1px; margin-top: 2px; }
        .login-hero-text  { position: relative; z-index: 1; }
        .login-hero-text h1 {
          font-size: 38px; font-weight: 900;
          color: #fff; line-height: 1.2;
          margin-bottom: 20px;
        }
        .login-hero-text h1 span { color: #c9a84c; }
        .login-hero-text p { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.7; max-width: 340px; }
        .login-quote {
          border-left: 3px solid #c9a84c;
          padding-left: 20px;
          position: relative; z-index: 1;
        }
        .login-quote p { color: rgba(201,168,76,0.7); font-style: italic; font-size: 13px; line-height: 1.7; }

        /* ── Right Panel ── */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 48px 32px;
          background: #08080f;
        }
        .login-card {
          width: 100%;
          max-width: 460px;
        }
        .login-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(201,168,76,0.7);
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 36px;
          transition: color 0.2s;
        }
        .login-back:hover { color: #c9a84c; }
        .login-title {
          font-size: 28px; font-weight: 800;
          color: #fff; margin-bottom: 6px;
        }
        .login-title span { color: #c9a84c; }
        .login-subtitle { color: rgba(255,255,255,0.4); font-size: 13px; margin-bottom: 36px; }

        /* ORCID Button */
        .btn-orcid {
          width: 100%;
          background: rgba(163,201,76,0.12);
          border: 1.5px solid rgba(163,201,76,0.4);
          color: #a3c94c;
          font-weight: 700; font-size: 14px;
          padding: 13px 20px;
          border-radius: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s;
          margin-bottom: 28px;
          letter-spacing: 0.3px;
        }
        .btn-orcid:hover {
          background: rgba(163,201,76,0.2);
          border-color: #a3c94c;
        }

        /* Divider */
        .login-divider {
          display: flex; align-items: center; gap: 16px;
          margin-bottom: 28px;
        }
        .login-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .login-divider-text { color: rgba(255,255,255,0.3); font-size: 11px; font-weight: 700; letter-spacing: 2px; white-space: nowrap; }

        /* Form Fields */
        .form-group { margin-bottom: 22px; }
        .form-label {
          display: block;
          color: rgba(255,255,255,0.5);
          font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.1);
          color: #fff;
          font-size: 14px;
          padding: 13px 16px;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        .form-input::placeholder { color: rgba(255,255,255,0.2); }
        .form-input:focus {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.05);
        }

        /* Remember / Forgot row */
        .form-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px;
        }
        .form-remember {
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.4); font-size: 13px;
          cursor: pointer;
        }
        .form-remember input { accent-color: #c9a84c; }
        .form-forgot {
          color: #c9a84c; font-size: 13px; font-weight: 600;
          text-decoration: none; transition: color 0.2s;
        }
        .form-forgot:hover { color: #fff; }

        /* Login Button */
        .btn-login {
          width: 100%;
          background: linear-gradient(135deg, #c9a84c 0%, #e8c96a 50%, #c9a84c 100%);
          background-size: 200% auto;
          color: #0d0d0d;
          font-weight: 800; font-size: 15px;
          padding: 14px 20px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background-position 0.4s, transform 0.2s, box-shadow 0.2s;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 20px rgba(201,168,76,0.3);
        }
        .btn-login:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 6px 28px rgba(201,168,76,0.45);
          transform: translateY(-1px);
        }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }

        /* Register link */
        .login-register {
          text-align: center; margin-top: 28px;
          color: rgba(255,255,255,0.35); font-size: 13px;
        }
        .login-register a { color: #c9a84c; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .login-register a:hover { color: #fff; }
      `}</style>

      <div className="login-page">

        {/* ── Left decorative panel ── */}
        <div className="login-left">
          <div className="login-brand-logo">
            <img src="/logo-apasific.png" alt="ASIA Logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <div className="login-brand-name">ASIA</div>
              <div className="login-brand-sub">ASSOCIATION OF ASIA PACIFIC ACADEMICIAN</div>
            </div>
          </div>

          <div className="login-hero-text">
            <h1>Portal Akademik <span>Terpadu</span> Asia Pasifik</h1>
            <p>
              Platform ekosistem akademik terintegrasi untuk peneliti, dosen, dan profesional di seluruh kawasan Asia Pasifik.
            </p>
          </div>

          <div className="login-quote">
            <p>
              "Excellence and Competent and Dedicated is Our Tradition"
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-right">
          <div className="login-card">

            <Link href="/" className="login-back">
              ← Kembali ke Beranda
            </Link>

            <h1 className="login-title">Masuk ke <span>IAEP</span></h1>
            <p className="login-subtitle">Integrated Academic Ecosystem Platform</p>

            {/* ORCID */}
            <button type="button" className="btn-orcid">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.5 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.5 3h2v8h-2V9.5zm4 0h2v1.1c.6-.8 1.5-1.3 2.5-1.3 2 0 3 1.4 3 3.4V17.5h-2v-4c0-1.2-.5-2-1.6-2-1.2 0-1.9.9-1.9 2.2V17.5h-2V9.5z"/>
              </svg>
              Login dengan ORCID
            </button>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">ATAU EMAIL</span>
              <div className="login-divider-line" />
            </div>

            {/* Form */}
            <form>
              <div className="form-group">
                <label className="form-label">EMAIL</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="nama@institusi.ac.id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PASSWORD</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label className="form-remember">
                  <input type="checkbox" /> Ingat saya
                </label>
                <a href="#" className="form-forgot">Lupa Password?</a>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  document.cookie = "mock_user=admin; path=/; max-age=2592000";
                  document.cookie = "mock_user_name=Super Admin; path=/; max-age=2592000";
                  window.location.href = "/dashboard/admin";
                }}
                className="btn-login"
              >
                Masuk Paksa (Admin)
              </button>
            </form>

            <div className="login-register">
              Belum memiliki akun?{" "}
              <Link href="/auth/register">Daftar sekarang</Link>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
