import os
import ast

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # If the file starts and ends with double quote, and contains literal '\n', we can just use ast.literal_eval if it's a valid python string
    # Actually, we can check if it starts with '"' and ends with '"'
    if content.startswith('"') and content.endswith('"'):
        try:
            # ast.literal_eval handles evaluating the python string representation to actual string
            actual_content = ast.literal_eval(content)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(actual_content)
            print(f'Fixed {filepath}')
        except Exception as e:
            print(f'Failed to fix {filepath}: {e}')

for root, _, files in os.walk('d:\GitHub\pano_erp'):
    for file in files:
        if file.endswith('.py') or file.endswith('.toml') or file.endswith('.env') or file.endswith('.example') or file.endswith('.gitignore') or file.endswith('.md'):
            # Only fix files that were probably recovered
            filepath = os.path.join(root, file)
            fix_file(filepath)
