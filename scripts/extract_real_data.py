import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

def fetch(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as res:
            return res.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

# Fetch university list from Moscow and St. Petersburg
vuz_list = []
urls_to_crawl = [
    'https://vuzopedia.ru/city/moskva',
    'https://vuzopedia.ru/city/sankt-peterburg',
    'https://vuzopedia.ru/city/kazan',
    'https://vuzopedia.ru/city/novosibirsk',
    'https://vuzopedia.ru/city/ekaterinburg',
]

for url in urls_to_crawl:
    html = fetch(url)
    if not html:
        continue
    # Extract university cards
    # Pattern for university link and name: /vuz/\d+
    matches = re.findall(r'<a[^>]*href=["\'](/vuz/(\d+))["\'][^>]*>(.*?)</a>', html, re.I | re.S)
    print(f"Found {len(matches)} vuz links on {url}")
    for link, vuz_id, text in matches:
        title = re.sub(r'<[^>]+>', ' ', text).strip()
        if len(title) > 3 and not any(x['id'] == vuz_id for x in vuz_list) and not title.startswith(('http', 'Программ', 'Специальност', 'Подробнее')):
            city_name = "Москва" if "moskva" in url else ("Санкт-Петербург" if "peterburg" in url else ("Казань" if "kazan" in url else ("Новосибирск" if "novosibirsk" in url else "Екатеринбург")))
            vuz_list.append({
                "id": vuz_id,
                "url": link,
                "name": title,
                "city": city_name
            })

print(f"\nTotal unique universities extracted: {len(vuz_list)}")
for v in vuz_list[:15]:
    print(f"  [{v['id']}] {v['city']}: {v['name']}")

with open('scripts/extracted_vuz_list.json', 'w', encoding='utf-8') as f:
    json.dump(vuz_list, f, ensure_ascii=False, indent=2)
