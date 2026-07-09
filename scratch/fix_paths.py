import os

# 1. Update playwright.config.ts
config_path = r"C:\fungga-wari-lab\playwright.config.ts"
with open(config_path, "r", encoding="utf-8") as f:
    config = f.read()

config = config.replace('baseURL: "http://localhost:3000/dashboard"', 'baseURL: "http://localhost:3000"')

with open(config_path, "w", encoding="utf-8") as f:
    f.write(config)

# 2. Update testBackend.ts
backend_path = r"C:\fungga-wari-lab\e2e\support\testBackend.ts"
with open(backend_path, "r", encoding="utf-8") as f:
    backend = f.read()

backend = backend.replace('await page.goto("/overview");', 'await page.goto("/dashboard/overview");')

with open(backend_path, "w", encoding="utf-8") as f:
    f.write(backend)

# 3. Update storyLifecycle.spec.ts
story_path = r"C:\fungga-wari-lab\e2e\dashboard\storyLifecycle.spec.ts"
with open(story_path, "r", encoding="utf-8") as f:
    story = f.read()

story = story.replace('await page.goto("/stories");', 'await page.goto("/dashboard/stories");')

with open(story_path, "w", encoding="utf-8") as f:
    f.write(story)

# 4. Update login.spec.ts
login_path = r"C:\fungga-wari-lab\e2e\dashboard\login.spec.ts"
with open(login_path, "r", encoding="utf-8") as f:
    login = f.read()

login = login.replace('await page.goto("/overview");', 'await page.goto("/dashboard/overview");')

with open(login_path, "w", encoding="utf-8") as f:
    f.write(login)

print("Fixed URL paths")
