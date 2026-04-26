# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** web
- **Date:** 2026-04-24
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

### Requirement: Reader Content & Navigation

#### Test TC001 Cinematic reading session with chapter switching updates content and illustration
- **Test Code:** [TC001_Cinematic_reading_session_with_chapter_switching_updates_content_and_illustration.py](./TC001_Cinematic_reading_session_with_chapter_switching_updates_content_and_illustration.py)
- **Test Error:** TEST FAILURE
- **Status:** ❌ Failed
- **Analysis / Findings:** Switching chapters updates the sidebar UI but the main reader text fails to update from Chapter 1 content. Illustrations are missing entirely.

#### Test TC002 Switch chapters from the sidebar and see content update
- **Test Code:** [TC002_Switch_chapters_from_the_sidebar_and_see_content_update.py](./TC002_Switch_chapters_from_the_sidebar_and_see_content_update.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** A full-archive paywall ("Archive Access Required") overlays the reader content, blocking interaction and verification of chapter switching.


### Requirement: Chapter Illustrations

#### Test TC003 Chapter illustration updates when switching chapters
- **Test Code:** [TC003_Chapter_illustration_updates_when_switching_chapters.py](./TC003_Chapter_illustration_updates_when_switching_chapters.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Reader content and illustrations are blurred and blocked by the "Unlock Lifetime Access" paywall overlay.

#### Test TC010 Illustration is present for the initially loaded chapter
- **Test Code:** [TC010_Illustration_is_present_for_the_initially_loaded_chapter.py](./TC010_Illustration_is_present_for_the_initially_loaded_chapter.py)
- **Test Error:** TEST FAILURE
- **Status:** ❌ Failed
- **Analysis / Findings:** The page contains no `<img>` element for the chapter illustration. An 'Archive Access Required' overlay is also present.

#### Test TC015 Illustration continues to update across multiple chapter switches
- **Test Code:** [TC015_Illustration_continues_to_update_across_multiple_chapter_switches.py](./TC015_Illustration_continues_to_update_across_multiple_chapter_switches.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Verification is blocked by the purchase paywall overlaying the reader after clicking 'Continue Reading'.


### Requirement: AI Narration (TTS)

#### Test TC004 Switch chapters while TTS is active
- **Test Code:** [TC004_Switch_chapters_while_TTS_is_active.py](./TC004_Switch_chapters_while_TTS_is_active.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** TTS control is marked "Unavailable". A paywall blocks access to the narration feature.

#### Test TC005 Start and pause TTS narration with visualiser state changes
- **Test Code:** [TC005_Start_and_pause_TTS_narration_with_visualiser_state_changes.py](./TC005_Start_and_pause_TTS_narration_with_visualiser_state_changes.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** TTS requires paid archive access. Narration controls display 'Unavailable'.

#### Test TC007 Changing chapters during active TTS does not lock the UI
- **Test Code:** [TC007_Changing_chapters_during_active_TTS_does_not_lock_the_UI.py](./TC007_Changing_chapters_during_active_TTS_does_not_lock_the_UI.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** Narration could not be started due to the purchase overlay and "Unavailable" TTS control.

#### Test TC009 Resume TTS narration after pausing
- **Test Code:** [TC009_Resume_TTS_narration_after_pausing.py](./TC009_Resume_TTS_narration_after_pausing.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** TTS controls are blocked by the archive access paywall.


### Requirement: Cinematic Story Reader

#### Test TC006 Start and pause TTS narration without locking the reader UI
- **Test Code:** [TC006_Start_and_pause_TTS_narration_without_locking_the_reader_UI.py](./TC006_Start_and_pause_TTS_narration_without_locking_the_reader_UI.py)
- **Test Error:** TEST FAILURE
- **Status:** ❌ Failed
- **Analysis / Findings:** UI is present, but an "Unlock the Full Archive" paywall modal overlays the reader, blocking TTS playback and navigation interactions.


### Requirement: Story Discovery & Browsing

#### Test TC008 Browse and open a story from the catalogue
- **Test Code:** [TC008_Browse_and_open_a_story_from_the_catalogue.py](./TC008_Browse_and_open_a_story_from_the_catalogue.py)
- **Test Error:** TEST BLOCKED
- **Status:** ⚠️ BLOCKED
- **Analysis / Findings:** The immersive reader is gated behind an 'Unlock the Full Archive' purchase panel overlay, preventing content access.

#### Test TC011 Open a story from archive into the immersive reader
- **Test Code:** [TC011_Open_a_story_from_archive_into_the_immersive_reader.py](./TC011_Open_a_story_from_archive_into_the_immersive_reader.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** User can successfully open a story from the archive and reach the immersive reader interface.

#### Test TC012 Enter the story catalogue from the landing hero
- **Test Code:** [TC012_Enter_the_story_catalogue_from_the_landing_hero.py](./TC012_Enter_the_story_catalogue_from_the_landing_hero.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** The landing hero CTA successfully navigates to the story catalogue.


### Requirement: Global Features (Theme & Chatbot)

#### Test TC013 Theme toggle persists across refresh and routes
- **Test Code:** [TC013_Theme_toggle_persists_across_refresh_and_routes.py](./TC013_Theme_toggle_persists_across_refresh_and_routes.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** Dark/light theme successfully persists via localStorage and is preserved during navigation.

#### Test TC014 Send a chatbot message and receive a response
- **Test Code:** [TC014_Send_a_chatbot_message_and_receive_a_response.py](./TC014_Send_a_chatbot_message_and_receive_a_response.py)
- **Status:** ✅ Passed
- **Analysis / Findings:** The WiseEpu chatbot triggers, accepts input, and responds to user messages properly.

---

## 3️⃣ Coverage & Matching Metrics

- **Total Tests Run:** 15
- **Passed:** 4 (26.67%)
- **Failed:** 3 (20%)
- **Blocked:** 8 (53.33%)

| Requirement                      | Total Tests | ✅ Passed | ❌ Failed | ⚠️ Blocked |
|----------------------------------|-------------|-----------|-----------|------------|
| Reader Content & Navigation      | 2           | 0         | 1         | 1          |
| Chapter Illustrations            | 3           | 0         | 1         | 2          |
| AI Narration (TTS)               | 4           | 0         | 0         | 4          |
| Cinematic Story Reader           | 1           | 0         | 1         | 0          |
| Story Discovery & Browsing       | 3           | 2         | 0         | 1          |
| Global Features (Theme/Chatbot)  | 2           | 2         | 0         | 0          |

---

## 4️⃣ Key Gaps / Risks

1. **Paywall Configuration for E2E Environments:** 8 out of 15 tests are BLOCKED due to the "Archive Access Required / Unlock the Full Archive" overlay. The supposedly free test story "Nongpok Ningthou" is still triggering the paywall logic, preventing verification of TTS, illustration rendering, and chapter navigation.
2. **Reader Content State Management:** In the unblocked attempt (TC001), switching chapters correctly updated the sidebar UI but the main reader text failed to update, indicating a state synchronization bug between the chapter selection and reader content display.
3. **Missing Illustrations:** Chapter illustrations are missing from the DOM entirely (TC010), leading to test failures even before the paywall blocks further interaction.
4. **TTS "Unavailable" State:** The TTS control shows as "Unavailable", possibly because of missing environment variables or API keys in the testing environment, compounding the issues caused by the paywall block.
