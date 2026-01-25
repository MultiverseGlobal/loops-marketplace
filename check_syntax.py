
import os

def check_file(path):
    print(f"Checking {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    print(f"Braces: {{: {open_braces}, }}: {close_braces}")
    
    open_parens = content.count('(')
    close_parens = content.count(')')
    print(f"Parens: (: {open_parens}, ): {close_parens}")

    # Search for DEFAULT_TERMS
    import re
    matches = re.findall(r'DEFAULT_TERMS', content)
    print(f"DEFAULT_TERMS occurrences: {len(matches)}")
    
    # Print lines around DEFAULT_TERMS
    lines = content.splitlines()
    for i, line in enumerate(lines):
        if 'DEFAULT_TERMS' in line:
            print(f"{i+1}: {line}")

check_file('src/context/campus-context.tsx')
check_file('src/app/onboarding/page.tsx')
