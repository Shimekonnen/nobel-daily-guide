import type { TimeBlock, DailySchedule } from '../types/database';

// Mock schedule based on the EXACT 8-block template
export const MOCK_THEME = "Feelings & Creativity Day";

// Extended TimeBlock type with new fields
type MockTimeBlock = Omit<TimeBlock, 'id' | 'daily_schedule_id' | 'created_at' | 'updated_at'>;

// THE 5 FIXED BLOCKS - identical to ai.ts
const FIXED_BLOCKS: MockTimeBlock[] = [
  // 1. FREE PLAY (9:00-10:30) - minimal
  {
    start_time: '09:00',
    end_time: '10:30',
    category: 'independent_play',
    activity_name: 'Free Play Time',
    description: 'Basement toys available: trampoline, blocks, slides, keyboard, basketball',
    materials_needed: [],
    learning_objective: '',
    difficulty: 'easy',
    tags: [],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
  // 3. LUNCH (12:00-1:00) - minimal
  {
    start_time: '12:00',
    end_time: '13:00',
    category: 'lunch',
    activity_name: 'Lunch',
    description: '',
    materials_needed: [],
    learning_objective: '',
    difficulty: 'easy',
    tags: ['meal'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
  // 5. REST TIME (2:30-3:30) - minimal
  {
    start_time: '14:30',
    end_time: '15:30',
    category: 'rest',
    activity_name: 'Rest Time — Quiet Reading',
    description: 'Nobel chooses his own reading material',
    materials_needed: [],
    learning_objective: '',
    difficulty: 'easy',
    tags: ['rest', 'reading'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
  // 7. FREE PLAY (4:00-6:00) - minimal
  {
    start_time: '16:00',
    end_time: '18:00',
    category: 'independent_play',
    activity_name: 'Free Play Time',
    description: 'Basement toys available: trampoline, blocks, slides, keyboard, basketball',
    materials_needed: [],
    learning_objective: '',
    difficulty: 'easy',
    tags: [],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
  // 8. READING TIME (8:00-9:00) - minimal
  {
    start_time: '20:00',
    end_time: '21:00',
    category: 'reading',
    activity_name: "Independent Reading — Nobel's Choice",
    description: '',
    materials_needed: [],
    learning_objective: '',
    difficulty: 'easy',
    tags: ['reading'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
];

// THE 3 STRUCTURED BLOCKS - these get AI-generated content (mock versions below)
const MOCK_STRUCTURED_BLOCKS: MockTimeBlock[] = [
  // 2. FOCUSED ACTIVITY (10:30-12:00) - structured
  {
    start_time: '10:30',
    end_time: '12:00',
    category: 'focused_learning',
    activity_name: 'Social-Emotional: Feelings Story Discussion',
    description: 'Read "The Color Monster" by Anna Llenas and discuss: What color is Nobel feeling today? After reading, Nobel draws his current feeling as a monster. Talk about what makes us feel different emotions and healthy ways to express them.',
    materials_needed: ['book: The Color Monster', 'paper', 'crayons or markers'],
    learning_objective: 'Emotional awareness, identifying and naming feelings, understanding that emotions are normal and manageable',
    difficulty: 'moderate',
    tags: ['social-emotional', 'reading', 'art', 'feelings'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'structured',
    developmental_domain: 'social_emotional',
    has_worksheet: true,
    worksheet_type: 'social_emotional',
    worksheet_prompt: 'Create a feelings identification worksheet with: 1) Draw 6 monster faces showing different emotions (happy, sad, angry, scared, surprised, calm), 2) A section to draw "My monster today" with space to color it, 3) Simple prompts: "I feel happy when ___", "I feel sad when ___"',
    feedback: null,
    setup_time_minutes: 2,
    cleanup_level: 'low',
  },
  // 4. AFTERNOON ACTIVITY (1:00-2:30) - structured
  {
    start_time: '13:00',
    end_time: '14:30',
    category: 'focused_learning',
    activity_name: 'Creative: Cardboard City Build',
    description: 'Build a miniature city from cardboard boxes, toilet paper rolls, and tape. Nobel draws and labels streets, buildings, and parks. Sister can help with stickers and decorating. Challenge: Include at least 5 different types of buildings (house, store, school, park, hospital).',
    materials_needed: ['cardboard boxes', 'toilet paper rolls', 'tape', 'scissors', 'markers', 'stickers'],
    learning_objective: 'Spatial reasoning, planning and design, fine motor skills (cutting, drawing), creative expression, collaborative play with sister',
    difficulty: 'moderate',
    tags: ['creative', 'building', 'fine-motor', 'planning'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'structured',
    developmental_domain: 'creative',
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    feedback: null,
    setup_time_minutes: 5,
    cleanup_level: 'high',
  },
  // 6. AMHARIC PRACTICE (3:30-4:00) - structured
  {
    start_time: '15:30',
    end_time: '16:00',
    category: 'amharic',
    activity_name: 'Amharic: Family Members Vocabulary',
    description: 'Learn family member words in Amharic:\n- እማማ (emma) - mom\n- አባባ (ababa) - dad  \n- እህት (ehit) - sister\n- ወንድም (wendim) - brother\n\nPractice in sentences: "This is my እማማ" pointing to mom. Play a game: Nobel says the Amharic word, parent points to the person (or a photo).',
    materials_needed: ['family photos (optional)'],
    learning_objective: 'Amharic vocabulary for family members, sentence construction, cultural connection',
    difficulty: 'moderate',
    tags: ['amharic', 'vocabulary', 'cultural'],
    status: 'pending',
    parent_notes: null,
    completed_at: null,
    display_type: 'structured',
    developmental_domain: 'cultural',
    has_worksheet: true,
    worksheet_type: 'writing_practice',
    worksheet_prompt: 'Create an Amharic family vocabulary worksheet: 1) Show each family word in Amharic script with pronunciation guide and English translation, 2) Simple matching activity (draw lines from Amharic word to picture of family member), 3) Trace the Amharic letters for each word',
    feedback: null,
    setup_time_minutes: 1,
    cleanup_level: 'low',
  },
];

// EXACTLY 8 BLOCKS in the correct order
export const MOCK_TIME_BLOCKS: MockTimeBlock[] = [
  FIXED_BLOCKS[0],           // 1. 9:00-10:30 Free Play
  MOCK_STRUCTURED_BLOCKS[0], // 2. 10:30-12:00 Focused Activity
  FIXED_BLOCKS[1],           // 3. 12:00-1:00 Lunch
  MOCK_STRUCTURED_BLOCKS[1], // 4. 1:00-2:30 Afternoon Activity
  FIXED_BLOCKS[2],           // 5. 2:30-3:30 Rest Time
  MOCK_STRUCTURED_BLOCKS[2], // 6. 3:30-4:00 Amharic
  FIXED_BLOCKS[3],           // 7. 4:00-6:00 Free Play
  FIXED_BLOCKS[4],           // 8. 8:00-9:00 Reading
];

export function getMockSchedule(date: string, childId: string): {
  schedule: Omit<DailySchedule, 'id' | 'created_at' | 'updated_at'>;
  timeBlocks: MockTimeBlock[];
  theme: string;
} {
  return {
    schedule: {
      weekly_plan_id: null,
      child_id: childId,
      date,
      generated_at: new Date().toISOString(),
      adjusted_at: null,
      status: 'active',
    },
    timeBlocks: MOCK_TIME_BLOCKS,
    theme: MOCK_THEME,
  };
}

// Alternative themes by day
export const MOCK_THEMES_BY_DAY: Record<string, string> = {
  monday: "Math Adventures & Creative Building",
  tuesday: "Feelings & Movement Day",
  wednesday: "Reading & Fine Motor Fun",
  thursday: "Thinking Games & Nature Exploration",
  friday: "Learning Celebration & Dramatic Play",
};

export function getThemeForDay(dayOfWeek: string): string {
  return MOCK_THEMES_BY_DAY[dayOfWeek.toLowerCase()] || MOCK_THEME;
}
