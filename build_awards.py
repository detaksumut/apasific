import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-recog.png'
    if os.path.exists(img_path):
        img = Image.open(img_path).convert('RGBA')
        datas = img.getdata()
        newData = []
        for item in datas:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        img.putdata(newData)
        img.save(img_path)
        print("White background removed from logo.")
    else:
        print(f"Logo not found at {img_path}")
except Exception as e:
    print('Error processing logo:', e)

print("Building awards.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

awards_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-recog.png" alt="ASIA-ARC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-ARC</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Award & Recognition Council</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Recognizing Excellence. Honoring Contribution. Inspiring Impact.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Award & Recognition Council (ASIA-ARC)</strong> is the official awards, honors, recognition, and distinction authority of the Association of Asia Pacific Academician (ASIA). It serves as the strategic body responsible for developing, governing, evaluating, and preserving the integrity of all awards, honorary distinctions, fellowships, institutional recognitions, and lifetime achievement honors conferred under the ASIA ecosystem.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-ARC recognizes that meaningful recognition extends beyond ceremonial appreciation. It is a strategic instrument for promoting excellence, encouraging innovation, strengthening ethical leadership, preserving institutional legacy, and inspiring future generations of academics, researchers, professionals, institutions, and communities.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Through transparent governance, evidence-based evaluation, independent selection processes, and internationally benchmarked recognition standards, ASIA-ARC ensures that every honor reflects genuine achievement, measurable impact, and lasting contribution.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-ARC functions as the guardian of excellence and the institutional mechanism for celebrating outstanding contributions across education, research, innovation, leadership, professional practice, community engagement, digital transformation, sustainability, and international collaboration.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading recognition and honors authority in the Asia-Pacific region, celebrating excellence, preserving legacy, and inspiring future generations through internationally respected awards and recognition programs."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-ARC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing internationally respected awards, honors, and recognition programs.</li>
          <li>Recognizing outstanding achievements by individuals, institutions, organizations, and collaborative initiatives.</li>
          <li>Establishing transparent, evidence-based, and ethical evaluation systems.</li>
          <li>Safeguarding independence, fairness, integrity, and credibility throughout the recognition process.</li>
          <li>Promoting excellence in education, research, innovation, leadership, professional service, and community contribution.</li>
          <li>Preserving the legacy of distinguished scholars, professionals, and institutions.</li>
          <li>Encouraging emerging talents and future leaders to pursue excellence.</li>
          <li>Expanding the international visibility of outstanding achievements across the Asia-Pacific region.</li>
          <li>Building a culture of appreciation, integrity, innovation, and lifelong contribution.</li>
          <li>Strengthening global recognition of impactful academic and professional accomplishments.</li>
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
            <h3>Recognition of Excellence</h3>
            <p>Honoring individuals and institutions that demonstrate outstanding achievement, innovation, and professional distinction.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🎉</div>
            <h3>Celebration of Contribution</h3>
            <p>Recognizing meaningful contributions that advance education, research, society, public service, and sustainable development.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">💡</div>
            <h3>Inspiration for Future Generations</h3>
            <p>Highlighting exemplary achievements that motivate emerging scholars, professionals, and future leaders.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🏛️</div>
            <h3>Legacy Preservation</h3>
            <p>Documenting and preserving the accomplishments of distinguished individuals and institutions as part of the enduring heritage of ASIA.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🏢</div>
            <h3>Institutional Recognition</h3>
            <p>Recognizing organizations, universities, research centers, and professional institutions that consistently demonstrate excellence and positive impact.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🌐</div>
            <h3>International Prestige</h3>
            <p>Enhancing the global reputation and visibility of exceptional achievements originating from the Asia-Pacific region.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & RECOGNITION ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-ARC serves as the official recognition authority responsible for:</p>
            <ul class="values-list">
              <li>Awards & Honors Governance</li>
              <li>Institutional Recognition Programs</li>
              <li>Academic Excellence Awards</li>
              <li>Research & Innovation Awards</li>
              <li>Leadership Recognition</li>
              <li>Community & SDGs Recognition</li>
              <li>International Collaboration Awards</li>
              <li>Young Talent Recognition</li>
              <li>Lifetime Achievement Honors</li>
              <li>Fellowship & Distinguished Membership Recognition</li>
              <li>Hall of Recognition & Legacy Preservation</li>
              <li>Recognition Standards & Evaluation Frameworks</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Recognition <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated recognition ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">ASIA Honors</span>
              <span class="value-badge">Excellence Awards</span>
              <span class="value-badge">Impact Awards</span>
              <span class="value-badge">Emerging Talent Awards</span>
              <span class="value-badge">Institutional Recognition</span>
              <span class="value-badge">Distinguished Fellows</span>
              <span class="value-badge">Honorary Recognition</span>
              <span class="value-badge">Hall of Recognition</span>
              <span class="value-badge">Legacy Series</span>
              <span class="value-badge">Recognition Archive</span>
              <span class="value-badge">Excellence Ambassador Program</span>
              <span class="value-badge">Global Recognition Network</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RECOGNITION EXCELLENCE ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Recognition Excellence <span class="gold">Ecosystem</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The procedural workflow utilized by ASIA-ARC to ensure fair, independent, and high-impact celebration of outstanding contributions.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Outstanding Achievement</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Evidence-Based Nomination</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Independent Evaluation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Recognition & Honors</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">International Visibility</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Institutional Legacy</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Inspiration for Future Leaders</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Academic & Professional Excellence</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Long-Term Societal Impact</div>
        </div>
      </div>
    </section>

    <!-- RECOGNITION SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Recognition <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-ARC recognizes achievements across all multidisciplinary academic fields represented by ASIA:
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
        <p style="text-align: center; margin-top: 30px; font-style: italic; color: var(--gold);" data-aos="fade-up">
          Recognition also extends to universities, research institutions, professional organizations, industries, government agencies, community initiatives, and international collaborations that contribute significantly to academic advancement and societal development.
        </p>
      </div>
    </section>

    <!-- CORE VALUES & COMMITMENT -->
    <section class="closing-section" style="padding: 60px 0 100px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Values</span></h2>
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto 60px auto;" data-aos="zoom-in">
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Impartiality</span>
          <span class="value-badge">Transparency</span>
          <span class="value-badge">Respect</span>
          <span class="value-badge">Inspiration</span>
          <span class="value-badge">Legacy</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-ARC is committed to building a trusted, prestigious, and internationally respected recognition ecosystem where excellence is celebrated with integrity, achievements are evaluated fairly, contributions are preserved as institutional legacy, and recognition inspires continuous innovation, ethical leadership, and sustainable impact across generations.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Recognizing Excellence. Honoring Contribution. Inspiring Impact.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble awards.html
awards_html = header_part + awards_main_content + footer_part

with open('awards.html', 'w', encoding='utf-8') as f:
    f.write(awards_html)
print("awards.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html', 'young.html', 'awards.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/awards" target="_blank">', '<a href="awards.html">')

        # Bump cache to v=18
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=18', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
