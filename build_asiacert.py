import os
import re

print("Building updated asiacert.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

asiacert_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-cert.png" alt="ASIACERT Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIACERT</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">Asia Professional Certification Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Certifying Competence. Empowering Professionals. Advancing Global Excellence.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The Asia Professional Certification Center (ASIACERT)</strong> is the official professional certification body of the Association of Asia Pacific Academician (ASIA). It serves as the principal institution responsible for designing, implementing, administering, and continuously improving competency-based professional certification systems across multidisciplinary academic and professional fields throughout the Asia-Pacific region.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIACERT was established to promote internationally recognized competency standards, strengthen professional qualifications, and enhance the global competitiveness of academics, professionals, institutions, industries, and public organizations.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Through transparent assessment processes, competency-based evaluation, digital credentialing, continuing professional development, and internationally benchmarked certification schemes, ASIACERT provides credible recognition of professional competence while supporting lifelong learning and workforce excellence.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Operating under the governance of the Board of Certification (BOC), ASIACERT ensures that every certification program is conducted with integrity, impartiality, transparency, quality assurance, and international best practices.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary professional certification center in the Asia-Pacific region, providing internationally recognized certification systems that strengthen professional competence, lifelong learning, and global workforce excellence."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIACERT is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing internationally benchmarked competency-based certification schemes.</li>
          <li>Delivering credible, transparent, and impartial professional certification services.</li>
          <li>Strengthening professional competence across multidisciplinary academic and professional fields.</li>
          <li>Supporting universities, industries, governments, and professional organizations through internationally recognized certification programs.</li>
          <li>Promoting lifelong learning and continuing professional development.</li>
          <li>Integrating digital technologies into certification, assessment, and credential verification.</li>
          <li>Expanding international cooperation and mutual recognition of professional qualifications.</li>
          <li>Ensuring quality, integrity, and continuous improvement throughout the certification lifecycle.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🏅</div>
            <h3>Professional Competency Certification</h3>
            <p>Providing internationally benchmarked recognition of professional skills, knowledge, and ethical conduct.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">📝</div>
            <h3>Competency Assessment</h3>
            <p>Implementing reliable, transparent, and multi-method competency assessment systems to evaluate candidate performance.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🤝</div>
            <h3>Professional Recognition</h3>
            <p>Enhancing the visibility, credibility, and value of certified professionals in the global academic and industry market.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🎓</div>
            <h3>Continuing Professional Development (CPD)</h3>
            <p>Advocating for lifelong learning and professional growth through continuing education, mentoring, and research activities.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">💻</div>
            <h3>Digital Credentials & Verification</h3>
            <p>Providing secure, verifiable, and globally accessible digital certificates and credentials utilizing advanced technologies.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">📈</div>
            <h3>Workforce Development</h3>
            <p>Contributing directly to the enhancement of workforce competencies, professional standards, and employment opportunities.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="700">
            <div class="mission-icon">🌐</div>
            <h3>International Certification Recognition</h3>
            <p>Building strategic partnerships to establish mutual acceptance and international recognition of ASIACERT certifications.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="800">
            <div class="mission-icon">🛡️</div>
            <h3>Quality Assurance in Certification</h3>
            <p>Upholding the highest standards of certification operations through systematic quality reviews, audits, and policy enforcement.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & CERTIFICATION SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIACERT serves as the official professional certification institution responsible for:</p>
            <ul class="values-list">
              <li>Professional Certification Programs</li>
              <li>Competency Assessment</li>
              <li>Certification Scheme Development</li>
              <li>Assessor Development</li>
              <li>Examination & Interview Management</li>
              <li>Recognition of Prior Learning (RPL)</li>
              <li>Digital Certification</li>
              <li>Continuing Professional Development (CPD)</li>
              <li>Certification Renewal</li>
              <li>International Certification Cooperation</li>
              <li>Certification Information Services</li>
              <li>Certification Quality Management</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Certification <span class="gold">Scope</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIACERT develops certification schemes covering all multidisciplinary fields represented by ASIA:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Accounting, Auditing & Taxation</span>
              <span class="value-badge">Business, Management & Entrepreneurship</span>
              <span class="value-badge">Finance, Banking & Investment</span>
              <span class="value-badge">Human Resources & Organizational Development</span>
              <span class="value-badge">Economics & Public Policy</span>
              <span class="value-badge">Education & Academic Development</span>
              <span class="value-badge">Law, Governance & Public Administration</span>
              <span class="value-badge">Information Technology, Artificial Intelligence & Digital Transformation</span>
              <span class="value-badge">Engineering, Technology & Applied Sciences</span>
              <span class="value-badge">Social Sciences, Humanities & Communication</span>
              <span class="value-badge">Tourism, Hospitality & Creative Economy</span>
              <span class="value-badge">Health, Public Health & Well-Being</span>
              <span class="value-badge">Agriculture, Environment & Sustainability</span>
              <span class="value-badge">Islamic Studies, Ethics & Spirituality</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CERTIFICATION ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Certification Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The procedural lifecycle through which candidates develop, validate, verify, and maintain their professional competencies.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Competency Standards</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Certification Schemes</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Candidate Registration</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Competency Assessment</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Professional Certification</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Digital Credential</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Continuing Professional Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Certification Renewal</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">International Recognition</div>
        </div>
      </div>
    </section>

    <!-- SCOPE OF DISCIPLINES (GRID FORMAT) -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Scope of <span class="gold">Disciplines</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIACERT supports professional certification across all 14 academic divisions of ASIA:
        </p>
        <div class="framework-grid" data-aos="fade-up">
          <div class="framework-card">
            <h4>Finance & Business</h4>
            <ul>
              <li>Accounting, Auditing & Taxation</li>
              <li>Business, Management & Entrepreneurship</li>
              <li>Finance, Banking & Investment</li>
              <li>Economics & Public Policy</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Technology & Engineering</h4>
            <ul>
              <li>IT, Artificial Intelligence & Digital Transformation</li>
              <li>Engineering, Technology & Applied Sciences</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Social & Humanities</h4>
            <ul>
              <li>Human Resources & Organizational Development</li>
              <li>Education & Academic Development</li>
              <li>Law, Governance & Public Administration</li>
              <li>Social Sciences, Humanities & Communication</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Health & Sciences</h4>
            <ul>
              <li>Health, Public Health & Well-Being</li>
              <li>Agriculture, Environment & Sustainability</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Industry & Specializations</h4>
            <ul>
              <li>Tourism, Hospitality & Creative Economy</li>
              <li>Islamic Studies, Ethics & Spirituality</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CORE VALUES & COMMITMENT -->
    <section class="closing-section" style="padding: 60px 0 100px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Values</span></h2>
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto 60px auto;" data-aos="zoom-in">
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Professionalism</span>
          <span class="value-badge">Competence</span>
          <span class="value-badge">Transparency</span>
          <span class="value-badge">Fairness</span>
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Accountability</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIACERT is committed to building a trusted, internationally recognized certification ecosystem that validates professional competence, supports lifelong learning, strengthens workforce quality, and contributes to sustainable development across the Asia-Pacific region.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Certifying Competence. Empowering Professionals. Advancing Global Excellence.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble asiacert.html
updated_asiacert_html = header_part + asiacert_main_content + footer_part

# Bump cache to v=20 across all files
print("Updating Navigation Cache across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html', 'young.html', 'awards.html', 'research.html']
for fn in files:
    if os.path.exists(fn):
        if fn == 'asiacert.html':
            content = updated_asiacert_html
        else:
            with open(fn, 'r', encoding='utf-8') as f:
                content = f.read()

        # Bump cache to v=20
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=20', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
