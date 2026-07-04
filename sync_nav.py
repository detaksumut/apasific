import os, re

with open("index.html", "r", encoding="utf-8") as f:
    idx_content = f.read()

nav_match = re.search(r'<nav class="navbar" id="navbar">.*?</nav>', idx_content, re.DOTALL)
if not nav_match:
    print("ERROR: navbar not found in index.html")
    exit(1)

nav_html = nav_match.group(0)
nav_html_sub = re.sub(r'href="(#[^"]+)"', r'href="index.html\1"', nav_html)

files = [
    "vision-mission.html","asiacert.html","boc.html","conference.html",
    "publication.html","mobility.html","competition.html","community.html",
    "quality.html","academy.html","young.html","awards.html","research.html",
    "accounting.html","business.html","finance.html","hr.html",
    "economics.html","law.html","it.html","engineering.html","social.html","education.html",
    "tourism.html","health.html","agriculture.html","islamic.html"
]

synced = 0
for fn in files:
    if not os.path.exists(fn):
        print("SKIP: " + fn)
        continue
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()
    s = content.find('<nav class="navbar" id="navbar">')
    e = content.find("</nav>", s)
    if s == -1 or e == -1:
        print("Nav not found: " + fn)
        continue
    e += 6
    new_content = content[:s] + nav_html_sub + content[e:]
    new_content = re.sub(r"style\.css\?v=\d+", "style.css?v=36", new_content)
    with open(fn, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Synced: " + fn)
    synced += 1

print("Done. Synced " + str(synced) + " files.")
