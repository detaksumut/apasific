import glob
import os

files = glob.glob('*.html') + glob.glob('*.py')
for f in files:
    if f == 'fix_paths.py': continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    if 'src="public/' in content:
        content = content.replace('src="public/', 'src="')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")
print("Done")
