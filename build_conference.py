import os
import re
from PIL import Image

print("Processing logo...")
try:
    img_path = r'd:\Users\apasific\public\asia-confrence.png'
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

print("Building conference.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

conf_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/asia-confrence.png" alt="ASIA-CAF Logo" class="page-hero-logo" style="width: 200px; height: 200px; margin-bottom: 30px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3.8rem; margin-bottom: 12px;" data-aos="fade-up" data-aos-delay="100">ASIA-CAF</h1>
        <p class="page-subtitle" style="font-size: 1.6rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">ASIA Conference & Academic Forum</p>
        <p class="page-subtitle" style="font-size: 1.15rem; font-style: italic; max-width: 600px;" data-aos="fade-up" data-aos-delay="300">Connecting Scholars. Sharing Knowledge. Advancing Academic Collaboration.</p>
      </div>
    </header>

    <!-- INTRODUCTION -->
    <section class="asiacert-intro">
      <div class="container purpose-content" data-aos="fade-up">
        <p class="lead-text" style="text-align: justify;">
          <strong>The ASIA Conference & Academic Forum (ASIA-CAF)</strong> is the official conference, scholarly engagement, and academic networking body of the Association of Asia Pacific Academician (ASIA). Established to foster intellectual exchange and international collaboration, ASIA-CAF serves as the central platform for organizing conferences, symposiums, academic forums, seminars, workshops, scholarly dialogues, and multidisciplinary knowledge-sharing activities throughout the Asia-Pacific region and beyond.
        </p>
        <p class="lead-text" style="text-align: justify;">
          ASIA-CAF provides an inclusive environment where academics, researchers, professionals, students, policymakers, industry leaders, and institutional partners come together to exchange ideas, present research findings, develop collaborative initiatives, and address regional and global challenges through academic excellence and innovation.
        </p>
        <p class="lead-text" style="text-align: justify;">
          As one of ASIA's strategic bodies, ASIA-CAF promotes interdisciplinary cooperation, strengthens international academic partnerships, supports research dissemination, and contributes to the advancement of education, science, technology, and sustainable development.
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
            "To become the leading multidisciplinary academic conference and scholarly engagement platform in the Asia-Pacific region, connecting global knowledge, fostering innovation, and strengthening international collaboration for the advancement of education, research, and society."
          </p>
        </div>

        <!-- MISSION -->
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Our <span class="gold">Mission</span></h2>
        <p style="text-align: center; color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">ASIA-CAF is committed to:</p>
        <ul class="values-list" style="max-width: 900px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 16px;" data-aos="fade-up">
          <li>Organizing internationally recognized conferences, symposiums, and academic forums across multidisciplinary fields.</li>
          <li>Providing high-quality platforms for scholars, researchers, professionals, and students to disseminate research findings and innovative ideas.</li>
          <li>Promoting interdisciplinary dialogue that addresses contemporary academic, technological, economic, environmental, and societal challenges.</li>
          <li>Strengthening academic collaboration among universities, research institutions, industries, governments, and international organizations.</li>
          <li>Encouraging international research partnerships, joint publications, and collaborative innovation.</li>
          <li>Supporting emerging scholars, doctoral candidates, and young researchers through inclusive academic engagement.</li>
          <li>Enhancing academic excellence through knowledge exchange, scientific discussion, and professional networking.</li>
          <li>Advancing the international visibility and impact of research produced across the Asia-Pacific region.</li>
        </ul>
      </div>
    </section>

    <!-- CORE PURPOSES -->
    <section class="values-section" style="padding: 60px 0; background: var(--bg-card);">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Core <span class="gold">Purposes</span></h2>
        
        <div class="mission-grid">
          <div class="mission-card" data-aos="fade-up" data-aos-delay="100">
            <div class="mission-icon">💡</div>
            <h3>Knowledge Exchange</h3>
            <p>Creating trusted platforms for exchanging knowledge, research findings, best practices, and professional experiences across disciplines and countries.</p>
          </div>
          
          <div class="mission-card" data-aos="fade-up" data-aos-delay="200">
            <div class="mission-icon">🌐</div>
            <h3>Academic Networking</h3>
            <p>Connecting scholars, universities, research institutions, professional organizations, industries, governments, and international partners into a sustainable academic network.</p>
          </div>
          
          <div class="mission-card" data-aos="fade-up" data-aos-delay="300">
            <div class="mission-icon">📢</div>
            <h3>Research Dissemination</h3>
            <p>Facilitating the publication and dissemination of scientific knowledge through conferences, symposiums, proceedings, and scholarly forums.</p>
          </div>
          
          <div class="mission-card" data-aos="fade-up" data-aos-delay="400">
            <div class="mission-icon">🤝</div>
            <h3>International Collaboration</h3>
            <p>Strengthening cross-border cooperation that encourages joint research, academic mobility, institutional partnerships, and global engagement.</p>
          </div>
          
          <div class="mission-card" data-aos="fade-up" data-aos-delay="500">
            <div class="mission-icon">💬</div>
            <h3>Intellectual Dialogue</h3>
            <p>Encouraging critical thinking, interdisciplinary discussion, and evidence-based solutions for regional and global issues.</p>
          </div>
          
          <div class="mission-card" data-aos="fade-up" data-aos-delay="600">
            <div class="mission-icon">🌱</div>
            <h3>Emerging Scholar Development</h3>
            <p>Providing opportunities for students, early-career researchers, and young academics to develop research capacity, international exposure, and professional networks.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STRATEGIC ROLES & ACADEMIC PROGRAMS -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <div class="two-col-layout">
          <!-- Roles -->
          <div data-aos="fade-right">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Strategic <span class="gold">Roles</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">ASIA-CAF serves as the official academic engagement platform responsible for:</p>
            <ul class="values-list">
              <li>Organizing international multidisciplinary conferences.</li>
              <li>Coordinating academic forums and scholarly dialogues.</li>
              <li>Developing international symposiums and congresses.</li>
              <li>Facilitating keynote lectures and distinguished professor series.</li>
              <li>Organizing doctoral colloquiums and young scholar forums.</li>
              <li>Promoting interdisciplinary collaboration among academic disciplines.</li>
              <li>Supporting conference proceedings and scientific publications.</li>
              <li>Building strategic partnerships with universities and research institutions.</li>
              <li>Strengthening academic diplomacy across the Asia-Pacific region.</li>
              <li>Encouraging innovation through research communication and global networking.</li>
            </ul>
          </div>
          
          <!-- Programs -->
          <div data-aos="fade-left">
            <h2 class="section-title" style="font-size: 26px; margin-bottom: 30px;">Academic <span class="gold">Programs</span></h2>
            <p style="color: var(--text-muted); margin-bottom: 20px;">A comprehensive portfolio of academic engagement programs:</p>
            <div class="values-badges" style="gap: 12px;">
              <span class="value-badge">International Academic Conferences</span>
              <span class="value-badge">Asia-Pacific Academic Forum</span>
              <span class="value-badge">International Research Symposium</span>
              <span class="value-badge">Global Scholars Forum</span>
              <span class="value-badge">Distinguished Professor Lecture Series</span>
              <span class="value-badge">Academic Roundtable Discussions</span>
              <span class="value-badge">Doctoral Research Forum</span>
              <span class="value-badge">Young Scholars Forum</span>
              <span class="value-badge">Policy and Academic Dialogue</span>
              <span class="value-badge">Industry–Academia Forum</span>
              <span class="value-badge">International Research Colloquium</span>
              <span class="value-badge">Multidisciplinary Scientific Congress</span>
              <span class="value-badge">Academic Leadership Summit</span>
              <span class="value-badge">Future Researchers Forum</span>
              <span class="value-badge">Cross-Border Research Collaboration Forum</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONFERENCE ECOSYSTEM -->
    <section class="values-section ecosystem-section" style="padding: 80px 0; background: var(--bg-body); border-top: 1px solid rgba(201,168,76,0.1);">
      <div class="container">
        <h2 class="section-title" style="font-size: 32px; text-align: center; margin-bottom: 20px;" data-aos="fade-up">The Conference <span class="gold">Ecosystem</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 50px auto; color: var(--text-muted); font-size: 1.1rem; line-height: 1.6;" data-aos="fade-up">
          ASIA-CAF is not merely an event organizer. It is an integrated academic conference ecosystem that connects the entire scholarly communication lifecycle.
        </p>
        
        <div class="ecosystem-grid" data-aos="fade-up" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
          <div class="ecosystem-card">Conference Planning & Management</div>
          <div class="ecosystem-card">Abstract Submission</div>
          <div class="ecosystem-card">Peer Review Coordination</div>
          <div class="ecosystem-card">Scientific Committee Management</div>
          <div class="ecosystem-card">Speaker & Keynote Management</div>
          <div class="ecosystem-card">Registration & Participant Services</div>
          <div class="ecosystem-card highlight-eco">Hybrid & Virtual Conference</div>
          <div class="ecosystem-card">Conference Proceedings</div>
          <div class="ecosystem-card highlight-eco">Journal Publication Opportunities</div>
          <div class="ecosystem-card">DOI & Indexing Support</div>
          <div class="ecosystem-card">Best Paper Awards</div>
          <div class="ecosystem-card highlight-eco">Post-Conference Collaboration</div>
          <div class="ecosystem-card">International Academic Networking</div>
        </div>
      </div>
    </section>

    <!-- ACADEMIC SCOPE -->
    <section class="vm-detail-section" style="padding: 60px 0;">
      <div class="container">
        <h2 class="section-title" style="font-size: 28px; text-align: center; margin-bottom: 40px;" data-aos="fade-up">Academic <span class="gold">Scope</span></h2>
        <p style="text-align: center; max-width: 800px; margin: 0 auto 30px auto; color: var(--text-main);" data-aos="fade-up">
          ASIA-CAF supports conferences and academic activities across all multidisciplinary fields represented by ASIA, including:
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
          <span class="value-badge">Academic Excellence</span>
          <span class="value-badge">Collaboration</span>
          <span class="value-badge">Innovation</span>
          <span class="value-badge">Integrity</span>
          <span class="value-badge">Inclusiveness</span>
          <span class="value-badge">Global Connectivity</span>
          <span class="value-badge">Sustainability</span>
          <span class="value-badge">Impact</span>
        </div>

        <div class="commitment-box" data-aos="fade-up">
          <p>
            <strong>Strategic Commitment:</strong> ASIA-CAF is committed to creating an inclusive, innovative, and internationally respected academic ecosystem where scholars, researchers, professionals, institutions, and policymakers collaborate to generate knowledge, inspire innovation, and produce meaningful solutions for the sustainable development of the Asia-Pacific region and the global community.
          </p>
          <hr class="commitment-divider" />
          <h3 class="closing-statement" style="font-size: 1.8rem !important;">Connecting Scholars. Sharing Knowledge. Advancing Academic Collaboration.</h3>
        </div>
      </div>
    </section>
  </main>
"""

# Assemble conference.html
conf_html = header_part + conf_main_content + footer_part

with open('conference.html', 'w', encoding='utf-8') as f:
    f.write(conf_html)
print("conference.html created successfully.")

print("Updating CSS...")
# Append CSS for .ecosystem-card to style.css if not present
with open('style.css', 'r', encoding='utf-8') as f:
    style = f.read()

if '.ecosystem-card' not in style:
    ecosystem_css = """
/* Conference Ecosystem */
.ecosystem-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 16px 20px;
  border-radius: var(--radius-sm);
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text-main);
  transition: all var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}
.ecosystem-card:hover {
  background: rgba(201,168,76,0.1);
  border-color: rgba(201,168,76,0.5);
  transform: translateY(-3px);
  color: var(--gold);
}
.ecosystem-card.highlight-eco {
  border-color: rgba(201,168,76,0.3);
  background: linear-gradient(135deg, rgba(201,168,76,0.1) 0%, transparent 100%);
  color: var(--gold);
}
"""
    with open('style.css', 'a', encoding='utf-8') as f:
        f.write(ecosystem_css)
    print("Appended ecosystem CSS to style.css")
else:
    print("Ecosystem CSS already exists.")

print("Updating Navigation Links across all pages...")
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html', 'conference.html']
for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # In navbar:
        content = content.replace('<a href="https://apasific.org/conference" target="_blank">', '<a href="conference.html">')
        
        # In index.html featured card:
        if fn == 'index.html':
            content = content.replace('<a href="https://apasific.org/conference" target="_blank" class="div-link">Visit Website →</a>', 
                                      '<a href="conference.html" class="div-link">Explore ASIA-CAF →</a>')
        
        # Bump cache to v=10
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=10', content)
        
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("Links and cache updated successfully.")
