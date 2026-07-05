export default function Home() {
  return (
    <main dangerouslySetInnerHTML={{ __html: `

  <!-- ═══════════════════════════════════════════
       HERO SECTION
  ═══════════════════════════════════════════ -->
  <section class="hero" id="home">
    <!-- Full-width background image — all content is inside the banner -->
    <div class="hero-bg-image">
      <img src="/banner-apasific.png" alt="ASIA – Association of Asia Pacific Academician" id="hero-bg-img" />
    </div>
    <!-- Logo overlay: di sebelah kanan teks ASSOCIATION di banner -->
    <div class="hero-logo-overlay">
      <img src="/logo-apasific.png"
           alt="ASIA Logo"
           class="hero-logo-img"
           onerror="this.style.display='none'" />
    </div>
    <!-- CTA Button Overlay -->
    <div class="hero-cta-overlay">
      <a href="/auth/membership" class="btn-primary" id="hero-become-member">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        BECOME A MEMBER
      </a>
      <a href="#programs" class="btn-outline" id="hero-explore">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        EXPLORE RESOURCES
      </a>
    </div>
    
    <!-- Stats Bar -->
    <div class="hero-stats">
      <div class="stats-container">
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <div><span class="stat-num" data-target="5000">0</span><span class="stat-plus">+</span><p class="stat-label">Members</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <div><span class="stat-num" data-target="25">0</span><span class="stat-plus">+</span><p class="stat-label">Countries</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <div><span class="stat-num" data-target="100">0</span><span class="stat-plus">+</span><p class="stat-label">Academic Disciplines</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <div><span class="stat-num" data-target="300">0</span><span class="stat-plus">+</span><p class="stat-label">Publications</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div><span class="stat-num" data-target="20">0</span><span class="stat-plus">+</span><p class="stat-label">Annual Events</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       ASIA SCHOLAR INDEX & ANALYTICS
  ═══════════════════════════════════════════ -->
  <section class="section index-section" id="scholar-analytics">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">RESEARCH IMPACT</p>
        <h2 class="section-title">Citation &amp; <span class="gold">H-Index Analytics</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-desc">Enterprise-grade tracking of academic citations, impact metrics, and open-access compliance across all publications affiliated with ASIA.</p>
      </div>

      <!-- Dashboard Grid -->
      <div class="analytics-dashboard-grid" data-aos="fade-up">
        <!-- Left: Scholar Metrics Table Card -->
        <div class="analytics-card metrics-card">
          <div class="card-header-with-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M12 20h9"/><path d="M3 20v-8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"/><path d="M13 20v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v8"/></svg>
            <h3>Citation Indices</h3>
          </div>
          <table class="scholar-metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th class="text-right">All</th>
                <th class="text-right">Since 2021</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="metric-name">Citations</td>
                <td class="metric-val text-right">14,850</td>
                <td class="metric-val text-right">9,420</td>
              </tr>
              <tr>
                <td class="metric-name">h-index</td>
                <td class="metric-val text-right">42</td>
                <td class="metric-val text-right">31</td>
              </tr>
              <tr>
                <td class="metric-name">i10-index</td>
                <td class="metric-val text-right">118</td>
                <td class="metric-val text-right">85</td>
              </tr>
            </tbody>
          </table>

          <div class="public-access-box">
            <div class="access-header">
              <span class="access-title">Public Access Compliance</span>
              <span class="access-badge">98.5% Green</span>
            </div>
            <p class="access-desc">184 of 187 articles indexed under ASIA division meet international public access requirements mandated by major funding bodies.</p>
            <div class="progress-bar-container">
              <div class="progress-fill" style="width: 98.5%"></div>
            </div>
          </div>
        </div>

        <!-- Right: Citation Graph Card -->
        <div class="analytics-card graph-card">
          <div class="card-header-with-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
            <h3>Annual Citations Tracker</h3>
          </div>
          
          <div class="graph-wrapper">
            <svg viewBox="0 0 600 280" class="scholar-bar-chart">
              <line x1="50" y1="40" x2="560" y2="40" class="grid-line" />
              <line x1="50" y1="90" x2="560" y2="90" class="grid-line" />
              <line x1="50" y1="140" x2="560" y2="140" class="grid-line" />
              <line x1="50" y1="190" x2="560" y2="190" class="grid-line" />
              <line x1="50" y1="240" x2="560" y2="240" class="grid-line" />
              <text x="35" y="45" class="chart-axis-text">2.5k</text>
              <text x="35" y="95" class="chart-axis-text">2.0k</text>
              <text x="35" y="145" class="chart-axis-text">1.5k</text>
              <text x="35" y="195" class="chart-axis-text">1.0k</text>
              <text x="35" y="245" class="chart-axis-text">0</text>
              <g class="chart-bar-group" data-value="620" data-year="2019">
                <rect x="75" y="178" width="36" height="62" rx="4" class="chart-rect" />
                <text x="93" y="260" class="chart-label-text">2019</text>
              </g>
              <g class="chart-bar-group" data-value="890" data-year="2020">
                <rect x="135" y="151" width="36" height="89" rx="4" class="chart-rect" />
                <text x="153" y="260" class="chart-label-text">2020</text>
              </g>
              <g class="chart-bar-group" data-value="1,240" data-year="2021">
                <rect x="195" y="116" width="36" height="124" rx="4" class="chart-rect" />
                <text x="213" y="260" class="chart-label-text">2021</text>
              </g>
              <g class="chart-bar-group" data-value="1,680" data-year="2022">
                <rect x="255" y="72" width="36" height="168" rx="4" class="chart-rect" />
                <text x="273" y="260" class="chart-label-text">2022</text>
              </g>
              <g class="chart-bar-group" data-value="2,120" data-year="2023">
                <rect x="315" y="28" width="36" height="212" rx="4" class="chart-rect" />
                <text x="333" y="260" class="chart-label-text">2023</text>
              </g>
              <g class="chart-bar-group" data-value="2,450" data-year="2024">
                <rect x="375" y="10" width="36" height="230" rx="4" class="chart-rect highlight" />
                <text x="393" y="260" class="chart-label-text">2024</text>
              </g>
              <g class="chart-bar-group" data-value="2,680" data-year="2025">
                <rect x="435" y="8" width="36" height="232" rx="4" class="chart-rect highlight" />
                <text x="453" y="260" class="chart-label-text">2025</text>
              </g>
              <g class="chart-bar-group" data-value="1,890" data-year="2026">
                <rect x="495" y="51" width="36" height="189" rx="4" class="chart-rect" />
                <text x="513" y="260" class="chart-label-text">2026</text>
              </g>
            </svg>
            <div id="chart-tooltip" class="chart-tooltip" style="display: none;"></div>
          </div>
        </div>
      </div>

      <!-- Top Articles List -->
      <div class="analytics-card articles-card" data-aos="fade-up" style="margin-top: 30px;">
        <div class="card-header-with-search">
          <div class="title-with-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <h3>Top Cited Publications</h3>
          </div>
          <div class="article-search-box">
            <input type="text" id="article-search-input" placeholder="Search publications, authors, or DOIs..." autocomplete="off" />
          </div>
        </div>

        <div class="articles-table-wrapper">
          <table class="articles-table" id="articles-table">
            <thead>
              <tr>
                <th>Publication Details</th>
                <th class="text-center">Citations</th>
                <th class="text-center">Year</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="articles-table-body">
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       ABOUT ASIA
  ═══════════════════════════════════════════ -->
  <section class="section about-section" id="about">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">WHO WE ARE</p>
        <h2 class="section-title">About <span class="gold">ASIA</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
      </div>

      <!-- Vision & Mission -->
      <div class="about-vm" id="vision-mission">
        <div class="vm-card">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h3>Our Vision</h3>
          <p>To become the leading academic association in Asia Pacific, recognized globally for excellence in knowledge creation, academic leadership, and sustainable impact.</p>
        </div>
        <div class="vm-card" style="animation-delay:0.15s">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3>Our Mission</h3>
          <p>To foster academic collaboration, promote research excellence, advance professional certification, and empower scholars across Asia Pacific through innovative programs and inclusive platforms.</p>
        </div>
        <div class="vm-card" style="animation-delay:0.3s">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <h3>Core Values</h3>
          <p>Excellence · Integrity · Collaboration · Innovation · Inclusivity · Sustainability — guiding every initiative we undertake across the region.</p>
        </div>
      </div>

      <!-- Leadership -->
      <!-- Leadership / Organizational Structure -->
      <div class="subsection" id="leadership" style="scroll-margin-top: 100px;">
        <a id="org-structure" style="position: relative; top: -100px; display: block; visibility: hidden;"></a>
        <h3 class="subsection-title">Organizational Structure</h3>
        <div class="leadership-grid">
          
          <!-- Founding Father -->
          <div class="leader-card" data-aos="fade-up">
            <div class="leader-avatar">
              <img src="arfan.png" alt="DR. ARFAN IKHSAN LUBIS" />
            </div>
            <div class="leader-info">
              <h4>Founding Father</h4>
              <p class="leader-name">DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr</p>
              <p class="leader-affil">Association of Asia Pacific Academician</p>
            </div>
          </div>

          <!-- Advisor -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.05s">
            <div class="leader-avatar">
              <img src="indra.jpg" alt="PROF. DR. INDRA MAIPITA" />
            </div>
            <div class="leader-info">
              <h4>Advisor</h4>
              <p class="leader-name">PROF. DR. INDRA MAIPITA., M.Si</p>
              <p class="leader-affil">Asia Pacific Academic Advisory Board</p>
            </div>
          </div>

          <!-- President -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.1s">
            <div class="leader-avatar">
              <img src="arfan.png" alt="DR. ARFAN IKHSAN LUBIS" />
            </div>
            <div class="leader-info">
              <h4>President</h4>
              <p class="leader-name">DR. ARFAN IKHSAN LUBIS., SE., M.Si., CATr</p>
              <p class="leader-affil">Asia Pacific Academic Leadership</p>
            </div>
          </div>

          <!-- Vice President 1 -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.15s">
            <div class="leader-avatar">
              <img src="yamin.jpg" alt="DR. MUHAMMAD YAMIN NOCH" />
            </div>
            <div class="leader-info">
              <h4>Vice President</h4>
              <p class="leader-name">DR. MUHAMMAD YAMIN NOCH., SE., MSA</p>
              <p class="leader-affil">Academic Affairs &amp; Institutional Development</p>
            </div>
          </div>

          <!-- Vice President 2 -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.2s">
            <div class="leader-avatar">
              <img src="istianingsih.jpg" alt="PROF. DR. ISTIANINGSIH SASTRODIHARJO" />
            </div>
            <div class="leader-info">
              <h4>Vice President</h4>
              <p class="leader-name">PROF. DR. ISTIANINGSIH SASTRODIHARJO., SE., M.Si</p>
              <p class="leader-affil">Research &amp; International Cooperation</p>
            </div>
          </div>

          <!-- Secretary General -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.25s">
            <div class="leader-avatar">
              <img src="ngatemin.jpg" alt="DR. NGATEMIN" />
            </div>
            <div class="leader-info">
              <h4>Secretary General</h4>
              <p class="leader-name">DR. NGATEMIN., M.Si</p>
              <p class="leader-affil">Strategic Operations &amp; Governance</p>
            </div>
          </div>

          <!-- Treasurer -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.3s">
            <div class="leader-avatar">
              <img src="tridessy.jpg" alt="TRI DESSY FADILLAH" />
            </div>
            <div class="leader-info">
              <h4>Treasurer</h4>
              <p class="leader-name">TRI DESSY FADILLAH., SE., M.Ak</p>
              <p class="leader-affil">Finance &amp; Resource Management</p>
            </div>
          </div>

          <!-- Information Technology -->
          <div class="leader-card" data-aos="fade-up" style="animation-delay:0.35s">
            <div class="leader-avatar">
              <img src="rahman.jpg" alt="M. A. RAHMAN" />
            </div>
            <div class="leader-info">
              <h4>Information Technology</h4>
              <p class="leader-name">M. A. RAHMAN</p>
              <p class="leader-affil">Digital Platform &amp; System Integration</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Regional Chapters -->
      <div class="subsection" id="regional-chapters">
        <h3 class="subsection-title">Regional Chapters</h3>
        <div class="chapters-grid">
          <div class="chapter-badge"><img src="https://flagcdn.com/w40/my.png" alt="" /> Malaysia</div>
          <div class="chapter-badge" style="animation-delay:0.05s"><img src="https://flagcdn.com/w40/id.png" alt="" /> Indonesia</div>
          <div class="chapter-badge" style="animation-delay:0.1s"><img src="https://flagcdn.com/w40/ph.png" alt="" /> Philippines</div>
          <div class="chapter-badge" style="animation-delay:0.15s"><img src="https://flagcdn.com/w40/th.png" alt="" /> Thailand</div>
          <div class="chapter-badge" style="animation-delay:0.2s"><img src="https://flagcdn.com/w40/bd.png" alt="" /> Bangladesh</div>
          <div class="chapter-badge" style="animation-delay:0.25s"><img src="https://flagcdn.com/w40/pk.png" alt="" /> Pakistan</div>
          <div class="chapter-badge" style="animation-delay:0.3s"><img src="https://flagcdn.com/w40/in.png" alt="" /> India</div>
          <div class="chapter-badge" style="animation-delay:0.35s"><img src="https://flagcdn.com/w40/cn.png" alt="" /> China</div>
          <div class="chapter-badge" style="animation-delay:0.4s"><img src="https://flagcdn.com/w40/jp.png" alt="" /> Japan</div>
          <div class="chapter-badge" style="animation-delay:0.45s"><img src="https://flagcdn.com/w40/kr.png" alt="" /> Korea</div>
          <div class="chapter-badge" style="animation-delay:0.5s"><img src="https://flagcdn.com/w40/sg.png" alt="" /> Singapore</div>
          <div class="chapter-badge" style="animation-delay:0.55s"><img src="https://flagcdn.com/w40/vn.png" alt="" /> Vietnam</div>
          <div class="chapter-badge" style="animation-delay:0.6s"><img src="https://flagcdn.com/w40/ng.png" alt="" /> Nigeria</div>
          <div class="chapter-badge" style="animation-delay:0.65s"><img src="https://flagcdn.com/w40/tr.png" alt="" /> Turkey</div>
          <div class="chapter-badge" style="animation-delay:0.7s"><img src="https://flagcdn.com/w40/au.png" alt="" /> Australia</div>
          <div class="chapter-badge" style="animation-delay:0.75s"><img src="https://flagcdn.com/w40/bn.png" alt="" /> Brunei</div>
          <div class="chapter-badge" style="animation-delay:0.8s"><img src="https://flagcdn.com/w40/nz.png" alt="" /> New Zealand</div>
          <div class="chapter-badge" style="animation-delay:0.85s"><img src="https://flagcdn.com/w40/ca.png" alt="" /> Canada</div>
          <div class="chapter-badge" style="animation-delay:0.9s"><img src="https://flagcdn.com/w40/mn.png" alt="" /> Mongolia</div>
          <div class="chapter-badge" style="animation-delay:0.95s"><img src="https://flagcdn.com/w40/fj.png" alt="" /> Fiji</div>
          <div class="chapter-badge" style="animation-delay:1.0s"><img src="https://flagcdn.com/w40/cl.png" alt="" /> Chile</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       ACADEMIC DIVISIONS
  ═══════════════════════════════════════════ -->
  <section class="section divisions-section" id="academic-divisions">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">14 SPECIALIZED FIELDS</p>
        <h2 class="section-title">Academic <span class="gold">Divisions</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Spanning diverse academic disciplines to serve every scholar and professional in Asia Pacific</p>
      </div>
      <div class="divisions-grid">
        <div class="division-card" id="div-accounting">
          <div class="div-num">01</div>
          <div class="div-icon">📊</div>
          <h3>Accounting, Auditing &amp; Taxation</h3>
          <p>Advancing standards in financial reporting, audit practices, and tax policy across the region.</p>
          <a href="accounting.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-business" style="animation-delay:0.05s">
          <div class="div-num">02</div>
          <div class="div-icon">💼</div>
          <h3>Business, Management &amp; Entrepreneurship</h3>
          <p>Driving innovation, leadership, and entrepreneurial excellence in modern business ecosystems.</p>
          <a href="business.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-finance" style="animation-delay:0.1s">
          <div class="div-num">03</div>
          <div class="div-icon">🏦</div>
          <h3>Finance, Banking &amp; Investment</h3>
          <p>Strengthening financial systems, capital markets, and investment ecosystems across Asia Pacific.</p>
          <a href="finance.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-hr" style="animation-delay:0.15s">
          <div class="div-num">04</div>
          <div class="div-icon">👥</div>
          <h3>Human Resources</h3>
          <p>Developing human capital strategies, organizational behavior, and workforce excellence.</p>
          <a href="hr.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-economics" style="animation-delay:0.2s">
          <div class="div-num">05</div>
          <div class="div-icon">📈</div>
          <h3>Economics &amp; Public Policy</h3>
          <p>Informing evidence-based policymaking and macroeconomic resilience across the Asia Pacific.</p>
          <a href="economics.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-education" style="animation-delay:0.25s">
          <div class="div-num">06</div>
          <div class="div-icon">🎓</div>
          <h3>Education</h3>
          <p>Transforming pedagogy, curriculum design, and educational leadership for the 21st century.</p>
          <a href="economics.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-law" style="animation-delay:0.3s">
          <div class="div-num">07</div>
          <div class="div-icon">⚖️</div>
          <h3>Law &amp; Governance</h3>
          <p>Promoting rule of law, institutional governance, and legal scholarship across jurisdictions.</p>
          <a href="law.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-it" style="animation-delay:0.35s">
          <div class="div-num">08</div>
          <div class="div-icon">🤖</div>
          <h3>IT, AI &amp; Digital Transformation</h3>
          <p>Leading the frontier of artificial intelligence, cybersecurity, and digital innovation research.</p>
          <a href="it.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-engineering" style="animation-delay:0.4s">
          <div class="div-num">09</div>
          <div class="div-icon">⚙️</div>
          <h3>Engineering</h3>
          <p>Advancing engineering sciences, applied technology, and sustainable infrastructure solutions.</p>
          <a href="it.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-social" style="animation-delay:0.45s">
          <div class="div-num">10</div>
          <div class="div-icon">🌐</div>
          <h3>Social Sciences</h3>
          <p>Exploring human society, cultural dynamics, and interdisciplinary social research.</p>
          <a href="engineering.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-tourism" style="animation-delay:0.5s">
          <div class="div-num">11</div>
          <div class="div-icon">✈️</div>
          <h3>Tourism</h3>
          <p>Advancing sustainable tourism, hospitality management, and cultural heritage preservation.</p>
          <a href="social.html" class="div-link">Explore Division →</a>
        </div>
        <div class="division-card" id="div-health" style="animation-delay:0.55s">
          <div class="div-num">12</div>
          <div class="div-icon">🏥</div>
          <h3>Health</h3>
          <p>Promoting public health, medical research, and health system innovation across the region.</p>
          <a href="health.html" class="div-link">Learn More →</a>
        </div>
        <div class="division-card" id="div-agriculture" style="animation-delay:0.6s">
          <div class="div-num">13</div>
          <div class="div-icon">🌾</div>
          <h3>Agriculture</h3>
          <p>Supporting agri-food innovation, rural development, and food security research.</p>
          <a href="agriculture.html" class="div-link">Learn More →</a>
        </div>
        <div class="division-card" id="div-islamic" style="animation-delay:0.65s">
          <div class="div-num">14</div>
          <div class="div-icon">☪️</div>
          <h3>Islamic Studies</h3>
          <p>Advancing Islamic scholarship, jurisprudence, and the integration of Islamic values in academia.</p>
          <a href="islamic.html" class="div-link">Learn More →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       STRATEGIC BODIES
  ═══════════════════════════════════════════ -->
  <section class="section bodies-section" id="strategic-bodies">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">INSTITUTIONAL FRAMEWORK</p>
        <h2 class="section-title">Strategic <span class="gold">Bodies</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Specialized organs that power ASIA's mission across certification, research, publications, and more</p>
      </div>
      <div class="bodies-grid">
        <div class="body-card featured" id="boc">
          <div class="body-badge">FLAGSHIP</div>
          <div class="body-icon">🏛️</div>
          <h3>ASIA Board of Certification (BOC)</h3>
          <p>The apex body governing all professional and academic certification standards under ASIA's framework.</p>
          <a href="/boc.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card featured" id="asiacert" style="animation-delay:0.1s">
          <div class="body-badge">CERTIFICATION</div>
          <div class="body-icon">🎖️</div>
          <h3>ASIACERT</h3>
          <p>Official certification arm issuing internationally recognized credentials to qualified academicians and professionals.</p>
          <a href="/asiacert.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="research-council" style="animation-delay:0.15s">
          <div class="body-icon">🔬</div>
          <h3>Research &amp; Innovation Council</h3>
          <p>Spearheading collaborative research initiatives, innovation grants, and knowledge generation programs.</p>
          <a href="/research.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="conference-forum" style="animation-delay:0.2s">
          <div class="body-icon">🎤</div>
          <h3>Conference &amp; Academic Forum</h3>
          <p>Organizing premier international conferences and academic forums for knowledge exchange and networking.</p>
          <a href="/conference.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="publication-center" style="animation-delay:0.25s">
          <div class="body-icon">📚</div>
          <h3>Publication &amp; Knowledge Center</h3>
          <p>Managing scholarly publications, open-access journals, and the dissemination of academic knowledge.</p>
          <a href="/publication.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="mobility-center" style="animation-delay:0.3s">
          <div class="body-icon">🌏</div>
          <h3>Academic Mobility Center</h3>
          <p>Facilitating cross-border academic exchanges, visiting scholar programs, and mobility fellowships.</p>
          <a href="/mobility.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="competition-center" style="animation-delay:0.35s">
          <div class="body-icon">🏆</div>
          <h3>Competition Center</h3>
          <p>Hosting academic competitions, olympiads, and case study challenges for students and researchers.</p>
          <a href="/competition.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="community-center" style="animation-delay:0.4s">
          <div class="body-icon">🌱</div>
          <h3>Community Engagement &amp; SDGs Center</h3>
          <p>Aligning academic activities with UN Sustainable Development Goals and community empowerment.</p>
          <a href="/community.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="qa-board" style="animation-delay:0.45s">
          <div class="body-icon">✅</div>
          <h3>Quality Assurance &amp; Accreditation Board</h3>
          <p>Upholding academic standards, institutional accreditation, and quality benchmarking across programs.</p>
          <a href="/quality.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="digital-academy" style="animation-delay:0.5s">
          <div class="body-icon">💻</div>
          <h3>Digital Academy &amp; AI Center</h3>
          <p>Delivering digital literacy, AI education, and cutting-edge technology training for academics.</p>
          <a href="/academy.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="young-network" style="animation-delay:0.55s">
          <div class="body-icon">🌟</div>
          <h3>Young Academician Network</h3>
          <p>Nurturing emerging scholars and early-career researchers through mentorship and collaborative platforms.</p>
          <a href="/young.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
        <div class="body-card" id="awards-council" style="animation-delay:0.6s">
          <div class="body-icon">🏅</div>
          <h3>Awards &amp; Recognition Council</h3>
          <p>Celebrating academic excellence through prestigious awards honoring outstanding contributions to scholarship.</p>
          <a href="/awards.html" target="_blank" class="div-link">Visit Website →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       PUBLICATIONS
  ═══════════════════════════════════════════ -->
  <section class="section publications-section" id="publications">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">SCHOLARLY OUTPUT</p>
        <h2 class="section-title">Our <span class="gold">Publications</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
      </div>
      <div class="pub-grid">
        <div class="pub-card" id="journals">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3>Academic Journals</h3>
          <p>Peer-reviewed journals covering all 14 academic divisions, indexed in leading global databases.</p>
          <div class="pub-meta"><span>Quarterly</span><span>ISI / Scopus Indexed</span></div>
          <a href="publication.html" class="pub-link">Browse Journals →</a>
        </div>
        <div class="pub-card" id="proceedings" style="animation-delay:0.1s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </div>
          <h3>Proceedings</h3>
          <p>Official conference proceedings capturing breakthrough research and scholarly presentations.</p>
          <div class="pub-meta"><span>Per Conference</span><span>ISBN Registered</span></div>
          <a href="publication.html" class="pub-link">Browse Proceedings →</a>
        </div>
        <div class="pub-card" id="books" style="animation-delay:0.2s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3>Academic Books</h3>
          <p>Scholarly books authored and edited by ASIA members, covering theory, practice, and case studies.</p>
          <div class="pub-meta"><span>Annual</span><span>DOI Registered</span></div>
          <a href="publication.html" class="pub-link">Browse Books →</a>
        </div>
        <div class="pub-card" id="monographs" style="animation-delay:0.3s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h3>Monographs</h3>
          <p>In-depth single-topic scholarly works advancing specialized knowledge in key academic fields.</p>
          <div class="pub-meta"><span>Bi-annual</span><span>Open Access</span></div>
          <a href="publication.html" class="pub-link">Browse Monographs →</a>
        </div>
        <div class="pub-card" id="policy-briefs" style="animation-delay:0.4s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <h3>Policy Briefs</h3>
          <p>Evidence-based policy recommendations addressing real-world challenges for regional policymakers.</p>
          <div class="pub-meta"><span>Ongoing</span><span>Free Download</span></div>
          <a href="publication.html" class="pub-link">Browse Policy Briefs →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       PROGRAMS
  ═══════════════════════════════════════════ -->
  <section class="section programs-section" id="programs">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">WHAT WE OFFER</p>
        <h2 class="section-title">Our <span class="gold">Programs</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Comprehensive programs designed to elevate academic careers and institutional excellence</p>
      </div>
      <div class="programs-grid">
        <div class="program-card" id="certification">
          <div class="prog-number">01</div>
          <div class="prog-icon">🎖️</div>
          <h3>Certification</h3>
          <p>Internationally recognized professional certifications validating academic and field expertise through ASIACERT.</p>
          <ul class="prog-features">
            <li>Multiple certification tracks</li>
            <li>Online &amp; in-person assessment</li>
            <li>Globally recognized credentials</li>
          </ul>
          <a href="asiacert.html" class="btn-prog" id="btn-certification">Apply Now</a>
        </div>
        <div class="program-card" id="conferences" style="animation-delay:0.1s">
          <div class="prog-number">02</div>
          <div class="prog-icon">🎤</div>
          <h3>Conferences</h3>
          <p>International academic conferences and symposia bringing together leading minds across disciplines.</p>
          <ul class="prog-features">
            <li>Annual international conference</li>
            <li>Virtual &amp; hybrid formats</li>
            <li>Indexed proceedings</li>
          </ul>
          <a href="conference.html" class="btn-prog" id="btn-conferences">Register</a>
        </div>
        <div class="program-card" id="competitions" style="animation-delay:0.2s">
          <div class="prog-number">03</div>
          <div class="prog-icon">🏆</div>
          <h3>Competitions</h3>
          <p>Academic olympiads, case competitions, and research challenges for students and early-career researchers.</p>
          <ul class="prog-features">
            <li>Open to all ASIA members</li>
            <li>Cash prizes &amp; recognition</li>
            <li>Published winning entries</li>
          </ul>
          <a href="competition.html" class="btn-prog" id="btn-competitions">Compete</a>
        </div>
        <div class="program-card" id="training" style="animation-delay:0.3s">
          <div class="prog-number">04</div>
          <div class="prog-icon">📖</div>
          <h3>Training</h3>
          <p>Short courses, workshops, and capacity building programs for academic and professional development.</p>
          <ul class="prog-features">
            <li>Expert-led workshops</li>
            <li>CPD hours awarded</li>
            <li>Certificate of completion</li>
          </ul>
          <a href="academy.html" class="btn-prog" id="btn-training">Enroll</a>
        </div>
        <div class="program-card" id="mobility" style="animation-delay:0.4s">
          <div class="prog-number">05</div>
          <div class="prog-icon">🌏</div>
          <h3>Mobility</h3>
          <p>Academic exchange programs, visiting scholar fellowships, and cross-institution collaborative residencies.</p>
          <ul class="prog-features">
            <li>Partner institutions across 25+ countries</li>
            <li>Stipend support available</li>
            <li>MOU-backed placements</li>
          </ul>
          <a href="mobility.html" class="btn-prog" id="btn-mobility">Apply</a>
        </div>
        <div class="program-card" id="research-grants" style="animation-delay:0.5s">
          <div class="prog-number">06</div>
          <div class="prog-icon">🔬</div>
          <h3>Research Grants</h3>
          <p>Funding opportunities for collaborative research projects across ASIA's 14 academic divisions.</p>
          <ul class="prog-features">
            <li>Seed and full grants</li>
            <li>Multi-country collaboration</li>
            <li>Publication support</li>
          </ul>
          <a href="research.html" class="btn-prog" id="btn-grants">Apply for Grant</a>
        </div>
        <div class="program-card" id="awards-prog" style="animation-delay:0.6s">
          <div class="prog-number">07</div>
          <div class="prog-icon">🏅</div>
          <h3>Awards</h3>
          <p>Prestigious awards recognizing outstanding academic contributions, leadership, and community impact.</p>
          <ul class="prog-features">
            <li>Annual excellence awards</li>
            <li>Best researcher &amp; educator</li>
            <li>Young academician award</li>
          </ul>
          <a href="awards.html" class="btn-prog" id="btn-awards">Nominate</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       MEMBERSHIP
  ═══════════════════════════════════════════ -->
  <section class="section membership-section" id="membership">
    <div class="membership-bg-pattern"></div>
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">JOIN THE COMMUNITY</p>
        <h2 class="section-title">Become a <span class="gold">Member</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Join 5,000+ scholars and professionals shaping the future of Asia Pacific academic excellence</p>
      </div>
      <div class="membership-tiers">
        <div class="tier-card">
          <div class="tier-header">
            <div class="tier-icon">🎓</div>
            <h3>Student Member</h3>
            <div class="tier-price">USD <span>30</span> / year</div>
          </div>
          <ul class="tier-benefits">
            <li>✓ Access to digital resources</li>
            <li>✓ Conference early-bird rates</li>
            <li>✓ Young Academician Network</li>
            <li>✓ E-Certificate of membership</li>
            <li>✓ Competition eligibility</li>
          </ul>
          <a href="#contact" class="btn-tier" id="btn-student-member">Join Now</a>
        </div>
        <div class="tier-card featured-tier" style="animation-delay:0.15s">
          <div class="tier-popular">MOST POPULAR</div>
          <div class="tier-header">
            <div class="tier-icon">🏛️</div>
            <h3>Professional Member</h3>
            <div class="tier-price">USD <span>80</span> / year</div>
          </div>
          <ul class="tier-benefits">
            <li>✓ All Student Member benefits</li>
            <li>✓ Journal publication discount</li>
            <li>✓ Research grant eligibility</li>
            <li>✓ Certification fast-track</li>
            <li>✓ Networking directory access</li>
            <li>✓ Voting rights in ASIA governance</li>
          </ul>
          <a href="#contact" class="btn-tier btn-tier-featured" id="btn-prof-member">Join Now</a>
        </div>
        <div class="tier-card" style="animation-delay:0.3s">
          <div class="tier-header">
            <div class="tier-icon">🏆</div>
            <h3>Fellow Member</h3>
            <div class="tier-price">USD <span>150</span> / year</div>
          </div>
          <ul class="tier-benefits">
            <li>✓ All Professional Member benefits</li>
            <li>✓ Priority conference speaking slot</li>
            <li>✓ Editorial board consideration</li>
            <li>✓ ASIA Fellow designation (FASIA)</li>
            <li>✓ Strategic body participation</li>
            <li>✓ Leadership nomination eligibility</li>
          </ul>
          <a href="#contact" class="btn-tier" id="btn-fellow-member">Join Now</a>
        </div>
        <div class="tier-card" style="animation-delay:0.45s">
          <div class="tier-header">
            <div class="tier-icon">🏢</div>
            <h3>Institutional Member</h3>
            <div class="tier-price">USD <span>500</span> / year</div>
          </div>
          <ul class="tier-benefits">
            <li>✓ Up to 20 staff memberships</li>
            <li>✓ Co-branding opportunities</li>
            <li>✓ MOU partnership eligibility</li>
            <li>✓ Priority event hosting</li>
            <li>✓ Dedicated liaison officer</li>
            <li>✓ Accreditation advisory support</li>
          </ul>
          <a href="#contact" class="btn-tier" id="btn-inst-member">Join Now</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       FOOTER
  ═══════════════════════════════════════════ -->
  ` }} />
  );
}
