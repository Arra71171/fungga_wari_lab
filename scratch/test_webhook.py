import urllib.request
import urllib.parse
import json
import time

payload = json.dumps({
    "api_version": "2026-03-25.dahlia",
    "data": {
      "object": {
        "id": f"cs_test_{int(time.time())}",
        "metadata": {
          "auth_id": "test_auth_id",
        },
        "object": "checkout.session",
        "payment_status": "paid",
      },
    },
    "id": f"evt_test_{int(time.time())}",
    "object": "event",
    "type": "checkout.session.completed",
})

req = urllib.request.Request("http://localhost:3001/api/webhooks/stripe", data=payload.encode("utf-8"), method="POST")
req.add_header("content-type", "application/json")
req.add_header("stripe-signature", "dummy_signature")

try:
    response = urllib.request.urlopen(req)
    print("Status:", response.status)
    print("Body:", response.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("Error Status:", e.code)
    print("Error Body:", e.read().decode("utf-8"))
