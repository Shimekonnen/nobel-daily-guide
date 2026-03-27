// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`

import { supabase } from '../lib/supabase';
import { getMockAssessment, type AssessmentQuestion } from './mockAssessment';
import type { AssessmentSession, SkillLevel } from '../types/database';
import { getChildProfile } from './scheduleService';

export type SkillArea = 'reading' | 'math' | 'reasoning' | 'amharic' | 'vocabulary';

export interface GeneratedAssessment {
  session_theme: string;
  questions: AssessmentQuestion[];
}

// ============================================================================
// Assessment Generation
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _buildAssessmentPrompt(
  skillArea: SkillArea,
  currentLevel: number,
  previousQuestions?: string[]
): string {
  const previousQuestionsText = previousQuestions?.length
    ? `PREVIOUS QUESTIONS (avoid repeating these):\n${previousQuestions.join('\n')}`
    : 'No previous questions in this skill area.';

  return `You are creating a fun, game-themed assessment for Nobel (age 4, advanced learner). The questions should feel like play, not a test.

SKILL AREA: ${skillArea}
CURRENT LEVEL: ${currentLevel}/10

${previousQuestionsText}

DESIGN RULES:
- Generate 6 questions (mix of difficulty: 2 easy, 3 moderate, 1 hard)
- Frame each question with a fun narrative/adventure theme (space exploration, treasure maps, animal rescue, building cities)
- Nobel can read the questions himself — use clear, simple language
- Include visual elements where possible (describe images to render)
- For math: use real-world contexts (counting stars, sharing cookies, measuring things)
- For reading: short passages with comprehension questions
- For Amharic: vocabulary and simple phrases
- For reasoning: patterns, sequences, categorization, cause-and-effect
- For vocabulary: word meanings, synonyms, antonyms, context clues
- Multiple choice (3-4 options) for easy scoring
- NEVER repeat questions from the previous questions list

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "session_theme": "Space Explorer Mission",
  "questions": [
    {
      "id": 1,
      "question_text": "The astronaut found 7 moon rocks on Monday and 8 more on Tuesday. How many moon rocks does she have now?",
      "type": "multiple_choice",
      "options": ["14", "15", "16", "13"],
      "correct_answer": "15",
      "difficulty": "moderate",
      "skill_tags": ["math", "addition", "double-digit"],
      "visual_description": "Cartoon astronaut with moon rocks"
    }
  ]
}`;
}

export async function generateAssessment(
  skillArea: SkillArea,
  currentLevel: number,
  previousQuestions?: string[]
): Promise<GeneratedAssessment> {
  try {
    // Call the serverless API route instead of Anthropic directly
    const response = await fetch('/api/generate-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skillArea,
        currentLevel,
        previousQuestions,
      }),
    });

    if (!response.ok) {
      console.error('API request failed, falling back to mock');
      const mock = getMockAssessment(skillArea);
      return {
        session_theme: mock.session_theme,
        questions: mock.questions,
      };
    }

    return await response.json() as GeneratedAssessment;
  } catch (error) {
    console.error('Error generating assessment, falling back to mock:', error);
    const mock = getMockAssessment(skillArea);
    return {
      session_theme: mock.session_theme,
      questions: mock.questions,
    };
  }
}

// ============================================================================
// Fetch Operations
// ============================================================================

export async function getSkillLevels(): Promise<SkillLevel[]> {
  const profile = await getChildProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('skill_levels')
    .select('*')
    .eq('child_id', profile.id);

  if (error) {
    console.error('Error fetching skill levels:', error);
    return [];
  }

  return data || [];
}

export async function getSkillLevel(skillArea: SkillArea): Promise<SkillLevel | null> {
  const profile = await getChildProfile();
  if (!profile) return null;

  const { data, error } = await supabase
    .from('skill_levels')
    .select('*')
    .eq('child_id', profile.id)
    .eq('skill_area', skillArea)
    .single();

  if (error) {
    console.error('Error fetching skill level:', error);
    return null;
  }

  return data;
}

export async function getRecentAssessments(skillArea?: SkillArea, limit: number = 5): Promise<AssessmentSession[]> {
  const profile = await getChildProfile();
  if (!profile) return [];

  let query = supabase
    .from('assessment_sessions')
    .select('*')
    .eq('child_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (skillArea) {
    query = query.eq('skill_area', skillArea);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching recent assessments:', error);
    return [];
  }

  return data || [];
}

export async function getLastAssessmentForSkill(skillArea: SkillArea): Promise<AssessmentSession | null> {
  const profile = await getChildProfile();
  if (!profile) return null;

  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('child_id', profile.id)
    .eq('skill_area', skillArea)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching last assessment:', error);
    return null;
  }

  return data || null;
}

// ============================================================================
// Save Operations
// ============================================================================

export interface AssessmentAnswer {
  question_id: number;
  question_text: string;
  correct_answer: string;
  user_answer: string;
  is_correct: boolean;
  difficulty: string;
}

export interface SaveAssessmentData {
  skill_area: SkillArea;
  difficulty_level: number;
  questions: AssessmentAnswer[];
  session_theme: string;
}

