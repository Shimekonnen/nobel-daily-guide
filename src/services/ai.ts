import type { ChildProfile, SkillLevel, TimeBlock, ActivityLog } from '../types/database';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface GeneratedTimeBlock {
  start_time: string;
  end_time: string;
  category: string;
  activity_name: string;
  description: string;
  materials_needed: string[];
  learning_objective: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  tags: string[];
}

interface GeneratedSchedule {
  theme: string;
  time_blocks: GeneratedTimeBlock[];
}

const DAILY_SCHEDULE_TEMPLATE = `
| Time Block | Category | Description |
|---|---|---|
| 9:00–9:30 | sibling_play | Guided play activity with sister |
| 9:30–10:30 | independent_play | Solo play in basement (building, imaginative, music) |
| 10:30–12:00 | focused_learning | Reading, comprehension, math, activities (with play breaks) |
| 12:00–12:15 | amharic | Conversational Amharic practice |
| 12:15–1:00 | lunch | Lunch with sister |
| 1:00–2:15 | sibling_play | Basement activities — mix of group and independent |
| 2:15–2:45 | outdoor | Walk, playground, bike, outdoor exploration |
| 2:45–3:45 | rest | Quiet time in bedroom (self-directed reading) |
| 3:45–4:00 | amharic | Second short Amharic block (conversation, vocabulary) |
| 4:00–6:15 | independent_play | Basement play, creative projects, movement |
| 6:15–6:30 | cleanup | Cleanup routine, transition to dinner |
| 6:30–7:30 | dinner | Dinner time |
| 7:30–8:00 | routine | Bath, preparation for bed |
| 8:00–9:00 | reading | Nobel reads independently in his room |
`;

function buildSystemPrompt(
  childProfile: ChildProfile,
  skillLevels: SkillLevel[],
  recentActivities: ActivityLog[]
): string {
  const skillsText = skillLevels
    .map(s => `- ${s.skill_area}: level ${s.current_level}/10`)
    .join('\n');

  const recentActivitiesText = recentActivities.length > 0
    ? recentActivities.map(a => `- ${a.actual_activity || 'Unknown activity'}`).join('\n')
    : 'No recent activity history available.';

  return `You are Nobel's Daily Guide — an expert early childhood development AI specializing in gifted/advanced preschoolers. Your job is to create a complete daily schedule for Nobel, a 4-year-old boy with abilities significantly above age level.

CHILD PROFILE:
- Name: ${childProfile.name}
- Age: 4 years old (DOB: ${childProfile.date_of_birth})
- Reading Level: ${childProfile.reading_level || 'Not specified'}
- Math Level: ${childProfile.math_level || 'Not specified'}
- Amharic Level: ${childProfile.amharic_level || 'Not specified'}
- Interests: ${childProfile.interests?.join(', ') || 'Not specified'}
- Learning Style: ${childProfile.learning_style || 'Not specified'}
- Physical Resources Available: ${childProfile.physical_resources?.join(', ') || 'Not specified'}
- Content Restrictions: ${childProfile.content_restrictions?.join(', ') || 'None'}
- Screen Time Limit: ${childProfile.screen_time_limit_minutes} minutes/day

CURRENT SKILL LEVELS:
${skillsText || 'No skill levels recorded yet.'}

RECENT ACTIVITIES (last 14 days - DO NOT REPEAT these):
${recentActivitiesText}

DAILY SCHEDULE TEMPLATE:
${DAILY_SCHEDULE_TEMPLATE}

CONSTRAINTS:
- Generate a complete day schedule following the template time blocks
- NEVER repeat an activity from the recent activities list
- Calibrate all content to current skill levels
- Include variety: rotate between math, reading, science, creative, music, engineering/building
- Each focused learning block should have a specific learning objective
- Amharic blocks should be conversational (not just alphabet drills)
- Outdoor activities should vary (walk, playground, bike, nature explore)
- Independent play suggestions should leverage available equipment (trampoline, basketball, keyboard, Legos, blocks, slides)
- Sibling play suggestions must be appropriate for a 16-month-old participating alongside a 4-year-old
- Content must avoid: ${childProfile.content_restrictions?.join(', ') || 'no restrictions'}

MORNING SESSION RULES (before 10:30 AM):
- Limit to ONE activity per time block before 10:30 AM
- Do NOT double up or combine two activities into one block
- Keep mornings simple — one clear activity per slot

LUNCH AND DINNER BLOCKS:
- For meal times (Lunch, Dinner), do NOT include activity descriptions or learning objectives
- Just use the meal name — e.g., "Lunch" or "Dinner"
- Keep description and learning_objective fields minimal or empty for meals

ACTIVITY NAMING CONVENTION:
- Every activity name MUST follow this pattern: "[Activity Type] - [Specific Activity]"
- Use these Activity Types:
  - "Group Play Time" — when Nobel plays WITH his sister
  - "Independent Play" — when Nobel plays alone
  - "Focused Learning" — reading, math, comprehension activities
  - "Outdoor Time" — walks, playground, bikes
  - "Creative Time" — art, music, building projects
  - "Amharic Practice" — language practice
  - "Rest Time" — quiet/nap time
  - "Reading Time" — independent reading
  - "Routine" — cleanup, bath, transitions
- Examples:
  - "Group Play Time - Block City Building"
  - "Outdoor Time - Neighborhood Construction Hunt"
  - "Focused Learning - Map Coordinate Math Game"
  - "Creative Time - Pirate Treasure Map Art"
  - "Independent Play - Lego Bridge Engineering"
  - "Amharic Practice - Vehicle Names Conversation"

BOOK RECOMMENDATIONS:
- ALL book recommendations MUST be books likely available at a public library, specifically CRRL (Central Rappahannock Regional Library)
- Do NOT recommend obscure, self-published, or niche books unlikely to be in a public library system
- Prefer well-known children's books from major publishers (Scholastic, Random House, National Geographic Kids, DK, etc.)
- Include a note: "Check CRRL Library" with link: https://librarypoint.bibliocommons.com/v2/search?query=BOOK+TITLE&searchType=smart (replacing spaces with +)

OUTPUT FORMAT:
Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "theme": "A fun theme for the day (e.g., 'Ocean Explorers', 'Space Adventure')",
  "time_blocks": [
    {
      "start_time": "09:00",
      "end_time": "09:30",
      "category": "sibling_play",
      "activity_name": "Name of activity",
      "description": "1-2 sentence description of the activity",
      "materials_needed": ["item1", "item2"],
      "learning_objective": "What Nobel will learn (parent-facing)",
      "difficulty": "easy|moderate|challenging",
      "tags": ["social", "motor", "math", etc]
    }
  ]
}

Generate time blocks for ALL slots in the daily schedule template. Be creative, engaging, and age-appropriate while challenging Nobel appropriately.`;
}

