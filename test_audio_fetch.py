import urllib.request
import re
import ssl
import json

def fetch_mp3s(query):
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    url = f"https://freesound.org/search/?q={query.replace(' ', '+')}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')
        return re.findall(r'data-mp3="(https://cdn\.freesound\.org/previews/[^"]+)"', html)[:1]
    except Exception as e:
        return [str(e)]

res = {
    "music-exploration.mp3": fetch_mp3s("dark ambient drone"),
    "music-tension.mp3": fetch_mp3s("horror tension"),
    "music-terror.mp3": fetch_mp3s("horror chase chase"),
    "stinger-discovery.mp3": fetch_mp3s("horror stinger"),
    "stinger-death.mp3": fetch_mp3s("horror death impact"),
    "stinger-scare.mp3": fetch_mp3s("jumpscare")
}

print(json.dumps(res, indent=2))
