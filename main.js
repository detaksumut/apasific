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
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    /* Back-to-top visibility */
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
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
  hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    this.classList.toggle('active');
  });

  /* Close menu when link clicked */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  /* Mobile dropdown toggle */
  document.querySelectorAll('.has-dropdown').forEach(function (item) {
    const link = item.querySelector('.nav-link');
    link.addEventListener('click', function (e) {
      if (window.innerWidth <= 992) {
        e.preventDefault();
        item.classList.toggle('open');
      }
    });
  });

  /* ═══════════════════════════════════════════════
     ACTIVE SECTION HIGHLIGHT
  ═══════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function highlightActiveSection() {
    const scrollPos = window.scrollY + 140;

    sections.forEach(function (section) {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(function (link) {
          link.classList.remove('active');
          const href = link.getAttribute('href');
          if (href && href === '#' + id) {
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

  /* ═══════════════════════════════════════════════
     CONTACT FORM
  ═══════════════════════════════════════════════ */
  window.handleFormSubmit = function (e) {
    e.preventDefault();
    const btn      = document.getElementById('btn-contact-submit');
    const success  = document.getElementById('form-success');

    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(function () {
      success.classList.add('show');
      btn.textContent = '✓ Sent!';
      btn.style.background = '#4ade80';
      btn.style.color = '#0a1a0a';
      e.target.reset();
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
