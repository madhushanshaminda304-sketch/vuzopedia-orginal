import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for path in ['/spo', '/cherniy-spisok-vuzov', '/target', '/s-chego-nachat', '/distancionnoe-obrazovanie']:
    try:
        url = f'https://vuzopedia.ru{path}'
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=12).read().decode('utf-8', errors='ignore')
        title = re.search(r'<title>(.*?)</title>', html, re.I)
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I | re.S)
        print(f"\n=== {path} ===")
        print("Title:", title.group(1).strip() if title else "None")
        print("H1:", re.sub(r'<[^>]+>', ' ', h1.group(1)).strip() if h1 else "None")
        # Extract sample text or links
        links = re.findall(r'<a\s+[^>]*href=["\'](/[^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S)
        print(f"Sample links ({len(links)}):")
        for h, t in links[:5]:
            print(f"  {h} -> {re.sub(r'<[^>]+>', '', t).strip()}")
    except Exception as e:
        print(f"Error {path}:", e)
