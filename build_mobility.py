import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-mobility.png'
    if os.path.exists(img_path):
        img = Image.open(img_path).convert('RGBA')
        datas = img.getdata()
        newData = []
        for item in datas:
            # Remove near-white pixels
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

print("Building mobility.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

mob_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-mobility.png" alt="ASIA-AMC Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.8rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-AMC</h1>
        <p class="page-subtitle" style="font-size: 1.6rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Academic Mobility Center</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Connecting Scholars. Expanding Horizons. Creating Global Impact.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Academic Mobility Center (ASIA-AMC)</strong> is the official international academic mobility and global engagement center of the Association of Asia Pacific Academician (ASIA). It serves as the strategic platform for developing, coordinating, facilitating, and expanding academic mobility programs that connect students, lecturers, researchers, professors, professionals, universities, industries, and institutions across the Asia-Pacific region and the global academic community.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-AMC promotes international learning, collaborative teaching, research mobility, institutional cooperation, intercultural understanding, and professional exchange as essential components of higher education internationalization.
        </p>
        <p class="lead-text" style="text-align: justify;">
          Recognizing that academic mobility extends beyond physical travel, ASIA-AMC develops integrated mobility models that include physical, virtual, hybrid, short-term, long-term, individual, institutional, and collaborative mobility programs. Through these initiatives, the Center seeks to create meaningful academic experiences, strengthen global competencies, and build sustainable international partnerships.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-AMC contributes to the development of globally minded scholars and institutions while supporting education, research, innovation, and sustainable development throughout the Asia-Pacific region.
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
            "To become the leading multidisciplinary academic mobility and global engagement platform in the Asia-Pacific region, connecting people, institutions, knowledge, and cultures through innovative, inclusive, and internationally recognized mobility programs."
          </p>
        </div>

        <!-- MISSION -->
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-AMC is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Developing high-quality international academic mobility programs for students, lecturers, researchers, professionals, and institutions.</li>
          <li>Promoting international collaboration in education, research, innovation, and professional development.</li>
          <li>Expanding opportunities for global learning, intercultural exchange, and academic networking.</li>
          <li>Supporting institutional internationalization through strategic partnerships and collaborative initiatives.</li>
          <li>Facilitating physical, virtual, and hybrid mobility that is accessible, flexible, and technology-enabled.</li>
          <li>Strengthening international research collaboration and knowledge exchange across disciplines.</li>
          <li>Encouraging cultural understanding, global citizenship, and sustainable international cooperation.</li>
          <li>Creating long-term academic, professional, and societal impact through international mobility.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🌍</div>
            <h3>Global Academic Exposure</h3>
            <p>Providing meaningful international learning and professional experiences that broaden perspectives and strengthen global competencies.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">💡</div>
            <h3>Knowledge Exchange</h3>
            <p>Facilitating the exchange of knowledge, teaching practices, research expertise, innovation, and professional experience among institutions and individuals.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🤝</div>
            <h3>International Collaboration</h3>
            <p>Building sustainable partnerships among universities, research institutions, governments, industries, and international organizations.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🏛️</div>
            <h3>Institutional Internationalization</h3>
            <p>Supporting higher education institutions in strengthening international engagement, collaboration, and global visibility.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🎭</div>
            <h3>Intercultural Understanding</h3>
            <p>Promoting respect, diversity, inclusion, and mutual understanding among people from different cultural and academic backgrounds.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🎖️</div>
            <h3>Professional & Leadership Development</h3>
            <p>Developing internationally competent students, educators, researchers, academic leaders, and professionals capable of contributing to global society.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & GLOBAL MOBILITY ECOSYSTEM -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <!-- Roles -->
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-AMC serves as the official international mobility platform responsible for:</p>
            <ul class="values-list">
              <li>Student Exchange & Credit Mobility</li>
              <li>Lecturer & Faculty Exchange</li>
              <li>Visiting Professor & Distinguished Scholar Programs</li>
              <li>International Guest Lecturer Programs</li>
              <li>Researcher Mobility & Fellowship</li>
              <li>Academic Study Visits & Benchmarking</li>
              <li>International Internship & Professional Attachment</li>
              <li>Virtual & Hybrid Academic Mobility</li>
              <li>Collaborative Online International Learning (COIL)</li>
              <li>International Community Engagement</li>
              <li>Global Academic Partnership Development</li>
              <li>International Mobility Network Coordination</li>
            </ul>
          </div>
          
          <!-- Mobility Ecosystem Components -->
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Global Mobility <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Developing an integrated academic mobility ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">International Student Mobility</span>
              <span class="value-badge">Faculty & Lecturer Mobility</span>
              <span class="value-badge">Visiting Professor Network</span>
              <span class="value-badge">Researcher Exchange</span>
              <span class="value-badge">Academic Leadership Exchange</span>
              <span class="value-badge">Academic Study Visits</span>
              <span class="value-badge">International Internship Programs</span>
              <span class="value-badge">Professional Exchange Programs</span>
              <span class="value-badge">Community Engagement Mobility</span>
              <span class="value-badge">Virtual Mobility Campus</span>
              <span class="value-badge">Hybrid Mobility Programs</span>
              <span class="value-badge">Cross-Border Collaborative Learning</span>
              <span class="value-badge">International Academic Partnership Network</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ACADEMIC MOBILITY ECOSYSTEM MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Academic Mobility Ecosystem <span class="gold">Model</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The integrated pathway of international engagement connecting individual mobility to sustainable global impact.
        </p>

        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Student Mobility</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Faculty Exchange</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Visiting Professor</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Research Collaboration</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">International Internship</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Academic Partnership</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Global Academic Network</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Knowledge Exchange</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">International Recognition</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Global Impact</div>
        </div>
      </div>
    </section>

    <!-- MOBILITY SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Mobility <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-AMC supports mobility programs across all multidisciplinary academic fields represented by ASIA, including:
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
          <span class="value-badge">Global Connectivity</span>
          <span class="value-badge">Academic Excellence</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Intercultural Understanding</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Global Citizenship</span>
          <span class="value-badge">Impact</span>
        </div>

        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-AMC is committed to creating an inclusive and globally connected academic mobility ecosystem where learners, educators, researchers, professionals, and institutions collaborate across borders to generate knowledge, strengthen international partnerships, and contribute to sustainable global development.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Connecting Scholars. Expanding Horizons. Creating Global Impact.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble mobility.html
mob_html = header_part + mob_main_content + footer_part

with open('mobility.html', 'w', encoding='utf-8') as f:
    f.write(mob_html)
print("mobility.html created successfully.")


print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html', 'conference.html', 'publication.html', 'mobility.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # In navbar:
        content = content.replace('<a href="https://apasific.org/mobility" target="_blank">', '<a href="mobility.html">')
        
        # In index.html featured card for Mobility Center
        if fn == 'index.html':
            # Looking for the original link to replace it with explore
            content = content.replace('<a href="https://apasific.org/mobility" target="_blank" class="div-link">Visit Website →</a>', 
                                      '<a href="mobility.html" class="div-link">Explore ASIA-AMC →</a>')
            # If there's no Explore link yet, we need to add one.
            # But the original code was: <p>Facilitating cross-border academic exchanges...</p> \n <a href="https://apasific.org/mobility" ...>
            
        # Bump cache to v=12
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=12', content)
        
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("Links and cache updated successfully.")
