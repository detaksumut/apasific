/* ═══════════════════════════════════════════════════
   ASIA – main.js
   Interactive behaviors, animations, nav
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM Refs ── */
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const backToTop = document.getElementById('backToTop');

  /* ═══════════════════════════════════════════════
     SCROLL-AWARE NAVBAR
  ═══════════════════════════════════════════════ */
  function onScroll() {
    if (navbar && window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else if (navbar) {
      navbar.classList.remove('scrolled');
    }

    /* Back-to-top visibility */
    if (backToTop && window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else if (backToTop) {
      backToTop.classList.remove('visible');
    }

    /* Active nav link highlight */
    highlightActiveSection();

    /* AOS trigger */
    triggerAOS();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ═══════════════════════════════════════════════
     HAMBURGER MENU
  ═══════════════════════════════════════════════ */
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
      this.classList.toggle('active');
    });

    /* Close menu when link clicked (except dropdown triggers) */
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        const parentLi = link.closest('li');
        const isDropdownTrigger = parentLi && parentLi.classList.contains('has-dropdown') && link.classList.contains('nav-link');
        if (!isDropdownTrigger) {
          navLinks.classList.remove('open');
          hamburger.classList.remove('active');
        }
      });
    });
  }

  /* Mobile and Touch dropdown toggle */
  document.querySelectorAll('.has-dropdown').forEach(function (item) {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', function (e) {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const isMobile = window.innerWidth <= 992;
      
      if (isTouch || isMobile) {
        if (!item.classList.contains('open')) {
          e.preventDefault();
          // Close other dropdowns
          document.querySelectorAll('.has-dropdown').forEach(function (other) {
            if (other !== item) other.classList.remove('open');
          });
          item.classList.add('open');
        } else {
          // If already open and on mobile, or it's a hash link, prevent navigation and toggle off
          const href = link.getAttribute('href');
          if (isMobile || (href && href.startsWith('#'))) {
            e.preventDefault();
            item.classList.remove('open');
          }
        }
      }
    });
  });

  /* Close dropdowns when clicking outside */
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown').forEach(function (item) {
        item.classList.remove('open');
      });
    }
  });

  /* ═══════════════════════════════════════════════
     ACTIVE SECTION HIGHLIGHT
  ═══════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function highlightActiveSection() {
    if (!sections.length) return;
    const scrollPos = window.scrollY + 140;

    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (link) {
          link.classList.remove('active');
          const href = link.getAttribute('href');
          if (href && (href === '#' + id || href === '/#' + id)) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════
     ANIMATED STATS COUNTER
  ═══════════════════════════════════════════════ */
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;

    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const rect = heroStats.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      countersStarted = true;

      document.querySelectorAll('.stat-num').forEach(function (el) {
        const target  = parseInt(el.getAttribute('data-target'), 10);
        const suffix  = '';
        const duration = 2000;
        const start   = performance.now();

        function update(now) {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease     = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          const current  = Math.round(ease * target);
          el.textContent = current >= 1000
            ? (current / 1000).toFixed(1) + 'K'
            : current;

          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target >= 1000
            ? (target / 1000).toFixed(0) + ',000'
            : target;
        }

        requestAnimationFrame(update);
      });
    }
  }

  window.addEventListener('scroll', startCounters, { passive: true });
  window.addEventListener('load', startCounters);

  /* ═══════════════════════════════════════════════
     AOS – ANIMATE ON SCROLL
  ═══════════════════════════════════════════════ */
  function triggerAOS() {
    const elements = document.querySelectorAll('[data-aos]:not(.aos-animate)');
    const windowHeight = window.innerHeight;

    elements.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      const delay = parseFloat(el.style.animationDelay) || 0;

      if (rect.top < windowHeight - 60) {
        setTimeout(function () {
          el.classList.add('aos-animate');
        }, delay * 1000);
      }
    });
  }

  window.addEventListener('load', function () {
    setTimeout(triggerAOS, 100);
    setTimeout(startCounters, 200);
  });

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL FOR ALL ANCHOR LINKS
  ═══════════════════════════════════════════════ */
  /* Smooth scroll for pure #id anchors */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* Smooth scroll for /#id anchors when already on home page */
  document.querySelectorAll('a[href^="/#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      if (window.location.pathname !== '/') return; // Let browser navigate normally if not on home
      const href = this.getAttribute('href');
      const id = href.replace('/#', '#');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════════════
     CONTACT FORM
  ═══════════════════════════════════════════════ */
  window.handleFormSubmit = function (e) {
    e.preventDefault();
    const btn      = document.getElementById('btn-contact-submit');
    const success  = document.getElementById('form-success');

    if (!btn) return;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(function () {
      if (success) success.classList.add('show');
      btn.textContent = '✓ Sent!';
      btn.style.background = '#4ade80';
      btn.style.color = '#0a1a0a';
      if (e.target) e.target.reset();
    }, 1200);
  };

  /* ═══════════════════════════════════════════════
     FLOATING PARTICLES (CANVAS)
  ═══════════════════════════════════════════════ */
  const hero = document.querySelector('.hero');
  if (hero) {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.5';
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrame;

    function resize() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x:     Math.random() * canvas.width,
          y:     Math.random() * canvas.height,
          r:     Math.random() * 1.2 + 0.3,
          dx:    (Math.random() - 0.5) * 0.3,
          dy:    -(Math.random() * 0.3 + 0.1),
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + p.alpha + ')';
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
      });
      animFrame = requestAnimationFrame(drawParticles);
    }

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });

    resize();
    createParticles();
    drawParticles();
  }

  /* ═══════════════════════════════════════════════
     MEDALLION INTERACTIVE TILT
  ═══════════════════════════════════════════════ */
  const medallion = document.querySelector('.medallion');
  if (medallion) {
    document.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 768) return;
      const rect   = medallion.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / window.innerWidth  * 10;
      const dy     = (e.clientY - cy) / window.innerHeight * 10;
      medallion.style.transform = 'rotateX(' + (-dy) + 'deg) rotateY(' + dx + 'deg) translateY(0px)';
    });

    medallion.addEventListener('mouseleave', function () {
      medallion.style.transform = '';
    });
  }

  /* ═══════════════════════════════════════════════
     NAVBAR CITY SKYLINE BG ON HERO (decorative)
  ═══════════════════════════════════════════════ */
  function drawSkyline() {
    const heroBg = document.querySelector('.hero');
    if (!heroBg) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1440 300');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText =
      'position:absolute;bottom:90px;left:0;width:100%;height:260px;' +
      'opacity:0.06;pointer-events:none;z-index:1;';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('fill', '#c9a84c');
    path.setAttribute('d',
      'M0,300 L0,200 L40,200 L40,160 L60,160 L60,120 L80,120 L80,160 L100,160 ' +
      'L100,140 L120,140 L120,80 L130,80 L130,60 L140,60 L140,80 L150,80 L150,140 ' +
      'L170,140 L170,160 L200,160 L200,180 L220,180 L220,130 L240,130 L240,90 ' +
      'L250,90 L250,70 L260,70 L260,90 L270,90 L270,130 L300,130 L300,150 ' +
      'L320,150 L320,110 L340,110 L340,70 L350,70 L350,50 L360,50 L360,70 ' +
      'L370,70 L370,110 L400,110 L400,140 L420,140 L420,160 L450,160 L450,100 ' +
      'L470,100 L470,60 L480,60 L480,40 L490,40 L490,60 L500,60 L500,100 ' +
      'L530,100 L530,140 L560,140 L560,160 L580,160 L580,120 L610,120 L610,80 ' +
      'L620,80 L620,60 L630,60 L630,80 L640,80 L640,120 L670,120 L670,150 ' +
      'L700,150 L700,130 L730,130 L730,90 L740,90 L740,70 L750,70 L750,90 ' +
      'L760,90 L760,130 L790,130 L790,150 L820,150 L820,120 L840,120 L840,80 ' +
      'L860,80 L860,100 L880,100 L880,140 L910,140 L910,120 L930,120 L930,80 ' +
      'L950,80 L950,60 L960,60 L960,80 L970,80 L970,120 L1000,120 L1000,150 ' +
      'L1020,150 L1020,130 L1050,130 L1050,90 L1060,90 L1060,70 L1070,70 ' +
      'L1070,90 L1080,90 L1080,130 L1110,130 L1110,150 L1140,150 L1140,170 ' +
      'L1160,170 L1160,130 L1190,130 L1190,90 L1200,90 L1200,70 L1210,70 ' +
      'L1210,90 L1220,90 L1220,130 L1250,130 L1250,160 L1280,160 L1280,180 ' +
      'L1300,180 L1300,160 L1330,160 L1330,140 L1360,140 L1360,170 ' +
      'L1400,170 L1400,200 L1440,200 L1440,300 Z'
    );
    svg.appendChild(path);
    heroBg.appendChild(svg);
  }

  drawSkyline();

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  onScroll();

  // Immediately attempt to run animations in case the load event already fired:
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(triggerAOS, 100);
    setTimeout(startCounters, 200);
  }

})();

