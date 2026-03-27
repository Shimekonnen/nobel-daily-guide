// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`

import type { ChildProfile, SkillLevel, ActivityLog, DevelopmentalDomain, WorksheetType } from '../types/database';

// Type for the 3 AI-generated structured activities only
interface GeneratedActivity {
  activity_name: string;
  description: string;
  materials_needed: string[];
  learning_objective: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  tags: string[];
  has_worksheet: boolean;
  worksheet_type: WorksheetType;
  worksheet_prompt: string | null;
  setup_time_minutes: number;
  cleanup_level: 'low' | 'medium' | 'high';
}

// What the AI returns - ONLY 3 activities
interface AIResponse {
  theme: string;
  focused_activity: GeneratedActivity;     // 10:30-12:00
  afternoon_activity: GeneratedActivity;   // 1:00-2:30
  amharic_activity: GeneratedActivity;     // 3:30-4:00
}

// Full time block for the schedule
interface FullTimeBlock {
  start_time: string;
  end_time: string;
  category: string;
  activity_name: string;
  description: string;
  materials_needed: string[];
  learning_objective: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  tags: string[];
  display_type: 'structured' | 'minimal';
  developmental_domain: DevelopmentalDomain | null;
  has_worksheet: boolean;
  worksheet_type: WorksheetType;
  worksheet_prompt: string | null;
  setup_time_minutes: number | null;
  cleanup_level: 'low' | 'medium' | 'high' | null;
}

interface GeneratedSchedule {
  theme: string;
  time_blocks: FullTimeBlock[];
}

// Weekly rotation plan for developmental domains
const WEEKLY_ROTATION = {
  monday: {
    focused: 'academic' as DevelopmentalDomain,
    focused_subtype: 'math_science',
    afternoon: 'creative' as DevelopmentalDomain,
    amharic_focus: 'vocabulary',
  },
  tuesday: {
    focused: 'social_emotional' as DevelopmentalDomain,
    focused_subtype: 'feelings_empathy',
    afternoon: 'physical' as DevelopmentalDomain,
    amharic_focus: 'phrases',
  },
  wednesday: {
    focused: 'academic' as DevelopmentalDomain,
    focused_subtype: 'reading_writing',
    afternoon: 'fine_motor' as DevelopmentalDomain,
    amharic_focus: 'vocabulary',
  },
  thursday: {
    focused: 'executive_function' as DevelopmentalDomain,
    focused_subtype: 'planning_memory',
    afternoon: 'academic' as DevelopmentalDomain,
    amharic_focus: 'conversation',
  },
  friday: {
    focused: 'academic' as DevelopmentalDomain,
    focused_subtype: 'choice_assessment',
    afternoon: 'creative' as DevelopmentalDomain,
    amharic_focus: 'cultural',
  },
};

function getDayOfWeek(date: string): keyof typeof WEEKLY_ROTATION {
  const d = new Date(date);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[d.getDay()];
  if (day === 'sunday' || day === 'saturday') return 'monday';
  return day as keyof typeof WEEKLY_ROTATION;
}

// THE 5 FIXED BLOCKS - these NEVER change
const FIXED_BLOCKS: FullTimeBlock[] = [
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
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
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
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
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
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
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
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
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
    display_type: 'minimal',
    developmental_domain: null,
    has_worksheet: false,
    worksheet_type: null,
    worksheet_prompt: null,
    setup_time_minutes: null,
    cleanup_level: null,
  },
];

// Developmental Activity Framework for the AI
const DEVELOPMENTAL_FRAMEWORK = `
## DEVELOPMENTAL DOMAINS

### ACADEMIC — Cognitive Skills
- Reading: discuss stories, retell in own words, find facts in nonfiction
- Math: real-world measuring, double-digit operations, patterns, word problems
- Writing: sentences, labels, letters to family
- Science: experiments, nature observation, "What happens if?"

### SOCIAL-EMOTIONAL — Most Important at Age 4
- Feelings: check-ins, identify character emotions, coping strategies
- Empathy: perspective-taking, role-play, "How did they feel?"
- Self-regulation: breathing, waiting, frustration tolerance
- Kindness: doing kind acts, cooperation with sister

### EXECUTIVE FUNCTION — Critical for School Readiness
- Inhibitory control: Simon Says, Freeze Dance
- Working memory: 3-step instructions, memory games
- Planning: following recipes, building from plans
- Flexible thinking: brainstorming, "What if?" scenarios

### FINE MOTOR — Supporting Writing
- Cutting, drawing, tracing
- Playdough letters, bead stringing
- Mazes, dot-to-dot

### PHYSICAL/MOVEMENT — Gross Motor
- Obstacle courses, balance challenges
- Throwing/catching, yoga
- Movement + learning combinations

### CREATIVE/IMAGINATIVE
- Dramatic play: restaurant, vet clinic, school
- Art: painting, collage, 3D building
- Music: keyboard, body percussion
- Storytelling: make up stories, puppet shows

### CULTURAL/AMHARIC — Ethiopian Heritage
- Vocabulary: 3-5 new words with pronunciation
- Phrases: greetings, simple requests
- Conversation practice
- Cultural: food, holidays, music, folklore
`;

