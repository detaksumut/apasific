import os
import glob

files = glob.glob('public/*.html') + ['src/app/layout.tsx']

replacements = [
    (
        '<a href="/#regional-chapters"><span class="dd-icon">◈</span> Regional Chapters</a>',
        '<a href="/#certification-structure"><span class="dd-icon">◈</span> Certification Structure</a>'
    ),
    (
        '<a href="/#strategic-partners"><span class="dd-icon">◈</span> Strategic Partners</a>',
        '<a href="/#journal-structure"><span class="dd-icon">◈</span> Journal Structure</a>'
    ),
    (
        '<li><a href="#regional-chapters">Regional Chapters</a></li>',
        '<li><a href="#certification-structure">Certification Structure</a></li>'
    ),
    (
        '<li><a href="#strategic-partners">Strategic Partners</a></li>',
        '<li><a href="#journal-structure">Journal Structure</a></li>'
    ),
    (
        '<li><a href="/#regional-chapters">Regional Chapters</a></li>',
        '<li><a href="/#certification-structure">Certification Structure</a></li>'
    ),
    (
        '<li><a href="/#strategic-partners">Strategic Partners</a></li>',
        '<li><a href="/#journal-structure">Journal Structure</a></li>'
    ),
]

count = 0
for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1
            print(f"Updated {filepath}")
print(f"Total updated files: {count}")
