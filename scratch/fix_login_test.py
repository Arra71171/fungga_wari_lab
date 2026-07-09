import os
import re

# 1. Update login.spec.ts
login_path = r"C:\fungga-wari-lab\e2e\dashboard\login.spec.ts"
with open(login_path, "r", encoding="utf-8") as f:
    login = f.read()

# Replace input[name='identifier'] with input[type='email']
login = login.replace('input[name=\'identifier\']', 'input[type=\'email\']')

with open(login_path, "w", encoding="utf-8") as f:
    f.write(login)

# 2. Update testBackend.ts
backend_path = r"C:\fungga-wari-lab\e2e\support\testBackend.ts"
with open(backend_path, "r", encoding="utf-8") as f:
    backend = f.read()

# Add access archive to button name regex
backend = backend.replace('/accessing|sign in|continue/i', '/accessing|access archive|sign in|continue/i')

with open(backend_path, "w", encoding="utf-8") as f:
    f.write(backend)

print("Fixed login test and testBackend")
