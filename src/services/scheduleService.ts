import { supabase } from '../lib/supabase';
import { generateDaySchedule, regenerateSingleBlock } from './ai';
import { getMockSchedule, MOCK_THEME } from './mockSchedule';
import type {
  ChildProfile,
  SkillLevel,
  DailySchedule,
  TimeBlock,
  ActivityLog,
  DailyScheduleWithBlocks,
  TimeBlockStatus,
} from '../types/database';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// ============================================================================
// Fetch Operations
// ============================================================================

export async function getChildProfile(): Promise<ChildProfile | null> {
  const { data, error } = await supabase
    .from('child_profiles')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching child profile:', error);
    return null;
  }
  return data;
}

export async function getSkillLevels(childId: string): Promise<SkillLevel[]> {
  const { data, error } = await supabase
    .from('skill_levels')
    .select('*')
    .eq('child_id', childId);

  if (error) {
    console.error('Error fetching skill levels:', error);
    return [];
  }
  return data || [];
}

export async function getRecentActivities(childId: string, days: number = 14): Promise<ActivityLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .eq('child_id', childId)
    .gte('date', startDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching recent activities:', error);
    return [];
  }
  return data || [];
}

export async function getTodaySchedule(): Promise<DailyScheduleWithBlocks | null> {
  const today = getToday();

  // First get child profile
  const profile = await getChildProfile();
  if (!profile) return null;

  // Fetch today's schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('daily_schedules')
    .select('*')
    .eq('child_id', profile.id)
    .eq('date', today)
    .single();

  if (scheduleError && scheduleError.code !== 'PGRST116') {
    console.error('Error fetching schedule:', scheduleError);
    return null;
  }

  if (!schedule) return null;

  // Fetch time blocks
  const { data: blocks, error: blocksError } = await supabase
    .from('time_blocks')
    .select('*')
    .eq('daily_schedule_id', schedule.id)
    .order('start_time', { ascending: true });

  if (blocksError) {
    console.error('Error fetching time blocks:', blocksError);
    return null;
  }

  return {
    ...schedule,
    time_blocks: blocks || [],
  };
}

// ============================================================================
// Generate Operations
// ============================================================================

export async function generateAndSaveSchedule(
  date: string = getToday(),
  useMock: boolean = false
): Promise<{ schedule: DailySchedule; timeBlocks: TimeBlock[]; theme: string } | null> {
  try {
    // Get child profile
    const profile = await getChildProfile();
    if (!profile) {
      throw new Error('No child profile found');
    }

    // Check if schedule already exists for this date
    const { data: existingSchedule } = await supabase
      .from('daily_schedules')
      .select('id')
      .eq('child_id', profile.id)
      .eq('date', date)
      .single();

    if (existingSchedule) {
      // Delete existing schedule and blocks
      await supabase
        .from('daily_schedules')
        .delete()
        .eq('id', existingSchedule.id);
    }

    let generatedData;
    let theme: string;

    if (useMock || !import.meta.env.VITE_ANTHROPIC_API_KEY) {
      // Use mock data
      const mock = getMockSchedule(date, profile.id);
      generatedData = {
        theme: mock.theme,
        time_blocks: mock.timeBlocks,
      };
      theme = mock.theme;
    } else {
      // Get context data for AI
      const skillLevels = await getSkillLevels(profile.id);
      const recentActivities = await getRecentActivities(profile.id);

      // Generate via AI
      const aiResponse = await generateDaySchedule(date, profile, skillLevels, recentActivities);
      generatedData = aiResponse;
      theme = aiResponse.theme;
    }

    // Create daily schedule
    const { data: newSchedule, error: scheduleError } = await supabase
      .from('daily_schedules')
      .insert({
        child_id: profile.id,
        date,
        status: 'active',
      })
      .select()
      .single();

    if (scheduleError) {
      throw scheduleError;
    }

    // Create time blocks
    const blocksToInsert = generatedData.time_blocks.map((block) => ({
      daily_schedule_id: newSchedule.id,
      start_time: block.start_time,
      end_time: block.end_time,
      category: block.category,
      activity_name: block.activity_name,
      description: block.description,
      materials_needed: block.materials_needed || [],
      learning_objective: block.learning_objective,
      difficulty: block.difficulty || 'moderate',
      tags: block.tags || [],
      status: 'pending' as TimeBlockStatus,
    }));

    const { data: newBlocks, error: blocksError } = await supabase
      .from('time_blocks')
      .insert(blocksToInsert)
      .select();

    if (blocksError) {
      throw blocksError;
    }

    return {
      schedule: newSchedule,
      timeBlocks: newBlocks,
      theme,
    };
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw error;
  }
}

