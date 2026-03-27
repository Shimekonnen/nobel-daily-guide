import type { VercelRequest, VercelResponse } from '@vercel/node';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const WORKSHEET_SYSTEM_PROMPT = `You are generating a printable worksheet for a 4-year-old advanced learner named Nobel.

RULES:
- Design for printing on standard US Letter paper (8.5 x 11 inches)
- Black and white only (no colors — will be printed)
- Clear, large font (minimum 16pt for instructions, 20pt for content)
- Include Nobel's name at the top
- Include today's date
- Clear instructions that a 4-year-old can follow (parent may read them aloud)
- Content should take 10-15 minutes to complete
- Include an answer key at the bottom (for parent reference)
- Use simple line drawings described in text (circles, boxes, lines) rather than images
- Appropriate difficulty for the specified skill level

WORKSHEET TYPES AND FORMATS:

1. MATH WORKSHEET:
- Addition/subtraction problems with space to write answers
- Number patterns to complete
- Counting exercises with simple shapes
- Word problems with pictures
- Comparison (greater than, less than)

2. READING COMPREHENSION:
- Short passage (3-5 sentences at appropriate reading level)
- 3-4 comprehension questions
- Vocabulary word matching
- Sequence ordering

3. WRITING PRACTICE:
- Letter/word tracing with proper formation guides
- Simple sentence completion
- Creative writing prompts with lined space
- Labeling activity

4. SCIENCE OBSERVATION:
- Observation recording boxes with prompts
- Experiment steps checklist
- Classification activity (sorting/grouping)
- Prediction and results sections

5. FINE MOTOR TRACING:
- Pattern tracing (zigzag, curves, spirals)
- Maze with clear path
- Dot-to-dot with numbers
- Shape tracing and completion

6. SOCIAL-EMOTIONAL:
- Feelings identification with face outlines to draw
- Scenario cards with "What would you do?" prompts
- Emotion drawing/coloring spaces
- Kindness challenge checklist

OUTPUT FORMAT:
Return ONLY clean, valid HTML that can be rendered in a browser and printed.
Use inline CSS styles for all formatting.
Structure:
- Use a main container with max-width: 8.5in and margin: auto
- Use clear section headings
- Use tables or flexbox for alignment
- Include print-specific styles

Example structure:
<div style="max-width: 8.5in; margin: 0 auto; padding: 0.5in; font-family: 'Comic Sans MS', cursive, sans-serif;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="font-size: 24pt; margin: 0;">Nobel's [Type] Worksheet</h1>
    <p style="font-size: 14pt; color: #666;">[Date]</p>
  </div>

  <div style="margin-bottom: 20px;">
    <h2 style="font-size: 18pt;">Instructions</h2>
    <p style="font-size: 16pt;">[Clear instructions here]</p>
  </div>

  <!-- Main content sections -->

  <div style="margin-top: 30px; border-top: 2px dashed #ccc; padding-top: 10px;">
    <p style="font-size: 12pt; color: #888;"><strong>Answer Key (for parents):</strong></p>
    <p style="font-size: 12pt; color: #888;">[Answers here]</p>
  </div>
</div>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { activityName, category, skillLevel, topic, materialsPrompt, worksheetType, childName } = req.body;

    if (!activityName || !worksheetType) {
      return res.status(400).json({ error: 'Missing required fields: activityName, worksheetType' });
    }

    // Customize system prompt with child name if provided
    let systemPrompt = WORKSHEET_SYSTEM_PROMPT;
    if (childName && childName !== 'Nobel') {
      systemPrompt = systemPrompt.replace(/Nobel/g, childName);
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const userPrompt = `Generate a printable worksheet.

Activity: ${activityName}
Category: ${category || 'general'}
Skill Level: ${skillLevel || 5}/10
Topic: ${topic || activityName}
Worksheet Type: ${worksheetType}
Specific Request: ${materialsPrompt || 'Create an appropriate worksheet for this activity'}
Today's Date: ${today}

Create an engaging, age-appropriate worksheet that will be fun to complete. Make it educational!`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
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

    // Clean up the response - remove any markdown code blocks if present
    let htmlContent = content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Ensure it starts with a valid HTML div
    if (!htmlContent.startsWith('<')) {
      const htmlMatch = htmlContent.match(/<div[\s\S]*<\/div>/);
      if (htmlMatch) {
        htmlContent = htmlMatch[0];
      }
    }

    return res.status(200).json({ html: htmlContent });
  } catch (error) {
    console.error('Error generating worksheet:', error);
    return res.status(500).json({ error: 'Failed to generate worksheet' });
  }
}
