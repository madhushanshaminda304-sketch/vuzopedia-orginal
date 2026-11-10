import urllib.request
import re
import json

url = 'https://vuzopedia.ru/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
try:
    with urllib.request.urlopen(req, timeout=15) as res:
        html = res.read().decode('utf-8', errors='ignore')
except Exception as e:
    print("Error fetching:", e)
    exit(1)

title_match = re.search(r'<title>(.*?)</title>', html, re.I | re.S)
desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.I)

print("Title:", title_match.group(1).strip() if title_match else "None")
print("Desc:", desc_match.group(1).strip() if desc_match else "None")

# Find navigation elements / header menus
nav_items = re.findall(r'<a\s+[^>]*href=["\'](/[^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S)
clean_nav = []
for href, text in nav_items:
    text_clean = re.sub(r'<[^>]+>', '', text).strip()
    if text_clean and not href.startswith(('/css', '/js', '/images', '/img', '/favicon', '#')):
        clean_nav.append((href, text_clean))

# De-duplicate while preserving order
seen = set()
unique_nav = []
for href, text in clean_nav:
    if (href, text) not in seen and len(text) < 60:
        seen.add((href, text))
        unique_nav.append({"url": href, "title": text})

print("\n--- Navigation Items Sample (total %d) ---" % len(unique_nav))
for item in unique_nav[:40]:
    print(f"  {item['url']} -> {item['title']}")

# Find sections, blocks, features
print("\n--- Key Sections Detected ---")
blocks = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html, re.I | re.S)
for b in blocks[:25]:
    b_clean = re.sub(r'<[^>]+>', '', b).strip()
    if b_clean:
        print("  Heading:", b_clean)
