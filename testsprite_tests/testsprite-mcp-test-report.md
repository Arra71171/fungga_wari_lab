# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** fungga-wari-lab
- **Date:** 2026-04-24
- **Prepared by:** TestSprite AI Team / Antigravity

---

## 2️⃣ Requirement Validation Summary

### Requirement 1: Authentication & Access Control

#### Test TC001 Log in and reach the dashboard overview
- **Status:** ✅ Passed
- **Analysis / Findings:** Login flow successfully authenticates the user and correctly redirects to the dashboard overview.

#### Test TC002 Protect the dashboard from anonymous deep-link access and redirect back after login
- **Status:** ✅ Passed
- **Analysis / Findings:** The middleware correctly intercepts unauthenticated access to `/dashboard` routes, appends the `redirect` URL parameter, and enforces the login flow.

#### Test TC003 Create a new creator account
- **Status:** ❌ Failed
- **Analysis / Findings:** The registration form rejected the valid email `creator+new1@example.com`. This indicates that the email validation regex is too strict (likely rejecting the `+` character) or Supabase auth settings are rejecting the format.

#### Test TC011 Reject login with non-existent account credentials
- **Status:** ✅ Passed
- **Analysis / Findings:** Invalid credentials are appropriately caught and error messages are displayed securely without leaking user existence.

#### Test TC012 Block registration with invalid email format
- **Status:** ✅ Passed
- **Analysis / Findings:** Form validation correctly prevents submission with malformed email addresses.

#### Test TC013 Show email validation error on login for invalid email format
- **Status:** ✅ Passed
- **Analysis / Findings:** Client-side validation is working correctly for the login form.

---

### Requirement 2: Dashboard & Creator Studio

#### Test TC004 View dashboard overview statistics and open the story editor
- **Status:** ✅ Passed
- **Analysis / Findings:** The dashboard correctly fetches and displays the authenticated user's statistics and allows navigation into the draft editor.

#### Test TC005 Edit story metadata, save, and see updates reflected on the overview
- **Status:** ❌ Failed
- **Analysis / Findings:** Editing and saving works in the editor (saved as "The Tale of the Bamboo Cutter (Edited)"), but the dashboard overview still shows the old title ("Manuscript Core"). This is a classic Next.js App Router cache invalidation issue — `revalidatePath('/dashboard/overview')` is likely missing or failing in the server action.

---

### Requirement 3: Story Discovery & Reading

#### Test TC006 Read a featured published story from the landing page
- **Status:** ❌ Failed
- **Analysis / Findings:** The UI is working ("No stories published yet" state), but no stories are displayed. The seeded test story is either not marked as published/featured, or the seed data was not loaded into the active test database.

#### Test TC007 Return to landing page from the story reader
- **Status:** ✅ Passed
- **Analysis / Findings:** Navigation components inside the reader layout properly route users back to the root application.

#### Test TC008 Landing page shows featured stories list
- **Status:** ❌ Failed
- **Analysis / Findings:** Fails for the same reason as TC006 — lack of published seed data in the active environment causes the "AWAITING MANUSCRIPTS" placeholder to render instead of actual stories.

#### Test TC009 Reader supports moving through story content
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Blocked due to the lack of clickable, published stories (same root cause as TC006 and TC008).

#### Test TC010 Open a published story from site search
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Blocked due to no published stories being available in the database, causing the search query ("folk") to return no results.

---

## 3️⃣ Coverage & Matching Metrics

- **Overall Pass Rate:** 53.85% (7/13)
- **Blocked Rate:** 15.38% (2/13)
- **Failure Rate:** 30.77% (4/13)

| Requirement | Total Tests | ✅ Passed | ❌ Failed | ⚠️ Blocked |
|---|---|---|---|---|
| Authentication & Access Control | 6 | 5 | 1 | 0 |
| Dashboard & Creator Studio | 2 | 1 | 1 | 0 |
| Story Discovery & Reading | 5 | 1 | 2 | 2 |

---

## 4️⃣ Key Gaps / Risks

1. **Test Environment Seeding:** The primary reason for 4 test failures/blocks is missing published seed data in the database. The `seed.sql` needs to ensure at least one story is explicitly set to `status = 'published'` and `is_featured = true` so the landing page and search flows can be fully automated.
2. **Next.js Cache Invalidation:** The dashboard overview is suffering from stale data reads (TC005). The server actions (likely `saveStory`) must call `revalidatePath` for the dashboard overview and story listing routes to ensure the cache is purged after mutations.
3. **Registration Email Validation:** The signup validation is incorrectly rejecting standard email sub-addressing (the `+` alias format, e.g., `creator+new1@example.com`). This needs to be relaxed in the Zod schema or Supabase config.
