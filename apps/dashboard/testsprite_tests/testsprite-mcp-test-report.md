# TestSprite AI Testing Report (MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** dashboard (Fungga Wari Lab Creator Studio)
- **Date:** 2026-04-24
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### 📌 Requirement: Story Management
*List, create, update and remove story drafts and their metadata.*

#### Test TC001 Create a new story draft and see it in the stories list
- **Test Code:** [TC001_Create_a_new_story_draft_and_see_it_in_the_stories_list.py](./TC001_Create_a_new_story_draft_and_see_it_in_the_stories_list.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/dae3a5fc-c160-4e85-954a-8636b799dbf0)
- **Status:** ✅ Passed
- **Analysis / Findings:** The story draft is successfully created and correctly appears in the stories list as expected.

#### Test TC003 Edit story metadata from story details and see updates reflected in the list
- **Test Code:** [TC003_Edit_story_metadata_from_story_details_and_see_updates_reflected_in_the_list.py](./TC003_Edit_story_metadata_from_story_details_and_see_updates_reflected_in_the_list.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/e9a1516c-78fd-4f36-a5ca-ecfa6edaaa75)
- **Status:** ✅ Passed
- **Analysis / Findings:** Metadata editing functions perfectly and updates are accurately synchronized and reflected in the stories list.

#### Test TC012 Require a title when creating a new story
- **Test Code:** [TC012_Require_a_title_when_creating_a_new_story.py](./TC012_Require_a_title_when_creating_a_new_story.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/226c51e9-f225-4eff-aa43-a9e57f91b6a2)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** The "New Manuscript" button showed "+ INITIALIZING..." and was unresponsive. The create-story UI could not be reached.

---

### 📌 Requirement: Chapter Builder
*Add, edit and reorder chapters within a story draft, compose chapter content with the rich text editor, and attach portrait illustrations.*

#### Test TC007 Delete a chapter and confirm it is removed from the draft outline
- **Test Code:** [TC007_Delete_a_chapter_and_confirm_it_is_removed_from_the_draft_outline.py](./TC007_Delete_a_chapter_and_confirm_it_is_removed_from_the_draft_outline.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/81c5dd55-b5a4-4ada-9732-f78467b80337)
- **Status:** ✅ Passed
- **Analysis / Findings:** Deletion logic successfully executes and updates the UI outline without blocking TestSprite (using the new `AlertDialog`).

#### Test TC002 Create a story, add a chapter with rich text and illustration, and confirm it persists after refresh
- **Test Code:** [TC002_Create_a_story_add_a_chapter_with_rich_text_and_illustration_and_confirm_it_persists_after_refresh.py](./TC002_Create_a_story_add_a_chapter_with_rich_text_and_illustration_and_confirm_it_persists_after_refresh.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/e5a4f0f4-f184-48a4-acd3-9f330baec2dc)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Test blocked by the same "+ INITIALIZING..." state on the New Manuscript button.

#### Test TC013 Block unsupported chapter illustration file types
- **Test Code:** [TC013_Block_unsupported_chapter_illustration_file_types.py](./TC013_Block_unsupported_chapter_illustration_file_types.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/0e242c6a-de03-4f04-a9d6-56461ee9faa4)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Test blocked because the create manuscript feature could not be reached ("+ INITIALIZING...").

---

### 📌 Requirement: Asset Library
*Upload and organize image and audio assets and browse recent assets in a grid.*

#### Test TC014 Reject unsupported or oversized asset uploads in the library
- **Test Code:** [TC014_Reject_unsupported_or_oversized_asset_uploads_in_the_library.py](./TC014_Reject_unsupported_or_oversized_asset_uploads_in_the_library.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/f17e4b1d-85d7-4238-806b-d62c7b6ba40d)
- **Status:** ❌ Failed
- **Analysis / Findings:** The test failed to confirm the inline validation message after attempting to upload an unsupported PDF. The verification was inconclusive and resulted in timeouts.

#### Test TC005 Upload an image asset and see it appear in the library grid
- **Test Code:** [TC005_Upload_an_image_asset_and_see_it_appear_in_the_library_grid.py](./TC005_Upload_an_image_asset_and_see_it_appear_in_the_library_grid.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/e301c069-90a5-4ffa-a26d-d0cbd81ba6cb)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** The test could not be completed because a required local image file (`test-image.png`) was not available to the agent for upload.

#### Test TC009 Assign tags or metadata to an uploaded asset and confirm it persists after refresh
- **Test Code:** [TC009_Assign_tags_or_metadata_to_an_uploaded_asset_and_confirm_it_persists_after_refresh.py](./TC009_Assign_tags_or_metadata_to_an_uploaded_asset_and_confirm_it_persists_after_refresh.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/78b5038b-a705-422e-9338-47ac4bfdebd3)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Similar to TC005, there was no valid image file (`tc009-test-image.png`) available in the environment to execute the upload step.

