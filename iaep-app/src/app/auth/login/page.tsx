"use client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loginUser } from "@/app/actions/auth";
import { getDashboardPath } from "@/lib/roles";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'author' | 'staff'>('author');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const emailLower = email.toLowerCase().trim();

    try {
      const res = await loginUser(emailLower, password);
      if (res.success && res.user) {
        let role = res.user.role || "author";
        const isSuperAdminEmail = (emailLower === "detaksumut@gmail.com" || emailLower === "detaksumtu@gmail.com");
        const isDanilSupervisor = (emailLower === "danil@apasific.org");
        const isKadinEditor = (emailLower === "kadinmedan1@gmail.com");
        if (isSuperAdminEmail) {
          role = "admin";
        } else if (isDanilSupervisor) {
          role = "supervisor";
        } else if (isKadinEditor) {
          role = "editor";
        }
        document.cookie = `active_portal_role=${encodeURIComponent(role)}; path=/; max-age=2592000`;
        document.cookie = `user_role=${encodeURIComponent(role)}; path=/; max-age=2592000`;
        document.cookie = `user_name=${encodeURIComponent(isSuperAdminEmail ? "Super Administrator" : (isDanilSupervisor ? "Muhammad Danil" : (isKadinEditor ? "Muhibbuddin" : (res.user.full_name || "User"))))}; path=/; max-age=2592000`;
        if (res.user.id) {
          document.cookie = `supabase_fallback_session=${res.user.id}; path=/; max-age=604800`;
        }

        const redirectUrl = isSuperAdminEmail 
          ? "/dashboard/admin" 
          : (isDanilSupervisor ? "/dashboard/production/supervisor" : (isKadinEditor ? "/dashboard/editor" : getDashboardPath(role)));
        window.location.href = redirectUrl;
        return;
      } else {
        setErrorMessage(res.error || "Email atau password salah.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Terjadi kesalahan sistem.");
    }
    
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          background: #05050a;
        }
        /* Left Panel */
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
        .login-hero-text  { position: relative; z-index: 1; max-width: 440px; }
        .login-hero-text h1 {
          font-size: 32px; font-weight: 900;
          color: #fff; line-height: 1.25;
          margin-bottom: 14px;
        }
        .login-hero-text h1 span { color: #c9a84c; }
        
        .hero-tagline {
          font-size: 13px; font-weight: 900;
          color: #fff; letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 16px 0 10px;
          line-height: 1.4;
        }
        .hero-tagline span { 
          color: #c9a84c; 
          text-shadow: 0 0 10px rgba(201,168,76,0.3);
        }

        .hero-manifesto {
          color: rgba(255,255,255,0.7);
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .hero-pillars {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }
        .pillar-chip {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: #e8c96a;
          background: rgba(201,168,76,0.08);
          border: 1px solid rgba(201,168,76,0.25);
          padding: 4px 9px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .hero-badge {
          font-size: 11px;
          font-weight: 700;
          color: #a3c94c;
          background: rgba(163,201,76,0.08);
          border: 1px solid rgba(163,201,76,0.25);
          padding: 6px 10px;
          border-radius: 8px;
          margin-bottom: 14px;
          display: inline-block;
          letter-spacing: 0.5px;
        }

        .hero-disclaimer {
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          line-height: 1.5;
          margin-bottom: 16px;
          border-left: 2px solid rgba(201,168,76,0.4);
          padding-left: 10px;
        }

        .hero-philosophy {
          font-size: 11px;
          font-weight: 700;
          color: rgba(201,168,76,0.9);
          background: rgba(201,168,76,0.06);
          border: 1px dashed rgba(201,168,76,0.25);
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 20px;
          line-height: 1.5;
          letter-spacing: 0.3px;
        }

        .login-quote {
          border-left: 3px solid #c9a84c;
          padding-left: 16px;
          position: relative; z-index: 1;
        }
        .login-quote p { color: rgba(201,168,76,0.7); font-style: italic; font-size: 12px; line-height: 1.6; }

        /* Right Panel */
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
          max-width: 480px;
        }
        .login-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(201,168,76,0.7);
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 24px;
          transition: color 0.2s;
        }
        .login-back:hover { color: #c9a84c; }
        .login-title {
          font-size: 28px; font-weight: 800;
          color: #fff; margin-bottom: 6px;
        }
        .login-title span { color: #c9a84c; }
        
        @keyframes goldBlink {
          0%, 100% {
            opacity: 1;
            color: #fce38a;
            text-shadow: 0 0 10px rgba(201, 168, 76, 0.8), 0 0 20px rgba(201, 168, 76, 0.4);
          }
          50% {
            opacity: 0.35;
            color: #c9a84c;
            text-shadow: none;
          }
        }

        .login-subtitle { 
          color: #c9a84c; 
          font-size: 13px; 
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 24px; 
          animation: goldBlink 1.8s ease-in-out infinite;
          display: inline-block;
        }

        /* Role Selector Tabs */
        .portal-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 24px;
          gap: 4px;
        }
        .portal-tab-btn {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          color: rgba(255,255,255,0.6);
          background: transparent;
        }
        .portal-tab-btn.active {
          background: #c9a84c;
          color: #0d0d0d;
          box-shadow: 0 2px 10px rgba(201,168,76,0.3);
        }
        .portal-tab-btn.active-orcid {
          background: #a3c94c;
          color: #0d0d0d;
          box-shadow: 0 2px 10px rgba(163,201,76,0.3);
        }

        /* Policy Banner */
        .policy-card {
          background: rgba(163,201,76,0.06);
          border: 1px solid rgba(163,201,76,0.25);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .policy-card h4 {
          color: #a3c94c;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .policy-card p {
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        /* ORCID Button */
        .btn-orcid-main {
          width: 100%;
          background: #a3c94c;
          border: none;
          color: #0a1f05;
          font-weight: 800; font-size: 15px;
          padding: 16px 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.2s;
          margin-bottom: 20px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 20px rgba(163,201,76,0.25);
          text-decoration: none;
        }
        .btn-orcid-main:hover {
          background: #b5dc57;
          transform: translateY(-2px);
          box-shadow: 0 6px 26px rgba(163,201,76,0.4);
        }

        /* Educational List */
        .orcid-benefits {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .orcid-benefits h5 {
          color: rgba(255,255,255,0.8);
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .orcid-benefits ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .orcid-benefits li {
          color: rgba(255,255,255,0.55);
          font-size: 12px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .orcid-benefits li strong {
          color: #a3c94c;
        }

        /* Form Fields */
        .form-group { margin-bottom: 20px; }
        .form-label {
          display: block;
          color: rgba(255,255,255,0.5);
          font-size: 11px; font-weight: 700;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
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

        .login-register {
          text-align: center; margin-top: 24px;
          color: rgba(255,255,255,0.35); font-size: 13px;
        }
        .login-register a { color: #a3c94c; font-weight: 700; text-decoration: none; transition: color 0.2s; }
        .login-register a:hover { color: #fff; }
      `}</style>

      <div className="login-page">

        {/* Left decorative panel */}
        <div className="login-left">
          <div className="login-brand-logo">
            <img src="/logobaru.png" alt="ASIA Logo" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <div>
              <div className="login-brand-name">ASIA</div>
              <div className="login-brand-sub">ASSOCIATION OF ASIA PACIFIC ACADEMICIAN</div>
            </div>
          </div>

          <div className="login-hero-text">
            <h1>Portal Akademik <span>Terpadu</span> Asia Pasifik</h1>
            
            <div className="hero-tagline">
              RESEARCH QUALITY IS NOT OPTIONAL.<br />
              <span>IT IS OUR STANDARD.</span>
            </div>

            <p className="hero-manifesto">
              APASIFIC tidak hanya menerbitkan naskah. Kami membangun proses ilmiah yang menjaga kualitas, integritas, dan kontribusi penelitian.
            </p>

            <div className="hero-pillars">
              <span className="pillar-chip">✦ INTEGRITY</span>
              <span className="pillar-chip">✦ RIGOR</span>
              <span className="pillar-chip">✦ EVIDENCE</span>
              <span className="pillar-chip">✦ TRANSPARENCY</span>
              <span className="pillar-chip">✦ SCHOLARLY IMPACT</span>
            </div>

            <div className="hero-badge">
              AT-RQS™ Adaptive Multi-Taxonomy Evaluation
            </div>

            <p className="hero-disclaimer">
              Every manuscript is evaluated through a structured editorial and independent peer-review process.
            </p>

            <div className="hero-philosophy">
              Author submits. Reviewer evaluates. Editor decides. APASIFIC preserves the record.
            </div>
          </div>

          <div className="login-quote">
            <p>
              "Excellence and Competent and Dedicated is Our Tradition"
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="login-card">

            <Link href="/" className="login-back">
              ← Kembali ke Beranda
            </Link>

            <h1 className="login-title">Masuk ke <span>APASIFIC</span></h1>
            <p className="login-subtitle">Research Quality &amp; Intelligence Ecosystem</p>

            {/* Portal Tab Switcher */}
            <div className="portal-tabs">
              <button 
                type="button" 
                className={`portal-tab-btn ${activeTab === 'author' ? 'active-orcid' : ''}`}
                onClick={() => setActiveTab('author')}
              >
                Peneliti &amp; Author (ORCID)
              </button>
              <button 
                type="button" 
                className={`portal-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => setActiveTab('staff')}
              >
                Editorial &amp; Staf
              </button>
            </div>

            {errorMessage && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            {activeTab === 'author' ? (
              <div>
                {/* Policy Notice */}
                <div className="policy-card">
                  <h4>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.5 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.5 3h2v8h-2V9.5zm4 0h2v1.1c.6-.8 1.5-1.3 2.5-1.3 2 0 3 1.4 3 3.4V17.5h-2v-4c0-1.2-.5-2-1.6-2-1.2 0-1.9.9-1.9 2.2V17.5h-2V9.5z"/>
                    </svg>
                    Kebijakan Autentikasi Peneliti APASIFIC
                  </h4>
                  <p>
                    Sesuai standar integritas publikasi APASIFIC, Penulis Korespondensi (<em>Corresponding Author</em>) wajib menghubungkan akun <strong>ORCID iD yang terautentikasi</strong> untuk mengakses portal submisi naskah.
                  </p>
                </div>

                {/* Main ORCID Action Button */}
                <a href="/api/auth/orcid" className="btn-orcid-main">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm-1.5 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-.5 3h2v8h-2V9.5zm4 0h2v1.1c.6-.8 1.5-1.3 2.5-1.3 2 0 3 1.4 3 3.4V17.5h-2v-4c0-1.2-.5-2-1.6-2-1.2 0-1.9.9-1.9 2.2V17.5h-2V9.5z"/>
                  </svg>
                  <span>Connect with ORCID iD</span>
                </a>

                {/* Benefits */}
                <div className="orcid-benefits">
                  <h5>MENGAPA APASIFIC MENGGUNAKAN ORCID?</h5>
                  <ul>
                    <li>✦ <strong>Reduced Author Name Ambiguity</strong>: Membedakan identitas peneliti dengan nama yang sama.</li>
                    <li>✦ <strong>Persistent Researcher Identification</strong>: Keterhubungan persisten ke rekaman ilmiah global.</li>
                    <li>✦ <strong>Interoperabilitas Metadata Global</strong>: Standar Crossref, DOI, dan repositori internasional.</li>
                  </ul>
                </div>

                <div className="login-register">
                  Belum memiliki ORCID iD?{" "}
                  <a href="https://orcid.org/register" target="_blank" rel="noopener noreferrer">
                    Daftar Gratis di orcid.org ↗
                  </a>
                </div>
              </div>
            ) : (
              <div>
                {/* Staff / Editorial Login Form */}
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">EMAIL STAF / DEWAN REDAKSI</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="editor@apasific.org"
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
                      placeholder="Masukkan password staf"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-login"
                    disabled={loading}
                  >
                    {loading ? "Memproses..." : "Masuk ke Panel Editorial"}
                  </button>
                </form>

                <div className="login-register" style={{ marginTop: '16px' }}>
                  Akses khusus Dewan Redaksi, Reviewer, dan Administrator APASIFIC.
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0f', color: '#c9a84c' }}>Memuat...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
