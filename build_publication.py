import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-publication.png'
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

print("Building publication.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

pub_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="asia-publication.png" alt="ASIA-PKC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.8rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-PKC</h1>
        <p class="page-subtitle" style="font-size: 1.6rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Publication & Knowledge Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">From Research to Knowledge. From Knowledge to Impact.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Publication & Knowledge Center (ASIA-PKC)</strong> is the official scholarly publishing, knowledge management, and academic communication center of the Association of Asia Pacific Academician (ASIA). It serves as the strategic hub for developing, managing, preserving, disseminating, and transforming academic knowledge into meaningful contributions for education, research, professional practice, public policy, industry, and society.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-PKC brings together scholars, researchers, authors, editors, reviewers, publishers, universities, research institutions, libraries, and knowledge communities through an integrated publishing ecosystem that promotes academic excellence, ethical publishing, interdisciplinary collaboration, and global knowledge exchange.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Beyond conventional publishing, ASIA-PKC functions as a comprehensive knowledge ecosystem that supports the complete scholarly communication lifecycle—from research creation and peer review to publication, digital preservation, knowledge dissemination, academic impact, and international visibility.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <!-- VISION -->
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary publication and knowledge center in the Asia-Pacific region, advancing scholarly excellence, responsible publishing, open knowledge, digital innovation, and global academic impact."
          </p>
        </div>

        <!-- MISSION -->
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-PKC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing internationally respected academic journals, scholarly books, conference proceedings, and digital publications.</li>
          <li>Promoting ethical, transparent, and responsible scholarly publishing practices.</li>
          <li>Strengthening the competencies of authors, editors, reviewers, publishers, and journal managers.</li>
          <li>Expanding international visibility, accessibility, and impact of scholarly publications.</li>
          <li>Developing integrated digital repositories, academic libraries, and institutional knowledge management systems.</li>
          <li>Supporting interdisciplinary collaboration and cross-border knowledge exchange.</li>
          <li>Transforming research outputs into practical knowledge for education, industry, government, and society.</li>
          <li>Preserving academic knowledge and intellectual heritage for future generations.</li>
          <li>Encouraging innovation in scholarly communication and digital publishing technologies.</li>
          <li>Promoting open science, responsible AI in publishing, and sustainable knowledge ecosystems.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">📖</div>
            <h3>Scholarly Publishing Excellence</h3>
            <p>Developing internationally recognized publications that uphold the highest standards of academic quality, originality, and scientific integrity.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🗄️</div>
            <h3>Knowledge Management</h3>
            <p>Collecting, organizing, preserving, and distributing academic knowledge through modern digital knowledge management systems.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🎓</div>
            <h3>Academic Capacity Building</h3>
            <p>Strengthening the competencies of authors, editors, reviewers, journal managers, and academic publishers through professional development programs.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🌍</div>
            <h3>Global Knowledge Dissemination</h3>
            <p>Expanding international access, visibility, discoverability, and influence of scholarly works produced across the Asia-Pacific region.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">⚖️</div>
            <h3>Research Integrity</h3>
            <p>Promoting responsible research, ethical publishing, transparency, originality, and accountability throughout the scholarly publishing process.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🤝</div>
            <h3>Intellectual Collaboration</h3>
            <p>Building collaborative networks among universities, publishers, research institutions, industries, libraries, and international knowledge communities.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="700">
            <div class="mission-icon">🌱</div>
            <h3>Societal Impact</h3>
            <p>Transforming research findings into practical knowledge, evidence-based policy, professional guidance, educational resources, and community development initiatives.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & KNOWLEDGE ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <!-- Roles -->
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-PKC serves as the official knowledge management and scholarly publishing platform responsible for:</p>
            <ul class="values-list">
              <li>Academic Journal Development</li>
              <li>Scholarly Book Publishing</li>
              <li>Research Monograph Publication</li>
              <li>Conference Proceedings Management</li>
              <li>Editorial & Peer Review Development</li>
              <li>Publication Ethics & Research Integrity</li>
              <li>Digital Repository & Knowledge Preservation</li>
              <li>Knowledge Translation & Science Communication</li>
              <li>Indexing & International Visibility</li>
              <li>Open Science & Open Access Development</li>
              <li>Academic Writing & Publication Capacity Building</li>
              <li>International Publishing Partnerships</li>
            </ul>
          </div>
          
          <!-- Ecosystem Components -->
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Knowledge <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Managing an integrated scholarly communication ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Peer-Reviewed Academic Journals</span>
              <span class="value-badge">Scholarly Books</span>
              <span class="value-badge">Research Monographs</span>
              <span class="value-badge">Edited Volumes</span>
              <span class="value-badge">Conference Proceedings</span>
              <span class="value-badge">Policy Briefs</span>
              <span class="value-badge">Working Papers</span>
              <span class="value-badge">Institutional Research Reports</span>
              <span class="value-badge">Professional Publications</span>
              <span class="value-badge">Open Educational Resources (OER)</span>
              <span class="value-badge">Digital Knowledge Repository</span>
              <span class="value-badge">Academic Digital Library</span>
              <span class="value-badge">Multimedia Learning Resources</span>
              <span class="value-badge">AI-Assisted Knowledge Discovery</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- KNOWLEDGE ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Knowledge Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The ASIA-PKC scholarly communication lifecycle, driving research from creation to measurable societal impact.
        </p>

        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Knowledge Creation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Research & Innovation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Academic Conference</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Peer Review</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Publication</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Digital Repository</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Knowledge Translation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Professional Practice</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Public Policy</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Societal Impact</div>
        </div>
      </div>
    </section>

    <!-- PUBLICATION SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Publication <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-PKC supports publications across all multidisciplinary academic fields represented by ASIA, including:
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

    <!-- GOVERNANCE PRINCIPLES & COMMITMENT -->
    <section class="closing-section" style="padding: 60px 0 100px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Values</span></h2>
        
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto 60px auto;" data-aos="zoom-in">
          <span class="value-badge">Excellence</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Accessibility</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Openness</span>
          <span class="value-badge">Impact</span>
        </div>

        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-PKC is committed to creating a trusted and internationally recognized knowledge ecosystem where research is transformed into accessible knowledge, knowledge inspires innovation, and innovation generates meaningful impact for academia, industry, government, and society.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">From Research to Knowledge. From Knowledge to Impact.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble publication.html
pub_html = header_part + pub_main_content + footer_part

with open('publication.html', 'w', encoding='utf-8') as f:
    f.write(pub_html)
print("publication.html created successfully.")

print("Updating CSS...")
# Append CSS for .vertical-flowchart to style.css if not present
with open('style.css', 'r', encoding='utf-8') as f:
    style = f.read()

if '.vertical-flowchart' not in style:
    vflow_css = """
/* Vertical Flowchart Model */
.vertical-flowchart {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px auto;
  max-width: 600px;
}
.vflow-node {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.15);
  padding: 16px 32px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--text-main);
  text-align: center;
  min-width: 300px;
  transition: all var(--transition);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}
.vflow-node:hover {
  border-color: rgba(201,168,76,0.6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(201,168,76,0.15);
}
.vflow-node.highlight {
  background: rgba(201,168,76,0.05);
  border-color: rgba(201,168,76,0.4);
  color: var(--gold);
}
.vflow-node.impact {
  background: linear-gradient(135deg, rgba(201,168,76,0.2) 0%, transparent 100%);
  border: 2px solid var(--gold);
  color: var(--gold);
  font-size: 1.25rem;
  padding: 20px 40px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 0 30px rgba(201,168,76,0.2);
}
.vflow-arrow {
  color: var(--gold);
  font-size: 1.2rem;
  margin: 12px 0;
  opacity: 0.7;
}
"""
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write(vflow_css)
    print("Appended vertical flowchart CSS to style.css")
else:
    print("Vertical flowchart CSS already exists.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html', 'conference.html', 'publication.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # In navbar:
        content = content.replace('<a href="https://apasific.org/publication" target="_blank">', '<a href="publication.html">')
        
        # In index.html featured card for Publication
        if fn == 'index.html':
            content = content.replace('<a href="https://apasific.org/publication" target="_blank" class="div-link">Explore ASIA-PKC →</a>', 
                                      '<a href="publication.html" class="div-link">Explore ASIA-PKC →</a>')
            # Wait, the index.html might not have a div-link for PKC yet. Let's check.
            # Looking at previous index.html dump:
            # 469:          <h3>Publication &amp; Knowledge Center</h3>
            # 470:          <p>Managing scholarly publications, open-access journals, and the dissemination of academic knowledge.</p>
            # Let's just blindly replace if it exists.
        
        # Bump cache to v=11
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=11', content)
        
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("Links and cache updated successfully.")
