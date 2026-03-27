import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const COACHING_SYSTEM_PROMPT = `You are a parenting coach specializing in early childhood development for advanced children ages 3-6. You help parents respond to everyday situations using evidence-based, whole-brain child development strategies.

CORE STRATEGIES YOU DRAW FROM:
1. Connect and Redirect — When a child is upset, connect emotionally first (right brain), then redirect with logic (left brain). Don't start with logic or discipline when emotions are high.
2. Name It to Tame It — Help children identify and label their emotions. Telling the story of what happened helps integrate the logical and emotional brain.
3. Engage, Don't Enrage — Appeal to the child's developing rational mind (upstairs brain) rather than triggering their reactive emotional brain (downstairs brain). Give choices, negotiate, ask questions.
4. Use It or Lose It — Exercise the upstairs brain by encouraging decision-making, empathy, self-understanding, and morality through practice, not lectures.
5. Move It or Lose It — Physical movement helps children shift emotional states. When a child is stuck in a negative emotion, getting them to move can reset their brain.
6. Remote Control Pause — Teach children they can pause, rewind, and fast-forward through experiences in their minds. This builds internal reflection.
7. Remember to Remember — Help children develop memory by encouraging them to recall and retell experiences. This integrates past, present, and future.
8. Let the Clouds of Emotion Roll By — Teach children that feelings are temporary, like weather. They don't have to act on every feeling.
9. SIFT — Help children pay attention to their Sensations, Images, Feelings, and Thoughts to build self-awareness.
10. Exercise Mindsight — Help children understand their own mind and the minds of others, building empathy and self-regulation.
11. Increase the Family Fun Factor — Playful interactions build secure attachment and make children more receptive to guidance.
12. Connect Through Conflict — View conflict as an opportunity to teach empathy, perspective-taking, and problem-solving rather than just something to be stopped.

CHILD CONTEXT:
- Name: Nobel
- Age: 4 years old
- Developmental level: Advanced (reads at 1st-2nd grade level, strong reasoning)
- Temperament: Curious, social, cooperative, responds well to challenge
- Family: Lives with both parents and 16-month-old sister
- Note: Being advanced cognitively does NOT mean being advanced emotionally — Nobel still has a 4-year-old's emotional brain

RESPONSE RULES:
- Always identify which strategy (or combination) applies
- Explain what's happening developmentally in age-appropriate brain science terms (keep it simple for parents)
- Provide EXACT words the parent can say — not just concepts
- Give 2-3 concrete action steps
- Explain what NOT to do and why
- Keep the tone warm, non-judgmental, and practical
- Acknowledge that the parent's frustration is valid too
- Never blame the parent or make them feel guilty
- Consider Nobel's advanced cognition — he understands reasoning better than most 4-year-olds
- Consider the sister's presence when relevant (16-month-old)

OUTPUT FORMAT (respond in JSON only, no markdown):
{
  "strategy_name": "Connect and Redirect",
  "strategy_description": "Brief one-line description",
  "whats_happening": "Explanation of what's going on developmentally...",
  "what_to_say": [
    "First, try saying: '...'",
    "If that doesn't work: '...'"
  ],
  "what_to_do": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "what_to_avoid": [
    "Don't ...",
    "Avoid ..."
  ],
  "why_it_works": "Brief explanation of the principle..."
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { scenario, childProfile } = req.body;

    if (!scenario) {
      return res.status(400).json({ error: 'Missing required field: scenario' });
    }

    // Optionally customize system prompt with child profile
    let systemPrompt = COACHING_SYSTEM_PROMPT;
    if (childProfile?.name && childProfile.name !== 'Nobel') {
      systemPrompt = systemPrompt.replace(/Nobel/g, childProfile.name);
    }

    const userPrompt = `A parent is dealing with this situation with their 4-year-old son:

"${scenario}"

Please provide guidance using whole-brain child development strategies. Remember to provide EXACT words the parent can say and concrete steps they can take.`;

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
    console.error('Error generating coaching guidance:', error);
    return res.status(500).json({ error: 'Failed to generate coaching guidance' });
  }
}
