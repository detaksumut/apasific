import re

with open('d:/Users/apasific/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract Navbar
nav_match = re.search(r'<nav.*?</nav>', html, re.DOTALL)
navbar = nav_match.group(0) if nav_match else ''

# Extract Footer
footer_match = re.search(r'<footer.*?</footer>', html, re.DOTALL)
footer = footer_match.group(0) if footer_match else ''

# Extract Main content (between nav and footer)
main_match = re.search(r'</nav>(.*?)<footer', html, re.DOTALL)
main_content = main_match.group(1) if main_match else ''

layout_tsx = f"""import type {{ Metadata }} from "next";
import "./globals.css";

export const metadata: Metadata = {{
  title: "ASIA – Association of Asia Pacific Academician",
  description: "Uniting scholars, researchers, and professionals across Asia Pacific.",
}};

export default function RootLayout({{
  children,
}}: Readonly<{{
  children: React.ReactNode;
}}>) {{
  return (
    <html lang="en">
      <body>
        {{/* Navigation */}}
        <div dangerouslySetInnerHTML={{{{ __html: `{navbar}` }}}} />
        
        {{children}}

        {{/* Footer */}}
        <div dangerouslySetInnerHTML={{{{ __html: `{footer}` }}}} />
      </body>
    </html>
  );
}}
"""

page_tsx = f"""export default function Home() {{
  return (
    <main dangerouslySetInnerHTML={{{{ __html: `{main_content}` }}}} />
  );
}}
"""

with open('d:/Users/apasific/iaep-app/src/app/layout.tsx', 'w', encoding='utf-8') as f:
    f.write(layout_tsx)
    
with open('d:/Users/apasific/iaep-app/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_tsx)

print('Generated layout.tsx and page.tsx')