/* ═══════════════════════════════════════════════════
   BOC SPECIFIC SCRIPTS
═══════════════════════════════════════════════════ */

/* FAQ Accordion Toggle */
function toggleAccordion(btn) {
  const item = btn.parentElement;
  item.classList.toggle('active');
  const icon = btn.querySelector('.icon');
  if (item.classList.contains('active')) {
    icon.textContent = '−';
  } else {
    icon.textContent = '+';
  }
}

/* Scheme Explorer Filter */
function filterSchemes() {
  const input = document.getElementById('schemeSearch').value.toLowerCase();
  const cards = document.querySelectorAll('.standard-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(input)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

/* Dummy Verification Result */
function verifyCertificate() {
  const input = document.getElementById('verifyInput').value.trim();
  const resultDiv = document.getElementById('verifyResult');
  
  if (!input) {
    resultDiv.style.display = 'none';
    return;
  }
  
  // Fake validation
  resultDiv.style.display = 'flex';
  resultDiv.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <div>
      <strong>Verified Certificate Found</strong><br>
      <span style="font-size: 13px; color: var(--text);">Status: Active | Issued by ASIA BOC</span>
    </div>
  `;
}

/* ── Dynamic Leadership Section for Subpages ── */
async function initDynamicLeadership() {
  const pageToBodyMap = {
    'asiacert.html': 'ASIACERT',
    'boc.html': 'ASIA Board of Certification (BOC)',
    'research.html': 'ASIA Research & Innovation Council (ASIA-RIC)',
    'conference.html': 'ASIA Conference & Academic Forum (ASIA-CAF)',
    'publication.html': 'ASIA Publication & Knowledge Center (ASIA-PKC)',
    'mobility.html': 'ASIA Academic Mobility Center (ASIA-AMC)',
    'competition.html': 'ASIA Competition Center (ASIA-CC)',
    'community.html': 'ASIA Community Engagement & SDGs Center (ASIA-CES)',
    'quality.html': 'ASIA Quality Assurance & Accreditation Board (ASIA-QAAB)',
    'academy.html': 'ASIA Digital Academy & AI Center (ASIA-DAC)',
    'young.html': 'ASIA Young Academician Network (ASIA-YAN)',
    'awards.html': 'ASIA Awards & Recognition Council (ASIA-ARC)'
  };

  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  const bodyName = pageToBodyMap[page];

  if (!bodyName) return;

  try {
    // Attempt to load from API (database)
    const response = await fetch(`/api/leadership?body=${encodeURIComponent(bodyName)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Check if we have at least Ketua or Sekretaris data
    if (!data.ketuaNama && !data.sekNama) {
      // Fallback: check localStorage
      const savedLocal = localStorage.getItem(`leadership_${bodyName}`);
      if (savedLocal) {
        Object.assign(data, JSON.parse(savedLocal));
      } else {
        return; // No data found
      }
    }

    const logo = document.querySelector('.page-hero-logo, .boc-hero-logo img');
    if (!logo) return;

    // Create wrapper row
    const row = document.createElement('div');
    row.className = 'hero-leaders-row';

    // Insert row before logo
    logo.parentNode.insertBefore(row, logo);

    // Create Ketua Card (Left)
    if (data.ketuaNama) {
      const ketuaCard = document.createElement('div');
      ketuaCard.className = 'hero-leader-card ketua';
      
      const photoUrl = data.ketuaPhoto || 'logo-apasific.png';
      ketuaCard.innerHTML = `
        <img src="${photoUrl}" style="width: 150px; height: 200px; border-radius: 6px; object-fit: cover; border: 2px solid #c9a84c; margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(201,168,76,0.35));" />
        <div style="font-weight: 700; color: #fff; font-size: 13px; margin-bottom: 4px; font-family: 'Cinzel', serif; line-height: 1.3;">${data.ketuaNama}</div>
        <div style="color: #c9a84c; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${data.ketuaJabatan || 'Ketua'}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 10px;">${data.ketuaNegara || ''}</div>
        <div style="color: rgba(255,255,255,0.2); font-size: 8px; margin-top: 2px;">${data.ketuaId || ''}</div>
      `;
      row.appendChild(ketuaCard);
    }

    // Append Logo to center
    row.appendChild(logo);

    // Create Sekretaris Card (Right)
    if (data.sekNama) {
      const sekCard = document.createElement('div');
      sekCard.className = 'hero-leader-card sekretaris';
      
      const photoUrl = data.sekretarisPhoto || data.sekPhoto || 'logo-apasific.png';
      sekCard.innerHTML = `
        <img src="${photoUrl}" style="width: 150px; height: 200px; border-radius: 6px; object-fit: cover; border: 2px solid rgba(255,255,255,0.4); margin-bottom: 12px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));" />
        <div style="font-weight: 700; color: #fff; font-size: 13px; margin-bottom: 4px; font-family: 'Cinzel', serif; line-height: 1.3;">${data.sekNama}</div>
        <div style="color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">${data.sekJabatan || 'Sekretaris'}</div>
        <div style="color: rgba(255,255,255,0.4); font-size: 10px;">${data.sekNegara || ''}</div>
        <div style="color: rgba(255,255,255,0.2); font-size: 8px; margin-top: 2px;">${data.sekId || ''}</div>
      `;
      row.appendChild(sekCard);
    }

  } catch (e) {
    console.error('Error rendering dynamic leadership', e);
  }
}

/* ═══════════════════════════════════════════════
   CERTIFICATION EXAM REGISTRATION SYSTEM
   (Drop-in dynamic form for 10 Strategic Bodies)
═══════════════════════════════════════════════ */

const certSchemeMap = {
  'research': { name: 'Research & Innovation Council', cert: 'Certified Research & Innovation Professional (CRIP)', levels: ['Associate (A-CRIP)', 'Professional (P-CRIP)', 'Senior Fellow (SF-CRIP)'],
    scopes: ['Interdisciplinary & Applied Research', 'Quantitative & Mixed-Methods Research', 'Qualitative & Ethnographic Research', 'Policy & Evaluation Research', 'Innovation & Technology Development', 'Research Ethics & Integrity'] },
  'conference': { name: 'Conference & Academic Forum', cert: 'Certified Academic Event Manager (CAEM)', levels: ['Associate (A-CAEM)', 'Professional (P-CAEM)', 'Senior Fellow (SF-CAEM)'],
    scopes: ['International Academic Conference Management', 'Seminar & Symposium Organization', 'Virtual & Hybrid Event Coordination', 'Scientific Committee & Peer Review Facilitation', 'Conference Publication & Proceedings', 'Academic Networking & Collaboration'] },
  'publication': { name: 'Publication & Knowledge Center', cert: 'Certified Scholarly Publishing Specialist (CSPS)', levels: ['Associate (A-CSPS)', 'Professional (P-CSPS)', 'Senior Fellow (SF-CSPS)'],
    scopes: ['Scholarly Journal Publishing', 'Academic Book & Monograph Editing', 'Open Access & Digital Publishing', 'Peer Review Management', 'Citation Indexing & Impact Metrics', 'Intellectual Property & Copyright Management'] },
  'mobility': { name: 'Academic Mobility Center', cert: 'Certified Academic Mobility Advisor (CAMA)', levels: ['Associate (A-CAMA)', 'Professional (P-CAMA)', 'Senior Fellow (SF-CAMA)'],
    scopes: ['Student & Faculty Exchange Programs', 'International Partnership Development', 'Cross-Border Academic Recognition', 'Scholarship & Fellowship Administration', 'Intercultural Academic Advising', 'Mobility Program Evaluation'] },
  'competition': { name: 'Competition Center', cert: 'Certified Science & Technology Innovator (CSTI)', levels: ['Associate (A-CSTI)', 'Professional (P-CSTI)', 'Senior Fellow (SF-CSTI)'],
    scopes: ['STEM & Science Olympiad', 'Innovation & Startup Competition', 'Academic Case Study & Debate', 'Engineering Design Challenge', 'Social Impact & SDGs Competition', 'Creative Arts & Digital Media Competition'] },
  'community': { name: 'Community Engagement & SDGs Center', cert: 'Certified Community Development Practitioner (CCDP)', levels: ['Associate (A-CCDP)', 'Professional (P-CCDP)', 'Senior Fellow (SF-CCDP)'],
    scopes: ['Community Service & Social Outreach', 'SDGs Implementation & Reporting', 'Environmental Advocacy & Sustainability', 'Public Health & Community Well-being', 'Youth & Women Empowerment', 'Rural & Urban Development Programs'] },
  'quality': { name: 'Quality Assurance & Accreditation Board', cert: 'Certified Academic Quality Auditor (CAQA)', levels: ['Associate (A-CAQA)', 'Professional (P-CAQA)', 'Senior Fellow (SF-CAQA)'],
    scopes: ['Academic Accreditation & Standards', 'ISO Quality Management Systems', 'Curriculum & Program Evaluation', 'Institutional Assessment & Benchmarking', 'Internal Audit & Compliance', 'Continuous Improvement & Kaizen in Education'] },
  'academy': { name: 'Digital Academy & AI Center', cert: 'Certified Digital Education & AI Educator (CDAE)', levels: ['Associate (A-CDAE)', 'Professional (P-CDAE)', 'Senior Fellow (SF-CDAE)'],
    scopes: ['AI & Machine Learning in Education', 'Digital Learning Design & E-Learning', 'Data Science & Analytics Literacy', 'Cybersecurity Awareness in Academia', 'EdTech Platform Development', 'Digital Transformation Strategy in HEI'] },
  'young': { name: 'Young Academician Network', cert: 'Certified Early-Career Scholar (CECS)', levels: ['Associate (A-CECS)', 'Professional (P-CECS)', 'Senior Fellow (SF-CECS)'],
    scopes: ['Early-Career Research Development', 'Academic Writing & Scholarly Communication', 'Mentorship & Peer Learning Networks', 'Grant Writing & Research Funding', 'Career Development in Academia', 'Youth Leadership in Academic Institutions'] },
  'awards': { name: 'Awards & Recognition Council', cert: 'Certified Academic Leadership & Excellence Fellow (CALEF)', levels: ['Associate (A-CALEF)', 'Professional (P-CALEF)', 'Senior Fellow (SF-CALEF)'],
    scopes: ['Academic Excellence & Distinguished Scholar Award', 'Leadership in Higher Education', 'Innovation & Impact Recognition', 'Community & SDGs Contribution Award', 'Lifetime Achievement in Academia', 'Emerging Leader & Rising Star Award'] }
};

function initAsiacertHubForm() {
  // Inject CSS style block into the document head
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@1,500;1,600&family=Inter:wght@400;600;700&display=swap');
    .cert-section {
      background: rgba(255,255,255,0.025);
      border: 1.5px solid rgba(201, 168, 76, 0.15);
      border-radius: 20px;
      padding: 40px;
      max-width: 900px;
      margin: 40px auto 80px auto;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    .cert-section::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #c9a84c, #a07828);
    }
    .cert-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      text-align: center;
      margin-bottom: 8px;
    }
    .cert-sub {
      color: #c9a84c;
      font-size: 13.5px;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cert-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cert-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .cert-row { grid-template-columns: 1fr; }
    }
    .cert-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cert-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cert-input, .cert-select {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13.5px;
      color: #fff;
      outline: none;
      transition: all 0.2s;
    }
    .cert-input:focus, .cert-select:focus {
      border-color: rgba(201,168,76,0.5);
      background: rgba(201,168,76,0.03);
    }
    .cert-select option {
      background: #05050a;
      color: #fff;
    }
    /* Exam Methods */
    .method-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 600px) {
      .method-grid { grid-template-columns: 1fr; }
    }
    .method-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 18px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.2s;
    }
    .method-card:hover {
      border-color: rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
    }
    .method-card.active {
      border-color: rgba(201,168,76,0.4);
      background: rgba(201,168,76,0.06);
    }
    .method-radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .method-card.active .method-radio {
      border-color: #c9a84c;
    }
    .method-radio::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c9a84c;
      display: none;
    }
    .method-card.active .method-radio::after {
      display: block;
    }
    .method-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .method-name {
      font-size: 13.5px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      margin-bottom: 4px;
    }
    .method-desc {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      line-height: 1.4;
    }
    .method-info-box {
      background: rgba(201,168,76,0.06);
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 12.5px;
      color: rgba(255,255,255,0.6);
      line-height: 1.5;
      display: none;
    }
    .method-info-box.visible {
      display: block;
    }
    .cert-submit {
      background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(201,168,76,0.2);
      transition: all 0.2s;
      margin-top: 10px;
    }
    .cert-submit:hover {
      box-shadow: 0 6px 24px rgba(201,168,76,0.35);
      transform: translateY(-1px);
    }
    /* Success Page */
    .cert-success {
      display: none;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30px 10px;
    }
    .success-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(52,211,153,0.1);
      border: 1px solid rgba(52,211,153,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34d399;
      font-size: 24px;
      margin-bottom: 18px;
    }
    .success-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .success-desc {
      font-size: 13.5px;
      color: rgba(255,255,255,0.4);
      max-width: 460px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .success-details {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      width: 100%;
      max-width: 440px;
      padding: 16px;
      text-align: left;
      font-size: 12.5px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .success-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      padding-bottom: 8px;
    }
    .success-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .success-label { color: rgba(255,255,255,0.3); }
    .success-val { color: rgba(255,255,255,0.85); font-weight: 600; }

    /* Certificate Previews */
    .cert-preview-section {
      margin-top: 40px;
      border-top: 1px solid rgba(201, 168, 76, 0.15);
      padding-top: 30px;
      width: 100%;
    }
    .cert-preview-heading {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      color: #c9a84c;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .cert-preview-subheading {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      margin-bottom: 25px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.5;
    }
    .cert-preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .cert-preview-grid {
        grid-template-columns: 1fr;
      }
    }
    .certificate-card {
      background: linear-gradient(135deg, #fdfbf7 0%, #f5ebd2 100%);
      border: 3px double #b89739;
      border-radius: 8px;
      padding: 15px;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .certificate-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('/logo-apasific.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 55%;
      opacity: 0.05;
      pointer-events: none;
      z-index: 1;
    }
    .certificate-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px rgba(184, 151, 57, 0.25);
    }
    .certificate-inner {
      border: 1px solid rgba(184, 151, 57, 0.3);
      padding: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      min-height: 270px;
      background: rgba(255, 255, 255, 0.45);
      position: relative;
      z-index: 2;
    }
    .cert-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #555;
      font-weight: 700;
    }
    .cert-card-main-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      color: #a07828;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-top: 6px;
      text-shadow: 0.5px 0.5px 0px rgba(255,255,255,0.8);
    }
    .cert-card-to {
      font-size: 8.5px;
      color: #444;
      font-style: italic;
      margin-top: 4px;
    }
    .cert-card-name {
      font-family: 'Playfair Display', serif;
      font-size: 15.5px;
      color: #0f131d;
      font-weight: 700;
      margin: 4px 0;
      border-bottom: 1px dashed rgba(184, 151, 57, 0.3);
      display: inline-block;
      padding-bottom: 2px;
    }
    .cert-card-text {
      font-size: 8px;
      color: #555;
      line-height: 1.35;
      max-width: 92%;
      margin: 0 auto;
    }
    .cert-card-award {
      font-size: 11.5px;
      color: #a07828;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .cert-card-scheme {
      font-size: 8px;
      color: #333;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
      margin-bottom: 8px;
    }
    .cert-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
    }
    .cert-sig {
      text-align: center;
      flex: 1;
    }
    .sig-line {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 10px;
      color: #0f131d;
      border-bottom: 1px solid rgba(0,0,0,0.15);
      padding-bottom: 1px;
      margin-bottom: 3px;
      font-weight: 600;
    }
    .sig-title {
      font-size: 7px;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .cert-qr {
      margin: 0 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cert-qr img {
      width: 44px;
      height: 44px;
      border: 1px solid rgba(184, 151, 57, 0.3);
      border-radius: 3px;
      background: #fff;
      padding: 1.5px;
    }
  `;
  document.head.appendChild(style);

  // Compute 14 days in advance date string
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  const year = minDate.getFullYear();
  const month = String(minDate.getMonth() + 1).padStart(2, '0');
  const day = String(minDate.getDate()).padStart(2, '0');
  const hours = String(minDate.getHours()).padStart(2, '0');
  const minutes = String(minDate.getMinutes()).padStart(2, '0');
  const minDateTimeStr = `${year}-${month}-${day}T${hours}:${minutes}`;

  // Create form element
  const container = document.createElement('section');
  container.className = 'cert-section';
  container.setAttribute('data-aos', 'fade-up');
  
  container.innerHTML = `
    <div id="certFormWrapper">
      <h3 class="cert-title">ASIACERT Board Registration Hub</h3>
      <p class="cert-sub">ASIACERT & BOC Central Registry</p>
      
      <form class="cert-form" id="certRegForm" onsubmit="event.preventDefault();">
        <div class="cert-row">
          <div class="cert-group">
            <label class="cert-label">Select Certification Field</label>
            <select class="cert-select" id="hubField" required>
              <option value="">-- Choose Field / Strategic Body --</option>
              ${Object.keys(certSchemeMap).map(k => `<option value="${k}">${certSchemeMap[k].name} (${certSchemeMap[k].cert.split('(')[1].replace(')', '')})</option>`).join('')}
            </select>
          </div>
          <div class="cert-group">
            <label class="cert-label">Select Competency Level</label>
            <select class="cert-select" id="hubLevel" required disabled>
              <option value="">-- Select Field First --</option>
            </select>
          </div>
        </div>

        <div class="cert-row">
          <div class="cert-group">
            <label class="cert-label">Full Name & Title</label>
            <input type="text" class="cert-input" id="certName" placeholder="e.g. Prof. Dr. M A Rahman" required />
          </div>
          <div class="cert-group">
            <label class="cert-label">Email Address</label>
            <input type="email" class="cert-input" id="certEmail" placeholder="e.g. marahman2169@gmail.com" required />
          </div>
        </div>

        <div class="cert-row">
          <div class="cert-group">
            <label class="cert-label">Institution / University</label>
            <input type="text" class="cert-input" id="certUniv" placeholder="e.g. Universitas Negeri Medan" required />
          </div>
          <div class="cert-group">
            <label class="cert-label">Phone / WhatsApp Number (Include Country Code)</label>
            <input type="tel" class="cert-input" id="certPhone" placeholder="e.g. +62 813-7006-2009" required />
          </div>
        </div>



        <button type="submit" class="cert-submit" id="certSubmitBtn">Submit Exam Registration</button>
      </form>
    </div>

    <div class="cert-success" id="certSuccessWrapper">
      <div class="success-icon">✓</div>
      <h3 class="success-title">Exam Registration Successful!</h3>
      <p class="success-desc">
        Your registration has been received. A confirmation message has been sent to your Email and WhatsApp Number. Our certification team will verify your credentials shortly.
      </p>
      <div class="success-details">
        <div class="success-row">
          <span class="success-label">Candidate</span>
          <span class="success-val" id="resName">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Academic Field</span>
          <span class="success-val" id="resAcademicField">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Certification</span>
          <span class="success-val" id="resCert">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Scheduled Date</span>
          <span class="success-val" id="resSchedule">-</span>
        </div>
      </div>
      <button class="cert-submit" style="background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.1); width: 180px;" id="certResetBtn">Register Another</button>
    </div>

    <!-- Certificate Mockups Preview -->
    <div class="cert-preview-section">
      <h4 class="cert-preview-heading">Sample Credentials Preview</h4>
      <p class="cert-preview-subheading">Upon passing the assessment, candidates will receive the official digital credentials signed by board directors, verifiable via QR code.</p>
      
      <div class="cert-preview-grid">
        <!-- Certificate 1 -->
        <div class="certificate-card">
          <div class="certificate-inner">
            <div class="cert-card-header">
              <span class="cert-org">ASIACERT & BOC Board Certification</span>
              <span class="cert-id" id="previewId1">ID: AC-SELECT-0842</span>
            </div>
            <div class="cert-card-main-title">BOARD CERTIFICATE</div>
            <div class="cert-card-to">This is to certify that</div>
            <div class="cert-card-name" id="previewName1">Prof. Ahmad Fauzi, Ph.D.</div>
            <div class="cert-card-text">has successfully completed the prescribed course of study and examination, meeting all board standards, and is hereby awarded the designation of</div>
            <div class="cert-card-award" id="previewLevel1">Associate Level</div>
            <div class="cert-card-scheme" id="previewScheme1">Select Strategic Field</div>
            
            <div class="cert-card-footer">
              <div class="cert-sig">
                <div class="sig-line">Dr. Arfan Ikhsan</div>
                <div class="sig-title">President ASIACERT</div>
              </div>
              <div class="cert-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apasific.org" alt="QR Code" />
              </div>
              <div class="cert-sig">
                <div class="sig-line">Dr. Sazili Zainal Abidin</div>
                <div class="sig-title">Chairman BOC</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certificate 2 -->
        <div class="certificate-card">
          <div class="certificate-inner">
            <div class="cert-card-header">
              <span class="cert-org">ASIACERT & BOC Board Certification</span>
              <span class="cert-id" id="previewId2">ID: AC-SELECT-0843</span>
            </div>
            <div class="cert-card-main-title">BOARD CERTIFICATE</div>
            <div class="cert-card-to">This is to certify that</div>
            <div class="cert-card-name" id="previewName2">Prof. Ahmad Fauzi, Ph.D.</div>
            <div class="cert-card-text">has successfully completed the prescribed course of study and examination, meeting all board standards, and is hereby awarded the designation of</div>
            <div class="cert-card-award" id="previewLevel2">Professional Level</div>
            <div class="cert-card-scheme" id="previewScheme2">Select Strategic Field</div>
            
            <div class="cert-card-footer">
              <div class="cert-sig">
                <div class="sig-line">Dr. Arfan Ikhsan</div>
                <div class="sig-title">President ASIACERT</div>
              </div>
              <div class="cert-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apasific.org" alt="QR Code" />
              </div>
              <div class="cert-sig">
                <div class="sig-line">Dr. Sazili Zainal Abidin</div>
                <div class="sig-title">Chairman BOC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Find the closing section or footer to prepend the certification form
  const main = document.querySelector('main');
  const footer = document.querySelector('.footer');
  if (main) {
    main.appendChild(container);
  } else if (footer) {
    footer.parentNode.insertBefore(container, footer);
  }

  // Hook up dynamic selectors
  const fieldSelect = container.querySelector('#hubField');
  const levelSelect = container.querySelector('#hubLevel');
  const nameInput = container.querySelector('#certName');

  function updatePreviews() {
    const nameVal = nameInput.value.trim() || "Prof. Dr. M A Rahman";
    container.querySelector('#previewName1').innerText = nameVal;
    container.querySelector('#previewName2').innerText = nameVal;

    const fieldKey = fieldSelect.value;
    const levelVal = levelSelect.value;

    if (fieldKey && certSchemeMap[fieldKey]) {
      const scheme = certSchemeMap[fieldKey];
      const certNameOnly = scheme.cert.replace(/\s*\([^)]*\)\s*$/, '');
      
      container.querySelector('#previewScheme1').innerText = certNameOnly;
      container.querySelector('#previewScheme2').innerText = certNameOnly;
      container.querySelector('#previewLevel1').innerText = levelVal || scheme.levels[0];
      container.querySelector('#previewLevel2').innerText = scheme.levels[1] || scheme.levels[0];
      
      container.querySelector('#previewId1').innerText = 'ID: AC-' + fieldKey.toUpperCase() + '-0842';
      container.querySelector('#previewId2').innerText = 'ID: AC-' + fieldKey.toUpperCase() + '-0843';
    } else {
      container.querySelector('#previewScheme1').innerText = "Select Strategic Field";
      container.querySelector('#previewScheme2').innerText = "Select Strategic Field";
      container.querySelector('#previewLevel1').innerText = "Associate Level";
      container.querySelector('#previewLevel2').innerText = "Professional Level";
      container.querySelector('#previewId1').innerText = "ID: AC-SELECT-0842";
      container.querySelector('#previewId2').innerText = "ID: AC-SELECT-0843";
    }
  }

  fieldSelect.addEventListener('change', () => {
    const val = fieldSelect.value;
    levelSelect.innerHTML = '';
    if (val && certSchemeMap[val]) {
      const scheme = certSchemeMap[val];
      scheme.levels.forEach(lvl => {
        const opt = document.createElement('option');
        opt.value = lvl;
        opt.innerText = lvl;
        levelSelect.appendChild(opt);
      });
      levelSelect.disabled = false;
    } else {
      const opt = document.createElement('option');
      opt.value = '';
      opt.innerText = '-- Select Field First --';
      levelSelect.appendChild(opt);
      levelSelect.disabled = true;
    }
    updatePreviews();
  });

  levelSelect.addEventListener('change', updatePreviews);
  nameInput.addEventListener('input', updatePreviews);

  // Handle Reset Button
  container.querySelector('#certResetBtn').addEventListener('click', () => {
    container.querySelector('#certSuccessWrapper').style.display = 'none';
    container.querySelector('#certFormWrapper').style.display = 'block';
    container.querySelector('#certRegForm').reset();
    levelSelect.innerHTML = '<option value="">-- Select Field First --</option>';
    levelSelect.disabled = true;
    updatePreviews();
  });

  // Handle Form Submission
  const form = container.querySelector('#certRegForm');
  form.addEventListener('submit', async () => {
    const name = nameInput.value;
    const email = container.querySelector('#certEmail').value;
    const phone = container.querySelector('#certPhone').value;
    const fieldKey = fieldSelect.value;
    const cert = levelSelect.value;
    const univ = container.querySelector('#certUniv').value;
    const scheduleRaw = "TBD by Management";
    const scheduleFormatted = "TBD by Management";
    const submitBtn = container.querySelector('#certSubmitBtn');

    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/certifications/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          cert: `${cert} — ${certSchemeMap[fieldKey]?.name || fieldKey}`,
          method: "Central Registration",
          schedule: scheduleRaw,
          status: "Awaiting Verification"
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Populate results
      container.querySelector('#resName').innerText = name;
      container.querySelector('#resCert').innerText = cert;
      container.querySelector('#resSchedule').innerText = scheduleFormatted;

      // Switch view
      container.querySelector('#certFormWrapper').style.display = 'none';
      container.querySelector('#certSuccessWrapper').style.display = 'flex';
    } catch (e) {
      alert('Error submitting registration: ' + e.message);
    } finally {
      submitBtn.innerText = "Submit Exam Registration";
      submitBtn.disabled = false;
    }
  });
}

