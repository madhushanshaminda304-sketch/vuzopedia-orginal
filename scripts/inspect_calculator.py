import urllib.request
import re

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

url = 'https://vuzopedia.ru/kalkulator-ege'
try:
    req = urllib.request.Request(url, headers=headers)
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    print("Calculator Page Title:", re.findall(r'<title>(.*?)</title>', html, re.I))
    
    # Find subject checkboxes or inputs
    subjects = re.findall(r'<(?:input|label|div)[^>]*class="[^"]*(?:predmet|subject|ege|item)[^"]*"[^>]*>(.*?)</(?:label|div)>', html, re.I | re.S)
    print(f"Subjects found: {len(subjects)}")
    
    # Search for text mentions of subjects
    common_subjects = ['Русский язык', 'Математика', 'Физика', 'Информатика', 'Обществознание', 'История', 'Химия', 'Биология', 'Иностранный язык', 'Литература', 'География']
    for s in common_subjects:
        if s.lower() in html.lower():
            print("  Subject present:", s)
except Exception as e:
    print("Error fetching calculator:", e)
