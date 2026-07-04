import os, re

fixes = {
    "accounting.html": ("Accounting, Auditing &amp; Taxation", "Accounting, Auditing &amp; Taxation discipline under the Association of Asia Pacific Academician (ASIA)."),
    "business.html":   ("Business, Management &amp; Entrepreneurship", "Business, Management &amp; Entrepreneurship discipline under the Association of Asia Pacific Academician (ASIA)."),
    "finance.html":    ("Finance, Banking &amp; Investment", "Finance, Banking &amp; Investment discipline under the Association of Asia Pacific Academician (ASIA)."),
    "law.html":        ("Law, Governance &amp; Public Administration", "Law, Governance &amp; Public Administration discipline under the Association of Asia Pacific Academician (ASIA)."),
    "it.html":         ("IT, AI &amp; Digital Transformation", "Information Technology, AI &amp; Digital Transformation discipline under the Association of Asia Pacific Academician (ASIA)."),
    "engineering.html":("Engineering, Technology &amp; Applied Sciences", "Engineering, Technology &amp; Applied Sciences discipline under the Association of Asia Pacific Academician (ASIA)."),
    "social.html":     ("Social Sciences, Humanities &amp; Communication", "Social Sciences, Humanities &amp; Communication discipline under the Association of Asia Pacific Academician (ASIA)."),
    "education.html":  ("Education &amp; Academic Development", "Education &amp; Academic Development discipline under the Association of Asia Pacific Academician (ASIA)."),
    "tourism.html":    ("Tourism, Hospitality &amp; Creative Economy", "Tourism, Hospitality &amp; Creative Economy discipline under the Association of Asia Pacific Academician (ASIA)."),
    "health.html":     ("Health, Public Health &amp; Well-Being", "Health, Public Health &amp; Well-Being discipline under the Association of Asia Pacific Academician (ASIA)."),
    "agriculture.html":("Agriculture, Environment &amp; Sustainability", "Agriculture, Environment &amp; Sustainability discipline under the Association of Asia Pacific Academician (ASIA)."),
    "islamic.html":    ("Islamic Studies, Ethics &amp; Spirituality", "Islamic Studies, Ethics &amp; Spirituality discipline under the Association of Asia Pacific Academician (ASIA)."),
}

suffix = " \u2013 ASIA Academic Division"

for fn, (title, desc) in fixes.items():
    if not os.path.exists(fn):
        print("SKIP: " + fn)
        continue
    with open(fn, "r", encoding="utf-8") as f:
        content = f.read()

    # Fix <title>
    content = re.sub(
        r"<title>.*?</title>",
        "<title>" + title + suffix + "</title>",
        content
    )
    # Fix meta description
    content = re.sub(
        r'<meta name="description" content=".*?"',
        '<meta name="description" content="' + desc + '"',
        content
    )

    with open(fn, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed: " + fn + " -> " + title + suffix)

print("All titles fixed.")
