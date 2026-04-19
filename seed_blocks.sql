-- Get the first chapter of Keibu Keioiba
DO $$
DECLARE
  v_story_id uuid := '0163b425-336e-472f-84c6-c34aa64c0e24';
  v_chapter_id uuid;
  v_scene_1_id uuid;
  v_scene_2_id uuid;
BEGIN
  -- Get chapter 1
  SELECT id INTO v_chapter_id FROM chapters WHERE story_id = v_story_id AND "order" = 1 LIMIT 1;
  
  -- Create Scene 1
  INSERT INTO scenes (chapter_id, title, "order", is_draft)
  VALUES (v_chapter_id, 'The Gathering', 1, false)
  RETURNING id INTO v_scene_1_id;
  
  -- Create Scene 2
  INSERT INTO scenes (chapter_id, title, "order", is_draft)
  VALUES (v_chapter_id, 'The Tiger Returns', 2, false)
  RETURNING id INTO v_scene_2_id;
  
  -- Insert Blocks for Scene 1
  INSERT INTO blocks (story_id, chapter_id, scene_id, type, "order", props) VALUES
  (v_story_id, v_chapter_id, v_scene_1_id, 'heading', 1, '{"text": "The Legend of Keibu Keioiba", "level": 1}'),
  (v_story_id, v_chapter_id, v_scene_1_id, 'text', 2, '{"text": "Long ago in the land of Kangleipak, there lived a creature half-man, half-tiger. By day, he walked as a man, but by night, the beast within consumed him."}'),
  (v_story_id, v_chapter_id, v_scene_1_id, 'image', 3, '{"url": "https://res.cloudinary.com/dlytqegcw/image/upload/v1776458995/fungga-wari-lab/yxds9edovpshouxpggbe.jpg", "caption": "The forest where Keibu Keioiba roamed"}'),
  (v_story_id, v_chapter_id, v_scene_1_id, 'choice', 4, jsonb_build_object('text', 'Continue the journey', 'targetSceneId', v_scene_2_id));
  
  -- Insert Blocks for Scene 2
  INSERT INTO blocks (story_id, chapter_id, scene_id, type, "order", props) VALUES
  (v_story_id, v_chapter_id, v_scene_2_id, 'heading', 1, '{"text": "The Tiger Returns", "level": 2}'),
  (v_story_id, v_chapter_id, v_scene_2_id, 'text', 2, '{"text": "The villagers locked their doors at sunset. They knew the sound of his footsteps—heavy, padded, unnatural."}'),
  (v_story_id, v_chapter_id, v_scene_2_id, 'quote', 3, '{"text": "Do not wander past the bamboo grove when the moon is hidden.", "author": "Village Elder"}'),
  (v_story_id, v_chapter_id, v_scene_2_id, 'text', 4, '{"text": "But Thabaton, waiting for her brothers, left the door unlatched..."}');

END $$;
