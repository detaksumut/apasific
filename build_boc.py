import os
import re

print("Building updated boc.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

boc_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-boc.png" alt="ASIA BOC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA BOC</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Board of Certification</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Governing Board of ASIACERT</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Board of Certification (BOC)</strong> is the governing board of the Asia Professional Certification Center (ASIACERT). It serves as the highest policy-making, governance, and oversight body responsible for ensuring the integrity, credibility, quality, and strategic direction of all certification activities conducted under ASIACERT.
        </p>
        <p class="lead-text" style="text-align: justify;">
          The Board establishes certification governance policies, approves competency standards, safeguards impartiality, monitors quality assurance, oversees ethical compliance, and ensures that certification programs are implemented in accordance with internationally accepted principles and best practices.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Rather than conducting day-to-day certification operations, the Board provides strategic leadership and institutional oversight, ensuring that ASIACERT remains independent, accountable, transparent, and internationally respected.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become a respected certification governing board that upholds integrity, quality, impartiality, and international credibility in professional certification across the Asia-Pacific region."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">The Board is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Providing strategic governance for ASIACERT.</li>
          <li>Approving competency standards and certification policies.</li>
          <li>Protecting impartiality, ethics, and institutional integrity.</li>
          <li>Monitoring certification quality and continuous improvement.</li>
          <li>Ensuring transparency and accountability in certification governance.</li>
          <li>Supporting international recognition of ASIACERT certifications.</li>
          <li>Strengthening stakeholder confidence in professional certification.</li>
          <li>Providing independent oversight of certification activities.</li>
        </ul>
      </div>
    </section>

    <!-- CORE RESPONSIBILITIES (GRID FORMAT) -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Responsibilities</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          The Board is actively responsible for the following domains of governance and oversight:
        </p>
        <div class="framework-grid" data-aos="fade-up">
          <div class="framework-card">
            <h4>Governance & Policy</h4>
            <ul>
              <li>Certification Governance</li>
              <li>Strategic Policy Development</li>
              <li>Ethics & Compliance</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Standardization & Quality</h4>
            <ul>
              <li>Competency Standard Approval</li>
              <li>Certification Scheme Approval</li>
              <li>Quality Oversight</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Evaluation & Operations</h4>
            <ul>
              <li>Assessor Approval Framework</li>
              <li>Appeals Governance</li>
              <li>Strategic Evaluation</li>
            </ul>
          </div>
          <div class="framework-card">
            <h4>Risk & Collaboration</h4>
            <ul>
              <li>Risk Management</li>
              <li>Institutional Development</li>
              <li>International Cooperation</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- GOVERNANCE PRINCIPLES -->
    <section class="vm-detail-section" style="padding: 80px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Governance <span class="gold">Principles</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 40px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The Board performs its oversight duties based on these fundamental principles:
        </p>
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto;" data-aos="zoom-in">
          <span class="value-badge">Independence</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Transparency</span>
          <span class="value-badge">Impartiality</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Professionalism</span>
          <span class="value-badge">Quality</span>
          <span class="value-badge">Continuous Improvement</span>
        </div>
      </div>
    </section>

    <!-- CORE VALUES & COMMITMENT -->
    <section class="closing-section" style="padding: 60px 0 100px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Values</span></h2>
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto 60px auto;" data-aos="zoom-in">
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Independence</span>
          <span class="value-badge">Impartiality</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Transparency</span>
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Professionalism</span>
          <span class="value-badge">Trust</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> The Board is committed to ensuring that ASIACERT operates as a trusted, internationally recognized certification institution where governance, professionalism, and quality remain the foundation of every certification program.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Leading Certification Governance with Integrity and Excellence.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble boc.html
updated_boc_html = header_part + boc_main_content + footer_part

# Bump cache to v=21 across all files
print("Updating Navigation Cache across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html', 'young.html', 'awards.html', 'research.html']
for fn in files:
    if os.path.exists(fn):
        if fn == 'boc.html':
            content = updated_boc_html
        else:
            with open(fn, 'r', encoding='utf-8') as f:
                content = f.read()

        # Bump cache to v=21
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=21', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
