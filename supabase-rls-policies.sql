-- ============================================================================
-- RLS Policies for Multi-User Support
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- First, drop existing dev policies (if any)
DROP POLICY IF EXISTS "dev_allow_all_child_profiles" ON child_profiles;
DROP POLICY IF EXISTS "dev_allow_all_daily_schedules" ON daily_schedules;
DROP POLICY IF EXISTS "dev_allow_all_time_blocks" ON time_blocks;
DROP POLICY IF EXISTS "dev_allow_all_skill_levels" ON skill_levels;
DROP POLICY IF EXISTS "dev_allow_all_assessment_sessions" ON assessment_sessions;
DROP POLICY IF EXISTS "dev_allow_all_activity_log" ON activity_log;
DROP POLICY IF EXISTS "dev_allow_all_coaching_history" ON coaching_history;
DROP POLICY IF EXISTS "dev_allow_all_book_recommendations" ON book_recommendations;
DROP POLICY IF EXISTS "dev_allow_all_activity_recommendations" ON activity_recommendations;
DROP POLICY IF EXISTS "dev_allow_all_weekly_plans" ON weekly_plans;

-- ============================================================================
-- child_profiles: Users can only access their own profiles
-- ============================================================================
CREATE POLICY "Users can view own child profiles"
ON child_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own child profiles"
ON child_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own child profiles"
ON child_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own child profiles"
ON child_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- daily_schedules: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own daily schedules"
ON daily_schedules FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = daily_schedules.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own daily schedules"
ON daily_schedules FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = daily_schedules.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own daily schedules"
ON daily_schedules FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = daily_schedules.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own daily schedules"
ON daily_schedules FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = daily_schedules.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- time_blocks: Access through schedule ownership
-- ============================================================================
CREATE POLICY "Users can view own time blocks"
ON time_blocks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM daily_schedules
    JOIN child_profiles ON child_profiles.id = daily_schedules.child_id
    WHERE daily_schedules.id = time_blocks.daily_schedule_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own time blocks"
ON time_blocks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM daily_schedules
    JOIN child_profiles ON child_profiles.id = daily_schedules.child_id
    WHERE daily_schedules.id = time_blocks.daily_schedule_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own time blocks"
ON time_blocks FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM daily_schedules
    JOIN child_profiles ON child_profiles.id = daily_schedules.child_id
    WHERE daily_schedules.id = time_blocks.daily_schedule_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own time blocks"
ON time_blocks FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM daily_schedules
    JOIN child_profiles ON child_profiles.id = daily_schedules.child_id
    WHERE daily_schedules.id = time_blocks.daily_schedule_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- skill_levels: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own skill levels"
ON skill_levels FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = skill_levels.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own skill levels"
ON skill_levels FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = skill_levels.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own skill levels"
ON skill_levels FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = skill_levels.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own skill levels"
ON skill_levels FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = skill_levels.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- assessment_sessions: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own assessment sessions"
ON assessment_sessions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = assessment_sessions.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own assessment sessions"
ON assessment_sessions FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = assessment_sessions.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own assessment sessions"
ON assessment_sessions FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = assessment_sessions.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own assessment sessions"
ON assessment_sessions FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = assessment_sessions.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- activity_log: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own activity log"
ON activity_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_log.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own activity log"
ON activity_log FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_log.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own activity log"
ON activity_log FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_log.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own activity log"
ON activity_log FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_log.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- coaching_history: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own coaching history"
ON coaching_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = coaching_history.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own coaching history"
ON coaching_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = coaching_history.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own coaching history"
ON coaching_history FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = coaching_history.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own coaching history"
ON coaching_history FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = coaching_history.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- book_recommendations: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own book recommendations"
ON book_recommendations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = book_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own book recommendations"
ON book_recommendations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = book_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own book recommendations"
ON book_recommendations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = book_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own book recommendations"
ON book_recommendations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = book_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- activity_recommendations: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own activity recommendations"
ON activity_recommendations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own activity recommendations"
ON activity_recommendations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own activity recommendations"
ON activity_recommendations FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own activity recommendations"
ON activity_recommendations FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = activity_recommendations.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- weekly_plans: Access through profile ownership
-- ============================================================================
CREATE POLICY "Users can view own weekly plans"
ON weekly_plans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = weekly_plans.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own weekly plans"
ON weekly_plans FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = weekly_plans.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own weekly plans"
ON weekly_plans FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = weekly_plans.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own weekly plans"
ON weekly_plans FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM child_profiles
    WHERE child_profiles.id = weekly_plans.child_id
    AND child_profiles.user_id = auth.uid()
  )
);

-- ============================================================================
-- Verify RLS is enabled on all tables
-- ============================================================================
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaching_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
