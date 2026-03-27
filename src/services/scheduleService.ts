// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`

import { supabase } from '../lib/supabase';
import { generateDaySchedule, regenerateSingleBlock } from './ai';
import { getMockSchedule } from './mockSchedule';
import type {
  ChildProfile,
  SkillLevel,
  DailySchedule,
  TimeBlock,
  ActivityLog,
  DailyScheduleWithBlocks,
  TimeBlockStatus,
  ParentFeedback,
} from '../types/database';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Augment DB blocks with client-side display fields
// These fields determine how the card is rendered (minimal vs structured)
function augmentBlockWithDisplayFields(block: TimeBlock): TimeBlock {
  // Determine display type based on category
  const minimalCategories = ['independent_play', 'lunch', 'rest', 'reading', 'dinner'];
  const isMinimal = minimalCategories.includes(block.category);

  // Determine developmental domain based on category or activity name
  let domain: TimeBlock['developmental_domain'] = null;
  if (block.category === 'amharic') {
    domain = 'cultural';
  } else if (block.category === 'focused_learning') {
    // Try to infer from activity name
    const name = block.activity_name.toLowerCase();
    if (name.includes('social') || name.includes('emotional') || name.includes('feeling')) {
      domain = 'social_emotional';
    } else if (name.includes('creative') || name.includes('art') || name.includes('build') || name.includes('music')) {
      domain = 'creative';
    } else if (name.includes('physical') || name.includes('movement') || name.includes('obstacle')) {
      domain = 'physical';
    } else if (name.includes('executive') || name.includes('memory') || name.includes('planning')) {
      domain = 'executive_function';
    } else if (name.includes('fine motor') || name.includes('cutting') || name.includes('tracing')) {
      domain = 'fine_motor';
    } else {
      domain = 'academic';
    }
  }

  return {
    ...block,
    display_type: block.display_type || (isMinimal ? 'minimal' : 'structured'),
    developmental_domain: block.developmental_domain || domain,
    has_worksheet: block.has_worksheet || false,
    worksheet_type: block.worksheet_type || null,
    worksheet_prompt: block.worksheet_prompt || null,
    feedback: block.feedback || null,
    setup_time_minutes: block.setup_time_minutes || null,
    cleanup_level: block.cleanup_level || null,
  };
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
    time_blocks: (blocks || []).map(augmentBlockWithDisplayFields),
  };
}

// ============================================================================
// Generate Operations
// ============================================================================

// Timeout wrapper for fetch calls
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

export async function generateAndSaveSchedule(
  date: string = getToday(),
  useMock: boolean = false
): Promise<{ schedule: DailySchedule; timeBlocks: TimeBlock[]; theme: string; usedFallback?: boolean } | null> {
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
    let usedFallback = false;

    if (useMock) {
      // User explicitly requested mock data
      const mock = getMockSchedule(date, profile.id);
      generatedData = {
        theme: mock.theme,
        time_blocks: mock.timeBlocks,
      };
      theme = mock.theme;
    } else {
      // Try AI generation with 30-second timeout
      try {
        const skillLevels = await getSkillLevels(profile.id);
        const recentActivities = await getRecentActivities(profile.id);

        // Generate via AI with timeout
        const aiResponse = await fetchWithTimeout(
          generateDaySchedule(date, profile, skillLevels, recentActivities),
          30000
        );
        generatedData = aiResponse;
        theme = aiResponse.theme;
      } catch (aiError) {
        // Fall back to mock on any AI error (timeout, API failure, etc.)
        console.error('AI generation failed, using fallback:', aiError);
        const mock = getMockSchedule(date, profile.id);
        generatedData = {
          theme: mock.theme,
          time_blocks: mock.timeBlocks,
        };
        theme = mock.theme;
        usedFallback = true;
      }
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

    // Create time blocks - only save base columns that exist in DB
    // Extra fields (display_type, developmental_domain, etc.) are added client-side
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
      timeBlocks: (newBlocks || []).map(augmentBlockWithDisplayFields),
      theme,
      usedFallback,
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

export async function updateTimeBlockFeedback(
  blockId: string,
  feedback: ParentFeedback
): Promise<TimeBlock | null> {
  const { data, error } = await supabase
    .from('time_blocks')
    .update({ feedback })
    .eq('id', blockId)
    .select()
    .single();

  if (error) {
    console.error('Error updating time block feedback:', error);
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
