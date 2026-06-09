import os
import json

def fix_content(content):
    # Try to load as JSON string first
    try:
        val = json.loads(content)
        if isinstance(val, str):
            return val
    except:
        pass
    
    # Check if it looks like json.dumps of a string
    content_str = content.strip()
    if content_str.startswith('"') and content_str.endswith('"'):
        # It's double quoted, meaning we can strip the quotes and decode unicode escapes
        # The easiest way is to use encode/decode
        try:
            return bytes(content_str[1:-1], 'utf-8').decode('unicode_escape')
        except:
            pass
    return None

for root, dirs, files in os.walk(r'd:\GitHub\pano_erp'):
    if 'venv' in dirs: dirs.remove('venv')
    if '.git' in dirs: dirs.remove('.git')
    for file in files:
        if file.endswith('.py') or file.endswith('.toml') or file.endswith('.env') or file.endswith('.example') or file.endswith('.gitignore') or file.endswith('.md'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            fixed = fix_content(content)
            if fixed is not None:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(fixed)
                print(f'Fixed {filepath}')
