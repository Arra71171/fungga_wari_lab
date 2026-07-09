import re

# 1. Update playwright.config.ts
config_path = r"C:\fungga-wari-lab\playwright.config.ts"
with open(config_path, "r", encoding="utf-8") as f:
    config = f.read()

config = config.replace('baseURL: "http://localhost:3000",', 'baseURL: "http://localhost:3000/dashboard",')

if "webServer:" not in config:
    webserver_block = """
  webServer: {
    command: "pnpm run dev",
    port: 3001,
    reuseExistingServer: true,
    timeout: 120000,
  },
"""
    config = config.replace("projects: [", webserver_block + "  projects: [")

with open(config_path, "w", encoding="utf-8") as f:
    f.write(config)


# 2. Update testBackend.ts
backend_path = r"C:\fungga-wari-lab\e2e\support\testBackend.ts"
with open(backend_path, "r", encoding="utf-8") as f:
    backend = f.read()

backend = backend.replace('await page.goto(`${urls.dashboard}/overview`);', 'await page.goto("/overview");')

with open(backend_path, "w", encoding="utf-8") as f:
    f.write(backend)


# 3. Update storyLifecycle.spec.ts
story_path = r"C:\fungga-wari-lab\e2e\dashboard\storyLifecycle.spec.ts"
with open(story_path, "r", encoding="utf-8") as f:
    story = f.read()

story = story.replace('await page.goto(`${urls.dashboard}/stories`);', 'await page.goto("/stories");')

with open(story_path, "w", encoding="utf-8") as f:
    f.write(story)

print("Fixed test configs")
