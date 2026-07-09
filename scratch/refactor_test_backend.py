import re

path = r"C:\fungga-wari-lab\e2e\support\testBackend.ts"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove clerk imports and createClerkClient
content = content.replace('import { createClerkClient } from "@clerk/backend";\n', '')

# 2. Update E2EUser
content = content.replace('clerkId: string;', 'authId: string;')

# 3. Remove clerkSecretKey and clerkClient
content = re.sub(r'const clerkSecretKey = requireEnv\("CLERK_SECRET_KEY"\);\n', '', content)
content = re.sub(r'const clerkClient = createClerkClient\(\{ secretKey: clerkSecretKey \}\);\n', '', content)

# 4. Remove E2E_CLERK constants and replace with E2E_SUPABASE
content = content.replace('process.env.E2E_CLERK_EMAIL', 'process.env.E2E_USER_EMAIL')
content = content.replace('process.env.E2E_CLERK_PASSWORD', 'process.env.E2E_USER_PASSWORD')

# 5. Remove ensureE2EOrganization
content = re.sub(r'async function ensureE2EOrganization\(.*?\).*?return organization\.id;\n}\n', '', content, flags=re.DOTALL)

# 6. Update ensureAdminUserRow
content = content.replace('auth_id: user.clerkId,', 'auth_id: user.authId,')

# 7. Rewrite ensureE2EUser
ensure_user_new = """export async function ensureE2EUser(): Promise<E2EUser> {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  const existingUser = users.find(u => u.email === testEmail);

  if (existingUser) {
    const user = {
      authId: existingUser.id,
      email: testEmail,
      password: testPassword,
    };
    await ensureAdminUserRow(user);
    return user;
  }

  const { data: { user: createdUser }, error: createError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { role: "admin" }
  });

  if (createError || !createdUser) {
    throw new Error(`Failed to create test user: ${createError?.message}`);
  }

  const user = {
    authId: createdUser.id,
    email: testEmail,
    password: testPassword,
  };

  await ensureAdminUserRow(user);

  return user;
}"""
content = re.sub(r'export async function ensureE2EUser\(\): Promise<E2EUser> \{.*?\n\}\n', ensure_user_new + '\n', content, flags=re.DOTALL)

# 8. Update loginToDashboard
# Replace name='identifier' with name='email'
content = content.replace('name=\'identifier\'', 'name=\'email\'')

# 9. Update all references to clerkId -> authId in functions
content = content.replace('findUserRow(clerkId: string)', 'findUserRow(authId: string)')
content = content.replace('eq("auth_id", clerkId)', 'eq("auth_id", authId)')
content = content.replace('updateLifetimeAccess(clerkId: string,', 'updateLifetimeAccess(authId: string,')
content = content.replace('deleteAuditStories(clerkId: string)', 'deleteAuditStories(authId: string)')
content = content.replace('eq("author_id", clerkId)', 'eq("author_id", authId)')
content = content.replace('eq("uploaded_by", clerkId)', 'eq("uploaded_by", authId)')
content = content.replace('findCoverAssetByUrl(clerkId: string,', 'findCoverAssetByUrl(authId: string,')
content = content.replace('simulateSuccessfulCheckoutWebhook(\n  request: APIRequestContext,\n  clerkId: string,\n)', 'simulateSuccessfulCheckoutWebhook(\n  request: APIRequestContext,\n  authId: string,\n)')
content = content.replace('auth_id: clerkId,', 'auth_id: authId,')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated testBackend.ts")