function initCertificationExamForm() {
  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('asiacert')) {
    initAsiacertHubForm();
    return;
  }

  // Find which key in certSchemeMap is in path
  const key = Object.keys(certSchemeMap).find(p => path.includes(p));
  if (!key) return;

  const scheme = certSchemeMap[key];
  
  // Inject CSS style block into the document head
  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@1,500;1,600&family=Inter:wght@400;600;700&display=swap');
    .cert-section {
      background: rgba(255,255,255,0.025);
      border: 1.5px solid rgba(201, 168, 76, 0.15);
      border-radius: 20px;
      padding: 40px;
      max-width: 900px;
      margin: 40px auto 80px auto;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    .cert-section::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 4px;
      background: linear-gradient(90deg, #c9a84c, #a07828);
    }
    .cert-title {
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 700;
      color: #fff;
      text-align: center;
      margin-bottom: 8px;
    }
    .cert-sub {
      color: #c9a84c;
      font-size: 13.5px;
      text-align: center;
      margin-bottom: 30px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cert-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .cert-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .cert-row { grid-template-columns: 1fr; }
    }
    .cert-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cert-label {
      font-size: 10px;
      font-weight: 700;
      color: rgba(255,255,255,0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cert-input, .cert-select {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13.5px;
      color: #fff;
      outline: none;
      transition: all 0.2s;
    }
    .cert-input:focus, .cert-select:focus {
      border-color: rgba(201,168,76,0.5);
      background: rgba(201,168,76,0.03);
    }
    .cert-select option {
      background: #05050a;
      color: #fff;
    }
    /* Exam Methods */
    .method-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }
    @media (max-width: 600px) {
      .method-grid { grid-template-columns: 1fr; }
    }
    .method-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 18px;
      cursor: pointer;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.2s;
    }
    .method-card:hover {
      border-color: rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
    }
    .method-card.active {
      border-color: rgba(201,168,76,0.4);
      background: rgba(201,168,76,0.06);
    }
    .method-radio {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .method-card.active .method-radio {
      border-color: #c9a84c;
    }
    .method-radio::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c9a84c;
      display: none;
    }
    .method-card.active .method-radio::after {
      display: block;
    }
    .method-icon {
      font-size: 24px;
      flex-shrink: 0;
    }
    .method-name {
      font-size: 13.5px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
      margin-bottom: 4px;
    }
    .method-desc {
      font-size: 12px;
      color: rgba(255,255,255,0.4);
      line-height: 1.4;
    }
    .method-info-box {
      background: rgba(201,168,76,0.06);
      border: 1px solid rgba(201,168,76,0.15);
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 12.5px;
      color: rgba(255,255,255,0.6);
      line-height: 1.5;
      display: none;
    }
    .method-info-box.visible {
      display: block;
    }
    .cert-submit {
      background: linear-gradient(135deg, #c9a84c 0%, #a07828 100%);
      color: #000;
      border: none;
      border-radius: 8px;
      padding: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(201,168,76,0.2);
      transition: all 0.2s;
      margin-top: 10px;
    }
    .cert-submit:hover {
      box-shadow: 0 6px 24px rgba(201,168,76,0.35);
      transform: translateY(-1px);
    }
    /* Success Page */
    .cert-success {
      display: none;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30px 10px;
    }
    .success-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(52,211,153,0.1);
      border: 1px solid rgba(52,211,153,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #34d399;
      font-size: 24px;
      margin-bottom: 18px;
    }
    .success-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    .success-desc {
      font-size: 13.5px;
      color: rgba(255,255,255,0.4);
      max-width: 460px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .success-details {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      width: 100%;
      max-width: 440px;
      padding: 16px;
      text-align: left;
      font-size: 12.5px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .success-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      padding-bottom: 8px;
    }
    .success-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .success-label { color: rgba(255,255,255,0.3); }
    .success-val { color: rgba(255,255,255,0.85); font-weight: 600; }

    /* Certificate Previews */
    .cert-preview-section {
      margin-top: 40px;
      border-top: 1px solid rgba(201, 168, 76, 0.15);
      padding-top: 30px;
      width: 100%;
    }
    .cert-preview-heading {
      font-family: 'Cinzel', serif;
      font-size: 18px;
      color: #c9a84c;
      text-align: center;
      margin-bottom: 8px;
      letter-spacing: 1px;
    }
    .cert-preview-subheading {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      margin-bottom: 25px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.5;
    }
    .cert-preview-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .cert-preview-grid {
        grid-template-columns: 1fr;
      }
    }
    .certificate-card {
      background: linear-gradient(135deg, #fdfbf7 0%, #f5ebd2 100%);
      border: 3px double #b89739;
      border-radius: 8px;
      padding: 15px;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      font-family: 'Inter', sans-serif;
      color: #1a1a1a;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .certificate-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('/logo-apasific.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: 55%;
      opacity: 0.05;
      pointer-events: none;
      z-index: 1;
    }
    .certificate-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px rgba(184, 151, 57, 0.25);
    }
    .certificate-inner {
      border: 1px solid rgba(184, 151, 57, 0.3);
      padding: 12px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      min-height: 270px;
      background: rgba(255, 255, 255, 0.45);
      position: relative;
      z-index: 2;
    }
    .cert-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #555;
      font-weight: 700;
    }
    .cert-card-main-title {
      font-family: 'Cinzel', serif;
      font-size: 13px;
      color: #a07828;
      letter-spacing: 1.5px;
      font-weight: 700;
      margin-top: 6px;
      text-shadow: 0.5px 0.5px 0px rgba(255,255,255,0.8);
    }
    .cert-card-to {
      font-size: 8.5px;
      color: #444;
      font-style: italic;
      margin-top: 4px;
    }
    .cert-card-name {
      font-family: 'Playfair Display', serif;
      font-size: 15.5px;
      color: #0f131d;
      font-weight: 700;
      margin: 4px 0;
      border-bottom: 1px dashed rgba(184, 151, 57, 0.3);
      display: inline-block;
      padding-bottom: 2px;
    }
    .cert-card-text {
      font-size: 8px;
      color: #555;
      line-height: 1.35;
      max-width: 92%;
      margin: 0 auto;
    }
    .cert-card-award {
      font-size: 11.5px;
      color: #a07828;
      font-weight: 700;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
    .cert-card-scheme {
      font-size: 8px;
      color: #333;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 1px;
      margin-bottom: 8px;
    }
    .cert-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: auto;
    }
    .cert-sig {
      text-align: center;
      flex: 1;
    }
    .sig-line {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 10px;
      color: #0f131d;
      border-bottom: 1px solid rgba(0,0,0,0.15);
      padding-bottom: 1px;
      margin-bottom: 3px;
      font-weight: 600;
    }
    .sig-title {
      font-size: 7px;
      color: #555;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .cert-qr {
      margin: 0 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cert-qr img {
      width: 44px;
      height: 44px;
      border: 1px solid rgba(184, 151, 57, 0.3);
      border-radius: 3px;
      background: #fff;
      padding: 1.5px;
    }
    
    .cert-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 25px;
    }
    .cert-tab-btn {
      flex: 1;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.5);
      padding: 14px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      position: relative;
      transition: color 0.3s;
    }
    .cert-tab-btn.active {
      color: #c9a84c;
    }
    .cert-tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px; left: 0; right: 0;
      height: 2px;
      background: #c9a84c;
    }
    .exam-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px dashed rgba(255,255,255,0.1);
    }
    .exam-timer {
      font-family: monospace;
      font-size: 20px;
      font-weight: 700;
      color: #ff4444;
      background: rgba(255, 68, 68, 0.1);
      padding: 4px 10px;
      border-radius: 4px;
    }
    .exam-q-block {
      margin-bottom: 24px;
      background: rgba(255,255,255,0.02);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .exam-q-text {
      font-size: 15px;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .exam-opt-label {
      display: block;
      margin-bottom: 10px;
      padding: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .exam-opt-label:hover {
      background: rgba(255,255,255,0.05);
    }
    .exam-opt-label input {
      margin-right: 10px;
    }
  `;
  document.head.appendChild(style);

  const certNameOnly = scheme.cert.replace(/\s*\([^)]*\)\s*$/, '');
  const level1 = scheme.levels[0];
  const level2 = scheme.levels[1];

  // Create form element
  const container = document.createElement('section');
  container.className = 'cert-section';
  container.setAttribute('data-aos', 'fade-up');
  
  container.innerHTML = `
    <div id="certFormWrapper">
      <div class="cert-tabs">
        <button class="cert-tab-btn active" id="tabRegister">Registration</button>
        <button class="cert-tab-btn" id="tabExam">Take Exam (MCQ)</button>
      </div>

      <div id="certRegSection">
        <h3 class="cert-title">Certification Registration</h3>
        <p class="cert-sub">${scheme.cert}</p>
        
        <form class="cert-form" id="certRegForm" onsubmit="event.preventDefault();">
        <div class="cert-group">
          <label class="cert-label">Research Scope / Academic Focus</label>
          <select class="cert-select" id="certAcademicField" required>
            <option value="" disabled selected>— Select Scope for ${scheme.name} —</option>
            ${scheme.scopes ? scheme.scopes.map(s => `<option value="${s}">${s}</option>`).join('') : '<option value="General">General</option>'}
          </select>
        </div>

        <div class="cert-group">
          <label class="cert-label">Select Certification Level</label>
          <select class="cert-select" id="certLevel" required>
            ${scheme.levels.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>

        <div class="cert-row">
          <div class="cert-group">
            <label class="cert-label">Full Name & Title</label>
            <input type="text" class="cert-input" id="certName" placeholder="e.g. Prof. Dr. M A Rahman" required />
          </div>
          <div class="cert-group">
            <label class="cert-label">Email Address</label>
            <input type="email" class="cert-input" id="certEmail" placeholder="e.g. marahman2169@gmail.com" required />
          </div>
        </div>

        <div class="cert-row">
          <div class="cert-group">
            <label class="cert-label">Institution / University</label>
            <input type="text" class="cert-input" id="certUniv" placeholder="e.g. Universitas Negeri Medan" required />
          </div>
          <div class="cert-group">
            <label class="cert-label">Phone / WhatsApp Number (Include Country Code)</label>
            <input type="tel" class="cert-input" id="certPhone" placeholder="e.g. +62 813-7006-2009" required />
          </div>
        </div>



        <div class="cert-group">
          <label class="cert-label">Exam Method / Metode Ujian</label>
          <div class="method-grid">
            <div class="method-card active" id="methodMC">
              <div class="method-radio"></div>
              <div class="method-icon">📝</div>
              <div>
                <div class="method-name">Multiple Choice Exam</div>
                <div class="method-desc">Online exam with computerized assessment on the ASIA portal.</div>
              </div>
            </div>
            <div class="method-card" id="methodZoom">
              <div class="method-radio"></div>
              <div class="method-icon">💻</div>
              <div>
                <div class="method-name">Online Interview</div>
                <div class="method-desc">Face-to-face interactive evaluation via Zoom with expert assessors.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="method-info-box visible" id="infoMC">
          <strong>📝 Multiple Choice Exam:</strong> An access token and link to the ASIA online exam platform will be sent to your registered email address 24 hours prior to your scheduled exam time.
        </div>

        <div class="method-info-box" id="infoZoom">
          <strong>💻 Online Interview:</strong> Your Zoom meeting link, assessor assignment, and interview preparation guide will be emailed to you after verification by the ASIA Board of Certification (BOC).
        </div>

        <button type="submit" class="cert-submit" id="certSubmitBtn">Submit Exam Registration</button>
      </form>
      </div> <!-- Close certRegSection -->

      <div id="certExamSection" style="display: none;">
        <h3 class="cert-title">Online MCQ Exam</h3>
        <p class="cert-sub">${scheme.cert}</p>
        
        <div id="examAuthBox">
          <form class="cert-form" id="certExamLoginForm" onsubmit="event.preventDefault();">
            <div class="cert-group">
               <label class="cert-label">Candidate ID (Token)</label>
               <input type="text" id="examToken" class="cert-input" placeholder="e.g. C-1234" required />
            </div>
            <div class="cert-group">
               <label class="cert-label">Registered Email</label>
               <input type="email" id="examEmail" class="cert-input" placeholder="e.g. email@example.com" required />
            </div>
            <div id="examError" class="cert-error" style="display:none; color:#ff4444; margin-bottom:15px; font-size:14px; background:rgba(255,68,68,0.1); padding:10px; border-radius:4px;"></div>
            <button type="submit" class="cert-submit" id="startExamBtn" style="margin-top: 10px;">Access Exam</button>
          </form>
        </div>

        <div id="examActiveBox" style="display:none;">
           <!-- Header will be generated here -->
           <div id="examQuestionsContainer"></div>
           <button type="button" class="cert-submit" id="submitExamAnswersBtn" style="margin-top:20px; background:#4CAF50;">Submit Answers</button>
        </div>
        
        <div id="examResultBox" style="display:none; text-align:center;">
           <div class="success-icon" id="resultIcon">✓</div>
           <h3 class="success-title" id="resultTitle">Exam Completed</h3>
           <p class="success-desc" id="resultDesc">Score: <span id="resultScore"></span>%</p>
        </div>
      </div>
    </div>

    <div class="cert-success" id="certSuccessWrapper">
      <div class="success-icon">✓</div>
      <h3 class="success-title">Exam Registration Successful!</h3>
      <p class="success-desc">
        Your registration has been received. Our certification team will verify your credentials and send details to your email address shortly.
      </p>
      <div class="success-details">
        <div class="success-row">
          <span class="success-label">Candidate</span>
          <span class="success-val" id="resName">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Academic Field</span>
          <span class="success-val" id="resAcademicField">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Certification</span>
          <span class="success-val" id="resCert">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Exam Method</span>
          <span class="success-val" id="resMethod">-</span>
        </div>
        <div class="success-row">
          <span class="success-label">Scheduled Date</span>
          <span class="success-val" id="resSchedule">-</span>
        </div>
      </div>
      <button class="cert-submit" style="background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.1); width: 180px;" id="certResetBtn">Register Another</button>
    </div>

    <!-- Certificate Mockups Preview -->
    <div class="cert-preview-section">
      <h4 class="cert-preview-heading">Sample Credentials Preview</h4>
      <p class="cert-preview-subheading">Upon passing the assessment, candidates will receive the official digital credentials signed by board directors, verifiable via QR code.</p>
      
      <div class="cert-preview-grid">
        <!-- Certificate 1: Level 1 -->
        <div class="certificate-card">
          <div class="certificate-inner">
            <div class="cert-card-header">
              <span class="cert-org">ASIACERT & BOC Board Certification</span>
              <span class="cert-id">ID: AC-${key.toUpperCase()}-0842</span>
            </div>
            <div class="cert-card-main-title">BOARD CERTIFICATE</div>
            <div class="cert-card-to">This is to certify that</div>
            <div class="cert-card-name">Prof. Ahmad Fauzi, Ph.D.</div>
            <div class="cert-card-text">has successfully completed the prescribed course of study and examination, meeting all board standards, and is hereby awarded the designation of</div>
            <div class="cert-card-award">${level1}</div>
            <div class="cert-card-scheme">${certNameOnly}</div>
            
            <div class="cert-card-footer">
              <div class="cert-sig">
                <div class="sig-line">Dr. Arfan Ikhsan</div>
                <div class="sig-title">President ASIACERT</div>
              </div>
              <div class="cert-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apasific.org" alt="QR Code" />
              </div>
              <div class="cert-sig">
                <div class="sig-line">Dr. Sazili Zainal Abidin</div>
                <div class="sig-title">Chairman BOC</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certificate 2: Level 2 -->
        <div class="certificate-card">
          <div class="certificate-inner">
            <div class="cert-card-header">
              <span class="cert-org">ASIACERT & BOC Board Certification</span>
              <span class="cert-id">ID: AC-${key.toUpperCase()}-0843</span>
            </div>
            <div class="cert-card-main-title">BOARD CERTIFICATE</div>
            <div class="cert-card-to">This is to certify that</div>
            <div class="cert-card-name">Dr. Sarah Jenkins, M.B.A.</div>
            <div class="cert-card-text">has successfully completed the prescribed course of study and examination, meeting all board standards, and is hereby awarded the designation of</div>
            <div class="cert-card-award">${level2}</div>
            <div class="cert-card-scheme">${certNameOnly}</div>
            
            <div class="cert-card-footer">
              <div class="cert-sig">
                <div class="sig-line">Dr. Arfan Ikhsan</div>
                <div class="sig-title">President ASIACERT</div>
              </div>
              <div class="cert-qr">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apasific.org" alt="QR Code" />
              </div>
              <div class="cert-sig">
                <div class="sig-line">Dr. Sazili Zainal Abidin</div>
                <div class="sig-title">Chairman BOC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Find the closing section or footer to prepend the certification form
  const main = document.querySelector('main');
  const footer = document.querySelector('.footer');
  if (main) {
    main.appendChild(container);
  } else if (footer) {
    footer.parentNode.insertBefore(container, footer);
  }

  // Hook up event listeners for Exam Method selection
  let selectedMethod = "Multiple Choice Exam";
  const cardMC = container.querySelector('#methodMC');
  const cardZoom = container.querySelector('#methodZoom');
  const infoMC = container.querySelector('#infoMC');
  const infoZoom = container.querySelector('#infoZoom');

  cardMC.addEventListener('click', () => {
    cardMC.classList.add('active');
    cardZoom.classList.remove('active');
    infoMC.classList.add('visible');
    infoZoom.classList.remove('visible');
    selectedMethod = "Multiple Choice Exam";
  });

  cardZoom.addEventListener('click', () => {
    cardZoom.classList.add('active');
    cardMC.classList.remove('active');
    infoZoom.classList.add('visible');
    infoMC.classList.remove('visible');
    selectedMethod = "Online Interview (Zoom)";
  });

  // Handle Reset Button
  container.querySelector('#certResetBtn').addEventListener('click', () => {
    container.querySelector('#certSuccessWrapper').style.display = 'none';
    container.querySelector('#certFormWrapper').style.display = 'block';
    container.querySelector('#certRegForm').reset();
    cardMC.click();
  });

  // Tab Switching Logic
  const tabReg = container.querySelector('#tabRegister');
  const tabExam = container.querySelector('#tabExam');
  const secReg = container.querySelector('#certRegSection');
  const secExam = container.querySelector('#certExamSection');

  if (tabReg && tabExam) {
    tabReg.addEventListener('click', () => {
      tabReg.classList.add('active');
      tabExam.classList.remove('active');
      secReg.style.display = 'block';
      secExam.style.display = 'none';
    });

    tabExam.addEventListener('click', () => {
      tabExam.classList.add('active');
      tabReg.classList.remove('active');
      secExam.style.display = 'block';
      secReg.style.display = 'none';
    });
  }

  // Exam Logic States
  let examTimer = null;
  let examTimeRemaining = 0;
  let currentCandidateId = null;
  let currentEmail = null;
  let currentQuestions = [];
  
  const examLoginForm = container.querySelector('#certExamLoginForm');
  const examAuthBox = container.querySelector('#examAuthBox');
  const examActiveBox = container.querySelector('#examActiveBox');
  const examResultBox = container.querySelector('#examResultBox');
  const examQuestionsContainer = container.querySelector('#examQuestionsContainer');
  const examError = container.querySelector('#examError');
  const startExamBtn = container.querySelector('#startExamBtn');
  const submitExamAnswersBtn = container.querySelector('#submitExamAnswersBtn');

  const updateTimerDisplay = () => {
    const min = Math.floor(examTimeRemaining / 60);
    const sec = examTimeRemaining % 60;
    const disp = document.getElementById('examCountdown');
    if (disp) {
      disp.innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
  };

  const autoSubmitExam = () => {
    clearInterval(examTimer);
    if (submitExamAnswersBtn) submitExamAnswersBtn.click();
  };

  if (examLoginForm) {
    examLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = container.querySelector('#examToken').value;
      const email = container.querySelector('#examEmail').value;
      
      examError.style.display = 'none';
      startExamBtn.innerText = "Authenticating...";
      startExamBtn.disabled = true;

      try {
        const res = await fetch(`/api/certifications/exam?id=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to access exam.");
        }

        if (data.completed) {
          examAuthBox.style.display = 'none';
          examResultBox.style.display = 'block';
          container.querySelector('#resultScore').innerText = data.score;
          const isPass = data.status === "PASSED";
          container.querySelector('#resultTitle').innerText = isPass ? "Congratulations! You Passed" : "Exam Failed";
          container.querySelector('#resultIcon').innerText = isPass ? "✓" : "✕";
          container.querySelector('#resultIcon').style.background = isPass ? "linear-gradient(135deg, #b89739 0%, #d4b86a 100%)" : "#ff4444";
          return;
        }

        // Start Exam Session
        currentCandidateId = token;
        currentEmail = email;
        currentQuestions = data.questions;
        examTimeRemaining = data.timeLimit * 60;
        
        examAuthBox.style.display = 'none';
        examActiveBox.style.display = 'block';
        
        // Render Header
        const headerHtml = `
          <div class="exam-header">
            <div>
              <h4 style="margin:0; color:#c9a84c;">Official Assessment</h4>
              <div style="font-size:12px; opacity:0.6; margin-top:4px;">Candidate: ${token}</div>
            </div>
            <div class="exam-timer" id="examCountdown">--:--</div>
          </div>
        `;
        
        // Render Questions
        const qsHtml = currentQuestions.map((q, i) => `
          <div class="exam-q-block">
            <div class="exam-q-text"><strong>${i+1}.</strong> ${q.text}</div>
            <label class="exam-opt-label">
              <input type="radio" name="ans_${q.id}" value="A" required> A. ${q.options.A}
            </label>
            <label class="exam-opt-label">
              <input type="radio" name="ans_${q.id}" value="B"> B. ${q.options.B}
            </label>
            <label class="exam-opt-label">
              <input type="radio" name="ans_${q.id}" value="C"> C. ${q.options.C}
            </label>
            <label class="exam-opt-label">
              <input type="radio" name="ans_${q.id}" value="D"> D. ${q.options.D}
            </label>
          </div>
        `).join('');
        
        examQuestionsContainer.innerHTML = headerHtml + '<form id="examAnswersForm">' + qsHtml + '</form>';
        updateTimerDisplay();
        
        // Start Timer
        examTimer = setInterval(() => {
          if (examTimeRemaining <= 0) {
            autoSubmitExam();
          } else {
            examTimeRemaining--;
            updateTimerDisplay();
          }
        }, 1000);

      } catch (err) {
        examError.innerText = err.message;
        examError.style.display = 'block';
      } finally {
        startExamBtn.innerText = "Access Exam";
        startExamBtn.disabled = false;
      }
    });
  }

  if (submitExamAnswersBtn) {
    submitExamAnswersBtn.addEventListener('click', async () => {
      clearInterval(examTimer);
      submitExamAnswersBtn.innerText = "Submitting & Grading...";
      submitExamAnswersBtn.disabled = true;

      const ansForm = document.getElementById('examAnswersForm');
      const formData = new FormData(ansForm);
      const answers = {};
      
      currentQuestions.forEach(q => {
        answers[q.id] = formData.get(`ans_${q.id}`) || null;
      });

      try {
        const res = await fetch('/api/certifications/exam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidateId: currentCandidateId,
            email: currentEmail,
            answers
          })
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Submission failed");
        
        examActiveBox.style.display = 'none';
        examResultBox.style.display = 'block';
        
        const isPass = data.status === "PASSED";
        container.querySelector('#resultScore').innerText = data.score;
        container.querySelector('#resultTitle').innerText = isPass ? "Congratulations! You Passed" : "Exam Failed";
        container.querySelector('#resultIcon').innerText = isPass ? "✓" : "✕";
        container.querySelector('#resultIcon').style.background = isPass ? "linear-gradient(135deg, #b89739 0%, #d4b86a 100%)" : "#ff4444";
        
      } catch (err) {
        alert("Error submitting exam: " + err.message);
        submitExamAnswersBtn.innerText = "Submit Answers";
        submitExamAnswersBtn.disabled = false;
      }
    });
  }

  // Handle Form Submission
  const form = container.querySelector('#certRegForm');
  form.addEventListener('submit', async () => {
    const name = container.querySelector('#certName').value;
    const email = container.querySelector('#certEmail').value;
    const phone = container.querySelector('#certPhone').value;
    const cert = container.querySelector('#certLevel').value;
    const academicField = container.querySelector('#certAcademicField').value;
    const univ = container.querySelector('#certUniv').value;
    const scheduleRaw = "TBD by Management";
    const scheduleFormatted = "TBD by Management";
    const submitBtn = container.querySelector('#certSubmitBtn');

    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    try {
      const response = await fetch('/api/certifications/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          academicField,
          cert,
          method: selectedMethod,
          schedule: scheduleRaw,
          status: selectedMethod.includes("Zoom") ? "Awaiting Zoom Link" : "Token Emailed"
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      // Populate results
      container.querySelector('#resName').innerText = name;
      container.querySelector('#resAcademicField').innerText = academicField;
      container.querySelector('#resCert').innerText = cert;
      container.querySelector('#resMethod').innerText = selectedMethod;
      container.querySelector('#resSchedule').innerText = scheduleFormatted;

      // Switch view
      container.querySelector('#certFormWrapper').style.display = 'none';
      container.querySelector('#certSuccessWrapper').style.display = 'flex';
    } catch (e) {
      alert('Error submitting registration: ' + e.message);
    } finally {
      submitBtn.innerText = "Submit Exam Registration";
      submitBtn.disabled = false;
    }
  });
}

// Trigger load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initDynamicLeadership();
    initCertificationExamForm();
  });
} else {
  initDynamicLeadership();
  initCertificationExamForm();
}


