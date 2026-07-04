import os, re

pages = [
    "index.html","accounting.html","business.html","finance.html","hr.html",
    "economics.html","education.html","law.html","it.html","engineering.html",
    "social.html","tourism.html","health.html","agriculture.html","islamic.html",
    "vision-mission.html","asiacert.html","boc.html","conference.html",
    "publication.html","mobility.html","competition.html","community.html",
    "quality.html","academy.html","young.html","awards.html","research.html"
]

covers = [
    "public/accounting_journal_cover.png","public/business_journal_cover.png",
    "public/finance_journal_cover.png","public/hr_journal_cover.png",
    "public/economics_journal_cover.png","public/education_journal_cover.png",
    "public/law_journal_cover.png","public/it_journal_cover.png",
    "public/engineering_journal_cover.png","public/social_journal_cover.png",
    "public/tourism_journal_cover.png","public/health_journal_cover.png",
    "public/agriculture_journal_cover.png","public/islamic_journal_cover.png",
    "public/logo-apasific.png"
]

academic_pages = [
    "accounting.html","business.html","finance.html","hr.html",
    "economics.html","education.html","law.html","it.html","engineering.html",
    "social.html","tourism.html","health.html","agriculture.html","islamic.html"
]

print("=== FILE EXISTENCE ===")
for p in pages:
    status = "OK     " if os.path.exists(p) else "MISSING"
    print(status + " " + p)

print()
print("=== COVER IMAGES ===")
for c in covers:
    status = "OK     " if os.path.exists(c) else "MISSING"
    print(status + " " + c)

print()
print("=== NAV LINKS IN index.html ===")
with open("index.html", "r", encoding="utf-8") as f:
    idx = f.read()
for p in academic_pages:
    linked = ('href="' + p + '"') in idx
    print(("LINKED " if linked else "BROKEN ") + p)

print()
print("=== PAGE TITLES ===")
bad_titles = []
for p in academic_pages:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    m = re.search(r"<title>(.*?)</title>", content)
    title = m.group(1) if m else "NOT FOUND"
    is_bad = "ASIACERT" in title
    print(("WARN  " if is_bad else "OK    ") + p + " -> " + title)
    if is_bad:
        bad_titles.append(p)

print()
print("=== CSS VERSION ===")
for p in pages:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    m = re.search(r"style\.css(\?v=\d+)?", content)
    ver = m.group(0) if m else "NOT FOUND"
    old = "v=36" not in ver and "?v" in ver
    print(("OUTDATED " if old else "OK       ") + p + " -> " + ver)

print()
print("=== SUBPAGE NAV CONSISTENCY ===")
for p in academic_pages:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    has_all = all(x in content for x in ["accounting.html","islamic.html","education.html","tourism.html"])
    print(("OK     " if has_all else "BROKEN ") + p)

print()
print("AUDIT COMPLETE.")
