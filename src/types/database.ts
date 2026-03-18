// Nobel's Daily Guide - Database Types
// Auto-generated types matching the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================================================
// Enum Types
// ============================================================================

export type WeeklyPlanStatus = 'draft' | 'active' | 'completed';
export type DailyScheduleStatus = 'upcoming' | 'active' | 'completed';
export type TimeBlockCategory =
  | 'sibling_play'
  | 'independent_play'
  | 'focused_learning'
  | 'amharic'
  | 'lunch'
  | 'outdoor'
  | 'rest'
  | 'reading'
  | 'dinner'
  | 'routine'
  | 'cleanup';
export type TimeBlockDifficulty = 'easy' | 'moderate' | 'challenging';
export type TimeBlockStatus = 'pending' | 'done' | 'skipped' | 'swapped';
export type BookReadingApproach = 'independent' | 'read-aloud' | 'discussion';
export type BookCategory = 'this_week' | 'challenge' | 'fun' | 'amharic';
export type BookAvailability = 'library_likely' | 'purchase' | 'free_online';
export type BookStatus = 'recommended' | 'reading' | 'completed' | 'skipped';
export type ActivityCategory = 'toy' | 'kit' | 'diy' | 'experience';
export type ActivityCost = 'free' | 'under_10' | 'under_25' | 'over_25';
export type ActivityStatus = 'recommended' | 'acquired' | 'completed' | 'skipped';
export type SkillArea = 'reading' | 'math' | 'reasoning' | 'amharic' | 'vocabulary';
export type EngagementLevel = 'high' | 'medium' | 'low';

// ============================================================================
// Table Row Types
// ============================================================================

