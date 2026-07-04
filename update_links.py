import os, re
files = ['index.html', 'vision-mission.html', 'asiacert.html', 'boc.html']

for fn in files:
    if os.path.exists(fn):
        with open(fn, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # In navbar:
        content = content.replace('<a href="https://apasific.org/boc" target="_blank">', '<a href="boc.html">')
        
        # In index.html featured card:
        if fn == 'index.html':
            content = content.replace('<a href="https://apasific.org/boc" target="_blank" class="div-link">Visit Website →</a>', 
                                      '<a href="boc.html" class="div-link">Explore ASIA BOC →</a>')
        
        # Also bump cache to v=9 for safety
        content = re.sub(r'style\.css\?v=\d+', 'style.css?v=9', content)
        
        with open(fn, 'w', encoding='utf-8') as f:
            f.write(content)

print("Links and cache updated successfully.")
