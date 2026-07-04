import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-compet.png'
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

print("Building competition.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

comp_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-compet.png" alt="ASIA-CC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.8rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-CC</h1>
        <p class="page-subtitle" style="font-size: 1.6rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Competition Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Compete. Innovate. Excel.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Competition Center (ASIA-CC)</strong> is the official competition, talent development, and innovation platform of the Association of Asia Pacific Academician (ASIA). It serves as the strategic center for designing, organizing, managing, and expanding multidisciplinary academic, professional, research, business, technology, innovation, and creative competitions across the Asia-Pacific region and beyond.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-CC brings together students, academics, researchers, professionals, entrepreneurs, innovators, educational institutions, industries, and international partners in a competitive ecosystem that promotes excellence, creativity, collaboration, ethical competition, and continuous professional growth.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Beyond organizing competitions, ASIA-CC is dedicated to discovering outstanding talent, nurturing future leaders, encouraging innovation, and building internationally competitive human capital capable of addressing global challenges through knowledge, creativity, and responsible leadership.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of the strategic bodies of ASIA, ASIA-CC transforms competition into a comprehensive learning experience where participants strengthen competencies, expand international networks, and contribute meaningful solutions to society.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary competition and talent development center in the Asia-Pacific region, inspiring excellence, innovation, creativity, and global competitiveness through internationally recognized competition platforms."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-CC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Organizing high-quality academic, professional, research, innovation, and creative competitions at national, regional, and international levels.</li>
          <li>Promoting excellence, creativity, innovation, entrepreneurship, and professional competence through competitive learning experiences.</li>
          <li>Providing transparent, fair, ethical, and internationally benchmarked competition systems.</li>
          <li>Identifying, nurturing, and recognizing outstanding talents, innovators, and future leaders.</li>
          <li>Strengthening collaboration among universities, industries, governments, professional organizations, and international institutions.</li>
          <li>Developing future-ready competencies including leadership, critical thinking, teamwork, communication, creativity, and problem-solving.</li>
          <li>Encouraging responsible innovation and technology-driven solutions that contribute to sustainable development.</li>
          <li>Expanding international participation and cross-border academic collaboration.</li>
          <li>Integrating digital technologies and artificial intelligence into competition management.</li>
          <li>Creating sustainable academic, professional, economic, and societal impact through international competitions.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🏆</div>
            <h3>Excellence Development</h3>
            <p>Encouraging individuals and institutions to achieve the highest standards of academic, professional, technological, and entrepreneurial excellence.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🌟</div>
            <h3>Talent Discovery</h3>
            <p>Identifying and developing outstanding students, researchers, innovators, entrepreneurs, educators, and professionals with exceptional potential.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">⚙️</div>
            <h3>Competency Development</h3>
            <p>Strengthening analytical thinking, creativity, leadership, teamwork, communication, innovation, and professional skills through structured competitions.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">💡</div>
            <h3>Innovation Promotion</h3>
            <p>Providing platforms that encourage participants to create innovative products, technologies, business models, research, and social solutions.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🌐</div>
            <h3>Global Competitiveness</h3>
            <p>Preparing participants to compete, collaborate, and lead successfully within the international academic and professional community.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🎖️</div>
            <h3>Institutional Recognition</h3>
            <p>Recognizing universities, organizations, and institutions that demonstrate excellence in innovation, education, research, and professional development.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & COMPETITION ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-CC serves as the official competition and talent development platform responsible for:</p>
            <ul class="values-list">
              <li>Academic Olympiads</li>
              <li>Research Competitions</li>
              <li>Innovation Challenges</li>
              <li>Business & Entrepreneurship Competitions</li>
              <li>Professional Competency Challenges</li>
              <li>Artificial Intelligence Competitions</li>
              <li>Technology & Engineering Competitions</li>
              <li>Creative Media & Digital Competitions</li>
              <li>Sustainable Development Challenges</li>
              <li>Student Leadership Competitions</li>
              <li>International Judging & Evaluation Systems</li>
              <li>Global Talent Recognition Programs</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Competition <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated international competition ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Academic Olympiad Series</span>
              <span class="value-badge">International Research Competition</span>
              <span class="value-badge">Innovation Challenge</span>
              <span class="value-badge">Startup & Entrepreneurship Competition</span>
              <span class="value-badge">Business Case Competition</span>
              <span class="value-badge">Professional Skills Competition</span>
              <span class="value-badge">Artificial Intelligence Challenge</span>
              <span class="value-badge">Digital Creativity Competition</span>
              <span class="value-badge">Sustainable Development Challenge</span>
              <span class="value-badge">Young Researcher Competition</span>
              <span class="value-badge">Student Leadership Competition</span>
              <span class="value-badge">International Poster Competition</span>
              <span class="value-badge">Global Pitching Competition</span>
              <span class="value-badge">Future Innovators Program</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMPETITION ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Competition Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The integrated pathway that transforms raw talent into world-class leaders and innovators capable of creating lasting societal impact.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Talent Discovery</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Knowledge & Skills Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Academic & Professional Competition</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Innovation Showcase</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">International Recognition</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Networking & Collaboration</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Leadership Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Career & Professional Opportunities</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Societal Impact</div>
        </div>
      </div>
    </section>

    <!-- COMPETITION SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Competition <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-CC organizes competitions across all multidisciplinary academic fields represented by ASIA, including:
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
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Fairness</span>
          <span class="value-badge">Global Competitiveness</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-CC is committed to creating a trusted, inclusive, and internationally recognized competition ecosystem that empowers individuals and institutions to achieve excellence, discover talent, foster innovation, strengthen global collaboration, and generate meaningful contributions to academic advancement and sustainable development.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Compete. Innovate. Excel.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble competition.html
comp_html = header_part + comp_main_content + footer_part

with open('competition.html', 'w', encoding='utf-8') as f:
    f.write(comp_html)
print("competition.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html', 
         'conference.html', 'publication.html', 'mobility.html', 'competition.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/competition" target="_blank">', '<a href="competition.html">')
        
        # Fix index.html featured card
        if fn == 'index.html':
            content = content.replace('<a href="https://apasific.org/competition" target="_blank" class="div-link">Visit Website →</a>',
                                      '<a href="competition.html" class="div-link">Explore ASIA-CC →</a>')
        
        # Bump cache to v=13
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=13', content)
        
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
