import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

type SkillArea = 'reading' | 'math' | 'reasoning' | 'amharic' | 'vocabulary';

function buildAssessmentPrompt(
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { skillArea, currentLevel, previousQuestions } = req.body;

    if (!skillArea || currentLevel === undefined) {
      return res.status(400).json({ error: 'Missing required fields: skillArea, currentLevel' });
    }

    const systemPrompt = buildAssessmentPrompt(skillArea, currentLevel, previousQuestions);
    const userPrompt = `Generate a fun ${skillArea} assessment for Nobel at difficulty level ${currentLevel}. Make it engaging and adventure-themed!`;

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

    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const aiResponse = JSON.parse(cleanedContent);
    return res.status(200).json(aiResponse);
  } catch (error) {
    console.error('Error generating assessment:', error);
    return res.status(500).json({ error: 'Failed to generate assessment' });
  }
}