/* eslint-disable @typescript-eslint/no-unused-vars */
function _buildSystemPrompt(
  childProfile: ChildProfile,
  skillLevels: SkillLevel[],
  recentActivities: ActivityLog[],
  date: string
): string {
  const dayOfWeek = getDayOfWeek(date);
  const rotation = WEEKLY_ROTATION[dayOfWeek];

  const skillsText = skillLevels
    .map(s => `- ${s.skill_area}: level ${s.current_level}/10`)
    .join('\n');

  const recentActivitiesText = recentActivities.length > 0
    ? recentActivities.slice(0, 10).map(a => `- ${a.actual_activity || 'Unknown'}`).join('\n')
    : 'No recent activities.';

  return `You are Nobel's Daily Guide. Generate ONLY 3 structured activities for today's schedule.

CHILD PROFILE:
- Name: ${childProfile.name}, Age: 4 years old
- Reading: ${childProfile.reading_level || '1st-2nd grade'} | Math: ${childProfile.math_level || 'K-1st'}
- Amharic: ${childProfile.amharic_level || 'early vocabulary'}
- Interests: ${childProfile.interests?.join(', ') || 'maps, space, building'}
- Resources: ${childProfile.physical_resources?.join(', ') || 'Legos, trampoline, keyboard, art supplies'}

SKILL LEVELS:
${skillsText || 'No levels recorded.'}

RECENT ACTIVITIES (DO NOT REPEAT):
${recentActivitiesText}

TODAY: ${dayOfWeek.toUpperCase()} - ${date}

TODAY'S DOMAINS:
- FOCUSED (10:30-12:00): ${rotation.focused.toUpperCase()} — ${rotation.focused_subtype}
- AFTERNOON (1:00-2:30): ${rotation.afternoon.toUpperCase()}
- AMHARIC (3:30-4:00): ${rotation.amharic_focus.toUpperCase()}

${DEVELOPMENTAL_FRAMEWORK}

ACTIVITY NAMING: Use "[Domain]: [Specific Activity]" format
Examples: "Social-Emotional: Feelings Story Discussion", "Creative: Cardboard City Build"

WORKSHEET: Set has_worksheet=true if activity needs printable materials
worksheet_type options: "math_worksheet", "reading_comprehension", "writing_practice", "science_observation", "fine_motor_tracing", "social_emotional"

OUTPUT: Return ONLY this JSON structure (no markdown, no explanation):
{
  "theme": "Fun theme for the day",
  "focused_activity": {
    "activity_name": "[Domain]: [Activity Name]",
    "description": "Detailed description with specific steps and instructions",
    "materials_needed": ["item1", "item2"],
    "learning_objective": "What Nobel will learn",
    "difficulty": "moderate",
    "tags": ["tag1", "tag2"],
    "has_worksheet": false,
    "worksheet_type": null,
    "worksheet_prompt": null,
    "setup_time_minutes": 5,
    "cleanup_level": "low"
  },
  "afternoon_activity": {
    "activity_name": "[Domain]: [Activity Name]",
    "description": "Detailed description",
    "materials_needed": [],
    "learning_objective": "Learning goal",
    "difficulty": "moderate",
    "tags": [],
    "has_worksheet": false,
    "worksheet_type": null,
    "worksheet_prompt": null,
    "setup_time_minutes": 5,
    "cleanup_level": "medium"
  },
  "amharic_activity": {
    "activity_name": "Amharic: [Topic]",
    "description": "Include specific words/phrases with pronunciation hints",
    "materials_needed": [],
    "learning_objective": "Amharic skill goal",
    "difficulty": "moderate",
    "tags": ["amharic", "vocabulary"],
    "has_worksheet": true,
    "worksheet_type": "writing_practice",
    "worksheet_prompt": "Create worksheet with Amharic words and tracing",
    "setup_time_minutes": 2,
    "cleanup_level": "low"
  }
}`;
}

