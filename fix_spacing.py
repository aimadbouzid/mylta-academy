import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add space before number if preceded by non-space (and not a quote or bracket)
    # e.g., ":19 400 DZD" -> ": 19 400 DZD"
    # Wait, simple way: replace "([a-zA-Z:])(\d)" where it's part of our DZD block?
    # No, let's just replace " :(\d)" with " : \1" maybe?
    # Let's fix common ones
    
    # 1. ":19" -> ": 19"
    new_content = re.sub(r':(\d)', r': \1', content)
    
    # 2. "DZDde " -> "DZD de "
    new_content = re.sub(r'DZD([a-zA-Z])', r'DZD \1', new_content)

    # 3. "(\w)(\d+.*DZD)" -> add space? Only if needed, let's leave it mostly.
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated spacing {filepath}")

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx') or file.endswith('.cjs'):
            process_file(os.path.join(root, file))
