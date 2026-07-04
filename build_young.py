import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-young.png'
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

print("Building young.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

young_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-young.png" alt="ASIA-YAN Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.4rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-YAN</h1>
        <p class="page-subtitle" style="font-size: 1.4rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Young Academicians Network</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Connect. Grow. Lead.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Young Academicians Network (ASIA-YAN)</strong> is the official network for young academics, emerging scholars, early-career researchers, doctoral candidates, postdoctoral fellows, and future academic leaders under the Association of Asia Pacific Academician (ASIA). It serves as the strategic platform for connecting, empowering, mentoring, and preparing the next generation of academic leaders across the Asia-Pacific region.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-YAN creates an inclusive ecosystem where young scholars can strengthen academic competencies, expand international networks, collaborate in multidisciplinary research, participate in global academic activities, develop leadership capacity, and contribute to addressing regional and global challenges through education, research, innovation, and community engagement.
        </p>
        <p class="lead-text" style="text-align: justify;">
          The Network is founded on the belief that the future of higher education depends on investing in the next generation of scholars. Young academicians are not merely future successors—they are today's innovators, researchers, educators, entrepreneurs, and changemakers.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-YAN functions as the talent development and leadership pipeline that prepares outstanding members to contribute actively across every initiative within the ASIA ecosystem.
        </p>
      </div>
    </section>

    <!-- VISION & MISSION -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="detail-vision-box" data-aos="zoom-in" style="margin-bottom: 60px;">
          <h2 class="section-title" style="font-size: 28px; text-align: center;">Our <span class="gold">Vision</span></h2>
          <p style="font-style: italic; margin-top: 20px;">
            "To become the leading Asia-Pacific network that develops globally connected, innovative, ethical, and impactful young academicians who will shape the future of higher education, research, and professional leadership."
          </p>
        </div>

        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-YAN is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Connecting young academicians across countries, cultures, and academic disciplines.</li>
          <li>Developing competencies in teaching, research, publication, leadership, innovation, and professional practice.</li>
          <li>Expanding opportunities for international collaboration, academic mobility, and global networking.</li>
          <li>Providing structured mentoring and career development pathways.</li>
          <li>Supporting collaborative research, academic publishing, and interdisciplinary innovation.</li>
          <li>Encouraging ethical leadership, academic integrity, and social responsibility.</li>
          <li>Empowering young scholars to contribute to sustainable development and community transformation.</li>
          <li>Preparing future academic leaders capable of leading universities, research institutions, professional organizations, and international collaborations.</li>
          <li>Building lifelong professional networks among emerging scholars throughout the Asia-Pacific region.</li>
          <li>Creating a sustainable leadership succession pipeline for the entire ASIA ecosystem.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">🌐</div>
            <h3>Academic Networking</h3>
            <p>Connecting young scholars, universities, research institutions, and professional communities across borders.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">📈</div>
            <h3>Capacity Development</h3>
            <p>Strengthening competencies in research, teaching, publication, leadership, communication, digital technology, and innovation.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">🤝</div>
            <h3>Mentorship</h3>
            <p>Connecting emerging scholars with distinguished professors, senior researchers, and experienced academic leaders.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🌍</div>
            <h3>Global Exposure</h3>
            <p>Providing international experiences through conferences, research collaboration, exchange programs, and global academic engagement.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">🎓</div>
            <h3>Leadership Development</h3>
            <p>Preparing future academic, institutional, and professional leaders through structured leadership programs and practical experience.</p>
          </div>
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🧬</div>
            <h3>Talent Pipeline</h3>
            <p>Developing a continuous pathway that enables young academicians to grow into future leaders within the ASIA ecosystem.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & YOUNG ACADEMIC DEVELOPMENT ECOSYSTEM COMPONENTS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-YAN serves as the official young academic development platform responsible for:</p>
            <ul class="values-list">
              <li>International Young Scholar Networking</li>
              <li>Academic Mentorship Programs</li>
              <li>Early-Career Research Development</li>
              <li>Academic Leadership Development</li>
              <li>Publication & Scientific Writing Support</li>
              <li>International Mobility & Exchange</li>
              <li>Future Skills & Digital Competency Development</li>
              <li>Innovation & Entrepreneurship Programs</li>
              <li>Community Engagement & SDGs Participation</li>
              <li>Young Academic Recognition Programs</li>
              <li>Leadership Succession Development</li>
              <li>Global Talent Collaboration</li>
            </ul>
          </div>
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Young Academic <span class="gold">Ecosystem</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">An integrated ecosystem consisting of:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">Young Scholars Forum</span>
              <span class="value-badge">Academic Mentorship Network</span>
              <span class="value-badge">Emerging Researchers Network</span>
              <span class="value-badge">Academic Leadership Academy</span>
              <span class="value-badge">International Mobility Program</span>
              <span class="value-badge">Publication Development Program</span>
              <span class="value-badge">Young Innovators Network</span>
              <span class="value-badge">Future Leaders Fellowship</span>
              <span class="value-badge">Research Collaboration Platform</span>
              <span class="value-badge">Professional Development Hub</span>
              <span class="value-badge">Global Alumni Network</span>
              <span class="value-badge">Young Academician Awards</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- YOUNG ACADEMIC LEADERSHIP PATHWAY MODEL (FLOWCHART) -->
    <section class="ecosystem-model-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">Young Academic Leadership <span class="gold">Pathway</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          The progressive path mapping the professional growth of emerging scholars into influential figures within the international academic community.
        </p>
        <div class="vertical-flowchart" data-aos="fade-up">
          <div class="vflow-node">Young Academic Member</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Mentorship & Capacity Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Research & Publication</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">International Conference & Mobility</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Leadership Development</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Professional Certification</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node highlight">Strategic Body Participation</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node">Regional Academic Leadership</div>
          <div class="vflow-arrow">▼</div>
          <div class="vflow-node impact">Global Academic Leadership</div>
        </div>
      </div>
    </section>

    <!-- MEMBERSHIP SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Membership <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-YAN welcomes members from all multidisciplinary academic fields represented by ASIA:
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
          Membership categories include young lecturers, doctoral candidates, postdoctoral researchers, early-career academics, emerging researchers, and young professionals with academic interests.
        </p>
      </div>
    </section>

    <!-- CORE VALUES & COMMITMENT -->
    <section class="closing-section" style="padding: 60px 0 100px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Values</span></h2>
        <div class="values-badges" style="justify-content: center; max-width: 800px; margin: 0 auto 60px auto;" data-aos="zoom-in">
          <span class="value-badge">Growth</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Leadership</span>
          <span class="value-badge">Lifelong Learning</span>
          <span class="value-badge">Global Citizenship</span>
          <span class="value-badge">Impact</span>
        </div>
        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-YAN is committed to nurturing a globally connected generation of young academicians who demonstrate academic excellence, ethical leadership, innovation, international collaboration, and a lifelong commitment to advancing education, research, and sustainable development.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Connect. Grow. Lead.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble young.html
young_html = header_part + young_main_content + footer_part

with open('young.html', 'w', encoding='utf-8') as f:
    f.write(young_html)
print("young.html created successfully.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html',
         'conference.html', 'publication.html', 'mobility.html', 'competition.html', 'community.html', 'quality.html', 'academy.html', 'young.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix navbar dropdown link
        content = content.replace('<a href="https://apasific.org/young" target="_blank">', '<a href="young.html">')

        # Bump cache to v=17
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=17', content)

        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("All done!")
