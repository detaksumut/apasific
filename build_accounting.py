import os
import re

print("Building ultimate academic journal layout for accounting.html...")
with open('asiacert.html', 'r', encoding='utf-8') as f:
    template = f.read()

header_part = template[:template.find('  <!-- PAGE HERO -->')]
footer_part = template[template.find('  <!-- FOOTER -->'):]

accounting_main_content = """
    <!-- PAGE HERO -->
    <header class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="container page-hero-content">
        <img src="public/logo-apasific.png" alt="ASIA Logo" class="page-hero-logo" style="width: 150px; height: 150px; margin-bottom: 25px; animation: pulse-glow 4s infinite;" data-aos="zoom-in" />
        <h1 class="page-title" style="font-size: 3rem; margin-bottom: 12px; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="100">Accounting, Auditing &amp; Taxation</h1>
        <p class="page-subtitle" style="font-size: 1.25rem; color: var(--gold); margin-bottom: 16px; font-weight: 600; font-family: var(--font-cinzel);" data-aos="fade-up" data-aos-delay="200">Academic Division &amp; Journal</p>
        <p class="page-subtitle" style="font-size: 1.1rem; font-style: italic; max-width: 800px; margin: 0 auto; color: var(--text-muted);" data-aos="fade-up" data-aos-delay="300">Advancing Excellence in Accounting, Auditing, Taxation, and Sustainable Financial Practices</p>
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
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 15px;">
                The Accounting, Auditing &amp; Taxation discipline under the Association of Asia Pacific Academician (ASIA) serves as an international academic platform for researchers, academics, professionals, practitioners, policymakers, and students to disseminate high-quality scientific research and scholarly contributions in accounting, auditing, taxation, financial reporting, corporate governance, and related fields.
              </p>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 15px;">
                This discipline promotes the advancement of accounting knowledge through multidisciplinary research, encourages innovation in financial reporting and assurance practices, and supports the development of ethical, transparent, and sustainable financial systems that contribute to economic growth, public accountability, and global competitiveness.
              </p>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 0;">
                ASIA welcomes original and impactful research that addresses contemporary challenges, emerging technologies, international standards, sustainability issues, and innovative practices in accounting, auditing, taxation, and financial management.
              </p>
            </div>

            <!-- 2. Scope of the Discipline -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">2. Scope of the Discipline</h2>
              <p style="line-height: 1.8; color: var(--text-muted); margin-bottom: 20px;">
                This discipline welcomes original manuscripts related to, but not limited to, the following areas:
              </p>
              <ul class="values-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding-left: 5px;">
                <li>Akuntansi</li>
                <li>Audit</li>
                <li>Perpajakan</li>
                <li>Akuntansi Publik</li>
                <li>Forensik</li>
                <li>Sistem Informasi Akuntansi</li>
                <li style="grid-column: span 2;">ESG dan Sustainability Accounting</li>
              </ul>
            </div>

            <!-- 3. Types of Manuscripts Accepted -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">3. Types of Manuscripts Accepted</h2>
              <p style="color: var(--text-muted); margin-bottom: 20px;">This discipline welcomes the following types of scholarly manuscripts:</p>
              <ul class="values-list" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; padding-left: 5px;">
                <li>Original Research Articles</li>
                <li>Review Articles</li>
                <li>Systematic Literature Reviews</li>
                <li>Meta-Analysis</li>
                <li>Conceptual Papers</li>
                <li>Case Studies</li>
                <li>Applied Research</li>
                <li>Short Communications</li>
                <li style="grid-column: span 2;">Technical Papers</li>
              </ul>
            </div>

            <!-- 4. Double-Blind Peer Review Policy -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">4. Double-Blind Peer Review Policy</h2>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 15px;">
                All manuscripts submitted to this discipline will undergo a rigorous Double-Blind Peer Review process to ensure scientific quality, originality, methodological rigor, ethical compliance, and relevance to the discipline.
              </p>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 15px;">
                During the review process, the identities of both authors and reviewers remain anonymous to maintain fairness, objectivity, and academic integrity.
              </p>
              <p style="text-align: justify; line-height: 1.8; color: var(--text); margin-bottom: 0;">
                Only manuscripts that successfully pass the editorial evaluation and peer review process will be accepted for publication.
              </p>
            </div>

            <!-- 5. Publication Ethics -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">5. Publication Ethics</h2>
              <p style="color: var(--text-muted); margin-bottom: 20px;">Authors submitting manuscripts under this discipline are expected to comply with internationally accepted publication ethics, including:</p>
              <ul class="values-list" style="display: flex; flex-direction: column; gap: 12px; padding-left: 5px;">
                <li>Original and unpublished work with zero tolerance for plagiarism or self-plagiarism.</li>
                <li>No simultaneous submission to other journals.</li>
                <li>Proper citation and acknowledgment of all sources.</li>
                <li>Ethical approval for research involving human participants or sensitive data where applicable.</li>
                <li>Compliance with the Committee on Publication Ethics (COPE) principles.</li>
                <li>Full disclosure of conflicts of interest.</li>
                <li>Responsible use of artificial intelligence in research and manuscript preparation.</li>
              </ul>
            </div>

            <!-- 6. Submit Your Manuscript -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 35px; text-align: center;">
              <h2 style="font-family: var(--font-cinzel); font-size: 22px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 10px;">6. Submit Your Manuscript</h2>
              <p style="line-height: 1.8; color: var(--text); margin-bottom: 25px;">
                Researchers, academics, professionals, and postgraduate students are invited to submit high-quality manuscripts that contribute to the advancement of accounting, auditing, taxation, and sustainable financial practices. All submissions will be processed through the official ASIA Double-Blind Peer Review System.
              </p>
              <div style="display: flex; justify-content: center; gap: 15px;">
                <a href="index.html#contact" class="btn-join" style="padding: 14px 30px; font-weight: bold; border-radius: 4px; box-shadow: 0 4px 15px rgba(201,168,76,0.25);">Submit Manuscript</a>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: SIDEBAR JOURNAL INFO CARD (RJRAKP STYLE) -->
          <div class="journal-sidebar" style="position: sticky; top: 110px; display: flex; flex-direction: column; gap: 30px;" data-aos="fade-left">
            
            <!-- RJRAKP style card inside a dark-gold themed framework -->
            <div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow);">
              
              <!-- Cover image with overlay badge -->
              <div style="position: relative; height: 180px; overflow: hidden; border-bottom: 1px solid var(--border);">
                <img src="public/accounting_journal_cover.png" alt="Journal Cover" style="width: 100%; height: 100%; object-fit: cover;" />
                <span style="position: absolute; top: 15px; right: 15px; background: rgba(8,8,16,0.85); border: 1px solid var(--gold); color: var(--gold); padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  0 Artikel
                </span>
              </div>

              <!-- Card Body -->
              <div style="padding: 25px; font-family: 'Inter', sans-serif;">
                <h3 style="font-size: 16px; font-weight: bold; color: var(--white); margin-bottom: 10px; line-height: 1.4;">
                  Jurnal Akuntansi, Audit dan Perpajakan (JAAP)
                </h3>
                <p style="font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
                  Fokus pada kajian ilmu akuntansi, audit, perpajakan, akuntansi publik, forensik, sistem informasi akuntansi, ESG dan sustainability accounting.
                </p>

                <!-- Focus & Scope mini container -->
                <div style="background: rgba(8,8,16,0.4); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 15px; margin-bottom: 20px;">
                  <h4 style="font-size: 10px; font-weight: bold; color: var(--gold); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Focus &amp; Scope</h4>
                  <ul style="padding-left: 12px; margin: 0; color: var(--text); font-size: 12px; line-height: 1.7; list-style-type: circle;">
                    <li>Akuntansi</li>
                    <li>Audit</li>
                    <li>Perpajakan</li>
                    <li>Akuntansi Publik</li>
                    <li>Forensik</li>
                    <li>Sistem Informasi Akuntansi</li>
                    <li>ESG &amp; Sustainability</li>
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
                  <a href="index.html#contact" style="display: block; text-align: center; background: var(--gold); color: var(--bg); padding: 10px; font-size: 12px; font-weight: bold; border-radius: 4px; text-decoration: none; transition: background var(--transition);" onmouseover="this.style.background='var(--gold-light)'" onmouseout="this.style.background='var(--gold)'">
                    Submit Artikel →
                  </a>
                  <a href="index.html#contact" style="display: block; text-align: center; border: 1.5px solid var(--gold); color: var(--gold); background: transparent; padding: 8px; font-size: 12px; font-weight: bold; border-radius: 4px; text-decoration: none; transition: background var(--transition);" onmouseover="this.style.background='rgba(201,168,76,0.1)'" onmouseout="this.style.background='transparent'">
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

# Assemble accounting.html
accounting_html = header_part + accounting_main_content + footer_part

# Sync navbar and style.css cache globally to v=27
accounting_html = re.sub(r'style\.css\?v=\d+', 'style.css?v=27', accounting_html)

with open('accounting.html', 'w', encoding='utf-8') as f:
    f.write(accounting_html)
print("accounting.html recreated successfully.")

print("Navigation bar sync process starts...")
with open('index.html', 'r', encoding='utf-8') as f:
    idx_content = f.read()

# Subpage navbar replacement
nav_match = re.search(r'<nav class="navbar" id="navbar">.*?</nav>', idx_content, re.DOTALL)
if nav_match:
    nav_html = nav_match.group(0)
    nav_html_sub = nav_html.replace('href="#', 'href="index.html#')

    files = [
        'vision-mission.html', 'asiacert.html', 'boc.html', 'conference.html',
        'publication.html', 'mobility.html', 'competition.html', 'community.html',
        'quality.html', 'academy.html', 'young.html', 'awards.html', 'research.html', 'accounting.html'
    ]
    for fn in files:
        if os.path.exists(fn):
            with open(fn, 'r', encoding='utf-8') as f:
                content = f.read()

            start_idx = content.find('<nav class="navbar" id="navbar">')
            end_idx = content.find('</nav>', start_idx)
            if start_idx != -1 and end_idx != -1:
                end_idx += 6
                new_content = content[:start_idx] + nav_html_sub + content[end_idx:]
                
                # Bump cache to v=27
                new_content = re.sub(r'style\.css\?v=\d+', 'style.css?v=27', new_content)
                
                with open(fn, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Synced navigation to {fn}")
            else:
                print(f"Nav not found in {fn}")
    
    # Bump index.html cache as well
    idx_content = re.sub(r'style\.css\?v=\d+', 'style.css?v=27', idx_content)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(idx_content)
    print("Navigation sync global done.")
else:
    print("Nav not found in index.html for global sync.")
