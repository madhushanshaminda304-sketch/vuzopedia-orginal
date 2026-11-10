import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://vuzopedia.ru/'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

# Extract all anchor tags with their text, class, and parents
links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S)

features = []
for href, text in links:
    clean_text = re.sub(r'<[^>]+>', ' ', text).strip()
    clean_text = ' '.join(clean_text.split())
    if href.startswith(('/themes', '/css', '/js', 'http', '#', 'tel:', 'mailto:', '//')):
        continue
    if len(clean_text) > 1 and len(clean_text) < 100:
        features.append((href, clean_text))

# Deduplicate
seen = set()
unique_features = []
for h, t in features:
    if (h, t) not in seen:
        seen.add((h, t))
        unique_features.append({"href": h, "title": t})

print(f"Total internal features/links extracted from homepage: {len(unique_features)}")
with open('scripts/all_homepage_features.json', 'w', encoding='utf-8') as f:
    json.dump(unique_features, f, ensure_ascii=False, indent=2)

for item in unique_features:
    print(f"{item['href']} -> {item['title']}")
