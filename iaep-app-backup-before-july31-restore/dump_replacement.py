import json

with open('C:\\Users\\BI News\\.gemini\\antigravity-ide\\brain\\85497ef1-c0fc-45d1-9e00-4ff21d0857d7\\.system_generated\\logs\\transcript.jsonl', 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE' and data.get('tool_calls'):
            for tc in data['tool_calls']:
                if tc['name'] == 'replace_file_content' and 'Redesign Copyediting' in tc['args'].get('Description', ''):
                    print("Found!")
                    content = tc['args']['ReplacementContent']
                    with open('scratch/replacement.tsx', 'w', encoding='utf-8') as outf:
                        outf.write(content)
                    break
