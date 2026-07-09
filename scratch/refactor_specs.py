import os

login_path = r"C:\fungga-wari-lab\e2e\dashboard\login.spec.ts"
story_path = r"C:\fungga-wari-lab\e2e\dashboard\storyLifecycle.spec.ts"

# 1. Update login.spec.ts
with open(login_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('clerkId', 'authId')
content = content.replace('signs in with Clerk', 'signs in with Supabase Auth')

with open(login_path, "w", encoding="utf-8") as f:
    f.write(content)


# 2. Update storyLifecycle.spec.ts
with open(story_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('clerkId', 'authId')
content = content.replace('Clerk', 'Supabase Auth')

with open(story_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated spec files")
