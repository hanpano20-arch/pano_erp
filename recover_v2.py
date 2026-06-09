import json
import os

log_file = r'C:\Users\Lenovo\.gemini\antigravity-ide\brain\106d3924-0796-4209-9c11-e1b0563d4084\.system_generated\logs\transcript.jsonl'
files_recovered = 0

with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        tool_calls = data.get('tool_calls', [])
        for call in tool_calls:
            if call.get('name') == 'write_to_file':
                args = call.get('args', {})
                target_file = args.get('TargetFile')
                content = args.get('CodeContent')
                if target_file and content and 'pano_erp' in target_file:
                    target_file = target_file.strip('\"')
                    
                    # CodeContent might be a double-encoded string
                    if isinstance(content, str):
                        try:
                            # Try to decode it as a JSON string
                            parsed_content = json.loads(content)
                            if isinstance(parsed_content, str):
                                content = parsed_content
                        except json.JSONDecodeError:
                            # If it's not a JSON string, leave it as is
                            pass

                    os.makedirs(os.path.dirname(target_file), exist_ok=True)
                    
                    with open(target_file, 'w', encoding='utf-8') as out_f:
                        out_f.write(content)
                    
                    print(f'Recovered: {target_file}')
                    files_recovered += 1

print(f'\nTotal files recovered: {files_recovered}')
