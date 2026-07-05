import os
import re

print("Building education.html...")
with open("asiacert.html", "r", encoding="utf-8") as f:
    template = f.read()

header_part = template[:template.find("  <!-- PAGE HERO -->")]
footer_part = template[template.find("  <!-- FOOTER -->"):]

education_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="logo-apasific.png" alt="ASIA Logo" class="page-hero-logo" style="width: 150px; height: 150px; margin-bottom: 25px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3rem; margin-bottom: 12px; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="100">Education &amp; Academic Development</h1>
        <p class="page-subtitle" style="font-size: 1.25rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">Academic Division &amp; Journal</p>
        <p class="page-subtitle" style="font-size: 1.1rem; font-style: italic; max-width: 800px; margin: 0 auto; color: var(--text-muted);" data-aos="fade-up" data-aos-delay="300">Advancing Quality Education and Academic Excellence</p>
      </div>
    </header>

    <!-- MAIN TWO-COLUMN JOURNAL LAYOUT -->
    <section class="journal-portal-body" style="padding: 80px 0; background: var(--bg);">
      <div class="container">
        
        <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 45px; align-items: start;" class="journal-grid">
          
          <!-- LEFT COLUMN: MAIN JOURNAL CONTENTS -->
          <div class="journal-main-content" style="display: flex; flex-direction: column; gap: 40px;" data-aos="fade-right">
            
            <!-- 1. Introduction -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">1. Introduction</h2>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 0;">
                The Education &amp; Academic Development discipline under the Association of Asia Pacific Academician (ASIA) provides an academic platform for researchers, academics, educators, lecturers, practitioners, and policymakers to publish scholarly works in the fields of education and academic development. This discipline encourages scientific contributions that support educational innovation, teaching excellence, curriculum development, and the advancement of quality education at all levels.
              </p>
            </div>

            <!-- 2. Scope of the Discipline -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">2. Scope of the Discipline</h2>
              <p style="line-height: 1.8; color: var(--text-muted); margin-bottom: 20px;">
                This discipline welcomes scholarly manuscripts related to:
              </p>
              <ul class="values-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding-left: 5px;">
                <li>Education</li>
                <li>Curriculum</li>
                <li>Teaching and Learning</li>
                <li>Lecturer Competency</li>
                <li>Educational Technology</li>
                <li>Academic Leadership</li>
              </ul>
            </div>

            <!-- 3. Double-Blind Peer Review -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">3. Double-Blind Peer Review</h2>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 0;">
                All submitted manuscripts will undergo a rigorous Double-Blind Peer Review process to ensure originality, scientific quality, methodological rigor, and relevance to the discipline.
              </p>
            </div>

            <!-- 4. Publication Ethics -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">4. Publication Ethics</h2>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 0;">
                Authors are expected to comply with international publication ethics, including originality, academic integrity, proper citation practices, and adherence to COPE principles.
              </p>
            </div>

            <!-- 5. Submit Your Manuscript -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px; text-align: center;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">5. Submit Your Manuscript</h2>
              <p style="line-height: 1.8; color: var(--text); margin-bottom: 25px;">
                Researchers, academics, educators, professionals, and practitioners are invited to submit original manuscripts related to the scope of this discipline through the ASIA online submission system.
              </p>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <a href="/dashboard/submit" class="btn-join" style="padding: 14px 30px; font-weight: bold; border-radius: 4px; box-shadow: 0 4px 15px rgba(201,168,76,0.25);">Submit Manuscript</a>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: SIDEBAR JOURNAL INFO CARD (RJRAKP STYLE) -->
          <div class="journal-sidebar" style="position: sticky; top: 110px; display: flex; flex-direction: column; gap: 30px;" data-aos="fade-left">
            
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow);">
              
              <!-- Cover image with overlay badge -->
              <div style="position: relative; height: 180px; overflow: hidden; border-bottom: 1px solid var(--border);">
                <img src="education_journal_cover.png" alt="Journal Cover" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; top: 15px; right: 15px; background: rgba(8,8,16,0.85); border: 1px solid var(--gold); color: var(--gold); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  0 Artikel
                </span>
              </div>

              <!-- Card Body -->
              <div style="padding: 25px; font-family: 'Inter', sans-serif;">
                <h3 style="font-size: 16px; font-weight: bold; color: var(--white); margin-bottom: 10px; line-height: 1.4;">
                  Jurnal Pendidikan dan Pengembangan Akademik
                </h3>
                <p style="font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
                  Fokus pada kajian pendidikan, kurikulum, pembelajaran, kompetensi dosen, teknologi pendidikan, dan kepemimpinan akademik.
                </p>

                <!-- Focus & Scope mini container -->
                <div style="background: rgba(8,8,16,0.4); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 15px; margin-bottom: 20px;">
                  <h4 style="font-size: 10px; font-weight: bold; color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Focus &amp; Scope</h4>
                  <ul style="padding-left: 12px; margin: 0; color: var(--text); font-size: 12px; line-height: 1.7; list-style-type: circle;">
                    <li>Pendidikan</li>
                    <li>Kurikulum</li>
                    <li>Pembelajaran</li>
                    <li>Kompetensi Dosen</li>
                    <li>Teknologi Pendidikan</li>
                    <li>Kepemimpinan Akademik</li>
                  </ul>
                </div>

                <!-- Info list -->
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 25px; font-size: 11.5px; border-bottom: 1px solid var(--border); padding-bottom: 15px;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Penerbit:</span>
                    <strong style="color: var(--text);">ASIA</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">Frekuensi:</span>
                    <strong style="color: var(--text);">Semiannual</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-muted);">ISSN Online:</span>
                    <strong style="color: var(--gold);">Proses</strong>
                  </div>
                </div>

                <!-- Action buttons -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <a href="/dashboard/submit" style="display: block; text-align: center; background: var(--gold); color: var(--bg); padding: 10px; font-size: 12px; font-weight: bold; border-radius: 4px; text-decoration: none; transition: background var(--transition);" onmouseover="this.style.background='var(--gold-light)'" onmouseout="this.style.background='var(--gold)'">
                    Submit Artikel &#x2192;
                  </a>
                  <a href="index.html#journals" style="display: block; text-align: center; border: 1.5px solid var(--gold); color: var(--gold); background: transparent; padding: 8px; font-size: 12px; font-weight: bold; border-radius: 4px; text-decoration: none; transition: background var(--transition);" onmouseover="this.style.background='rgba(201,168,76,0.1)'" onmouseout="this.style.background='transparent'">
                    Lihat Jurnal
                  </a>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  </main>
