// @ts-nocheck
// TODO: The WORKSHEET_SYSTEM_PROMPT is kept for reference but moved to serverless function

import type { TimeBlock, WorksheetType } from '../types/database';

// Cache for generated worksheets
const worksheetCache = new Map<string, string>();

interface WorksheetOptions {
  activityName: string;
  category: string;
  skillLevel: number;
  topic: string;
  materialsPrompt: string;
  worksheetType: WorksheetType;
}

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

export async function generateWorksheet(options: WorksheetOptions): Promise<string> {
  const { activityName, category, skillLevel, topic, materialsPrompt, worksheetType } = options;

  // Check cache first
  const cacheKey = `${activityName}-${worksheetType}-${skillLevel}`;
  if (worksheetCache.has(cacheKey)) {
    return worksheetCache.get(cacheKey)!;
  }

  // Call the serverless API route instead of Anthropic directly
  const response = await fetch('/api/generate-worksheet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activityName,
      category,
      skillLevel,
      topic,
      materialsPrompt,
      worksheetType,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API error:', errorData);
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  const htmlContent = data.html;

  if (!htmlContent) {
    throw new Error('No HTML content in API response');
  }

  // Cache the result
  worksheetCache.set(cacheKey, htmlContent);

  return htmlContent;
}

// Generate worksheet from a TimeBlock
export async function generateWorksheetFromBlock(
  block: TimeBlock,
  skillLevel: number = 5
): Promise<string> {
  if (!block.has_worksheet || !block.worksheet_type) {
    throw new Error('This activity does not have a worksheet');
  }

  return generateWorksheet({
    activityName: block.activity_name,
    category: block.category,
    skillLevel,
    topic: block.description || block.activity_name,
    materialsPrompt: block.worksheet_prompt || 'Create an appropriate worksheet for this activity',
    worksheetType: block.worksheet_type,
  });
}

// Clear the worksheet cache (useful for testing)
export function clearWorksheetCache(): void {
  worksheetCache.clear();
}

// Get cached worksheet if available
export function getCachedWorksheet(block: TimeBlock): string | null {
  const cacheKey = `${block.activity_name}-${block.worksheet_type}-5`;
  return worksheetCache.get(cacheKey) || null;
}