export interface ChildProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string;
  reading_level: string | null;
  math_level: string | null;
  amharic_level: string | null;
  interests: string[];
  learning_style: string | null;
  content_restrictions: string[];
  physical_resources: string[];
  screen_time_limit_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlan {
  id: string;
  child_id: string;
  week_start_date: string;
  generated_at: string;
  ai_prompt_used: string | null;
  ai_response_raw: Json | null;
  status: WeeklyPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface DailySchedule {
  id: string;
  weekly_plan_id: string | null;
  child_id: string;
  date: string;
  generated_at: string;
  adjusted_at: string | null;
  status: DailyScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface TimeBlock {
  id: string;
  daily_schedule_id: string;
  start_time: string;
  end_time: string;
  category: TimeBlockCategory;
  activity_name: string;
  description: string | null;
  materials_needed: string[];
  learning_objective: string | null;
  difficulty: TimeBlockDifficulty;
  tags: string[];
  status: TimeBlockStatus;
  parent_notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookRecommendation {
  id: string;
  child_id: string;
  week_start_date: string;
  title: string;
  author: string | null;
  summary: string | null;
  why_recommended: string | null;
  reading_approach: BookReadingApproach;
  category: BookCategory;
  availability_hint: BookAvailability;
  status: BookStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityRecommendation {
  id: string;
  child_id: string;
  week_start_date: string;
  name: string;
  description: string | null;
  category: ActivityCategory;
  estimated_cost: ActivityCost;
  learning_connection: string | null;
  url: string | null;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  type: 'multiple_choice' | 'open_response';
  options?: string[];
  correct_answer: string;
  nobel_answer?: string;
  is_correct?: boolean;
  difficulty: TimeBlockDifficulty;
  skill_tags: string[];
  visual_description?: string;
}

export interface AssessmentSession {
  id: string;
  child_id: string;
  date: string;
  skill_area: SkillArea;
  difficulty_level: number;
  questions: AssessmentQuestion[];
  score_percentage: number | null;
  ai_summary: string | null;
  created_at: string;
}

export interface SkillLevelHistory {
  date: string;
  level: number;
  trigger: string;
}

export interface SkillLevel {
  id: string;
  child_id: string;
  skill_area: SkillArea;
  current_level: number;
  level_history: SkillLevelHistory[];
  updated_at: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  child_id: string;
  date: string;
  time_block_id: string | null;
  actual_activity: string | null;
  engagement_level: EngagementLevel;
  notes: string | null;
  created_at: string;
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type ChildProfileInsert = Omit<ChildProfile, 'id' | 'created_at' | 'updated_at'>;
export type WeeklyPlanInsert = Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at' | 'generated_at'>;
export type DailyScheduleInsert = Omit<DailySchedule, 'id' | 'created_at' | 'updated_at' | 'generated_at'>;
export type TimeBlockInsert = Omit<TimeBlock, 'id' | 'created_at' | 'updated_at'>;
export type BookRecommendationInsert = Omit<BookRecommendation, 'id' | 'created_at' | 'updated_at'>;
export type ActivityRecommendationInsert = Omit<ActivityRecommendation, 'id' | 'created_at' | 'updated_at'>;
export type AssessmentSessionInsert = Omit<AssessmentSession, 'id' | 'created_at'>;
export type SkillLevelInsert = Omit<SkillLevel, 'id' | 'created_at' | 'updated_at'>;
export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>;

// ============================================================================
// Update Types (for updating existing records)
// ============================================================================

export type ChildProfileUpdate = Partial<Omit<ChildProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type WeeklyPlanUpdate = Partial<Omit<WeeklyPlan, 'id' | 'child_id' | 'created_at' | 'updated_at'>>;
export type DailyScheduleUpdate = Partial<Omit<DailySchedule, 'id' | 'child_id' | 'created_at' | 'updated_at'>>;
export type TimeBlockUpdate = Partial<Omit<TimeBlock, 'id' | 'daily_schedule_id' | 'created_at' | 'updated_at'>>;
export type BookRecommendationUpdate = Partial<Omit<BookRecommendation, 'id' | 'child_id' | 'created_at' | 'updated_at'>>;
export type ActivityRecommendationUpdate = Partial<Omit<ActivityRecommendation, 'id' | 'child_id' | 'created_at' | 'updated_at'>>;
export type AssessmentSessionUpdate = Partial<Omit<AssessmentSession, 'id' | 'child_id' | 'created_at'>>;
export type SkillLevelUpdate = Partial<Omit<SkillLevel, 'id' | 'child_id' | 'created_at' | 'updated_at'>>;
export type ActivityLogUpdate = Partial<Omit<ActivityLog, 'id' | 'child_id' | 'created_at'>>;

// ============================================================================
// Joined/Extended Types
// ============================================================================

export interface DailyScheduleWithBlocks extends DailySchedule {
  time_blocks: TimeBlock[];
}

export interface WeeklyPlanWithSchedules extends WeeklyPlan {
  daily_schedules: DailyScheduleWithBlocks[];
  book_recommendations: BookRecommendation[];
  activity_recommendations: ActivityRecommendation[];
}

// ============================================================================
// Supabase Database Type (for client typing)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      child_profiles: {
        Row: ChildProfile;
        Insert: ChildProfileInsert;
        Update: ChildProfileUpdate;
      };
      weekly_plans: {
        Row: WeeklyPlan;
        Insert: WeeklyPlanInsert;
        Update: WeeklyPlanUpdate;
      };
      daily_schedules: {
        Row: DailySchedule;
        Insert: DailyScheduleInsert;
        Update: DailyScheduleUpdate;
      };
      time_blocks: {
        Row: TimeBlock;
        Insert: TimeBlockInsert;
        Update: TimeBlockUpdate;
      };
      book_recommendations: {
        Row: BookRecommendation;
        Insert: BookRecommendationInsert;
        Update: BookRecommendationUpdate;
      };
      activity_recommendations: {
        Row: ActivityRecommendation;
        Insert: ActivityRecommendationInsert;
        Update: ActivityRecommendationUpdate;
      };
      assessment_sessions: {
        Row: AssessmentSession;
        Insert: AssessmentSessionInsert;
        Update: AssessmentSessionUpdate;
      };
      skill_levels: {
        Row: SkillLevel;
        Insert: SkillLevelInsert;
        Update: SkillLevelUpdate;
      };
      activity_log: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
      };
    };
  };
}
