-- Nobel's Daily Guide - Initial Database Schema
-- Migration: 001_initial_schema.sql

-- ============================================================================
-- CHILD PROFILES
-- ============================================================================
CREATE TABLE child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  reading_level TEXT,
  math_level TEXT,
  amharic_level TEXT,
  interests TEXT[] DEFAULT '{}',
  learning_style TEXT,
  content_restrictions TEXT[] DEFAULT '{}',
  physical_resources TEXT[] DEFAULT '{}',
  screen_time_limit_minutes INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_child_profiles_user_id ON child_profiles(user_id);

-- ============================================================================
-- WEEKLY PLANS
-- ============================================================================
CREATE TABLE weekly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  ai_prompt_used TEXT,
  ai_response_raw JSONB,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_weekly_plans_status CHECK (status IN ('draft', 'active', 'completed'))
);

CREATE INDEX idx_weekly_plans_child_id ON weekly_plans(child_id);
CREATE INDEX idx_weekly_plans_week_start_date ON weekly_plans(week_start_date);
CREATE UNIQUE INDEX idx_weekly_plans_child_week ON weekly_plans(child_id, week_start_date);

-- ============================================================================
-- DAILY SCHEDULES
-- ============================================================================
CREATE TABLE daily_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id UUID REFERENCES weekly_plans(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  adjusted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_daily_schedules_status CHECK (status IN ('upcoming', 'active', 'completed'))
);

CREATE INDEX idx_daily_schedules_child_id ON daily_schedules(child_id);
CREATE INDEX idx_daily_schedules_date ON daily_schedules(date);
CREATE INDEX idx_daily_schedules_weekly_plan_id ON daily_schedules(weekly_plan_id);
CREATE UNIQUE INDEX idx_daily_schedules_child_date ON daily_schedules(child_id, date);

-- ============================================================================
-- TIME BLOCKS
-- ============================================================================
CREATE TABLE time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_schedule_id UUID NOT NULL REFERENCES daily_schedules(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  description TEXT,
  materials_needed TEXT[] DEFAULT '{}',
  learning_objective TEXT,
  difficulty TEXT DEFAULT 'moderate',
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  parent_notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_time_blocks_category CHECK (category IN (
    'sibling_play', 'independent_play', 'focused_learning', 'amharic',
    'lunch', 'outdoor', 'rest', 'reading', 'dinner', 'routine', 'cleanup'
  )),
  CONSTRAINT chk_time_blocks_difficulty CHECK (difficulty IN ('easy', 'moderate', 'challenging')),
  CONSTRAINT chk_time_blocks_status CHECK (status IN ('pending', 'done', 'skipped', 'swapped'))
);

CREATE INDEX idx_time_blocks_daily_schedule_id ON time_blocks(daily_schedule_id);
CREATE INDEX idx_time_blocks_start_time ON time_blocks(start_time);

-- ============================================================================
-- BOOK RECOMMENDATIONS
-- ============================================================================
CREATE TABLE book_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  summary TEXT,
  why_recommended TEXT,
  reading_approach TEXT DEFAULT 'independent',
  category TEXT NOT NULL DEFAULT 'this_week',
  availability_hint TEXT DEFAULT 'library_likely',
  status TEXT NOT NULL DEFAULT 'recommended',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_book_recommendations_reading_approach CHECK (reading_approach IN ('independent', 'read-aloud', 'discussion')),
  CONSTRAINT chk_book_recommendations_category CHECK (category IN ('this_week', 'challenge', 'fun', 'amharic')),
  CONSTRAINT chk_book_recommendations_availability CHECK (availability_hint IN ('library_likely', 'purchase', 'free_online')),
  CONSTRAINT chk_book_recommendations_status CHECK (status IN ('recommended', 'reading', 'completed', 'skipped'))
);

CREATE INDEX idx_book_recommendations_child_id ON book_recommendations(child_id);
CREATE INDEX idx_book_recommendations_week_start_date ON book_recommendations(week_start_date);

-- ============================================================================
-- ACTIVITY RECOMMENDATIONS
-- ============================================================================
CREATE TABLE activity_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'diy',
  estimated_cost TEXT DEFAULT 'free',
  learning_connection TEXT,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'recommended',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_activity_recommendations_category CHECK (category IN ('toy', 'kit', 'diy', 'experience')),
  CONSTRAINT chk_activity_recommendations_cost CHECK (estimated_cost IN ('free', 'under_10', 'under_25', 'over_25')),
  CONSTRAINT chk_activity_recommendations_status CHECK (status IN ('recommended', 'acquired', 'completed', 'skipped'))
);

CREATE INDEX idx_activity_recommendations_child_id ON activity_recommendations(child_id);
CREATE INDEX idx_activity_recommendations_week_start_date ON activity_recommendations(week_start_date);

-- ============================================================================
-- ASSESSMENT SESSIONS
-- ============================================================================
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  skill_area TEXT NOT NULL,
  difficulty_level INT NOT NULL DEFAULT 5,
  questions JSONB NOT NULL DEFAULT '[]',
  score_percentage DECIMAL(5,2),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_assessment_sessions_skill_area CHECK (skill_area IN ('reading', 'math', 'reasoning', 'amharic', 'vocabulary')),
  CONSTRAINT chk_assessment_sessions_difficulty CHECK (difficulty_level BETWEEN 1 AND 10),
  CONSTRAINT chk_assessment_sessions_score CHECK (score_percentage IS NULL OR (score_percentage >= 0 AND score_percentage <= 100))
);

