import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-riset.png'
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

print("Building research.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

research_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-riset.png" alt="ASIA-RIC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-RIC</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Research & Innovation Council</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Research. Innovation. Impact.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Research & Innovation Council (ASIA-RIC)</strong> is the official research, innovation, and knowledge advancement authority of the Association of Asia Pacific Academician (ASIA). It serves as the strategic body responsible for fostering research excellence, interdisciplinary collaboration, innovation development, intellectual property creation, knowledge commercialization, and international research partnerships across the Asia-Pacific region.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-RIC connects universities, research institutions, industries, governments, professional organizations, funding agencies, and communities through an integrated research ecosystem that encourages scientific discovery, evidence-based innovation, technology development, and sustainable solutions for regional and global challenges.
        </p>
        <p class="lead-text" style="text-align: justify;">
          The Council recognizes that research is not merely the production of scientific publications. It is a continuous process of generating knowledge, transforming ideas into innovation, strengthening policy development, supporting industry advancement, and improving the quality of life through measurable societal impact.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-RIC functions as the driving force for research collaboration, innovation capacity, and academic excellence throughout the ASIA ecosystem.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary research and innovation council in the Asia-Pacific region, advancing scientific excellence, collaborative innovation, and sustainable impact through internationally recognized research ecosystems."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-RIC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing internationally collaborative and multidisciplinary research programs.</li>
          <li>Strengthening research culture, scientific integrity, and academic excellence.</li>
          <li>Promoting innovation, technology development, and intellectual property creation.</li>
          <li>Expanding international research collaboration among universities, industries, governments, and research organizations.</li>
          <li>Supporting high-quality academic publications, knowledge dissemination, and research visibility.</li>
          <li>Facilitating research grants, funding opportunities, and strategic partnerships.</li>
          <li>Encouraging community-based research and evidence-based policy development.</li>
          <li>Integrating digital technologies, artificial intelligence, and data science into research practices.</li>
          <li>Building sustainable innovation ecosystems that generate social, economic, environmental, and technological impact.</li>
          <li>Preparing researchers and institutions to address future global challenges through collaborative innovation.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🔬</div>
            <h3>Research Excellence</h3>
            <p>Promoting high-quality, ethical, multidisciplinary, and internationally recognized research that advances knowledge across diverse academic fields.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">💡</div>
            <h3>Innovation Development</h3>
            <p>Transforming research outcomes into innovative products, technologies, services, policies, and practical solutions that create measurable value.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🤝</div>
            <h3>International Collaboration</h3>
            <p>Building strategic partnerships among universities, research institutions, industries, governments, funding agencies, and international organizations.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🌍</div>
            <h3>Knowledge Creation</h3>
            <p>Encouraging continuous generation, dissemination, preservation, and utilization of scientific knowledge for academic and societal advancement.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">📈</div>
            <h3>Research Capacity Building</h3>
            <p>Strengthening the competencies of researchers, research institutions, and academic communities through training, mentoring, networking, and collaborative learning.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🌱</div>
            <h3>Societal Impact</h3>
            <p>Ensuring research contributes directly to sustainable development, public policy, industry advancement, community empowerment, and global well-being.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & RESEARCH & INNOVATION ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-RIC serves as the official research and innovation platform responsible for:</p>
            <ul class="values-list">
              <li>Research Strategy & Policy Development</li>
              <li>International Collaborative Research</li>
              <li>Innovation & Technology Development</li>
              <li>Intellectual Property & Commercialization</li>
              <li>Research Grants & Funding Programs</li>
              <li>Publication & Knowledge Dissemination</li>
              <li>Research Capacity Building</li>
              <li>Community-Based Research</li>
              <li>Data Science & Digital Research</li>
              <li>Artificial Intelligence for Research</li>
              <li>Research Ethics & Integrity</li>
              <li>Research Impact Assessment</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Research & Innovation <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated research ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">International Research Consortium</span>
              <span class="value-badge">Research Excellence Network</span>
              <span class="value-badge">Innovation & Technology Hub</span>
              <span class="value-badge">Intellectual Property Center</span>
              <span class="value-badge">Research Grant Center</span>
              <span class="value-badge">Publication Development Network</span>
              <span class="value-badge">Community-Based Research Platform</span>
              <span class="value-badge">AI & Data Science Research Lab</span>
              <span class="value-badge">Policy Research Center</span>
              <span class="value-badge">Research Capacity Academy</span>
              <span class="value-badge">Industry–University Collaboration Hub</span>
              <span class="value-badge">Global Research Partnership Network</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- RESEARCH & INNOVATION ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Research & Innovation Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The systematic pathway through which ASIA-RIC bridges theoretical academic research ideas into practical applications and societal impacts.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Research Ideas</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Collaborative Research</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Knowledge Creation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Innovation & Technology</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Publication & Intellectual Property</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Research Commercialization</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Evidence-Based Policy</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Community & Industry Adoption</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Regional & Global Impact</div>
        </div>
      </div>
    </section>

    <!-- RESEARCH SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Research <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-RIC supports multidisciplinary research across all academic fields represented by ASIA, including:
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
          Research initiatives are encouraged to address regional priorities while contributing to global scientific knowledge and sustainable development.
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
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Scientific Rigor</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-RIC is committed to building an internationally connected research ecosystem where collaboration accelerates discovery, innovation transforms knowledge into solutions, and research creates measurable academic, economic, environmental, and societal impact for the Asia-Pacific region and the global community.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Research. Innovation. Impact.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble research.html
research_html = header_part + research_main_content + footer_part

with open('research.html', 'w', encoding='utf-8') as f:
    f.write(research_html)
print("research.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html', 'young.html', 'awards.html', 'research.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/research" target="_blank">', '<a href="research.html">')

        # Bump cache to v=19
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=19', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
