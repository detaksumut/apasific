import re

with open('d:/Users/apasific/iaep-app/src/app/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
    
c = re.sub(r' data-aos="[^"]*"', '', c)
c = re.sub(r' data-aos-delay="[^"]*"', '', c)

with open('d:/Users/apasific/iaep-app/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

print('Removed AOS animations from page.tsx')
