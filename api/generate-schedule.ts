import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Types
interface ChildProfile {
  name: string;
  reading_level?: string;
  math_level?: string;
  amharic_level?: string;
  interests?: string[];
  physical_resources?: string[];
}

interface SkillLevel {
  skill_area: string;
  current_level: number;
}

interface ActivityLog {
  actual_activity?: string;
}

type DevelopmentalDomain =
  | 'academic' | 'social_emotional' | 'executive_function'
  | 'fine_motor' | 'physical' | 'creative' | 'cultural';

// Weekly rotation plan
const WEEKLY_ROTATION: Record<string, {
  focused: DevelopmentalDomain;
  focused_subtype: string;
  afternoon: DevelopmentalDomain;
  amharic_focus: string;
}> = {
  monday: {
    focused: 'academic',
    focused_subtype: 'math_science',
    afternoon: 'creative',
    amharic_focus: 'vocabulary',
  },
  tuesday: {
    focused: 'social_emotional',
    focused_subtype: 'feelings_empathy',
    afternoon: 'physical',
    amharic_focus: 'phrases',
  },
  wednesday: {
    focused: 'academic',
    focused_subtype: 'reading_writing',
    afternoon: 'fine_motor',
    amharic_focus: 'vocabulary',
  },
  thursday: {
    focused: 'executive_function',
    focused_subtype: 'planning_memory',
    afternoon: 'academic',
    amharic_focus: 'conversation',
  },
  friday: {
    focused: 'academic',
    focused_subtype: 'choice_assessment',
    afternoon: 'creative',
    amharic_focus: 'cultural',
  },
};

function getDayOfWeek(date: string): string {
  const d = new Date(date);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const day = days[d.getDay()];
  if (day === 'sunday' || day === 'saturday') return 'monday';
  return day;
}

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

function buildSystemPrompt(
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { childProfile, skillLevels, recentActivities, date } = req.body;

    if (!childProfile || !date) {
      return res.status(400).json({ error: 'Missing required fields: childProfile, date' });
    }

    const systemPrompt = buildSystemPrompt(
      childProfile,
      skillLevels || [],
      recentActivities || [],
      date
    );
    const userPrompt = `Generate 3 activities for ${date}. Make them engaging and age-appropriate.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return res.status(500).json({ error: 'AI API request failed' });
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return res.status(500).json({ error: 'No content in API response' });
    }

    // Parse and return the AI response
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiResponse = JSON.parse(cleanedContent);
    return res.status(200).json(aiResponse);
  } catch (error) {
    console.error('Error generating schedule:', error);
    return res.status(500).json({ error: 'Failed to generate schedule' });
  }
}
