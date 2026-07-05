import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-acadigit.png'
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

print("Building academy.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

academy_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="asia-acadigit.png" alt="ASIA-DAIC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-DAIC</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Digital Academy & AI Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Empowering People. Transforming Education. Shaping the AI Future.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Digital Academy & AI Center (ASIA-DAIC)</strong> is the official digital transformation, artificial intelligence, future skills, and technology innovation center of the Association of Asia Pacific Academician (ASIA). It serves as the strategic platform for developing digital competencies, AI literacy, technology-enabled education, institutional innovation, and responsible digital transformation across the Asia-Pacific region.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-DAIC connects academics, students, researchers, professionals, universities, industries, technology providers, governments, and innovation communities to prepare individuals and institutions for the rapidly evolving digital era.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Recognizing that digital transformation extends beyond technology adoption, ASIA-DAIC promotes the transformation of knowledge, competencies, organizational culture, leadership, governance, research, and lifelong learning. Through integrated education, innovation, artificial intelligence, and digital ecosystems, the Center empowers institutions and professionals to thrive in the future of education, research, work, and society.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-DAIC functions as the digital innovation hub that supports every academic and professional activity within the ASIA ecosystem.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary digital academy and artificial intelligence center in the Asia-Pacific region, empowering people, transforming institutions, and advancing responsible digital innovation for global academic excellence."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-DAIC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing future-ready digital competencies and artificial intelligence capabilities.</li>
          <li>Expanding AI literacy for academics, students, professionals, institutional leaders, and communities.</li>
          <li>Promoting responsible, ethical, transparent, and human-centered artificial intelligence.</li>
          <li>Transforming teaching, learning, research, governance, and professional practice through digital technologies.</li>
          <li>Supporting institutional digital transformation and innovation.</li>
          <li>Building strategic collaboration among academia, industry, technology providers, and governments.</li>
          <li>Encouraging interdisciplinary research and innovation in AI and emerging technologies.</li>
          <li>Providing accessible, inclusive, and lifelong digital learning opportunities.</li>
          <li>Strengthening digital leadership and innovation capacity across the Asia-Pacific region.</li>
          <li>Preparing institutions and professionals for the future of education, work, and society.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🎓</div>
            <h3>Digital Competency Development</h3>
            <p>Building essential and advanced digital skills that enable individuals and institutions to succeed in an increasingly digital world.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🤖</div>
            <h3>Artificial Intelligence Literacy</h3>
            <p>Helping learners and professionals understand, evaluate, develop, and apply artificial intelligence responsibly and effectively.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">💻</div>
            <h3>Digital Transformation</h3>
            <p>Supporting organizational transformation through digital strategy, technology adoption, innovation, and data-driven decision-making.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">⚙️</div>
            <h3>Future Skills Development</h3>
            <p>Preparing individuals with critical competencies required for future careers, leadership, entrepreneurship, and lifelong learning.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🛡️</div>
            <h3>Responsible AI</h3>
            <p>Promoting ethical, transparent, accountable, inclusive, and human-centered artificial intelligence.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">💡</div>
            <h3>Technology Innovation</h3>
            <p>Encouraging research, experimentation, and implementation of emerging technologies that generate academic, professional, and societal impact.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & DIGITAL INNOVATION ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-DAIC serves as the official digital innovation platform responsible for:</p>
            <ul class="values-list">
              <li>Digital Skills Development</li>
              <li>Artificial Intelligence Education</li>
              <li>AI for Teaching & Learning</li>
              <li>AI for Research & Innovation</li>
              <li>Digital Transformation Consulting</li>
              <li>Future Skills Development</li>
              <li>Data Science & Analytics</li>
              <li>Digital Leadership Development</li>
              <li>Responsible AI Governance</li>
              <li>Emerging Technology Programs</li>
              <li>Technology Innovation Ecosystem</li>
              <li>Institutional Digital Capacity Building</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Digital Innovation <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated digital transformation ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Digital Skills Academy</span>
              <span class="value-badge">Artificial Intelligence Academy</span>
              <span class="value-badge">Future Skills Academy</span>
              <span class="value-badge">AI Innovation Lab</span>
              <span class="value-badge">Data Science Lab</span>
              <span class="value-badge">Digital Leadership Academy</span>
              <span class="value-badge">Responsible AI Institute</span>
              <span class="value-badge">Digital Transformation Hub</span>
              <span class="value-badge">Smart Education Initiative</span>
              <span class="value-badge">AI Research Collaboration Network</span>
              <span class="value-badge">Emerging Technology Center</span>
              <span class="value-badge">Innovation Sandbox</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DIGITAL TRANSFORMATION ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Digital Transformation Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The continuous evolutionary roadmap of ASIA-DAIC that drives foundational digital competencies up to high-value human and societal technology impacts.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Digital Literacy</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Future Skills Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Artificial Intelligence Competency</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Teaching & Learning Innovation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Research & Data Analytics</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Institutional Digital Transformation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Responsible AI Governance</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Global Digital Collaboration</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Human & Societal Impact</div>
        </div>
      </div>
    </section>

    <!-- DIGITAL LEARNING SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Digital Learning <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-DAIC supports digital transformation and AI education across all multidisciplinary academic fields represented by ASIA:
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
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Responsibility</span>
          <span class="value-badge">Human-Centeredness</span>
          <span class="value-badge">Inclusion</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Agility</span>
          <span class="value-badge">Ethics</span>
          <span class="value-badge">Lifelong Learning</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-DAIC is committed to building an internationally connected digital innovation ecosystem where technology empowers people, artificial intelligence strengthens education and research, institutions embrace responsible digital transformation, and innovation contributes to sustainable global development.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Empowering People. Transforming Education. Shaping the AI Future.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble academy.html
academy_html = header_part + academy_main_content + footer_part

with open('academy.html', 'w', encoding='utf-8') as f:
    f.write(academy_html)
print("academy.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/academy" target="_blank">', '<a href="academy.html">')

        # Bump cache to v=16
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=16', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