export async function saveAssessmentResults(data: SaveAssessmentData): Promise<AssessmentSession | null> {
  const profile = await getChildProfile();
  if (!profile) {
    console.error('No child profile found');
    return null;
  }

  // Calculate score percentage
  const correctCount = data.questions.filter(q => q.is_correct).length;
  const totalQuestions = data.questions.length;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Generate AI summary (or mock summary)
  const aiSummary = generateAssessmentSummary(data.skill_area, scorePercentage, correctCount, totalQuestions);

  const { data: session, error } = await supabase
    .from('assessment_sessions')
    .insert({
      profile_id: profile.id,
      date: new Date().toISOString().split('T')[0],
      skill_area: data.skill_area,
      difficulty_level: data.difficulty_level,
      questions: data.questions,
      score_percentage: scorePercentage,
      ai_summary: aiSummary,
    } as Record<string, unknown>)
    .select()
    .single();

  if (error) {
    console.error('Error saving assessment results:', error);
    return null;
  }

  // Update skill level based on score
  await updateSkillLevel(data.skill_area, scorePercentage);

  return session;
}

function generateAssessmentSummary(
  skillArea: SkillArea,
  scorePercentage: number,
  correct: number,
  total: number
): string {
  const skillNames: Record<SkillArea, string> = {
    reading: 'reading',
    math: 'math',
    reasoning: 'reasoning',
    amharic: 'Amharic',
    vocabulary: 'vocabulary',
  };

  if (scorePercentage >= 80) {
    return `Excellent performance in ${skillNames[skillArea]}! Nobel correctly answered ${correct} out of ${total} questions (${scorePercentage}%). Ready for more challenging content.`;
  } else if (scorePercentage >= 60) {
    return `Good progress in ${skillNames[skillArea]}. Nobel answered ${correct} out of ${total} questions correctly (${scorePercentage}%). Continuing at current level with reinforcement.`;
  } else {
    return `${skillNames[skillArea]} assessment complete. Nobel answered ${correct} out of ${total} questions (${scorePercentage}%). Recommend additional practice at current level with parent support.`;
  }
}

// ============================================================================
// Skill Level Updates
// ============================================================================

export async function updateSkillLevel(
  skillArea: SkillArea,
  scorePercentage: number
): Promise<SkillLevel | null> {
  const profile = await getChildProfile();
  if (!profile) return null;

  // Get current skill level
  const { data: currentSkill, error: fetchError } = await supabase
    .from('skill_levels')
    .select('*')
    .eq('profile_id', profile.id)
    .eq('skill_area', skillArea)
    .single() as { data: { id: string; current_level: number; level_history: unknown[] } | null; error: { code: string } | null };

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching skill level:', fetchError);
    return null;
  }

  const currentLevel = currentSkill?.current_level || 5;
  let newLevel = currentLevel;
  let trigger = 'assessment';

  // Apply scoring rules
  if (scorePercentage >= 80) {
    // Increment level by 1 (max 10)
    newLevel = Math.min(currentLevel + 1, 10);
    trigger = 'assessment_level_up';
  } else if (scorePercentage < 60) {
    // Decrement level by 1 (min 1), flag for review
    newLevel = Math.max(currentLevel - 1, 1);
    trigger = 'assessment_level_down';
  }
  // 60-79%: maintain current level (no change)

  // Build new history entry
  const historyEntry = {
    date: new Date().toISOString().split('T')[0],
    level: newLevel,
    trigger,
    score_percentage: scorePercentage,
  };

  // Get existing history or start fresh
  const existingHistory = currentSkill?.level_history || [];
  const newHistory = [...existingHistory, historyEntry];

  if (currentSkill) {
    // Update existing record
    const { data: updated, error: updateError } = await supabase
      .from('skill_levels')
      .update({
        current_level: newLevel,
        level_history: newHistory,
        updated_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq('id', currentSkill.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating skill level:', updateError);
      return null;
    }

    return updated as unknown as SkillLevel;
  } else {
    // Create new skill level record
    const { data: created, error: createError } = await supabase
      .from('skill_levels')
      .insert({
        profile_id: profile.id,
        skill_area: skillArea,
        current_level: newLevel,
        level_history: newHistory,
      } as Record<string, unknown>)
      .select()
      .single();

    if (createError) {
      console.error('Error creating skill level:', createError);
      return null;
    }

    return created as unknown as SkillLevel;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

export function getSkillAreaDisplayName(skillArea: SkillArea): string {
  const names: Record<SkillArea, string> = {
    math: 'Math Mission',
    reading: 'Reading Adventure',
    reasoning: 'Brain Puzzles',
    amharic: 'Amharic Explorer',
    vocabulary: 'Word Power',
  };
  return names[skillArea];
}

export function getSkillAreaEmoji(skillArea: SkillArea): string {
  const emojis: Record<SkillArea, string> = {
    math: '🚀',
    reading: '📚',
    reasoning: '🧩',
    amharic: '🇪🇹',
    vocabulary: '📝',
  };
  return emojis[skillArea];
}

export function getSkillAreaColors(skillArea: SkillArea): { primary: string; secondary: string; bg: string } {
  const colors: Record<SkillArea, { primary: string; secondary: string; bg: string }> = {
    math: { primary: '#1A365D', secondary: '#F6E05E', bg: 'from-blue-900 to-blue-700' },
    reading: { primary: '#276749', secondary: '#FEFCBF', bg: 'from-green-800 to-green-600' },
    reasoning: { primary: '#553C9A', secondary: '#E9D8FD', bg: 'from-purple-800 to-purple-600' },
    amharic: { primary: '#22543D', secondary: '#F6E05E', bg: 'from-green-900 to-green-700' },
    vocabulary: { primary: '#234E52', secondary: '#B2F5EA', bg: 'from-teal-800 to-teal-600' },
  };
  return colors[skillArea];
}

export function levelToStars(level: number): string {
  return '⭐'.repeat(Math.min(level, 10));
}
