import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def fetch(url):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read().decode('utf-8', errors='ignore')

# 1. Fetch homepage styles
html = fetch('https://vuzopedia.ru/')

css_urls = re.findall(r'href=["\']([^"\']+\.css[^"\']*)["\']', html)
print("CSS files:")
for c in css_urls[:10]:
    print(" ", c)

# 2. Check font families and color schemes
fonts = set(re.findall(r'font-family:\s*([^;]+);', html, re.I))
print("\nInlined font families:", fonts)

# 3. Fetch CSS file to inspect root variables / colors
for c in css_urls:
    if 'style' in c or 'main' in c or 'app' in c or 'bundle' in c:
        full_css_url = c if c.startswith('http') else ('https://vuzopedia.ru' + c if c.startswith('/') else 'https://vuzopedia.ru/' + c)
        try:
            css_content = fetch(full_css_url)
            vars_found = re.findall(r'(--[\w-]+:\s*[^;]+;)', css_content)
            colors_found = set(re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b', css_content))
            print(f"\nCSS {full_css_url}:")
            print(f"  Length: {len(css_content)}")
            print(f"  CSS Variables ({len(vars_found)}):", vars_found[:15])
            print(f"  Top Colors:", list(colors_found)[:10])
            break
        except Exception as e:
            print("  Failed to fetch CSS:", e)

# 4. Fetch a sample university page to understand structure: e.g. /vuz/3 (MGU or similar) or /vuz/4
for vuz_id in [3, 4, 13]:
    try:
        vuz_html = fetch(f'https://vuzopedia.ru/vuz/{vuz_id}')
        vuz_title = re.search(r'<title>(.*?)</title>', vuz_html, re.I)
        print(f"\nUniversity /vuz/{vuz_id}:", vuz_title.group(1) if vuz_title else "Unknown")
        # Extract specs/stats
        stats = re.findall(r'class="[^"]*(?:stat|score|ball|price|item)[^"]*"[^>]*>(.*?)</div>', vuz_html, re.I | re.S)
        print(f"  Page size: {len(vuz_html)} bytes")
    except Exception as e:
        print(f"  Error fetching /vuz/{vuz_id}:", e)