CREATE INDEX idx_assessment_sessions_child_id ON assessment_sessions(child_id);
CREATE INDEX idx_assessment_sessions_date ON assessment_sessions(date);
CREATE INDEX idx_assessment_sessions_skill_area ON assessment_sessions(skill_area);

-- ============================================================================
-- SKILL LEVELS
-- ============================================================================
CREATE TABLE skill_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  skill_area TEXT NOT NULL,
  current_level INT NOT NULL DEFAULT 5,
  level_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_skill_levels_skill_area CHECK (skill_area IN ('reading', 'math', 'reasoning', 'amharic', 'vocabulary')),
  CONSTRAINT chk_skill_levels_level CHECK (current_level BETWEEN 1 AND 10)
);

CREATE INDEX idx_skill_levels_child_id ON skill_levels(child_id);
CREATE UNIQUE INDEX idx_skill_levels_child_skill ON skill_levels(child_id, skill_area);

-- ============================================================================
-- ACTIVITY LOG
-- ============================================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE SET NULL,
  actual_activity TEXT,
  engagement_level TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT chk_activity_log_engagement CHECK (engagement_level IN ('high', 'medium', 'low'))
);

CREATE INDEX idx_activity_log_child_id ON activity_log(child_id);
CREATE INDEX idx_activity_log_date ON activity_log(date);
CREATE INDEX idx_activity_log_time_block_id ON activity_log(time_block_id);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_child_profiles_updated_at
  BEFORE UPDATE ON child_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_plans_updated_at
  BEFORE UPDATE ON weekly_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_schedules_updated_at
  BEFORE UPDATE ON daily_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_blocks_updated_at
  BEFORE UPDATE ON time_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_recommendations_updated_at
  BEFORE UPDATE ON book_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_recommendations_updated_at
  BEFORE UPDATE ON activity_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_levels_updated_at
  BEFORE UPDATE ON skill_levels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Child Profiles: Users can only access their own children
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own child profiles"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child profiles"
  ON child_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profiles"
  ON child_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Helper function to check if user owns the child
CREATE OR REPLACE FUNCTION user_owns_child(p_child_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM child_profiles
    WHERE id = p_child_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly Plans: Access via child ownership
CREATE POLICY "Users can view own weekly plans"
  ON weekly_plans FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own weekly plans"
  ON weekly_plans FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own weekly plans"
  ON weekly_plans FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own weekly plans"
  ON weekly_plans FOR DELETE
  USING (user_owns_child(child_id));

-- Daily Schedules: Access via child ownership
CREATE POLICY "Users can view own daily schedules"
  ON daily_schedules FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own daily schedules"
  ON daily_schedules FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own daily schedules"
  ON daily_schedules FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own daily schedules"
  ON daily_schedules FOR DELETE
  USING (user_owns_child(child_id));

-- Time Blocks: Access via daily schedule ownership
CREATE POLICY "Users can view own time blocks"
  ON time_blocks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM daily_schedules ds
    WHERE ds.id = time_blocks.daily_schedule_id
    AND user_owns_child(ds.child_id)
  ));

CREATE POLICY "Users can create own time blocks"
  ON time_blocks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM daily_schedules ds
    WHERE ds.id = time_blocks.daily_schedule_id
    AND user_owns_child(ds.child_id)
  ));

CREATE POLICY "Users can update own time blocks"
  ON time_blocks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM daily_schedules ds
    WHERE ds.id = time_blocks.daily_schedule_id
    AND user_owns_child(ds.child_id)
  ));

CREATE POLICY "Users can delete own time blocks"
  ON time_blocks FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM daily_schedules ds
    WHERE ds.id = time_blocks.daily_schedule_id
    AND user_owns_child(ds.child_id)
  ));

-- Book Recommendations: Access via child ownership
CREATE POLICY "Users can view own book recommendations"
  ON book_recommendations FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own book recommendations"
  ON book_recommendations FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own book recommendations"
  ON book_recommendations FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own book recommendations"
  ON book_recommendations FOR DELETE
  USING (user_owns_child(child_id));

-- Activity Recommendations: Access via child ownership
CREATE POLICY "Users can view own activity recommendations"
  ON activity_recommendations FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own activity recommendations"
  ON activity_recommendations FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own activity recommendations"
  ON activity_recommendations FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own activity recommendations"
  ON activity_recommendations FOR DELETE
  USING (user_owns_child(child_id));

-- Assessment Sessions: Access via child ownership
CREATE POLICY "Users can view own assessment sessions"
  ON assessment_sessions FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own assessment sessions"
  ON assessment_sessions FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own assessment sessions"
  ON assessment_sessions FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own assessment sessions"
  ON assessment_sessions FOR DELETE
  USING (user_owns_child(child_id));

-- Skill Levels: Access via child ownership
CREATE POLICY "Users can view own skill levels"
  ON skill_levels FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own skill levels"
  ON skill_levels FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own skill levels"
  ON skill_levels FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own skill levels"
  ON skill_levels FOR DELETE
  USING (user_owns_child(child_id));

-- Activity Log: Access via child ownership
CREATE POLICY "Users can view own activity log"
  ON activity_log FOR SELECT
  USING (user_owns_child(child_id));

CREATE POLICY "Users can create own activity log"
  ON activity_log FOR INSERT
  WITH CHECK (user_owns_child(child_id));

CREATE POLICY "Users can update own activity log"
  ON activity_log FOR UPDATE
  USING (user_owns_child(child_id));

CREATE POLICY "Users can delete own activity log"
  ON activity_log FOR DELETE
  USING (user_owns_child(child_id));
