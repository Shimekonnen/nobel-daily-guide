// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`
// Using @ts-nocheck temporarily until types are generated

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  ChildProfile,
  TimeBlock,
  WeeklyPlan,
  SkillLevel,
  BookRecommendation,
  ActivityRecommendation,
  DailyScheduleWithBlocks,
} from '../types/database';

// ============================================================================
// Helper Functions
// ============================================================================

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// ============================================================================
// Generic Hook State Type
// ============================================================================

interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// useChildProfile
// ============================================================================

export function useChildProfile(): UseQueryState<ChildProfile> {
  const [data, setData] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profile, error: fetchError } = await supabase
        .from('child_profiles')
        .select('*')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;
      setData(profile);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch child profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// useTodaySchedule
// ============================================================================

export function useTodaySchedule(): UseQueryState<DailyScheduleWithBlocks> {
  const [data, setData] = useState<DailyScheduleWithBlocks | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = getToday();

      // First get the child profile to get the child_id
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .select('id')
        .limit(1)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No child profile found');

      // Fetch today's schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('date', today)
        .single() as { data: { id: string } | null; error: { code: string } | null };

      if (scheduleError && scheduleError.code !== 'PGRST116') {
        throw scheduleError;
      }

      if (!schedule) {
        setData(null);
        return;
      }

      // Fetch time blocks for this schedule
      const { data: blocks, error: blocksError } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('daily_schedule_id', schedule.id)
        .order('start_time', { ascending: true }) as { data: TimeBlock[] | null; error: Error | null };

      if (blocksError) throw blocksError;

      setData({
        ...schedule,
        time_blocks: blocks || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch today\'s schedule'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// useWeekPlan
// ============================================================================

interface WeekPlanData {
  weeklyPlan: WeeklyPlan | null;
  dailySchedules: DailyScheduleWithBlocks[];
  bookRecommendations: BookRecommendation[];
  activityRecommendations: ActivityRecommendation[];
}

export function useWeekPlan(): UseQueryState<WeekPlanData> {
  const [data, setData] = useState<WeekPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const weekStart = getWeekStart();

      // Get child profile
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .select('id')
        .limit(1)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No child profile found');

      // Fetch weekly plan
      const { data: plan, error: planError } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('child_id', profile.id)
        .eq('week_start_date', weekStart)
        .single();

      if (planError && planError.code !== 'PGRST116') {
        throw planError;
      }

      // Fetch daily schedules for this week
      const { data: schedules, error: schedulesError } = await supabase
        .from('daily_schedules')
        .select('*')
        .eq('child_id', profile.id)
        .gte('date', weekStart)
        .order('date', { ascending: true })
        .limit(5);

      if (schedulesError) throw schedulesError;

      // Fetch time blocks for all schedules
      const schedulesWithBlocks: DailyScheduleWithBlocks[] = [];
      for (const schedule of schedules || []) {
        const { data: blocks } = await supabase
          .from('time_blocks')
          .select('*')
          .eq('daily_schedule_id', schedule.id)
          .order('start_time', { ascending: true });

        schedulesWithBlocks.push({
          ...schedule,
          time_blocks: blocks || [],
        });
      }

      // Fetch book recommendations
      const { data: books, error: booksError } = await supabase
        .from('book_recommendations')
        .select('*')
        .eq('child_id', profile.id)
        .eq('week_start_date', weekStart);

      if (booksError) throw booksError;

      // Fetch activity recommendations
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_recommendations')
        .select('*')
        .eq('child_id', profile.id)
        .eq('week_start_date', weekStart);

      if (activitiesError) throw activitiesError;

      setData({
        weeklyPlan: plan || null,
        dailySchedules: schedulesWithBlocks,
        bookRecommendations: books || [],
        activityRecommendations: activities || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch week plan'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// useSkillLevels
// ============================================================================

export function useSkillLevels(): UseQueryState<SkillLevel[]> {
  const [data, setData] = useState<SkillLevel[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get child profile
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .select('id')
        .limit(1)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error('No child profile found');

      // Fetch skill levels
      const { data: skills, error: skillsError } = await supabase
        .from('skill_levels')
        .select('*')
        .eq('child_id', profile.id)
        .order('skill_area', { ascending: true });

      if (skillsError) throw skillsError;
      setData(skills || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch skill levels'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// useUpdateTimeBlockStatus
// ============================================================================

export function useUpdateTimeBlockStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = async (
    blockId: string,
    status: 'pending' | 'done' | 'skipped' | 'swapped',
    notes?: string
  ): Promise<TimeBlock | null> => {
    try {
      setLoading(true);
      setError(null);

      const updateData: Record<string, unknown> = { status };
      if (status === 'done') {
        updateData.completed_at = new Date().toISOString();
      }
      if (notes !== undefined) {
        updateData.parent_notes = notes;
      }

      const { data: block, error: updateError } = await supabase
        .from('time_blocks')
        .update(updateData)
        .eq('id', blockId)
        .select()
        .single();

      if (updateError) throw updateError;
      return block;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update time block'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}
