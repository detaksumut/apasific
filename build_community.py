import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-engg.png'
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

print("Building community.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

community_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="asia-engg.png" alt="ASIA-CESC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-CESC</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Community Engagement & SDGs Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Local Action. Global Goals. Sustainable Impact.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Community Engagement & SDGs Center (ASIA-CESC)</strong> is the official community engagement, social innovation, sustainability, and impact development center of the Association of Asia Pacific Academician (ASIA). It serves as the strategic platform for translating academic knowledge, scientific research, technological innovation, and professional expertise into meaningful actions that improve communities and contribute to sustainable development across the Asia-Pacific region and beyond.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-CESC connects universities, researchers, students, professionals, governments, industries, civil society organizations, local communities, and international partners through collaborative initiatives that address real-world challenges in education, health, economy, environment, governance, technology, and social development.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Rather than viewing community engagement as a one-time outreach activity, ASIA-CESC promotes a long-term impact ecosystem where research generates innovation, innovation empowers communities, and empowered communities create sustainable transformation aligned with the United Nations Sustainable Development Goals (SDGs).
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-CESC strengthens the social responsibility of higher education institutions while advancing inclusive development, environmental stewardship, and international cooperation for a better future.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading multidisciplinary community engagement and sustainable development center in the Asia-Pacific region, transforming academic knowledge into measurable social, economic, environmental, and global impact."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-CESC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing high-impact community engagement programs that improve the quality of life of communities.</li>
          <li>Supporting the implementation of the United Nations Sustainable Development Goals through academic collaboration and innovation.</li>
          <li>Transforming research findings into practical solutions for social, economic, educational, environmental, and governance challenges.</li>
          <li>Empowering communities through education, entrepreneurship, digital transformation, and sustainable development initiatives.</li>
          <li>Strengthening partnerships among universities, governments, industries, NGOs, and international organizations.</li>
          <li>Encouraging international community service, global volunteering, and cross-border social collaboration.</li>
          <li>Promoting social innovation and evidence-based community development.</li>
          <li>Measuring, documenting, and communicating the long-term impact of community engagement initiatives.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🏘️</div>
            <h3>Community Empowerment</h3>
            <p>Strengthening the capacity, resilience, independence, and well-being of communities through sustainable development initiatives.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🌿</div>
            <h3>Sustainable Development</h3>
            <p>Supporting practical implementation of the Sustainable Development Goals through collaborative action and evidence-based programs.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🔬</div>
            <h3>Knowledge-to-Impact</h3>
            <p>Transforming academic knowledge, research, and innovation into real solutions that address community needs and create measurable impact.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">💡</div>
            <h3>Social Innovation</h3>
            <p>Encouraging creative, inclusive, and technology-driven approaches to solving social and environmental challenges.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🤝</div>
            <h3>Global Collaboration</h3>
            <p>Building strong partnerships among universities, governments, industries, NGOs, development agencies, and international organizations.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">📊</div>
            <h3>Impact Measurement</h3>
            <p>Ensuring every community engagement initiative generates measurable, transparent, and sustainable outcomes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & COMMUNITY IMPACT ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-CESC serves as the official community engagement and sustainability platform responsible for:</p>
            <ul class="values-list">
              <li>Community Empowerment Programs</li>
              <li>Sustainable Development Goals (SDGs) Initiatives</li>
              <li>International Community Service</li>
              <li>Global Volunteering Programs</li>
              <li>Social Innovation & Social Entrepreneurship</li>
              <li>Community-Based Research</li>
              <li>Climate Action & Environmental Sustainability</li>
              <li>Digital Inclusion & Community Literacy</li>
              <li>University–Community Partnerships</li>
              <li>Impact Assessment & Sustainability Reporting</li>
              <li>International Development Collaboration</li>
              <li>Knowledge Translation for Society</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Community Impact <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated community impact ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Community Empowerment Programs</span>
              <span class="value-badge">SDGs Action Initiatives</span>
              <span class="value-badge">Social Innovation Laboratories</span>
              <span class="value-badge">International Community Service</span>
              <span class="value-badge">Global Volunteer Network</span>
              <span class="value-badge">Community-Based Research</span>
              <span class="value-badge">Social Entrepreneurship Programs</span>
              <span class="value-badge">Climate Action Projects</span>
              <span class="value-badge">Environmental Sustainability Programs</span>
              <span class="value-badge">Digital Literacy & Inclusion</span>
              <span class="value-badge">Community Leadership Development</span>
              <span class="value-badge">Impact Measurement & Reporting</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- COMMUNITY IMPACT ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Community Impact Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The integrated pathway that transforms academic knowledge into measurable, lasting sustainable development for communities and society.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Academic Knowledge</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Research & Innovation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Community Engagement</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Social Innovation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">SDGs Implementation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Impact Measurement</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Knowledge Sharing</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Policy & Community Adoption</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Sustainable Development</div>
        </div>
      </div>
    </section>

    <!-- COMMUNITY DEVELOPMENT SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Community Development <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-CESC supports multidisciplinary community engagement initiatives across all academic fields represented by ASIA:
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
          <span class="value-badge">Empowerment</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Compassion</span>
          <span class="value-badge">Accountability</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-CESC is committed to building an internationally connected community engagement ecosystem where academic knowledge becomes practical action, collaboration creates innovation, and innovation generates measurable and sustainable impact for communities, institutions, and future generations.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Local Action. Global Goals. Sustainable Impact.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble community.html
community_html = header_part + community_main_content + footer_part

with open('community.html', 'w', encoding='utf-8') as f:
    f.write(community_html)
print("community.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/community" target="_blank">', '<a href="community.html">')

        # Bump cache to v=14
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=14', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
