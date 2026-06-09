import os
import ast

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if content.strip().startswith('"') and content.strip().endswith('"'):
        try:
            # First, check if it's literally an escaped string
            # We can use ast.literal_eval on the stripped content
            val = content.strip()
            actual_content = ast.literal_eval(val)
            if isinstance(actual_content, str):
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(actual_content)
                print(f'Fixed {filepath}')
        except Exception as e:
            print(f'Failed to fix {filepath}: {e}')
    elif '\\n' in content and '\\"' in content:
        # It might be missing quotes but still escaped? Unlikely.
        pass

for root, _, files in os.walk(r'd:\GitHub\pano_erp'):
    for file in files:
        if file.endswith('.py') or file.endswith('.toml') or file.endswith('.env') or file.endswith('.example') or file.endswith('.gitignore') or file.endswith('.md'):
            filepath = os.path.join(root, file)
            fix_file(filepath)