"""

education_html = header_part + education_main_content + footer_part
education_html = education_html.replace("<title>ASIACERT", "<title>Education &amp; Academic Development")
education_html = education_html.replace('content="Asia Professional Certification Center', 'content="Education &amp; Academic Development discipline under ASIA')
education_html = re.sub(r"style\.css\?v=\d+", "style.css?v=36", education_html)

with open("education.html", "w", encoding="utf-8") as f:
    f.write(education_html)
print("education.html created successfully.")

# Update index.html dropdown link
with open("index.html", "r", encoding="utf-8") as f:
    idx_content = f.read()

idx_content = idx_content.replace(
    '<a href="#div-education"><span class="dd-icon">&#x25c8;</span> Education</a>',
    '<a href="education.html"><span class="dd-icon">&#x25c8;</span> Education &amp; Academic Development</a>'
)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(idx_content)
print("index.html updated.")

# Sync nav to all pages
import re as _re
with open("index.html", "r", encoding="utf-8") as f:
    idx_content = f.read()

nav_match = _re.search(r'<nav class="navbar" id="navbar">.*?</nav>', idx_content, _re.DOTALL)
if nav_match:
    nav_html = nav_match.group(0)
    nav_html_sub = _re.sub(r'href="(#[^"]+)"', r'href="index.html\1"', nav_html)

    files = [
        "vision-mission.html","asiacert.html","boc.html","conference.html",
        "publication.html","mobility.html","competition.html","community.html",
        "quality.html","academy.html","young.html","awards.html","research.html",
        "accounting.html","business.html","finance.html","hr.html",
        "economics.html","law.html","it.html","engineering.html","social.html","education.html"
    ]
    for fn in files:
        if not os.path.exists(fn):
            continue
        with open(fn, "r", encoding="utf-8") as f:
            content = f.read()
        s = content.find('<nav class="navbar" id="navbar">')
        e = content.find("</nav>", s)
        if s == -1 or e == -1:
            continue
        e += 6
        new_content = content[:s] + nav_html_sub + content[e:]
        new_content = _re.sub(r"style\.css\?v=\d+", "style.css?v=36", new_content)
        with open(fn, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Synced: " + fn)
    print("Nav sync done.")
