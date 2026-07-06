import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";
import Script from "next/script";


export const metadata: Metadata = {
  title: "ASIA – Association of Asia Pacific Academician",
  description: "Uniting scholars, researchers, and professionals across Asia Pacific.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#05050a]">
        {/* Global Lively Background - Premium Dark Gold Glow */}
        <div className="fixed inset-0 z-[-1] bg-[#05050a]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#05050a] via-[#0d0d1a] to-[#05050a]"></div>
          <div 
            className="absolute inset-0 opacity-30" 
            style={{ 
              background: 'radial-gradient(circle at 50% 30%, rgba(201, 168, 76, 0.15) 0%, transparent 60%)' 
            }}
          ></div>
        </div>

        {/* Navigation */}
        <div dangerouslySetInnerHTML={{ __html: `<nav class="navbar" id="navbar">
    <div class="nav-container">
      <!-- Logo -->
      <a href="/" class="nav-logo">
        <div class="logo-icon">
          <!-- Logo image: place your file at public/images/logo.png -->
          <img id="nav-logo-img"
               src="/logo-apasific.png"
               alt="ASIA Logo"
               width="44" height="44"
               onerror="this.style.display='none';document.getElementById('nav-logo-svg').style.display='block';"
               style="object-fit:contain;border-radius:50%;" />
          <svg id="nav-logo-svg" width="44" height="44" viewBox="0 0 44 44" fill="none" style="display:none">
            <circle cx="22" cy="22" r="21" stroke="#c9a84c" stroke-width="1.5"/>
            <circle cx="22" cy="22" r="17" stroke="#c9a84c" stroke-width="0.75" stroke-dasharray="2 2"/>
            <path d="M22 8L26 16H18L22 8Z" fill="#c9a84c"/>
            <rect x="19" y="15" width="6" height="8" fill="#c9a84c" rx="0.5"/>
            <path d="M14 22C14 22 18 20 22 20C26 20 30 22 30 22" stroke="#c9a84c" stroke-width="1.2"/>
            <path d="M22 28V34M18 34H26" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="logo-text">
          <span class="logo-main">ASIA</span>
          <span class="logo-sub">Association of Asia Pacific Academician</span>
        </div>
      </a>

      <!-- Nav Links -->
      <ul class="nav-links" id="nav-links">
        <li><a href="/" class="nav-link active" id="nav-home">HOME</a></li>

        <li class="has-dropdown">
          <a href="/#about" class="nav-link" id="nav-about">ABOUT ASIA <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/vision-mission.html"><span class="dd-icon">◈</span> Vision &amp; Mission</a>
            <a href="/#leadership"><span class="dd-icon">◈</span> Leadership</a>
            <a href="/#org-structure"><span class="dd-icon">◈</span> Organizational Structure</a>
            <a href="/#regional-chapters"><span class="dd-icon">◈</span> Regional Chapters</a>
            <a href="/#strategic-partners"><span class="dd-icon">◈</span> Strategic Partners</a>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#academic-divisions" class="nav-link" id="nav-divisions">ACADEMIC DIVISIONS <span class="chevron">▾</span></a>
          <div class="dropdown dropdown-wide">
            <div class="dd-grid">
              <a href="accounting.html"><span class="dd-icon">◈</span> Accounting, Auditing &amp; Taxation</a>
              <a href="business.html"><span class="dd-icon">◈</span> Business, Management &amp; Entrepreneurship</a>
              <a href="finance.html"><span class="dd-icon">◈</span> Finance, Banking &amp; Investment</a>
              <a href="hr.html"><span class="dd-icon">◈</span> Human Resources &amp; Organizational Development</a>
              <a href="economics.html"><span class="dd-icon">◈</span> Economics &amp; Public Policy</a>
              <a href="education.html"><span class="dd-icon">◈</span> Education &amp; Academic Development</a>
              <a href="law.html"><span class="dd-icon">◈</span> Law, Governance &amp; Public Administration</a>
              <a href="it.html"><span class="dd-icon">◈</span> IT, AI &amp; Digital Transformation</a>
              <a href="engineering.html"><span class="dd-icon">◈</span> Engineering, Technology &amp; Applied Sciences</a>
              <a href="social.html"><span class="dd-icon">◈</span> Social Sciences, Humanities &amp; Communication</a>
              <a href="tourism.html"><span class="dd-icon">◈</span> Tourism, Hospitality &amp; Creative Economy</a>
              <a href="health.html"><span class="dd-icon">◈</span> Health, Public Health &amp; Well-Being</a>
              <a href="agriculture.html"><span class="dd-icon">◈</span> Agriculture, Environment &amp; Sustainability</a>
              <a href="islamic.html"><span class="dd-icon">◈</span> Islamic Studies, Ethics &amp; Spirituality</a>
            </div>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#strategic-bodies" class="nav-link" id="nav-bodies">STRATEGIC BODIES <span class="chevron">▾</span></a>
          <div class="dropdown dropdown-wide">
            <div class="dd-grid">
              <a href="/asiacert.html" target="_blank"><span class="dd-icon">◈</span> ASIACERT</a>
              <a href="/boc.html" target="_blank"><span class="dd-icon">◈</span> ASIA Board of Certification (BOC)</a>
              <a href="/research.html" target="_blank"><span class="dd-icon">◈</span> Research &amp; Innovation Council</a>
              <a href="/conference.html" target="_blank"><span class="dd-icon">◈</span> Conference &amp; Academic Forum</a>
              <a href="/publication.html" target="_blank"><span class="dd-icon">◈</span> Publication &amp; Knowledge Center</a>
              <a href="/mobility.html" target="_blank"><span class="dd-icon">◈</span> Academic Mobility Center</a>
              <a href="/competition.html" target="_blank"><span class="dd-icon">◈</span> Competition Center</a>
              <a href="/community.html" target="_blank"><span class="dd-icon">◈</span> Community Engagement &amp; SDGs Center</a>
              <a href="/quality.html" target="_blank"><span class="dd-icon">◈</span> Quality Assurance &amp; Accreditation Board</a>
              <a href="/academy.html" target="_blank"><span class="dd-icon">◈</span> Digital Academy &amp; AI Center</a>
              <a href="/young.html" target="_blank"><span class="dd-icon">◈</span> Young Academician Network</a>
              <a href="/awards.html" target="_blank"><span class="dd-icon">◈</span> Awards &amp; Recognition Council</a>
            </div>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#publications" class="nav-link" id="nav-publications">PUBLICATIONS <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/#journals"><span class="dd-icon">◈</span> Academic Journals</a>
            <a href="/#proceedings"><span class="dd-icon">◈</span> Proceedings</a>
            <a href="/#books"><span class="dd-icon">◈</span> Academic Books</a>
            <a href="/#monographs"><span class="dd-icon">◈</span> Monographs</a>
            <a href="/#policy-briefs"><span class="dd-icon">◈</span> Policy Briefs</a>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#programs" class="nav-link" id="nav-programs">PROGRAMS <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/#certification"><span class="dd-icon">◈</span> Certification</a>
            <a href="/#conferences"><span class="dd-icon">◈</span> Conferences</a>
            <a href="/#competitions"><span class="dd-icon">◈</span> Competitions</a>
            <a href="/#training"><span class="dd-icon">◈</span> Training</a>
            <a href="/#mobility"><span class="dd-icon">◈</span> Mobility</a>
            <a href="/#research-grants"><span class="dd-icon">◈</span> Research Grants</a>
            <a href="/#awards-prog"><span class="dd-icon">◈</span> Awards</a>
          </div>
        </li>
      </ul>

      <div style={{ display: 'flex', gap: '10px' }}>
        <a href="/auth/login" className="btn-join" id="btn-login-nav">LOGIN / DAFTAR</a>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>` }} />
        
        {children}

        {/* Footer */}
        <div dangerouslySetInnerHTML={{ __html: `<footer class="footer">
    <div class="footer-top">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="footer-logo">
              <svg width="40" height="40" viewBox="0 0 44 44" fill="none">
                <circle cx="22" cy="22" r="21" stroke="#c9a84c" stroke-width="1.5"/>
                <path d="M22 8L26 16H18L22 8Z" fill="#c9a84c"/>
                <rect x="19" y="15" width="6" height="8" fill="#c9a84c" rx="0.5"/>
                <path d="M22 28V34M18 34H26" stroke="#c9a84c" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <div>
                <p class="footer-logo-main">ASIA</p>
                <p class="footer-logo-sub">Association of Asia Pacific Academician</p>
              </div>
            </div>
            <p class="footer-desc">Uniting scholars, researchers, and professionals across Asia Pacific to advance knowledge, foster collaboration, and shape a better future.</p>
            <p class="footer-motto">✦ Excellence and Competent and Dedicated is Our Tradition ✦</p>
            <div class="footer-contact" style="margin-top: 24px;">
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.6;"><strong>Alamat:</strong> Jalan Perjuangan No. 80 B, Kelurahan Sei Kera Hilir, Kec. Medan Perjuangan, Medan – Sumatera Utara, Indonesia</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:admin@apasific.org" style="color: var(--gold); transition: color var(--transition);">admin@apasific.org</a></p>
              <p style="font-size: 12px; color: var(--text-muted);"><strong>Phone / WA:</strong> <a href="https://wa.me/6281370062009" target="_blank" style="color: var(--gold); transition: color var(--transition);">+62 813-7006-2009</a></p>
            </div>
          </div>

          <div class="footer-links-col">
            <h4>About ASIA</h4>
            <ul>
              <li><a href="/vision-mission.html">Vision &amp; Mission</a></li>
              <li><a href="#leadership">Leadership</a></li>
              <li><a href="#org-structure">Organizational Structure</a></li>
              <li><a href="#regional-chapters">Regional Chapters</a></li>
              <li><a href="#strategic-partners">Strategic Partners</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Programs</h4>
            <ul>
              <li><a href="#certification">Certification</a></li>
              <li><a href="#conferences">Conferences</a></li>
              <li><a href="#competitions">Competitions</a></li>
              <li><a href="#training">Training</a></li>
              <li><a href="#research-grants">Research Grants</a></li>
              <li><a href="#awards-prog">Awards</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Publications</h4>
            <ul>
              <li><a href="#journals">Academic Journals</a></li>
              <li><a href="#proceedings">Proceedings</a></li>
              <li><a href="#books">Academic Books</a></li>
              <li><a href="#monographs">Monographs</a></li>
              <li><a href="#policy-briefs">Policy Briefs</a></li>
            </ul>
          </div>
          <div class="footer-links-col" style="background: rgba(20,20,30,0.5); padding: 20px; border-radius: 12px; border: 1px solid rgba(201,168,76,0.3);">
            <h4 style="color: #c9a84c; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Official Bank Account
            </h4>
            <p style="color: #fff; font-weight: bold; margin-bottom: 8px; font-size: 13px;">Association of Asia Pacific Academician</p>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">Bank: Bank Negara Indonesia (BNI)</p>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 4px;">A/C No: <span style="color: #c9a84c; font-family: monospace; font-size: 15px; font-weight: bold;">7006002218</span></p>
            <p style="font-size: 13px; color: var(--text-muted);">Swift Code: BNINIDJA</p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2025 Association of Asia Pacific Academician (ASIA). All rights reserved. | Developed by PT. Bernas Sumut Jaya • Dilindungi Hak Cipta.</p>
        <div class="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Use</a>
          <a href="#">Sitemap</a>
        </div>
      </div>
    </div>
  </footer>` }} />
        <Script src="/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
