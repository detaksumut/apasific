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
    <html lang="id" suppressHydrationWarning>
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
        <li><a href="/" class="nav-link active" id="nav-home">BERANDA</a></li>

        <li class="has-dropdown">
          <a href="/#about" class="nav-link" id="nav-about">ABOUT ASIA <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/#vision-mission"><span class="dd-icon">◈</span> Vision &amp; Mission</a>
            <a href="/leadership"><span class="dd-icon">◈</span> Leadership</a>
            <a href="/organization-structure"><span class="dd-icon">◈</span> Organizational Structure</a>
            <a href="/certification"><span class="dd-icon">◈</span> Certification Structure</a>
            <a href="/journal-structure"><span class="dd-icon">◈</span> Journal Structure</a>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#academic-divisions" class="nav-link" id="nav-divisions">DIVISI AKADEMIK <span class="chevron">▾</span></a>
          <div class="dropdown dropdown-wide">
            <div class="dd-grid">
              <a href="/accounting.html"><span class="dd-icon">◈</span> Akuntansi, Audit &amp; Perpajakan</a>
              <a href="/business.html"><span class="dd-icon">◈</span> Administrasi &amp; Manajemen Bisnis</a>
              <a href="/economics.html"><span class="dd-icon">◈</span> Ekonomi Pembangunan &amp; Keuangan</a>
              <a href="/law.html"><span class="dd-icon">◈</span> Ilmu Hukum &amp; Hak Asasi Manusia</a>
              <a href="/education.html"><span class="dd-icon">◈</span> Pendidikan Dasar, Menengah &amp; Tinggi</a>
              <a href="/medical.html"><span class="dd-icon">◈</span> Kedokteran, Kesehatan Masyarakat &amp; Keperawatan</a>
              <a href="/engineering.html"><span class="dd-icon">◈</span> Teknik Sipil, Mesin &amp; Elektro</a>
              <a href="/computer.html"><span class="dd-icon">◈</span> Ilmu Komputer &amp; Teknologi Informasi</a>
              <a href="/agriculture.html"><span class="dd-icon">◈</span> Pertanian, Kehutanan &amp; Perikanan</a>
              <a href="/social.html"><span class="dd-icon">◈</span> Sosiologi &amp; Ilmu Pengetahuan Budaya</a>
              <a href="/arts.html"><span class="dd-icon">◈</span> Seni, Desain &amp; Media Kreatif</a>
              <a href="/environmental.html"><span class="dd-icon">◈</span> Ilmu Lingkungan &amp; Keberlanjutan</a>
              <a href="/political.html"><span class="dd-icon">◈</span> Ilmu Politik &amp; Hubungan Internasional</a>
              <a href="/tourism.html"><span class="dd-icon">◈</span> Pariwisata &amp; Manajemen Perhotelan</a>
            </div>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#strategic-bodies" class="nav-link" id="nav-bodies">BADAN STRATEGIS <span class="chevron">▾</span></a>
          <div class="dropdown dropdown-wide">
            <div class="dd-grid">
              <a href="/asiacert.html" target="_blank"><span class="dd-icon">◈</span> ASIACERT</a>
              <a href="/boc.html" target="_blank"><span class="dd-icon">◈</span> Dewan Sertifikasi (BOC) ASIA</a>
              <a href="/research.html" target="_blank"><span class="dd-icon">◈</span> Dewan Riset &amp; Inovasi</a>
              <a href="/conference.html" target="_blank"><span class="dd-icon">◈</span> Konferensi &amp; Forum Akademik</a>
              <a href="/publication.html" target="_blank"><span class="dd-icon">◈</span> Pusat Publikasi &amp; Pengetahuan</a>
              <a href="/mobility.html" target="_blank"><span class="dd-icon">◈</span> Pusat Mobilitas Akademik</a>
              <a href="/competition.html" target="_blank"><span class="dd-icon">◈</span> Pusat Kompetisi</a>
              <a href="/community.html" target="_blank"><span class="dd-icon">◈</span> Keterlibatan Komunitas &amp; Pusat SDGs</a>
              <a href="/quality.html" target="_blank"><span class="dd-icon">◈</span> Dewan Penjaminan Mutu &amp; Akreditasi</a>
              <a href="/academy.html" target="_blank"><span class="dd-icon">◈</span> Akademi Digital &amp; Pusat AI</a>
              <a href="/young.html" target="_blank"><span class="dd-icon">◈</span> Jaringan Akademisi Muda</a>
              <a href="/awards.html" target="_blank"><span class="dd-icon">◈</span> Dewan Penghargaan &amp; Rekognisi</a>
            </div>
          </div>
        </li>

        <li class="has-dropdown">
          <a href="/#publications" class="nav-link" id="nav-publications">PUBLIKASI <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/journals"><span class="dd-icon">◈</span> Jurnal Akademik</a>
            <a href="/#proceedings"><span class="dd-icon">◈</span> Prosiding</a>
            <a href="/#books"><span class="dd-icon">◈</span> Buku Akademik</a>
            <a href="/#monographs"><span class="dd-icon">◈</span> Monograf</a>
            <a href="/#policy-briefs"><span class="dd-icon">◈</span> Ringkasan Kebijakan</a>
          </div>
        </li>

        <li><a href="/bookstore" class="nav-link" id="nav-bookstore">TOKO BUKU</a></li>
        <li class="has-dropdown">
          <a href="/#programs" class="nav-link" id="nav-programs">PROGRAM <span class="chevron">▾</span></a>
          <div class="dropdown">
            <a href="/#certification"><span class="dd-icon">◈</span> Sertifikasi</a>
            <a href="/#conferences"><span class="dd-icon">◈</span> Konferensi</a>
            <a href="/#competitions"><span class="dd-icon">◈</span> Kompetisi</a>
            <a href="/#training"><span class="dd-icon">◈</span> Pelatihan</a>
            <a href="/#mobility"><span class="dd-icon">◈</span> Mobilitas</a>
            <a href="/#research-grants"><span class="dd-icon">◈</span> Hibah Penelitian</a>
            <a href="/#awards-prog"><span class="dd-icon">◈</span> Penghargaan</a>
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
            <p class="footer-desc">Menyatukan para cendekiawan, peneliti, dan profesional di seluruh Asia Pasifik untuk memajukan pengetahuan, mendorong kolaborasi, dan membentuk masa depan yang lebih baik.</p>
            <p class="footer-motto">✦ Keunggulan, Kompeten, dan Berdedikasi adalah Tradisi Kami ✦</p>
            <div class="footer-contact" style="margin-top: 24px;">
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px; line-height: 1.6;"><strong>Alamat:</strong> Jalan Perjuangan No. 80 B, Kelurahan Sei Kera Hilir, Kec. Medan Perjuangan, Medan – Sumatera Utara, Indonesia</p>
              <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><strong>Email:</strong> <a href="mailto:admin@apasific.org" style="color: var(--gold); transition: color var(--transition);">admin@apasific.org</a></p>
              <p style="font-size: 12px; color: var(--text-muted);"><strong>Phone / WA:</strong> <a href="https://wa.me/6281370062009" target="_blank" style="color: var(--gold); transition: color var(--transition);">+62 813-7006-2009</a></p>
            </div>
          </div>

          <div class="footer-links-col">
            <h4>Tentang ASIA</h4>
            <ul>
              <li><a href="/vision-mission.html">Visi &amp; Misi</a></li>
              <li><a href="#leadership">Kepemimpinan</a></li>
              <li><a href="/organization-structure">Struktur Organisasi</a></li>
              <li><a href="/certification">Struktur Sertifikasi</a></li>
              <li><a href="/journal">Struktur Jurnal</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Program Kami</h4>
            <ul>
              <li><a href="#certification">Sertifikasi</a></li>
              <li><a href="#conferences">Konferensi</a></li>
              <li><a href="#competitions">Kompetisi</a></li>
              <li><a href="#training">Pelatihan</a></li>
              <li><a href="#research-grants">Hibah Penelitian</a></li>
              <li><a href="#awards-prog">Penghargaan</a></li>
            </ul>
          </div>
          <div class="footer-links-col">
            <h4>Publikasi</h4>
            <ul>
              <li><a href="/journals">Jurnal Akademik</a></li>
              <li><a href="#proceedings">Prosiding</a></li>
              <li><a href="#books">Buku Akademik</a></li>
              <li><a href="#monographs">Monograf</a></li>
              <li><a href="#policy-briefs">Ringkasan Kebijakan</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2025 Association of Asia Pacific Academician (ASIA). Seluruh Hak Cipta Dilindungi Undang-Undang. | Developed by PT. Bernas Sumut Jaya</p>
        <div class="footer-bottom-links">
          <a href="#">Kebijakan Privasi</a>
          <a href="#">Syarat Penggunaan</a>
          <a href="#">Peta Situs</a>
        </div>
      </div>
    </div>
  </footer>` }} />
        <Script src="/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
