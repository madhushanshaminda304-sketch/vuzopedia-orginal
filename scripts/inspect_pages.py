import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for path in ['/testy', '/proforient', '/compare/catalog/vo/specialty', '/professii']:
    url = f'https://vuzopedia.ru{path}'
    try:
        req = urllib.request.Request(url, headers=headers)
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
        title = re.findall(r'<title>(.*?)</title>', html, re.I)
        print(f"Path {path}: {title[0] if title else 'No title'}")
        headings = re.findall(r'<h[1-2][^>]*>(.*?)</h[1-2]>', html, re.I | re.S)
        for h in headings[:3]:
            print("   Heading:", re.sub(r'<[^>]+>', '', h).strip())
    except Exception as e:
        print(f"Path {path} error:", e)
