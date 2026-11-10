import urllib.request
import re

url = 'https://vuzopedia.ru/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
with urllib.request.urlopen(req, timeout=15) as res:
    html = res.read().decode('utf-8', errors='ignore')

# Inspect top header and menus
header_match = re.search(r'(<header.*?</header>|<nav.*?</nav>|<div class="[^"]*menu[^"]*".*?</div>)', html, re.I | re.S)
if header_match:
    print("Found header/nav length:", len(header_match.group(0)))

# Find distinct route patterns
all_hrefs = set(re.findall(r'href=["\'](/[^"\'#?]+)["\']', html))
routes = {}
for h in all_hrefs:
    parts = h.strip('/').split('/')
    if parts:
        prefix = parts[0]
        routes.setdefault(prefix, []).append(h)

print("\n--- Route Categories ---")
for prefix, items in sorted(routes.items(), key=lambda x: len(x[1]), reverse=True):
    print(f"/{prefix} ({len(items)} routes) -> sample: {items[:3]}")

# Look for specific keywords like calculator, vuz, spec, prof, test
print("\n--- Key Feature Links ---")
for h in sorted(all_hrefs):
    if any(k in h for k in ['kalkulyator', 'vuz', 'spec', 'prof', 'test', 'reiting', 'sravnenie', 'journal', 'spo', 'kolledzhi']):
        print("  ", h)
