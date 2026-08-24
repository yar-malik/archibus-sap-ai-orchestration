"""Turn a reported fault into the work order a CAFM system accepts.

Standard library only — Python 3.9 or newer.

    export VOHO_API_KEY=voho_sk_live_...   # app.voho.ai -> API Tokens
    python examples/python/main.py

New accounts start with $25 of credit, so this costs nothing to try.
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

KEY = os.environ.get("VOHO_API_KEY")
BASE = os.environ.get("VOHO_BASE_URL", "https://app.voho.ai")

if not KEY:
    sys.exit("Set VOHO_API_KEY first — create one at https://app.voho.ai/tokens")


def voho(path, body, raw=False):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(body).encode(),
        headers={"Authorization": "Bearer " + KEY, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as res:
            return res.read() if raw else json.load(res)
    except urllib.error.HTTPError as err:
        detail = json.loads(err.read() or b"{}").get("error", {})
        sys.exit("%s: %s" % (detail.get("code", err.code), detail.get("message", "request failed")))


def spent(cents):
    print("\nCharged $%.2f from your Voho balance." % (cents / 100))

report = " ".join(sys.argv[1:]) or "في ريحة حريق في الدور الرابع من جهة المكيف، والمكان صار حار مرة. عندنا اجتماع بعد ساعة في نفس الدور."

print("Reported:", report, "\n")
out = voho("/v1/facilities/work-order", {"text": report})

print("%s · SLA %sh%s" % (out["priority"].upper(), out["sla_hours"], " · page the on-call" if out["escalate"] else ""))
print(out["summary"])
print("asset: %s\nlocation: %s\ntrade: %s" % (out["asset"], out["location"], out["trade"]))
if out["missing"]:
    print("still needed:", ", ".join(out["missing"]))
spent(out["cost_cents"])
