import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-quality.png'
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

print("Building quality.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

quality_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-quality.png" alt="ASIA-QAAB Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-QAAB</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Quality Assurance & Accreditation Board</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Assuring Quality. Advancing Standards. Inspiring Excellence.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Quality Assurance & Accreditation Board (ASIA-QAAB)</strong> is the official quality assurance, accreditation, institutional excellence, and continuous improvement authority of the Association of Asia Pacific Academician (ASIA). It serves as the strategic body responsible for developing internationally benchmarked quality standards, conducting independent evaluations, recognizing institutional excellence, and fostering a sustainable culture of quality across higher education institutions, professional organizations, research centers, training providers, and academic programs throughout the Asia-Pacific region.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-QAAB promotes quality not merely as regulatory compliance, but as a continuous journey toward institutional excellence, innovation, accountability, and global competitiveness. Through transparent evaluation systems, evidence-based review processes, and internationally aligned quality frameworks, ASIA-QAAB assists institutions in strengthening governance, academic performance, research quality, community engagement, digital transformation, and sustainable development.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of the strategic bodies of ASIA, ASIA-QAAB plays a vital role in strengthening public confidence, enhancing institutional credibility, encouraging international recognition, and supporting the long-term development of world-class educational and professional institutions.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary quality assurance and accreditation authority in the Asia-Pacific region, advancing institutional excellence, international recognition, continuous improvement, and sustainable quality culture."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-QAAB is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing internationally benchmarked quality assurance and accreditation standards.</li>
          <li>Promoting a sustainable culture of quality, accountability, and continuous improvement.</li>
          <li>Conducting transparent, objective, independent, and evidence-based evaluations.</li>
          <li>Supporting institutions in strengthening governance, leadership, academic quality, research, innovation, and organizational performance.</li>
          <li>Providing internationally respected accreditation, recognition, and quality certification.</li>
          <li>Developing highly competent reviewers, auditors, assessors, and quality professionals.</li>
          <li>Encouraging innovation in quality assurance, digital evaluation, and institutional benchmarking.</li>
          <li>Building regional and international partnerships in quality assurance and accreditation.</li>
          <li>Strengthening institutional competitiveness through quality enhancement and global benchmarking.</li>
          <li>Increasing public trust in institutions recognized by ASIA-QAAB.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🛡️</div>
            <h3>Quality Assurance</h3>
            <p>Developing comprehensive quality assurance systems that enable institutions to consistently achieve high standards of academic and organizational performance.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">📜</div>
            <h3>Accreditation & Recognition</h3>
            <p>Providing credible and internationally recognized accreditation and quality recognition for institutions, programs, professional organizations, and academic centers.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">📈</div>
            <h3>Continuous Quality Improvement</h3>
            <p>Supporting institutions in implementing sustainable improvement strategies through evaluation, mentoring, benchmarking, and innovation.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🏅</div>
            <h3>Institutional Excellence</h3>
            <p>Encouraging institutions to achieve excellence in governance, education, research, innovation, internationalization, and community engagement.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">📐</div>
            <h3>International Benchmarking</h3>
            <p>Promoting the adoption of internationally recognized best practices and global quality standards.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🤝</div>
            <h3>Public Trust</h3>
            <p>Strengthening confidence among students, academics, governments, industries, and society through transparent and accountable quality assurance systems.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & QUALITY ASSURANCE ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-QAAB serves as the official quality authority responsible for:</p>
            <ul class="values-list">
              <li>Institutional Quality Assurance</li>
              <li>Academic Program Accreditation</li>
              <li>Professional Program Recognition</li>
              <li>Research Center Evaluation</li>
              <li>Training Provider Accreditation</li>
              <li>Digital Learning Quality Assurance</li>
              <li>International Benchmarking</li>
              <li>External Quality Review</li>
              <li>Institutional Performance Assessment</li>
              <li>Reviewer & Assessor Development</li>
              <li>Quality Excellence Recognition</li>
              <li>Continuous Quality Improvement</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Quality Assurance <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated quality ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Institutional Accreditation</span>
              <span class="value-badge">Academic Program Accreditation</span>
              <span class="value-badge">Professional Certification Quality Review</span>
              <span class="value-badge">Research Center Assessment</span>
              <span class="value-badge">Journal & Publication Quality Recognition</span>
              <span class="value-badge">Digital Learning Quality Evaluation</span>
              <span class="value-badge">Quality Benchmarking</span>
              <span class="value-badge">Institutional Self-Evaluation</span>
              <span class="value-badge">External Peer Review</span>
              <span class="value-badge">Continuous Quality Improvement Programs</span>
              <span class="value-badge">Excellence Awards</span>
              <span class="value-badge">International Mutual Recognition</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- QUALITY EXCELLENCE ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Quality Excellence Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The continuous improvement framework of ASIA-QAAB that guides institutions towards global standards and institutional excellence.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Institutional Self-Evaluation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">External Quality Review</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Accreditation & Recognition</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Benchmarking</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Quality Enhancement</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Innovation & Transformation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Continuous Improvement</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">International Recognition</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Institutional Excellence</div>
        </div>
      </div>
    </section>

    <!-- QUALITY ASSURANCE SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Quality Assurance <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-QAAB supports quality assurance and accreditation across all multidisciplinary academic fields represented by ASIA:
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
          <span class="value-badge">Independence</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Impartiality</span>
          <span class="value-badge">Transparency</span>
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Continuous Improvement</span>
          <span class="value-badge">International Recognition</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-QAAB is committed to building an internationally respected quality assurance ecosystem where institutions continuously improve, academic standards remain globally relevant, innovation is encouraged, and quality becomes a shared culture that benefits learners, educators, researchers, professionals, and society.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Assuring Quality. Advancing Standards. Inspiring Excellence.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble quality.html
quality_html = header_part + quality_main_content + footer_part

with open('quality.html', 'w', encoding='utf-8') as f:
    f.write(quality_html)
print("quality.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/quality" target="_blank">', '<a href="quality.html">')

        # Bump cache to v=15
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=15', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
