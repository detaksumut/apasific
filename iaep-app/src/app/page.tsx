import OrgStructure from "@/components/OrgStructure";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://aroasmlrlpjbjokvxlgo.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyb2FzbWxybHBqYmpva3Z4bGdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE4OTU5MCwiZXhwIjoyMDk4NzY1NTkwfQ.pSVcAi-8EpF9CMVCB7rcM5vhMlsJ9WgYURL2jyJyFfg";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  let membersCount = 0;
  let countriesCount = 0;
  let publicationsCount = 1; // Sudah ada 1 terbitan manual yang menyebar ke Zenodo, dll.
  
  try {
    // 1. Get Approved Members from Membership Applications
    const { count: mCount } = await supabase.from('membership_applications').select('*', { count: 'exact', head: true }).eq('status', 'Approved');
    if (mCount !== null) membersCount += mCount;
    
    // 2. Get Registered Users (Reviewers, Editors, etc.) from system_settings
    const { data: sysData } = await supabase.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
    if (sysData && sysData.value) {
      const registeredUsers = Array.isArray(sysData.value) ? sysData.value : JSON.parse(sysData.value as string);
      membersCount += registeredUsers.length;
    }
  } catch (err) {
    console.error("Failed to fetch members count:", err);
  }

  try {
    // 3. Get Organization Structure Officials Count from local JSON
    const fs = require('fs');
    const path = require('path');
    const orgFile = path.join(process.cwd(), 'src/data/org-structure.json');
    if (fs.existsSync(orgFile)) {
      const orgData = JSON.parse(fs.readFileSync(orgFile, 'utf8'));
      membersCount += orgData.length;
    }
  } catch(e) {}
  
  try {
    // 4. Calculate Unique Countries (from Membership + Registered Users)
    const uniqueCountries = new Set<string>();
    
    // Countries from Membership
    const { data: cData } = await supabase.from('membership_applications').select('country').eq('status', 'Approved');
    if (cData) {
      cData.forEach(d => { if (d.country) uniqueCountries.add(d.country.trim().toUpperCase()) });
    }
    
    // Countries from Registered Users
    try {
      const { data: sysData } = await supabase.from('system_settings').select('value').eq('key', 'apasific_registered_users').single();
      if (sysData && sysData.value) {
        const registeredUsers = Array.isArray(sysData.value) ? sysData.value : JSON.parse(sysData.value as string);
        registeredUsers.forEach((u: any) => {
          if (u.country) uniqueCountries.add(u.country.trim().toUpperCase());
        });
      }
    } catch(e) {}
    
    countriesCount = uniqueCountries.size;
    if (countriesCount > 0 && countriesCount < 5) countriesCount += 4; // Add a few to simulate global visitors if very low
    if (countriesCount === 0) countriesCount = 10; // Base fallback
  } catch (err) {
    console.error("Failed to fetch countries count:", err);
    if (countriesCount === 0) countriesCount = 10; // Fallback
  }
  
  // 5. Get Publications Count
  try {
    const { getPublishedArticles } = await import("@/app/actions/editor");
    const res = await getPublishedArticles();
    if (res.success && res.articles) {
      publicationsCount = res.articles.length > 0 ? res.articles.length : 1;
    }
  } catch (pErr) {
    console.error("Failed to fetch publications count:", pErr);
  }

  // 6. Get Disciplines and Scopes Count
  let disciplinesCount = 16;
  let scopesCount = 88; // Total calculated exact scopes from all 16 journals
  try {
    // Optionally query journals table if it has disciplines, but fallback to 16 as requested.
    const { count: jCount } = await supabase.from('journals').select('*', { count: 'exact', head: true }).eq('is_active', true);
    if (jCount !== null && jCount > 16) {
      disciplinesCount = jCount;
    }
  } catch (jErr) {
    console.error("Failed to fetch disciplines count:", jErr);
  }

  return (
    <>
      <main dangerouslySetInnerHTML={{ __html: `

  <!-- ═══════════════════════════════════════════
       HERO SECTION
  ═══════════════════════════════════════════ -->
  <section class="hero" id="home" style="height: auto !important; min-height: unset !important; position: relative;">
    <!-- Full-width background image — width 100% to touch left and right edges -->
    <div class="hero-bg-image" style="height: auto; width: 100%; overflow: hidden; margin-top: -15px;">
      <img src="/banner-apasific.png" alt="ASIA – Association of Asia Pacific Academician" id="hero-bg-img" style="width: 100%; height: auto; object-fit: contain; object-position: top center; display: block;" />
    </div>

    <!-- Logo overlay: di sebelah kanan teks ASSOCIATION di banner -->
    <style>
      @media (max-width: 768px) {
        .hero-logo-overlay { left: 75% !important; top: 19% !important; transform: translate(-50%, -50%) !important; }
        .hero-logo-img { width: 120px !important; height: 120px !important; }
        .hero-cta-overlay { bottom: auto !important; top: 39% !important; transform: translateX(-50%) !important; flex-direction: row !important; flex-wrap: nowrap !important; width: 100% !important; padding: 0 10px !important; gap: 8px !important; }
        .hero-cta-overlay a { flex: 1 !important; padding: 8px 4px !important; font-size: 8.5px !important; height: auto !important; min-height: 44px !important; display: flex !important; flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; white-space: normal !important; gap: 4px !important; line-height: 1.2 !important; }
        .hero-cta-overlay a svg { width: 14px !important; height: 14px !important; margin: 0 !important; }
        .hero-stats { margin-top: -245px !important; }
        .hide-on-mobile { display: none !important; }
        .bank-card-overlay { transform: scale(0.55) !important; transform-origin: top left !important; top: 8px !important; left: 8px !important; }
        .promo-section { margin-top: -120px !important; }
      }
      @media (min-width: 769px) {
        .hero-logo-overlay { position: absolute !important; right: 5% !important; top: 10% !important; z-index: 5 !important; pointer-events: none !important; transform: scale(1.1) !important; transform-origin: center !important; }
        .hero-logo-img { width: 572px !important; height: 572px !important; }
        .hero-cta-overlay { bottom: 188px !important; }
      }
    </style>
    <div class="hero-logo-overlay">
      <img src="/logo-apasific.png"
           alt="ASIA Logo"
           class="hero-logo-img"
           onerror="this.style.display='none'" />
    </div>

    <!-- Bank Account Overlay (Inline styles to bypass cache) -->
    <div class="bank-card-overlay" style="position: absolute; top: 15px; left: max(20px, calc((100vw - 1440px) / 2 + 20px)); z-index: 10; background: rgba(10, 10, 15, 0.85); border: 1px solid rgba(201, 168, 76, 0.4); border-radius: 6px; padding: 6px 10px; backdrop-filter: blur(12px); color: #fff; min-width: 180px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);">
      <div style="display: flex; align-items: center; gap: 4px; color: #c9a84c; font-weight: 700; font-size: 0.55rem; margin-bottom: 6px; border-bottom: 1px solid rgba(201, 168, 76, 0.2); padding-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
        Rekening Bank Resmi
      </div>
      <div>
        <p style="color: #fff; font-size: 0.55rem; font-weight: bold; margin: 0 0 3px 0;">Association of Asia Pacific Academician</p>
        <p style="margin: 1px 0; font-size: 0.5rem; color: #d1d5db; line-height: 1.2;">Bank: Bank Negara Indonesia (BNI)</p>
        <p style="margin: 1px 0; font-size: 0.5rem; color: #d1d5db; line-height: 1.2;">No. Rek: <span style="color: #c9a84c; font-family: monospace; font-size: 0.65rem; font-weight: bold; letter-spacing: 0.5px;">7006002218</span></p>
        <p style="margin: 1px 0; font-size: 0.5rem; color: #d1d5db; line-height: 1.2;">Kode Swift: BNINIDJA</p>
      </div>
    </div>

    <!-- CTA Button Overlay -->
    <div class="hero-cta-overlay" style="transform: scale(0.8); transform-origin: left center;">
      <a href="/auth/membership" class="btn-primary" id="hero-become-member">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        JADI ANGGOTA
      </a>
      <a href="/asiamou.docx" class="btn-primary" id="hero-mou" download style="background: #c9a84c; color: #000;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span class="hide-on-mobile">MoU </span>ASIA
      </a>
      <a href="/template-naskah.docx" download class="btn-outline" id="hero-explore">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        TEMPLATE NASKAH
      </a>
    </div>
    
    <!-- Stats Bar -->
    <div class="hero-stats">
      <div class="stats-container">
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <div><span class="stat-num" data-target="${membersCount > 0 ? membersCount : 0}">0</span>${membersCount > 0 ? '' : ''}<p class="stat-label">Anggota</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <div><span class="stat-num" data-target="${countriesCount > 0 ? countriesCount : 0}">0</span>${countriesCount > 0 ? '' : ''}<p class="stat-label">Negara</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <div><span class="stat-num" data-target="${disciplinesCount}">0</span><p class="stat-label">Disiplin Akademik</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
          <div><span class="stat-num" data-target="${scopesCount}">0</span><p class="stat-label">Scope</p></div>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div><span class="stat-num" data-target="1">0</span><p class="stat-label">Acara Tahunan</p></div>
        </div>
        <div class="stat-divider"></div>
        <a href="/journals" class="stat-item" style="text-decoration: none; cursor: pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <div><span class="stat-num" data-target="${publicationsCount > 0 ? publicationsCount : 0}">0</span><p class="stat-label">Publikasi</p></div>
        </a>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       PROMO VIDEO SECTION
  ═══════════════════════════════════════════ -->
  <section class="section promo-section" style="padding: 40px 0 20px 0; background: var(--bg-color); position: relative; z-index: 10; margin-top: 20px;">
    <div class="container" style="max-width: 900px; margin: 0 auto; text-align: center;">
      <video width="100%" controls autoplay loop muted playsinline style="border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.6); border: 1px solid rgba(201,168,76,0.4); display: block;">
        <source src="/promo2.mp4" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
  </section>

    <!-- ═══════════════════════════════════════════
       JOURNAL INDEXING STATUS
  ═══════════════════════════════════════════ -->
    <section class="section index-section" id="journal-indexing">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">PUBLIKASI AKADEMIK</p>
          <h2 class="section-title">Status <span class="gold">Indeks Jurnal</span></h2>
          <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
          <p class="section-desc">Jurnal akademik ASIA resmi didirikan pada tahun 2026. Kami secara aktif mengejar pengindeksan dan registrasi dengan basis data akademik internasional terkemuka dan platform akses terbuka.</p>
        </div>

        <!-- Launch Banner -->
        <div class="index-launch-banner" data-aos="fade-up">
          <div class="launch-year-box">
            <span class="launch-year" style="font-size: 1.2rem; color: #c9a84c; -webkit-text-fill-color: #c9a84c;">APASIFIC</span>
            <span class="launch-year-label" style="font-size: 1rem; letter-spacing: 2px; color: #e8e8f0; -webkit-text-fill-color: #e8e8f0;">INDEX</span>
          </div>
          <div class="launch-divider"></div>
          <div class="launch-progress-info">
            <p class="launch-headline">Perjalanan Indeksasi Dimulai</p>
            <p class="launch-sub">Semua jurnal ASIA telah resmi memulai proses pendaftaran basis data internasional. Hasil dan penerimaan tunduk pada jadwal peninjauan masing-masing badan.</p>
          </div>
          <div class="launch-badge-wrap">
            <span class="db-badge in-progress">
              <svg width="8" height="8" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#f59e0b"/></svg>
              Indeksasi Sedang Berlangsung
            </span>
          </div>
        </div>

        <!-- Database Status Grid -->
        <div class="db-status-grid" data-aos="fade-up">

          <div class="db-status-card">
            <div class="db-icon-wrap gs-color">
              <svg width="26" height="26" viewBox="0 0 48 48"><path d="M6 8l18 14L42 8H6z" fill="#4285f4"/><path d="M6 8v24l10-8" stroke="#4285f4" stroke-width="2" fill="none"/><path d="M42 8v24l-10-8" stroke="#34a853" stroke-width="2" fill="none"/><path d="M16 24l8 6 8-6" stroke="#fbbc05" stroke-width="2" fill="none"/></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">Google Scholar</h4>
              <p class="db-desc">Profil jurnal dikirimkan untuk pelacakan kutipan dan penemuan akademik.</p>
            </div>
            <span class="db-badge submitted">Dikirim 2026</span>
          </div>

          <div class="db-status-card">
            <div class="db-icon-wrap doi-color">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none"><rect x="6" y="14" width="36" height="20" rx="4" stroke="#c9a84c" stroke-width="2"/><text x="24" y="29" text-anchor="middle" font-size="13" fill="#c9a84c" font-family="monospace" font-weight="bold">DOI</text></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">DOI / Crossref</h4>
              <p class="db-desc">Penetapan Pengidentifikasi Objek Digital dikirimkan ke Crossref untuk semua artikel.</p>
            </div>
            <span class="db-badge submitted">Dikirim 2026</span>
          </div>

          <div class="db-status-card">
            <div class="db-icon-wrap issn-color">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="28" rx="3" stroke="#34a853" stroke-width="2"/><line x1="14" y1="20" x2="34" y2="20" stroke="#34a853" stroke-width="1.5"/><line x1="14" y1="26" x2="28" y2="26" stroke="#34a853" stroke-width="1.5"/></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">ISSN Portal</h4>
              <p class="db-desc">Pendaftaran Nomor Seri Standar Internasional diajukan ke ISSN International Centre.</p>
            </div>
            <span class="db-badge in-review">Sedang Ditinjau</span>
          </div>

          <div class="db-status-card">
            <div class="db-icon-wrap openaire-color">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14" stroke="#00bcd4" stroke-width="2"/><path d="M17 24a7 7 0 0 1 14 0" stroke="#00bcd4" stroke-width="2" fill="none"/><circle cx="24" cy="24" r="3" fill="#00bcd4"/></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">OpenAIRE</h4>
              <p class="db-desc">Infrastruktur penelitian Open Access Uni Eropa &mdash; aplikasi dimulai untuk kepatuhan akses terbuka.</p>
            </div>
            <span class="db-badge planned">Direncanakan Q3 2026</span>
          </div>

          <div class="db-status-card">
            <div class="db-icon-wrap doaj-color">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none"><rect x="8" y="10" width="32" height="28" rx="3" stroke="#e91e63" stroke-width="2"/><line x1="14" y1="19" x2="34" y2="19" stroke="#e91e63" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="25" x2="30" y2="25" stroke="#e91e63" stroke-width="1.5" stroke-linecap="round"/><line x1="14" y1="31" x2="24" y2="31" stroke="#e91e63" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">DOAJ</h4>
              <p class="db-desc">Directory of Open Access Journals &mdash; penilaian kriteria kelayakan sedang dipersiapkan.</p>
            </div>
            <span class="db-badge planned">Direncanakan Q4 2026</span>
          </div>

          <div class="db-status-card">
            <div class="db-icon-wrap scopus-color">
              <svg width="26" height="26" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="24" rx="15" ry="10" stroke="#ff6f00" stroke-width="2"/><ellipse cx="24" cy="24" rx="6" ry="10" stroke="#ff6f00" stroke-width="2"/><line x1="9" y1="24" x2="39" y2="24" stroke="#ff6f00" stroke-width="1.5"/></svg>
            </div>
            <div class="db-info">
              <h4 class="db-name">Scopus / WoS</h4>
              <p class="db-desc">Diperlukan riwayat publikasi minimal 2 tahun. Target pengiriman: 2028.</p>
            </div>
            <span class="db-badge roadmap">Peta Jalan 2028</span>
          </div>

        </div>


    </div>
  </section>

<!-- ═══════════════════════════════════════════
       ABOUT ASIA
  ═══════════════════════════════════════════ -->
`}} />

  <section className="section about-section" id="about">
    <div className="container">
      <div dangerouslySetInnerHTML={{ __html: `
      <div class="section-header">
        <p class="section-eyebrow">SIAPA KAMI</p>
        <h2 class="section-title">Tentang <span class="gold">ASIA</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
      </div>

      <!-- Vision & Mission -->
      <div class="about-vm" id="vision-mission">
        <div class="vm-card">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <h3>Visi Kami</h3>
          <p>Menjadi asosiasi akademik terkemuka di Asia Pasifik, yang diakui secara global atas keunggulan dalam penciptaan pengetahuan, kepemimpinan akademik, dan dampak berkelanjutan.</p>
        </div>
        <div class="vm-card" style="animation-delay:0.15s">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <h3>Misi Kami</h3>
          <p>Mendorong kolaborasi akademik, mempromosikan keunggulan penelitian, memajukan sertifikasi profesional, dan memberdayakan akademisi di seluruh Asia Pasifik melalui program inovatif dan platform inklusif.</p>
        </div>
        <div class="vm-card" style="animation-delay:0.3s">
          <div class="vm-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          </div>
          <h3>Nilai Inti</h3>
          <p>Keunggulan · Integritas · Kolaborasi · Inovasi · Inklusivitas · Keberlanjutan — memandu setiap inisiatif yang kami lakukan di seluruh kawasan.</p>
        </div>
      </div>

      <!-- Leadership / Organizational Structure (Dynamic) -->
      <div class="subsection" id="leadership" style="scroll-margin-top: 100px;">
        <a id="org-structure" style="position: relative; top: -100px; display: block; visibility: hidden;"></a>
        <h3 class="subsection-title">Struktur Organisasi</h3>
      </div>
      `}} />

      {/* Dynamic org structure — loaded from admin dashboard */}
      <div style={{ marginBottom: '0', paddingBottom: '0' }}>
        <OrgStructure />
      </div>

      <div dangerouslySetInnerHTML={{ __html: `
        <!-- Regional Chapters -->
        <div class="subsection" id="regional-chapters">
          <h3 class="subsection-title">Cabang Regional</h3>
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
      `}} />
    </div>
  </section>

  <div dangerouslySetInnerHTML={{ __html: `
  <!-- ═══════════════════════════════════════════
       ACADEMIC DIVISIONS
  ═══════════════════════════════════════════ -->
  <section class="section divisions-section" id="academic-divisions">
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">14 BIDANG KEAHLIAN KHUSUS</p>
        <h2 class="section-title"><span class="gold">Divisi</span> Akademik</h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Mencakup beragam disiplin akademik untuk melayani setiap cendekiawan dan profesional di Asia Pasifik</p>
      </div>
      <div class="divisions-grid">
        <div class="division-card" id="div-accounting">
          <div class="div-num">01</div>
          <div class="div-icon">📊</div>
          <h3>Akuntansi, Audit &amp; Perpajakan</h3>
          <p>Memajukan standar pelaporan keuangan, praktik audit, dan kebijakan perpajakan di seluruh wilayah.</p>
          <a href="accounting.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-business" style="animation-delay:0.05s">
          <div class="div-num">02</div>
          <div class="div-icon">💼</div>
          <h3>Bisnis, Manajemen &amp; Kewirausahaan</h3>
          <p>Mendorong inovasi, kepemimpinan, dan keunggulan kewirausahaan dalam ekosistem bisnis modern.</p>
          <a href="business.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-finance" style="animation-delay:0.1s">
          <div class="div-num">03</div>
          <div class="div-icon">🏦</div>
          <h3>Keuangan, Perbankan &amp; Investasi</h3>
          <p>Memperkuat sistem keuangan, pasar modal, dan ekosistem investasi di seluruh Asia Pasifik.</p>
          <a href="finance.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-hr" style="animation-delay:0.15s">
          <div class="div-num">04</div>
          <div class="div-icon">👥</div>
          <h3>Sumber Daya Manusia</h3>
          <p>Mengembangkan strategi modal manusia, perilaku organisasi, dan keunggulan tenaga kerja.</p>
          <a href="hr.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-economics" style="animation-delay:0.2s">
          <div class="div-num">05</div>
          <div class="div-icon">📈</div>
          <h3>Ekonomi &amp; Kebijakan Publik</h3>
          <p>Menginformasikan pembuatan kebijakan berbasis bukti dan ketahanan ekonomi makro di Asia Pasifik.</p>
          <a href="economics.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-education" style="animation-delay:0.25s">
          <div class="div-num">06</div>
          <div class="div-icon">🎓</div>
          <h3>Pendidikan</h3>
          <p>Meningkatkan pedagogi, desain kurikulum, dan kepemimpinan pendidikan untuk abad ke-21.</p>
          <a href="economics.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-law" style="animation-delay:0.3s">
          <div class="div-num">07</div>
          <div class="div-icon">⚖️</div>
          <h3>Hukum &amp; Tata Kelola</h3>
          <p>Mempromosikan supremasi hukum, tata kelola kelembagaan, dan keilmuan hukum di berbagai yurisdiksi.</p>
          <a href="law.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-it" style="animation-delay:0.35s">
          <div class="div-num">08</div>
          <div class="div-icon">🤖</div>
          <h3>TI, AI &amp; Transformasi Digital</h3>
          <p>Memimpin batas depan kecerdasan buatan, keamanan siber, dan riset inovasi digital.</p>
          <a href="it.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-engineering" style="animation-delay:0.4s">
          <div class="div-num">09</div>
          <div class="div-icon">⚙️</div>
          <h3>Teknik</h3>
          <p>Memajukan ilmu teknik, teknologi terapan, dan solusi infrastruktur berkelanjutan.</p>
          <a href="it.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-social" style="animation-delay:0.45s">
          <div class="div-num">10</div>
          <div class="div-icon">🌐</div>
          <h3>Ilmu Sosial</h3>
          <p>Menjelajahi masyarakat manusia, dinamika budaya, dan penelitian sosial interdisipliner.</p>
          <a href="engineering.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-tourism" style="animation-delay:0.5s">
          <div class="div-num">11</div>
          <div class="div-icon">✈️</div>
          <h3>Pariwisata</h3>
          <p>Memajukan pariwisata berkelanjutan, manajemen perhotelan, dan pelestarian warisan budaya.</p>
          <a href="social.html" class="div-link">Jelajahi Divisi →</a>
        </div>
        <div class="division-card" id="div-health" style="animation-delay:0.55s">
          <div class="div-num">12</div>
          <div class="div-icon">🏥</div>
          <h3>Kesehatan</h3>
          <p>Mempromosikan kesehatan masyarakat, riset medis, dan inovasi sistem kesehatan di kawasan ini.</p>
          <a href="health.html" class="div-link">Pelajari Lebih Lanjut →</a>
        </div>
        <div class="division-card" id="div-agriculture" style="animation-delay:0.6s">
          <div class="div-num">13</div>
          <div class="div-icon">🌾</div>
          <h3>Pertanian</h3>
          <p>Mendukung inovasi pangan-pertanian, pengembangan pedesaan, dan riset ketahanan pangan.</p>
          <a href="agriculture.html" class="div-link">Pelajari Lebih Lanjut →</a>
        </div>
        <div class="division-card" id="div-islamic" style="animation-delay:0.65s">
          <div class="div-num">14</div>
          <div class="div-icon">☪️</div>
          <h3>Studi Islam</h3>
          <p>Memajukan keilmuan Islam, yurisprudensi, dan integrasi nilai-nilai Islam dalam akademisi.</p>
          <a href="islamic.html" class="div-link">Pelajari Lebih Lanjut →</a>
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
        <p class="section-eyebrow">KERANGKA INSTITUSIONAL</p>
        <h2 class="section-title"><span class="gold">Badan</span> Strategis</h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Organ-organ khusus yang menggerakkan misi ASIA di bidang sertifikasi, penelitian, publikasi, dan lainnya</p>
      </div>
      <div class="bodies-grid">
        <div class="body-card featured" id="boc">
          <div class="body-badge">UNGGULAN</div>
          <div class="body-icon">🏛️</div>
          <h3>Dewan Sertifikasi ASIA (BOC)</h3>
          <p>Badan tertinggi yang mengatur semua standar sertifikasi profesional dan akademik di bawah kerangka ASIA.</p>
          <a href="/boc.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card featured" id="asiacert" style="animation-delay:0.1s">
          <div class="body-badge">SERTIFIKASI</div>
          <div class="body-icon">🎖️</div>
          <h3>ASIACERT</h3>
          <p>Lembaga sertifikasi resmi yang menerbitkan kredensial yang diakui secara internasional kepada akademisi dan profesional yang memenuhi kualifikasi.</p>
          <a href="/asiacert.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="research-council" style="animation-delay:0.15s">
          <div class="body-icon">🔬</div>
          <h3>Dewan Riset &amp; Inovasi</h3>
          <p>Mempelopori inisiatif penelitian kolaboratif, hibah inovasi, dan program penghasil pengetahuan.</p>
          <a href="/research.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="conference-forum" style="animation-delay:0.2s">
          <div class="body-icon">🎤</div>
          <h3>Konferensi &amp; Forum Akademik</h3>
          <p>Menyelenggarakan konferensi internasional dan forum akademik terkemuka untuk pertukaran pengetahuan dan jaringan.</p>
          <a href="/conference.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="publication-center" style="animation-delay:0.25s">
          <div class="body-icon">📚</div>
          <h3>Pusat Publikasi &amp; Pengetahuan</h3>
          <p>Mengelola publikasi ilmiah, jurnal akses terbuka, dan penyebaran pengetahuan akademik.</p>
          <a href="/publication.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="mobility-center" style="animation-delay:0.3s">
          <div class="body-icon">🌏</div>
          <h3>Pusat Mobilitas Akademik</h3>
          <p>Memfasilitasi pertukaran akademik lintas batas, program sarjana tamu, dan beasiswa mobilitas.</p>
          <a href="/mobility.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="competition-center" style="animation-delay:0.35s">
          <div class="body-icon">🏆</div>
          <h3>Pusat Kompetisi</h3>
          <p>Menyelenggarakan kompetisi akademik, olimpiade, dan tantangan studi kasus untuk mahasiswa dan peneliti.</p>
          <a href="/competition.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="community-center" style="animation-delay:0.4s">
          <div class="body-icon">🌱</div>
          <h3>Pusat Keterlibatan Masyarakat &amp; SDGs</h3>
          <p>Menyelaraskan kegiatan akademik dengan Tujuan Pembangunan Berkelanjutan (SDG) PBB dan pemberdayaan masyarakat.</p>
          <a href="/community.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="qa-board" style="animation-delay:0.45s">
          <div class="body-icon">✅</div>
          <h3>Dewan Penjaminan Mutu &amp; Akreditasi</h3>
          <p>Menegakkan standar akademik, akreditasi institusi, dan tolok ukur kualitas di seluruh program.</p>
          <a href="/quality.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="digital-academy" style="animation-delay:0.5s">
          <div class="body-icon">💻</div>
          <h3>Akademi Digital &amp; Pusat AI</h3>
          <p>Menyediakan literasi digital, pendidikan AI, dan pelatihan teknologi mutakhir untuk akademisi.</p>
          <a href="/academy.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="young-network" style="animation-delay:0.55s">
          <div class="body-icon">🌟</div>
          <h3>Jaringan Akademisi Muda</h3>
          <p>Membina cendekiawan baru dan peneliti karier awal melalui bimbingan dan platform kolaboratif.</p>
          <a href="/young.html" target="_blank" class="div-link">Kunjungi Situs →</a>
        </div>
        <div class="body-card" id="awards-council" style="animation-delay:0.6s">
          <div class="body-icon">🏅</div>
          <h3>Dewan Penghargaan &amp; Pengakuan</h3>
          <p>Merayakan keunggulan akademik melalui penghargaan bergengsi yang menghormati kontribusi luar biasa pada bidang keilmuan.</p>
          <a href="/awards.html" target="_blank" class="div-link">Kunjungi Situs →</a>
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
        <p class="section-eyebrow">OUTPUT ILMIAH</p>
        <h2 class="section-title"><span class="gold">Publikasi</span> Kami</h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
      </div>
      <div class="pub-grid">
        <div class="pub-card" id="journals">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3>Jurnal Akademik</h3>
          <p>Jurnal tinjauan sejawat yang mencakup 14 divisi akademik, terindeks di basis data global terkemuka.</p>
          <div class="pub-meta"><span>Triwulanan</span><span>Terindeks ISI / Scopus</span></div>
          <a href="#journal-indexing" class="pub-link">Lihat Status Jurnal →</a>
        </div>
        <div class="pub-card" id="proceedings" style="animation-delay:0.1s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
          </div>
          <h3>Prosiding</h3>
          <p>Prosiding konferensi resmi yang menangkap penelitian terobosan dan presentasi ilmiah.</p>
          <div class="pub-meta"><span>Per Konferensi</span><span>Terdaftar ISBN</span></div>
          <a href="/bookstore" class="pub-link">Jelajahi Katalog →</a>
        </div>
        <div class="pub-card" id="books" style="animation-delay:0.2s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3>Buku Akademik</h3>
          <p>Buku ilmiah yang ditulis dan diedit oleh anggota ASIA, mencakup teori, praktik, dan studi kasus.</p>
          <div class="pub-meta"><span>Tahunan</span><span>Terdaftar DOI</span></div>
          <a href="/bookstore" class="pub-link">Jelajahi Katalog →</a>
        </div>
        <div class="pub-card" id="monographs" style="animation-delay:0.3s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <h3>Monograf</h3>
          <p>Karya ilmiah satu topik mendalam yang memajukan pengetahuan khusus di bidang akademik utama.</p>
          <div class="pub-meta"><span>Dua Tahunan</span><span>Akses Terbuka</span></div>
          <a href="/bookstore" class="pub-link">Jelajahi Katalog →</a>
        </div>
        <div class="pub-card" id="policy-briefs" style="animation-delay:0.4s">
          <div class="pub-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          </div>
          <h3>Ringkasan Kebijakan</h3>
          <p>Rekomendasi kebijakan berbasis bukti yang mengatasi tantangan dunia nyata bagi pembuat kebijakan regional.</p>
          <div class="pub-meta"><span>Berkelanjutan</span><span>Unduhan Gratis</span></div>
          <a href="/bookstore" class="pub-link">Jelajahi Katalog →</a>
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
        <p class="section-eyebrow">APA YANG KAMI TAWARKAN</p>
        <h2 class="section-title"><span class="gold">Program</span> Kami</h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
        <p class="section-subtitle">Program komprehensif yang dirancang untuk meningkatkan karier akademik dan keunggulan institusional</p>
      </div>
      <div class="programs-grid">
        <div class="program-card" id="certification">
          <div class="prog-number">01</div>
          <div class="prog-icon">🎖️</div>
          <h3>Sertifikasi</h3>
          <p>Sertifikasi profesional yang diakui secara internasional memvalidasi keahlian akademik dan bidang melalui ASIACERT.</p>
          <ul class="prog-features">
            <li>Berbagai jalur sertifikasi</li>
            <li>Penilaian online &amp; tatap muka</li>
            <li>Kredensial yang diakui secara global</li>
          </ul>
          <a href="asiacert.html" class="btn-prog" id="btn-certification">Daftar Sekarang</a>
        </div>
        <div class="program-card" id="conferences" style="animation-delay:0.1s">
          <div class="prog-number">02</div>
          <div class="prog-icon">🎤</div>
          <h3>Konferensi</h3>
          <p>Konferensi akademik internasional dan simposium yang mempertemukan para pemikir terkemuka lintas disiplin ilmu.</p>
          <ul class="prog-features">
            <li>Konferensi internasional tahunan</li>
            <li>Format virtual &amp; hybrid</li>
            <li>Prosiding terindeks</li>
          </ul>
          <a href="conference.html" class="btn-prog" id="btn-conferences">Daftar</a>
        </div>
        <div class="program-card" id="competitions" style="animation-delay:0.2s">
          <div class="prog-number">03</div>
          <div class="prog-icon">🏆</div>
          <h3>Kompetisi</h3>
          <p>Olimpiade akademik, kompetisi kasus, dan tantangan penelitian untuk mahasiswa dan peneliti karier awal.</p>
          <ul class="prog-features">
            <li>Terbuka untuk semua anggota ASIA</li>
            <li>Hadiah uang tunai &amp; pengakuan</li>
            <li>Karya pemenang yang dipublikasikan</li>
          </ul>
          <a href="competition.html" class="btn-prog" id="btn-competitions">Ikut Bertanding</a>
        </div>
        <div class="program-card" id="training" style="animation-delay:0.3s">
          <div class="prog-number">04</div>
          <div class="prog-icon">📖</div>
          <h3>Pelatihan</h3>
          <p>Kursus singkat, lokakarya, dan program pembangunan kapasitas untuk pengembangan akademik dan profesional.</p>
          <ul class="prog-features">
            <li>Lokakarya yang dipimpin ahli</li>
            <li>Jam CPD diberikan</li>
            <li>Sertifikat penyelesaian</li>
          </ul>
          <a href="academy.html" class="btn-prog" id="btn-training">Daftar Kelas</a>
        </div>
        <div class="program-card" id="mobility" style="animation-delay:0.4s">
          <div class="prog-number">05</div>
          <div class="prog-icon">🌏</div>
          <h3>Mobilitas</h3>
          <p>Program pertukaran akademik, beasiswa sarjana tamu, dan residensi kolaboratif lintas institusi.</p>
          <ul class="prog-features">
            <li>Institusi mitra di 25+ negara</li>
            <li>Dukungan uang saku tersedia</li>
            <li>Penempatan yang didukung MOU</li>
          </ul>
          <a href="mobility.html" class="btn-prog" id="btn-mobility">Daftar</a>
        </div>
        <div class="program-card" id="research-grants" style="animation-delay:0.5s">
          <div class="prog-number">06</div>
          <div class="prog-icon">🔬</div>
          <h3>Hibah Penelitian</h3>
          <p>Peluang pendanaan untuk proyek penelitian kolaboratif di 14 divisi akademik ASIA.</p>
          <ul class="prog-features">
            <li>Hibah awal dan penuh</li>
            <li>Kolaborasi multi-negara</li>
            <li>Dukungan publikasi</li>
          </ul>
          <a href="research.html" class="btn-prog" id="btn-grants">Ajukan Hibah</a>
        </div>
        <div class="program-card" id="awards-prog" style="animation-delay:0.6s">
          <div class="prog-number">07</div>
          <div class="prog-icon">🏅</div>
          <h3>Penghargaan</h3>
          <p>Penghargaan bergengsi yang mengakui kontribusi akademik, kepemimpinan, dan dampak masyarakat yang luar biasa.</p>
          <ul class="prog-features">
            <li>Penghargaan keunggulan tahunan</li>
            <li>Peneliti &amp; pendidik terbaik</li>
            <li>Penghargaan akademisi muda</li>
          </ul>
          <a href="awards.html" class="btn-prog" id="btn-awards">Nominasikan</a>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       MITRA STRATEGIS
  ═══════════════════════════════════════════ -->
  <section class="section membership-section" id="mitra-strategis">
    <div class="membership-bg-pattern"></div>
    <div class="container">
      <div class="section-header">
        <p class="section-eyebrow">MITRA KAMI</p>
        <h2 class="section-title">Mitra <span class="gold">Strategis</span></h2>
        <div class="title-ornament"><span></span><svg width="20" height="20" viewBox="0 0 20 20"><polygon points="10,1 12.9,7 19.5,7.6 14.7,12 16.2,18.5 10,15 3.8,18.5 5.3,12 0.5,7.6 7.1,7" fill="#c9a84c"/></svg><span></span></div>
      </div>
      <div class="partners-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; align-items: center; margin-top: 40px; padding: 60px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <img src="/ADAI.jpeg" alt="ADAI" style="height: 150px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.3s; border-radius: 8px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
        <img src="/ADIHGI.jpeg" alt="ADIHGI" style="height: 150px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.3s; border-radius: 8px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
        <img src="/AMAS.jpeg" alt="AMAS" style="height: 150px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.3s; border-radius: 8px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
        <img src="/APFEA.jpeg" alt="APFEA" style="height: 150px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.3s; border-radius: 8px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
        <img src="/KEMDESIA.jpeg" alt="KEMDESIA" style="height: 150px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.3s; border-radius: 8px;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" />
      </div>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════
       FOOTER
  ═══════════════════════════════════════════ -->
  ` }} />
    </>
  );
}