---

### 📌 Requirement: Settings (Operative Dossier)
*Edit creator profile information — alias, bio and avatar — and trigger identity sync.*

#### Test TC006 Saved dossier changes persist after page reload
- **Test Code:** [TC006_Saved_dossier_changes_persist_after_page_reload.py](./TC006_Saved_dossier_changes_persist_after_page_reload.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/b1c02e1d-9cc6-431e-81cd-a1ccdc8eaecd)
- **Status:** ✅ Passed
- **Analysis / Findings:** Form submissions and data persistence for Operative Dossier function correctly and survive a page refresh.

#### Test TC011 Prevent saving when alias is too short and allow correction
- **Test Code:** [TC011_Prevent_saving_when_alias_is_too_short_and_allow_correction.py](./TC011_Prevent_saving_when_alias_is_too_short_and_allow_correction.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/e8d641a5-851e-4f94-8c91-bec7185effa0)
- **Status:** ✅ Passed
- **Analysis / Findings:** Validation rules correctly prevent under-length aliases from being saved to the database.

#### Test TC010 Unsaved text changes are not persisted when leaving settings without saving
- **Test Code:** [TC010_Unsaved_text_changes_are_not_persisted_when_leaving_settings_without_saving.py](./TC010_Unsaved_text_changes_are_not_persisted_when_leaving_settings_without_saving.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/dcf96247-83cb-4463-ae42-d9c266804ed1)
- **Status:** ❌ Failed
- **Analysis / Findings:** Navigating away from the settings page and returning showed that unsaved changes were still present in the input fields. This suggests client-side state is being incorrectly retained between navigations rather than resetting to the database state.

#### Test TC004 Update dossier alias, bio, and avatar and see preview reflect saved changes
- **Test Code:** [TC004_Update_dossier_alias_bio_and_avatar_and_see_preview_reflect_saved_changes.py](./TC004_Update_dossier_alias_bio_and_avatar_and_see_preview_reflect_saved_changes.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/66b8cc7d-f466-4267-b17c-a26e34bb7374)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** The test could not supply a local image file to complete the avatar upload portion of the sequence.

#### Test TC008 Cancel avatar change before saving keeps previously saved avatar
- **Test Code:** [TC008_Cancel_avatar_change_before_saving_keeps_previously_saved_avatar.py](./TC008_Cancel_avatar_change_before_saving_keeps_previously_saved_avatar.py)
- **Test Visualization and Result:** [View on TestSprite](https://www.testsprite.com/dashboard/mcp/tests/dc989f72-d4b2-4436-83af-70d8034da321/ad0a54fa-79ff-4533-a067-ee634d8e1d4d)
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** The agent could not select or upload a local image file to execute the abandonment flow.

---

## 3️⃣ Coverage & Matching Metrics

- **35.71%** of tests passed (5 / 14 tests)

| Requirement | Total Tests | ✅ Passed | ❌ Failed | ⚠️ Blocked |
|-------------|-------------|-----------|-----------|------------|
| Story Management | 3 | 2 | 0 | 1 |
| Chapter Builder | 3 | 1 | 0 | 2 |
| Asset Library | 3 | 0 | 1 | 2 |
| Settings (Operative Dossier) | 5 | 2 | 1 | 2 |
| **Total** | **14** | **5** | **2** | **7** |

---

## 4️⃣ Key Gaps / Risks

1. **Test Environment File System Gaps**: 
   A significant portion of the tests (TC004, TC005, TC008, TC009) were blocked because TestSprite could not access or generate standard image dummy files (like `test-image.png`) in its execution environment. Providing these mock files locally will immediately unblock 4 tests.
2. **"INITIALIZING..." Button State Error**:
   Multiple tests (TC002, TC012, TC013) were blocked because the "New Manuscript" button remained stuck in an initializing state on the UI. This indicates a potential client-side React rendering issue or a stalled promise in the component fetching logic that needs to be addressed.
3. **Form State Retention Bug**:
   TC010 failed because leaving the settings page with unsaved form state and returning causes that dirty state to persist rather than resetting to the authoritative database values. The React component likely needs to properly reset its internal state or force a re-fetch/re-sync when mounted.
4. **Validation UX in Asset Library**:
   TC014 failed because when an unsupported PDF was uploaded, an inline validation error either didn't appear or couldn't be detected. This suggests the validation logic may be missing clear, detectable UI feedback when the browser rejects a file based on the `accept` attribute.
