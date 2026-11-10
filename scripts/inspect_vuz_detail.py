import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://vuzopedia.ru/vuz/4'
req = urllib.request.Request(url, headers=headers)
html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

# Extract numbers, badges, specs
print("--- Title ---")
title = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.I | re.S)
if title:
    print(re.sub(r'<[^>]+>', ' ', title.group(1)).strip())

# Extract key metrics block
print("\n--- Key Metrics ---")
metrics = re.findall(r'<div class="[^"]*(?:col|block|item|num|spec|stat)[^"]*"[^>]*>.*?</div>', html, re.I | re.S)
for m in re.findall(r'(\d+[\s\d]*)\s*(мест|руб|балл|программ|специальност|место)', html, re.I):
    print(" ", m)

# Extract badges
print("\n--- Badges / Attributes ---")
for b in ['Государственный', 'Военная кафедра', 'Общежитие', 'Бюджетные места', 'Лицензия', 'Аккредитация', 'Бакалавриат', 'Специалитет', 'Магистратура']:
    if b.lower() in html.lower():
        print("  Found badge:", b)

# Extract faculties / programs
programs = re.findall(r'<a\s+[^>]*href=["\'](/vuz/\d+/programs/[^"\']+)["\'][^>]*>(.*?)</a>', html, re.I | re.S)
print(f"\n--- Programs Sample ({len(programs)}) ---")
for p_url, p_title in programs[:5]:
    print(f"  {p_url} -> {re.sub(r'<[^>]+>', '', p_title).strip()}")