// ============================================================================
// Update Operations
// ============================================================================

export async function updateTimeBlockStatus(
  blockId: string,
  status: TimeBlockStatus,
  notes?: string
): Promise<TimeBlock | null> {
  const updateData: Record<string, unknown> = { status };

  if (status === 'done') {
    updateData.completed_at = new Date().toISOString();
  }

  if (notes !== undefined) {
    updateData.parent_notes = notes;
  }

  const { data, error } = await supabase
    .from('time_blocks')
    .update(updateData)
    .eq('id', blockId)
    .select()
    .single();

  if (error) {
    console.error('Error updating time block:', error);
    return null;
  }

  return data;
}

export async function regenerateTimeBlock(blockId: string): Promise<TimeBlock | null> {
  try {
    // Get the existing block
    const { data: existingBlock, error: fetchError } = await supabase
      .from('time_blocks')
      .select('*')
      .eq('id', blockId)
      .single();

    if (fetchError || !existingBlock) {
      throw new Error('Block not found');
    }

    // Check if API key is available
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      // Use mock regeneration - just update the activity name with a variation
      const variations = [
        'Alternative Activity',
        'New Adventure',
        'Different Approach',
        'Fresh Start',
      ];
      const randomVariation = variations[Math.floor(Math.random() * variations.length)];

      const { data: updatedBlock, error: updateError } = await supabase
        .from('time_blocks')
        .update({
          activity_name: `${randomVariation}: ${existingBlock.category.replace('_', ' ')}`,
          description: 'A fresh activity to try instead.',
          status: 'pending',
          completed_at: null,
        })
        .eq('id', blockId)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedBlock;
    }

    // Get context for AI
    const profile = await getChildProfile();
    if (!profile) throw new Error('No child profile');

    const skillLevels = await getSkillLevels(profile.id);
    const recentActivities = await getRecentActivities(profile.id);

    // Regenerate via AI
    const newBlockData = await regenerateSingleBlock(
      existingBlock,
      profile,
      skillLevels,
      recentActivities
    );

    // Update the block
    const { data: updatedBlock, error: updateError } = await supabase
      .from('time_blocks')
      .update({
        activity_name: newBlockData.activity_name,
        description: newBlockData.description,
        materials_needed: newBlockData.materials_needed,
        learning_objective: newBlockData.learning_objective,
        difficulty: newBlockData.difficulty,
        tags: newBlockData.tags,
        status: 'pending',
        completed_at: null,
      })
      .eq('id', blockId)
      .select()
      .single();

    if (updateError) throw updateError;
    return updatedBlock;
  } catch (error) {
    console.error('Error regenerating time block:', error);
    throw error;
  }
}

// ============================================================================
// Activity Logging
// ============================================================================

export async function logActivity(
  timeBlockId: string,
  actualActivity: string,
  engagementLevel: 'high' | 'medium' | 'low',
  notes?: string
): Promise<void> {
  const profile = await getChildProfile();
  if (!profile) return;

  const { error } = await supabase.from('activity_log').insert({
    child_id: profile.id,
    date: getToday(),
    time_block_id: timeBlockId,
    actual_activity: actualActivity,
    engagement_level: engagementLevel,
    notes,
  });

  if (error) {
    console.error('Error logging activity:', error);
  }
}
