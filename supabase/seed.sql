-- Nobel's Daily Guide - Seed Data
-- Run this after a user has signed up to create Nobel's profile
-- Replace 'YOUR_USER_ID_HERE' with the actual auth.users id

-- ============================================================================
-- SEED NOBEL'S PROFILE
-- ============================================================================
-- Note: You must replace YOUR_USER_ID_HERE with an actual user ID from auth.users
-- You can find this in the Supabase dashboard under Authentication > Users

DO $$
DECLARE
  v_user_id UUID;
  v_child_id UUID;
BEGIN
  -- Get the first user (for development) or specify a user ID
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please sign up first, then run this seed.';
    RETURN;
  END IF;

  -- Insert Nobel's profile
  INSERT INTO child_profiles (
    user_id,
    name,
    date_of_birth,
    reading_level,
    math_level,
    amharic_level,
    interests,
    learning_style,
    content_restrictions,
    physical_resources,
    screen_time_limit_minutes
  ) VALUES (
    v_user_id,
    'Nobel',
    '2021-11-11',
    '1st-2nd grade',
    'K-1st grade, double-digit addition/subtraction',
    'alphabet known, early vocabulary',
    ARRAY['maps', 'space', 'gardening', 'building', 'engineering'],
    'hands-on, real-world, play-based, discussion',
    ARRAY['LGBTQ'],
    ARRAY['indoor slides', 'keyboard/piano', 'indoor trampoline', 'basketball hoop', 'bikes', 'Legos', 'blocks', 'books'],
    60
  )
  RETURNING id INTO v_child_id;

  RAISE NOTICE 'Created child profile with ID: %', v_child_id;

  -- Insert initial skill levels
  INSERT INTO skill_levels (child_id, skill_area, current_level, level_history) VALUES
    (v_child_id, 'reading', 6, '[{"date": "2025-03-17", "level": 6, "trigger": "initial_assessment"}]'),
    (v_child_id, 'math', 5, '[{"date": "2025-03-17", "level": 5, "trigger": "initial_assessment"}]'),
    (v_child_id, 'reasoning', 5, '[{"date": "2025-03-17", "level": 5, "trigger": "initial_assessment"}]'),
    (v_child_id, 'amharic', 2, '[{"date": "2025-03-17", "level": 2, "trigger": "initial_assessment"}]'),
    (v_child_id, 'vocabulary', 6, '[{"date": "2025-03-17", "level": 6, "trigger": "initial_assessment"}]');

  RAISE NOTICE 'Created skill levels for child ID: %', v_child_id;

END $$;

-- ============================================================================
-- ALTERNATIVE: Manual seed with known user ID
-- ============================================================================
-- Uncomment and use this if you want to specify the user ID directly:
--
-- INSERT INTO child_profiles (
--   user_id,
--   name,
--   date_of_birth,
--   reading_level,
--   math_level,
--   amharic_level,
--   interests,
--   learning_style,
--   content_restrictions,
--   physical_resources,
--   screen_time_limit_minutes
-- ) VALUES (
--   'YOUR_USER_ID_HERE'::uuid,
--   'Nobel',
--   '2021-11-11',
--   '1st-2nd grade',
--   'K-1st grade, double-digit addition/subtraction',
--   'alphabet known, early vocabulary',
--   ARRAY['maps', 'space', 'gardening', 'building', 'engineering'],
--   'hands-on, real-world, play-based, discussion',
--   ARRAY['LGBTQ'],
--   ARRAY['indoor slides', 'keyboard/piano', 'indoor trampoline', 'basketball hoop', 'bikes', 'Legos', 'blocks', 'books'],
--   60
-- );
