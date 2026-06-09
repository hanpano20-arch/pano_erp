import os
import json

def fix_content(content):
    content_str = content.strip()
    if content_str.startswith('"') and content_str.endswith('"'):
        try:
            val = json.loads(content_str)
            if isinstance(val, str):
                return val
        except Exception as e:
            pass
    return None

fixed_count = 0
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
                fixed_count += 1
print(f'Total fixed: {fixed_count}')
