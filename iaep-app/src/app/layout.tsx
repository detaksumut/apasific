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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#05050a]" suppressHydrationWarning>
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
        <div style={{ position: 'relative', zIndex: 99999 }} dangerouslySetInnerHTML={{ __html: `<nav class="navbar" id="navbar">
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
            <a href="/organization-structure"><span class="dd-icon">◈</span> Organizational Structure</a>
            <a href="/certification"><span class="dd-icon">◈</span> Certification Structure</a>
            <a href="/journal"><span class="dd-icon">◈</span> Journal Structure</a>
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
            <a href="/journals"><span class="dd-icon">◈</span> Academic Journals</a>
            <a href="/#proceedings"><span class="dd-icon">◈</span> Proceedings</a>
            <a href="/#books"><span class="dd-icon">◈</span> Academic Books</a>
            <a href="/#monographs"><span class="dd-icon">◈</span> Monographs</a>
            <a href="/#policy-briefs"><span class="dd-icon">◈</span> Policy Briefs</a>
          </div>
        </li>

        <li><a href="/bookstore" class="nav-link" id="nav-bookstore">BOOK STORE</a></li>
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
        <li class="mobile-login-item">
          <a href="/auth/login" class="nav-link" style="color: #c9a84c; font-weight: bold;">LOGIN / DAFTAR</a>
        </li>
      </ul>
      <style>
        .mobile-login-item { display: none; }
        @media (max-width: 768px) {
          .mobile-login-item { display: block; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px; }
        }
      </style>
      <div class="nav-actions" style="display: flex; gap: 10px; align-items: center;">
        <div id="google_translate_element"></div>
        <div class="custom-lang-selector" id="custom-lang-selector">
          <div class="lang-btn" id="lang-btn">
            <img src="https://flagcdn.com/w20/id.png" alt="ID" id="current-lang-flag">
            <span class="chevron" style="margin-left:4px; font-size:10px;">▾</span>
          </div>
          <div class="lang-dropdown" id="lang-dropdown">
            <div class="lang-option" data-lang="id" data-flag="id.png"><img src="https://flagcdn.com/w20/id.png" alt="ID"> Indonesia</div>
            <div class="lang-option" data-lang="en" data-flag="gb.png"><img src="https://flagcdn.com/w20/gb.png" alt="EN"> English</div>
            <div class="lang-option" data-lang="ar" data-flag="sa.png"><img src="https://flagcdn.com/w20/sa.png" alt="AR"> العربية</div>
            <div class="lang-option" data-lang="zh-CN" data-flag="cn.png"><img src="https://flagcdn.com/w20/cn.png" alt="ZH"> 中文</div>
            <div class="lang-option" data-lang="ja" data-flag="jp.png"><img src="https://flagcdn.com/w20/jp.png" alt="JA"> 日本語</div>
            <div class="lang-option" data-lang="de" data-flag="de.png"><img src="https://flagcdn.com/w20/de.png" alt="DE"> Deutsch</div>
            <div class="lang-option" data-lang="fr" data-flag="fr.png"><img src="https://flagcdn.com/w20/fr.png" alt="FR"> Français</div>
            <div class="lang-option" data-lang="ko" data-flag="kr.png"><img src="https://flagcdn.com/w20/kr.png" alt="KO"> 한국어</div>
            <div class="lang-option" data-lang="th" data-flag="th.png"><img src="https://flagcdn.com/w20/th.png" alt="TH"> ไทย</div>
            <div class="lang-option" data-lang="vi" data-flag="vn.png"><img src="https://flagcdn.com/w20/vn.png" alt="VI"> Tiếng Việt</div>
            <div class="lang-option" data-lang="ru" data-flag="ru.png"><img src="https://flagcdn.com/w20/ru.png" alt="RU"> Русский</div>
            <div class="lang-option" data-lang="fa" data-flag="ir.png"><img src="https://flagcdn.com/w20/ir.png" alt="FA"> فارسی</div>
            <div class="lang-option" data-lang="ms" data-flag="my.png"><img src="https://flagcdn.com/w20/my.png" alt="MS"> Melayu</div>
            <div class="lang-option" data-lang="hi" data-flag="in.png"><img src="https://flagcdn.com/w20/in.png" alt="HI"> हिन्दी</div>
          </div>
        </div>
        <a href="/auth/login" class="btn-join" id="btn-login-nav">LOGIN / DAFTAR</a>
      </div>
      <button class="hamburger" id="hamburger-btn" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>` }} />
        
        <Script id="mobile-menu-handler" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              var btn = e.target.closest('#hamburger-btn');
              if (btn) {
                var nav = document.getElementById('nav-links');
                if (nav) {
                  nav.classList.toggle('open');
                  btn.classList.toggle('active');
                }
              }
            });
          `}
        </Script>
        
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'id',
                includedLanguages: 'id,en,ar,zh-CN,ja,de,fr,ko,th,vi,ru,fa,ms,hi',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }

            // Custom Language Switcher Logic
            (function initLangSwitcher() {
              if (typeof window === 'undefined') return;

              const setup = () => {
                const langBtn = document.getElementById('lang-btn');
                const langDropdown = document.getElementById('lang-dropdown');
                const options = document.querySelectorAll('.lang-option');
                const currentFlag = document.getElementById('current-lang-flag');

                if (!langBtn || !langDropdown) {
                  // Retry if DOM not ready
                  setTimeout(setup, 100);
                  return;
                }

                // Prevent multiple bindings
                if (langBtn.dataset.bound) return;
                langBtn.dataset.bound = "true";

                langBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  langDropdown.classList.toggle('show');
                });

                document.addEventListener('click', () => {
                  langDropdown.classList.remove('show');
                });

                options.forEach(opt => {
                  opt.addEventListener('click', () => {
                    const lang = opt.getAttribute('data-lang');
                    const flag = opt.getAttribute('data-flag');
                    
                    if(currentFlag) {
                      currentFlag.src = 'https://flagcdn.com/w20/' + flag;
                    }

                    // Set cookies manually to ensure it persists
                    document.cookie = 'googtrans=/auto/' + lang + '; path=/';
                    document.cookie = 'googtrans=/auto/' + lang + '; path=/; domain=' + window.location.hostname;

                    const select = document.querySelector('.goog-te-combo');
                    if(select) {
                      select.value = lang;
                      select.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                      // Fallback if widget hasn't loaded
                      window.location.reload();
                    }
                  });
                });

                // Check active language on load
                const match = document.cookie.match(/googtrans=\\/auto\\/([^;]+)/) || document.cookie.match(/googtrans=\\/[^\\/]+\\/([^;]+)/);
                if (match && match[1]) {
                  const activeLang = match[1];
                  const activeOpt = document.querySelector('.lang-option[data-lang="' + activeLang + '"]');
                  if(activeOpt && currentFlag) {
                    currentFlag.src = 'https://flagcdn.com/w20/' + activeOpt.getAttribute('data-flag');
                  }
                }
              };
              
              setup();
            })();
          `}
        </Script>

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
              <li><a href="/certification">Certification Structure</a></li>
              <li><a href="/journal">Journal Structure</a></li>
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