export async function generateDaySchedule(
  date: string,
  childProfile: ChildProfile,
  skillLevels: SkillLevel[],
  recentActivities: ActivityLog[]
): Promise<GeneratedSchedule> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY_NOT_CONFIGURED');
  }

  const systemPrompt = buildSystemPrompt(childProfile, skillLevels, recentActivities);
  const userPrompt = `Generate a complete daily schedule for ${date}. Today is a weekday. Create engaging, varied activities that will keep Nobel learning and having fun throughout the day.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Anthropic API error:', errorText);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  if (!content) {
    throw new Error('No content in API response');
  }

  // Parse the JSON response
  try {
    // Remove any potential markdown code blocks
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleanedContent) as GeneratedSchedule;
    return parsed;
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function regenerateSingleBlock(
  existingBlock: TimeBlock,
  childProfile: ChildProfile,
  skillLevels: SkillLevel[],
  recentActivities: ActivityLog[]
): Promise<GeneratedTimeBlock> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY_NOT_CONFIGURED');
  }

  const skillsText = skillLevels
    .map(s => `- ${s.skill_area}: level ${s.current_level}/10`)
    .join('\n');

  const systemPrompt = `You are Nobel's Daily Guide. Generate a SINGLE replacement activity for a time block.

CHILD PROFILE:
- Name: ${childProfile.name}
- Age: 4 years old
- Reading Level: ${childProfile.reading_level}
- Math Level: ${childProfile.math_level}
- Interests: ${childProfile.interests?.join(', ')}
- Physical Resources: ${childProfile.physical_resources?.join(', ')}

SKILL LEVELS:
${skillsText}

Return ONLY valid JSON (no markdown) with this structure:
{
  "start_time": "${existingBlock.start_time}",
  "end_time": "${existingBlock.end_time}",
  "category": "${existingBlock.category}",
  "activity_name": "New activity name",
  "description": "1-2 sentence description",
  "materials_needed": [],
  "learning_objective": "What Nobel will learn",
  "difficulty": "easy|moderate|challenging",
  "tags": []
}`;

  const userPrompt = `Generate a NEW activity for the ${existingBlock.category} time block (${existingBlock.start_time} - ${existingBlock.end_time}).
The previous activity was "${existingBlock.activity_name}" which didn't work out.
Generate something different but still appropriate for the ${existingBlock.category} category.`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text;

  const cleanedContent = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleanedContent) as GeneratedTimeBlock;
}
