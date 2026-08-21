"""
Archibus and SAP AI Orchestration — minimal Python example.

Speaks Najdi Saudi Arabic through the Voho speech API and writes an MP3.
"""

import os
import sys

import requests

KEY = os.environ.get("VOHO_API_KEY")
BASE = os.environ.get("VOHO_BASE_URL", "https://app.voho.ai")

if not KEY:
    sys.exit("Set VOHO_API_KEY first — see .env.example")

# Layla is a Najdi voice. faisal, nouf and omar are Najdi as well.
payload = {
    "text": "أهلاً بك في فوهو، كيف أقدر أساعدك اليوم؟",
    "voice": "layla",
    "model": "sada-1",
    # Use "mulaw" for telephony — 8 kHz, no transcoding needed.
    "format": "mp3",
}

res = requests.post(
    f"{BASE}/v1/speech",
    headers={"Authorization": f"Bearer {KEY}"},
    json=payload,
    timeout=30,
)

if not res.ok:
    sys.exit(f"Request failed: {res.status_code} {res.text[:200]}")

with open("output.mp3", "wb") as fh:
    fh.write(res.content)

print("Wrote output.mp3")
print("Characters billed:", res.headers.get("x-voho-characters"))
