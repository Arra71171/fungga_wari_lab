import os
import re

directories = ['apps/web', 'apps/dashboard', 'packages/ui']
exclude_dirs = {'node_modules', '.next', 'dist', 'build', '.git', 'storybook-static'}

def process_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The regex needs to handle optional prefixes like -t-, -b- properly
    # \brounded-(?:[trbl]|tl|tr|bl|br)?-?(?:sm|md|lg|xl|2xl|3xl|full|\[.*?\])\b
    new_content = re.sub(r'\brounded-(?!none\b)(?:(?:t|r|b|l|tl|tr|bl|br)-)?(?:sm|md|lg|xl|2xl|3xl|full|\[.*?\])\b', 'rounded-none', content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")

for directory in directories:
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))

print("Done")
