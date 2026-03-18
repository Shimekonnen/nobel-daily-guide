-- Nobel's Daily Guide - Development Seed
-- This version temporarily bypasses RLS for seeding

-- First, temporarily disable RLS on child_profiles
ALTER TABLE child_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels DISABLE ROW LEVEL SECURITY;

-- Get the first user ID (you must create a user first in Auth dashboard)
DO $$
DECLARE
  v_user_id UUID;
  v_child_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user in Supabase Auth dashboard first.';
  END IF;

  -- Delete any existing profile (for re-running)
  DELETE FROM child_profiles WHERE user_id = v_user_id;

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

  -- Delete existing skill levels for this child
  DELETE FROM skill_levels WHERE child_id = v_child_id;

  -- Insert initial skill levels
  INSERT INTO skill_levels (child_id, skill_area, current_level, level_history) VALUES
    (v_child_id, 'reading', 6, '[{"date": "2025-03-17", "level": 6, "trigger": "initial_assessment"}]'),
    (v_child_id, 'math', 5, '[{"date": "2025-03-17", "level": 5, "trigger": "initial_assessment"}]'),
    (v_child_id, 'reasoning', 5, '[{"date": "2025-03-17", "level": 5, "trigger": "initial_assessment"}]'),
    (v_child_id, 'amharic', 2, '[{"date": "2025-03-17", "level": 2, "trigger": "initial_assessment"}]'),
    (v_child_id, 'vocabulary', 6, '[{"date": "2025-03-17", "level": 6, "trigger": "initial_assessment"}]');

  RAISE NOTICE 'Created skill levels for Nobel';
END $$;

-- Re-enable RLS
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;

-- Verify the data
SELECT id, name, date_of_birth FROM child_profiles;
