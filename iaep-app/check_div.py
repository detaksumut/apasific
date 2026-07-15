import re

def check_div_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.readlines()
        
    stack = []
    
    # Simple regex to find <div and </div, ignoring comments and strings for a very rough estimate
    # Actually, a simple count of <div and </div might reveal the mismatch line
    div_open_re = re.compile(r'<\s*div[^>]*>')
    div_close_re = re.compile(r'<\s*/\s*div\s*>')
    
    open_count = 0
    close_count = 0
    
    for i, line in enumerate(content):
        o = len(div_open_re.findall(line))
        c = len(div_close_re.findall(line))
        
        open_count += o
        close_count += c
        
        # print(f"Line {i+1}: +{o} -{c} (Total: {open_count - close_count})")
        if open_count < close_count:
            print(f"Error: Too many closing divs at line {i+1}")
            break
            
    print(f"Total open: {open_count}, Total close: {close_count}")

check_div_balance('src/app/dashboard/editor/submissions/[id]/page.tsx')
