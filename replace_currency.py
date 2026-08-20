import os
import re

def convert_match(m):
    prefix = m.group(1)
    sym1 = m.group(2)
    num_str = m.group(3)
    sym2 = m.group(4)
    suffix = m.group(5)
    
    # Check which symbol matched
    symbol = sym1 if sym1 else sym2
    if not symbol:
        return m.group(0)

    # Clean number string
    clean_num = num_str.replace(' ', '').replace(',', '')
    
    multiplier = 1
    if clean_num.lower().endswith('k'):
        multiplier = 1000
        clean_num = clean_num[:-1]
    elif clean_num.lower().endswith('m'):
        multiplier = 1000000
        clean_num = clean_num[:-1]
        
    try:
        val = float(clean_num)
        new_val = int(val * multiplier * 200) # Conversion rate 200 DZD
        
        # Format with space as thousands separator
        if new_val == 0:
            formatted = "0"
        else:
            formatted = f"{new_val:,}".replace(',', ' ')
            
        return f"{prefix}{formatted} DZD{suffix}"
    except Exception as e:
        # If parsing fails, just return original
        return m.group(0)

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Match: (non-digit) (symbol)? (number with spaces/commas/k/m) (symbol)? (non-digit)
    # Actually we can do two patterns to be safe.
    # Pattern 1: Symbol before number
    # Pattern 2: Symbol after number
    
    # 1. € or $ followed by number
    p1 = re.compile(r'(^|\D)(€|\$)\s*([\d\s,]+[kKmM]?)(?=\D|$)')
    # 2. number followed by € or $
    p2 = re.compile(r'(^|\D)([\d\s,]+[kKmM]?)\s*(€|\$)(?=\D|$)')
    
    def repl1(m):
        prefix = m.group(1)
        sym = m.group(2)
        num = m.group(3)
        return convert_match_parts(prefix, num, sym, "")
        
    def repl2(m):
        prefix = m.group(1)
        num = m.group(2)
        sym = m.group(3)
        return convert_match_parts(prefix, num, sym, "")

    def convert_match_parts(prefix, num_str, sym, suffix):
        clean_num = num_str.replace(' ', '').replace(',', '')
        
        multiplier = 1
        if clean_num.lower().endswith('k'):
            multiplier = 1000
            clean_num = clean_num[:-1]
        elif clean_num.lower().endswith('m'):
            multiplier = 1000000
            clean_num = clean_num[:-1]
            
        try:
            val = float(clean_num)
            new_val = int(val * multiplier * 200) # using 200 rate
            if new_val == 0:
                formatted = "0"
            else:
                formatted = f"{new_val:,}".replace(',', ' ')
            return f"{prefix}{formatted} DZD{suffix}"
        except Exception:
            return f"{prefix}{num_str}{sym}{suffix}"

    new_content = p1.sub(repl1, content)
    new_content = p2.sub(repl2, new_content)
    
    # Also handle some edge cases manually if needed
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx') or file.endswith('.cjs'):
            process_file(os.path.join(root, file))