// Assemble the full 8-block schedule from AI response
function assembleSchedule(aiResponse: AIResponse, dayOfWeek: keyof typeof WEEKLY_ROTATION): GeneratedSchedule {
  const rotation = WEEKLY_ROTATION[dayOfWeek];

  // Create the 3 structured blocks from AI response
  const focusedBlock: FullTimeBlock = {
    start_time: '10:30',
    end_time: '12:00',
    category: 'focused_learning',
    activity_name: aiResponse.focused_activity.activity_name,
    description: aiResponse.focused_activity.description,
    materials_needed: aiResponse.focused_activity.materials_needed || [],
    learning_objective: aiResponse.focused_activity.learning_objective,
    difficulty: aiResponse.focused_activity.difficulty || 'moderate',
    tags: aiResponse.focused_activity.tags || [],
    display_type: 'structured',
    developmental_domain: rotation.focused,
    has_worksheet: aiResponse.focused_activity.has_worksheet || false,
    worksheet_type: aiResponse.focused_activity.worksheet_type || null,
    worksheet_prompt: aiResponse.focused_activity.worksheet_prompt || null,
    setup_time_minutes: aiResponse.focused_activity.setup_time_minutes || 5,
    cleanup_level: aiResponse.focused_activity.cleanup_level || 'low',
  };

  const afternoonBlock: FullTimeBlock = {
    start_time: '13:00',
    end_time: '14:30',
    category: 'focused_learning',
    activity_name: aiResponse.afternoon_activity.activity_name,
    description: aiResponse.afternoon_activity.description,
    materials_needed: aiResponse.afternoon_activity.materials_needed || [],
    learning_objective: aiResponse.afternoon_activity.learning_objective,
    difficulty: aiResponse.afternoon_activity.difficulty || 'moderate',
    tags: aiResponse.afternoon_activity.tags || [],
    display_type: 'structured',
    developmental_domain: rotation.afternoon,
    has_worksheet: aiResponse.afternoon_activity.has_worksheet || false,
    worksheet_type: aiResponse.afternoon_activity.worksheet_type || null,
    worksheet_prompt: aiResponse.afternoon_activity.worksheet_prompt || null,
    setup_time_minutes: aiResponse.afternoon_activity.setup_time_minutes || 5,
    cleanup_level: aiResponse.afternoon_activity.cleanup_level || 'medium',
  };

  const amharicBlock: FullTimeBlock = {
    start_time: '15:30',
    end_time: '16:00',
    category: 'amharic',
    activity_name: aiResponse.amharic_activity.activity_name,
    description: aiResponse.amharic_activity.description,
    materials_needed: aiResponse.amharic_activity.materials_needed || [],
    learning_objective: aiResponse.amharic_activity.learning_objective,
    difficulty: aiResponse.amharic_activity.difficulty || 'moderate',
    tags: aiResponse.amharic_activity.tags || ['amharic'],
    display_type: 'structured',
    developmental_domain: 'cultural',
    has_worksheet: aiResponse.amharic_activity.has_worksheet || false,
    worksheet_type: aiResponse.amharic_activity.worksheet_type || null,
    worksheet_prompt: aiResponse.amharic_activity.worksheet_prompt || null,
    setup_time_minutes: aiResponse.amharic_activity.setup_time_minutes || 2,
    cleanup_level: aiResponse.amharic_activity.cleanup_level || 'low',
  };

  // Assemble all 8 blocks in order
  const allBlocks: FullTimeBlock[] = [
    FIXED_BLOCKS[0],  // 9:00-10:30 Free Play
    focusedBlock,     // 10:30-12:00 Focused Activity
    FIXED_BLOCKS[1],  // 12:00-1:00 Lunch
    afternoonBlock,   // 1:00-2:30 Afternoon Activity
    FIXED_BLOCKS[2],  // 2:30-3:30 Rest Time
    amharicBlock,     // 3:30-4:00 Amharic
    FIXED_BLOCKS[3],  // 4:00-6:00 Free Play
    FIXED_BLOCKS[4],  // 8:00-9:00 Reading
  ];

  return {
    theme: aiResponse.theme,
    time_blocks: allBlocks,
  };
}

export async function generateDaySchedule(
  date: string,
  childProfile: ChildProfile,
  skillLevels: SkillLevel[],
  recentActivities: ActivityLog[]
): Promise<GeneratedSchedule> {
  const dayOfWeek = getDayOfWeek(date);

  // Call the serverless API route instead of Anthropic directly
  const response = await fetch('/api/generate-schedule', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      childProfile,
      skillLevels,
      recentActivities,
      date,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API error:', errorData);
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  const aiResponse = await response.json() as AIResponse;
  return assembleSchedule(aiResponse, dayOfWeek);
}

export async function regenerateSingleBlock(
  _existingBlock: FullTimeBlock,
  _childProfile: ChildProfile,
  _skillLevels: SkillLevel[],
  _recentActivities: ActivityLog[]
): Promise<FullTimeBlock> {
  // For regeneration, fall back to mock (handled in scheduleService.ts)
  // A full AI regeneration API could be added later if needed
  throw new Error('REGENERATION_USE_MOCK');
}

export { WEEKLY_ROTATION, getDayOfWeek };
