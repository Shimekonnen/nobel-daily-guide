// @ts-nocheck
// TODO: Generate proper Supabase types with `supabase gen types typescript`

import { supabase } from '../lib/supabase';
import type { CoachingResponse, CoachingHistory, ChildProfile } from '../types/database';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _COACHING_SYSTEM_PROMPT = `You are a parenting coach specializing in early childhood development for advanced children ages 3-6. You help parents respond to everyday situations using evidence-based, whole-brain child development strategies.

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

// Mock response for fallback when no API key
const MOCK_RESPONSES: Record<string, CoachingResponse> = {
  default: {
    strategy_name: "Engage, Don't Enrage + Connect Through Conflict",
    strategy_description: "Appeal to Nobel's rational mind with choices rather than triggering a power struggle, and use this moment to build problem-solving skills.",
    whats_happening: "At age 4, Nobel is developing autonomy and control over his world. Refusing food is rarely about the food — it's about asserting independence. His 'upstairs brain' (rational thinking) is still developing, and power struggles push him into his 'downstairs brain' (fight-or-flight reactions). Since Nobel is cognitively advanced, he's even more aware of control dynamics, which means he needs to feel like he has agency, not that he's being forced.",
    what_to_say: [
      "Try: 'I notice you're not eating your dinner. Your body needs fuel — what part of your meal would you like to start with?'",
      "If he says none: 'That's okay. Dinner will be here when you're ready. But our kitchen closes after dinner time, so this is the last chance to eat until morning.'"
    ],
    what_to_do: [
      "Step 1: Stay calm and matter-of-fact. Sit with him and eat your own food — modeling is powerful.",
      "Step 2: Offer a choice within limits: 'Would you like to eat the rice first or the vegetables?' This gives him control without giving in.",
      "Step 3: Set a natural consequence without anger: 'When dinner is over, the kitchen closes.' Then follow through — no snacks later. He'll learn the connection."
    ],
    what_to_avoid: [
      "Don't force or bribe ('eat three more bites for dessert') — this creates a transactional relationship with food.",
      "Don't make it a power struggle ('you're not leaving this table until you eat') — this triggers the downstairs brain and guarantees resistance.",
      "Don't offer alternatives/short-order cooking — this teaches that refusing works."
    ],
    why_it_works: "By offering choices within boundaries, you engage Nobel's developing rational brain instead of triggering his emotional reactivity. The natural consequence (no food until breakfast) teaches cause-and-effect without punishment. Nobel's advanced reasoning means he'll connect the dots quickly — usually within 2-3 experiences of this approach."
  },
  tantrum: {
    strategy_name: "Connect and Redirect + Name It to Tame It",
    strategy_description: "When emotions are flooding, connect with the feeling first before trying to solve or redirect.",
    whats_happening: "During a tantrum, Nobel's 'downstairs brain' (the emotional, reactive part) has taken over completely. His 'upstairs brain' (rational thinking) is literally offline — he can't hear logic, lessons, or reasoning right now. Even though Nobel is cognitively advanced, his emotional brain is still very much 4 years old. The tantrum needs to run its course while he feels supported, not shamed.",
    what_to_say: [
      "Get down to his level and say calmly: 'I can see you're really upset right now. That's a big feeling.'",
      "If he's verbal: 'Can you tell me what happened? I'm listening.'",
      "When he starts calming: 'You were so frustrated because [reflect what happened]. That makes sense.'"
    ],
    what_to_do: [
      "Step 1: Get physically close (if he allows it) — sit nearby, offer a gentle hand on his back. Your calm presence helps regulate his nervous system.",
      "Step 2: Wait out the storm. Don't try to fix, lecture, or problem-solve yet. Just be there.",
      "Step 3: Once he's calmer (maybe 5-10 minutes later), help him tell the story of what happened. 'So you were building with blocks, and then what happened? And that made you feel...?'"
    ],
    what_to_avoid: [
      "Don't say 'stop crying' or 'calm down' — this invalidates his feelings and usually makes it worse.",
      "Don't threaten consequences in the moment — he literally can't process them right now.",
      "Don't walk away in frustration — even if you need space, say 'I'm right here when you need me.'"
    ],
    why_it_works: "When we connect with the emotional brain first ('I see you're upset'), it helps that part of the brain feel heard and start to settle. Only then can the upstairs brain come back online. Naming the emotion ('You were frustrated') helps Nobel develop emotional vocabulary and teaches him that feelings are manageable and temporary."
  },
  bedtime: {
    strategy_name: "Engage, Don't Enrage + Increase the Family Fun Factor",
    strategy_description: "Turn bedtime resistance into connection by making the routine predictable and playful.",
    whats_happening: "Bedtime resistance is almost never about sleep — it's about separation. Nobel doesn't want the day (and time with you) to end. At 4, he's also testing boundaries and asserting independence. His advanced cognition means he can generate endless reasons to delay ('one more book,' 'I need water,' 'I'm scared'). The key is making bedtime feel like connection time, not rejection time.",
    what_to_say: [
      "Try: 'It's almost time for our special bedtime routine. Do you want to hop to bed like a bunny or walk like a robot?'",
      "For stalling: 'I know you don't want today to end. Tomorrow will be here soon. Right now, let's do our cozy routine together.'",
      "For 'one more' requests: 'We can do that tomorrow! Tonight we're doing [routine]. Which stuffed animal gets to sleep with you?'"
    ],
    what_to_do: [
      "Step 1: Create a predictable, short routine (5-10 min max): pajamas → teeth → 2 books → song → lights out. Same every night.",
      "Step 2: Give him control over small choices: which pajamas, which books, which stuffed animal. This satisfies his need for autonomy.",
      "Step 3: End with physical connection — a special handshake, back rub, or whispered 'secret' about something fun tomorrow."
    ],
    what_to_avoid: [
      "Don't negotiate after lights out — every negotiation teaches him that pushing back works.",
      "Don't threaten to take away tomorrow's activities — this creates anxiety and makes sleep harder.",
      "Don't rush the routine — investing 10 focused minutes prevents 45 minutes of battles."
    ],
    why_it_works: "A predictable routine engages Nobel's 'upstairs brain' because he knows what's coming. The playful elements (bunny hops, choices) make it feel like connection instead of rejection. Ending with physical closeness fills his 'attachment tank' so he can separate peacefully."
  },
  sharing: {
    strategy_name: "Connect Through Conflict + Exercise Mindsight",
    strategy_description: "Use sharing conflicts as opportunities to build empathy and perspective-taking skills.",
    whats_happening: "At 4, Nobel is still developing the ability to see things from another person's perspective (what's called 'theory of mind'). Sharing feels like loss to him — his brain hasn't fully grasped that sharing is temporary and that his sister's feelings matter as much as his own. His advanced cognition actually helps here: he can start to understand explanations about others' feelings if we guide him there.",
    what_to_say: [
      "Connect first: 'You really love that toy. It's hard when someone else wants it.'",
      "Build empathy: 'Look at your sister's face. What do you think she's feeling right now?'",
      "Problem-solve together: 'What could we do so you both get a turn? What's your idea?'"
    ],
    what_to_do: [
      "Step 1: Acknowledge his feelings first — even if he 'should' share, his feelings of not wanting to are valid.",
      "Step 2: Help him notice his sister's experience: 'She's crying. When you cry, what does that usually mean?'",
      "Step 3: Let him generate solutions. Even imperfect ideas ('she can have it in 100 years') can be negotiated ('what about 5 minutes?')."
    ],
    what_to_avoid: [
      "Don't force immediate sharing — this builds resentment, not generosity.",
      "Don't say 'you have to share' without acknowledgment — he'll feel unheard and dig in harder.",
      "Don't always make the older sibling give in — that breeds resentment toward his sister."
    ],
    why_it_works: "When Nobel practices noticing his sister's feelings and generating solutions, he's literally building neural pathways for empathy. This 'exercise' of the upstairs brain makes sharing (and other social skills) easier over time. Forced sharing doesn't build these pathways — it just builds compliance or resentment."
  },
  listening: {
    strategy_name: "Engage, Don't Enrage + Use It or Lose It",
    strategy_description: "Get Nobel's attention and cooperation by engaging his thinking brain rather than repeating commands.",
    whats_happening: "When Nobel 'doesn't listen,' his brain is usually deeply engaged in something else (play, imagination, problem-solving). Repeated commands become background noise. His advanced cognition means he also might be testing the logical consistency of your requests ('why do I have to?'). The key is to first interrupt his focus respectfully, then engage his thinking brain in the task.",
    what_to_say: [
      "Get connection first: Get close, touch his shoulder gently, and wait for eye contact. 'Nobel, I need your attention for a second.'",
      "Make it engaging: Instead of 'put on your shoes,' try 'Your shoes are by the door — how fast can you put them on? I'll count!'",
      "Give the why (he's smart enough): 'We need to leave in 5 minutes so we're not late. What do you still need to do to get ready?'"
    ],
    what_to_do: [
      "Step 1: Proximity and connection first — walk to him, get on his level, make sure he's actually hearing you (not just hearing noise).",
      "Step 2: One clear request at a time. 'Put on your shoes' not 'get ready to go.'",
      "Step 3: Ask him to repeat back: 'What are you going to do now?' This engages his upstairs brain and confirms he heard you."
    ],
    what_to_avoid: [
      "Don't yell from across the room — it's easy to tune out and he may genuinely not hear you.",
      "Don't repeat the same command 5 times — after twice, change your approach.",
      "Don't threaten: 'If you don't listen...' — this triggers the downstairs brain and power struggles."
    ],
    why_it_works: "When we engage Nobel's 'upstairs brain' with choices, questions, and the 'why,' he cooperates because his thinking brain is online. Repeated commands without connection just become noise. The 'repeat back' technique also exercises his executive function — the part of the brain that turns intentions into actions."
  },
  hitting: {
    strategy_name: "Connect and Redirect + Name It to Tame It",
    strategy_description: "Address the behavior firmly while connecting with the emotion driving it.",
    whats_happening: "When Nobel hits or pushes, his 'downstairs brain' has hijacked the moment — he's reacting before his 'upstairs brain' can intervene with better choices. At 4, impulse control is still developing. Even though Nobel is cognitively advanced, his ability to pause between feeling and action is still very much 4 years old. The goal is to stop the behavior immediately while helping him understand and manage the feeling underneath.",
    what_to_say: [
      "Firm but calm: 'I won't let you hit. Hitting hurts.' (Physically stop the hitting if needed.)",
      "Connect with the feeling: 'You were so frustrated/angry. That's a big feeling. But hitting isn't how we show it.'",
      "Teach alternatives: 'When you feel that way, you can stomp your feet, squeeze this pillow, or come tell me.'"
    ],
    what_to_do: [
      "Step 1: Stop the behavior immediately and calmly — 'I won't let you hit.' No long lectures.",
      "Step 2: Remove him from the situation briefly if needed. 'Let's take a break over here together.'",
      "Step 3: Once calm, help him repair: 'What happened? How do you think [person] felt? What could you do to help them feel better?'"
    ],
    what_to_avoid: [
      "Don't hit back or use physical punishment — this teaches that hitting is okay when you're bigger/in charge.",
      "Don't shame: 'Bad boy!' — this attacks his identity rather than addressing the behavior.",
      "Don't lecture in the moment — his upstairs brain is offline; save the teaching for later."
    ],
    why_it_works: "By stopping the behavior firmly but calmly, Nobel learns the boundary. By connecting with the feeling, he learns his emotions are valid even when his actions aren't. By teaching alternatives and practicing repair, he builds the neural pathways for better responses next time. This takes many repetitions — that's normal."
  },
  saying_no: {
    strategy_name: "Engage, Don't Enrage + Use It or Lose It",
    strategy_description: "Transform reflexive 'no' responses into opportunities for decision-making and cooperation.",
    whats_happening: "'No' is Nobel's way of asserting independence and testing his power in the world — which is developmentally healthy, even if exhausting. At 4, he's discovering that he's a separate person with his own will. His advanced cognition makes him even more aware of this autonomy. The key is to give him real choices (so he feels powerful) while maintaining the boundaries you need.",
    what_to_say: [
      "Offer real choices: Instead of 'put on your jacket,' try 'Do you want to wear the blue jacket or the red one?'",
      "Acknowledge the no: 'I hear that you don't want to. Here's the thing: we need to [do X] because [reason]. How do you want to do it?'",
      "Use 'when/then': 'When you've brushed your teeth, then we can read books. You choose when that happens.'"
    ],
    what_to_do: [
      "Step 1: Give choices within your boundaries — he picks how, you pick what. Both feel powerful.",
      "Step 2: Use 'when/then' instead of 'if/then' — it assumes compliance and removes the threat.",
      "Step 3: Pick your battles — say yes when you can ('Can I wear my cape to the store?' 'Sure!') so your nos carry weight."
    ],
    what_to_avoid: [
      "Don't ask yes/no questions when no isn't an option ('Do you want to brush your teeth?' → 'No!').",
      "Don't get into a power struggle — you'll both lose. Change the dynamic instead.",
      "Don't cave to avoid conflict — this teaches that 'no' is a winning strategy."
    ],
    why_it_works: "When Nobel has real choices, his need for autonomy is satisfied and he's more likely to cooperate. 'When/then' engages his logical brain ('oh, I can control when this happens by doing the thing'). By saving your 'non-negotiables' for what really matters, you reduce daily battles and he takes your limits seriously."
  },
  bathroom: {
    strategy_name: "Move It or Lose It + Engage, Don't Enrage",
    strategy_description: "Use movement and playful engagement to overcome bathroom resistance without power struggles.",
    whats_happening: "Bathroom resistance at 4 often comes from being deeply engaged in play and not wanting to stop, or from asserting independence ('you can't tell me when to go'). Nobel's advanced focus means he can ignore body signals longer than other kids. Power struggles around the bathroom can also lead to holding, which creates real problems. The goal is to make it easy and matter-of-fact.",
    what_to_say: [
      "Make it playful: 'Race you to the bathroom!' or 'Can you hop there like a frog?'",
      "Give control: 'It's bathroom time. Do you want to go now or in 2 minutes? You decide.'",
      "Matter-of-fact: 'Your body needs a bathroom break. Let's go, and then you can come right back to your game.'"
    ],
    what_to_do: [
      "Step 1: Use movement to break his focus — 'Let's race!' or 'Can you get there before I count to 10?'",
      "Step 2: Build in regular bathroom times (before meals, before leaving the house) so it's routine, not interruption.",
      "Step 3: If accidents happen, stay calm: 'Oops, your body was telling you something. Let's get cleaned up. Next time, let's listen sooner.'"
    ],
    what_to_avoid: [
      "Don't ask 'do you need to go?' — he'll say no even if he does.",
      "Don't shame accidents — this creates anxiety and makes the problem worse.",
      "Don't make it a power struggle — this can lead to intentional holding, which causes physical problems."
    ],
    why_it_works: "Movement (racing, hopping) engages his body and makes the transition feel like play, not interruption. Building bathroom breaks into routines removes the 'you vs. me' dynamic. Matter-of-fact responses keep it low-drama — bathroom needs are just part of life, not battles to win."
  }
};

// Map quick scenarios to mock response keys
const SCENARIO_MAPPING: Record<string, string> = {
  'refusing to eat': 'default',
  'dinner': 'default',
  'eat': 'default',
  'food': 'default',
  'tantrum': 'tantrum',
  'meltdown': 'tantrum',
  'crying': 'tantrum',
  'upset': 'tantrum',
  'bed': 'bedtime',
  'sleep': 'bedtime',
  'bedtime': 'bedtime',
  'share': 'sharing',
  'sharing': 'sharing',
  'sister': 'sharing',
  'turn': 'sharing',
  'listen': 'listening',
  'listening': 'listening',
  'ignore': 'listening',
  'hit': 'hitting',
  'hitting': 'hitting',
  'push': 'hitting',
  'pushing': 'hitting',
  'hurt': 'hitting',
  'no': 'saying_no',
  'refuse': 'saying_no',
  'won\'t': 'saying_no',
  'bathroom': 'bathroom',
  'potty': 'bathroom',
  'toilet': 'bathroom',
};

function findMockResponse(scenario: string): CoachingResponse {
  const lowerScenario = scenario.toLowerCase();

  for (const [keyword, responseKey] of Object.entries(SCENARIO_MAPPING)) {
    if (lowerScenario.includes(keyword)) {
      return MOCK_RESPONSES[responseKey];
    }
  }

  return MOCK_RESPONSES.default;
}

export async function getParentingGuidance(
  scenario: string,
  childProfile?: ChildProfile
): Promise<CoachingResponse> {
  try {
    // Call the serverless API route instead of Anthropic directly
    const response = await fetch('/api/generate-coaching', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        childProfile,
      }),
    });

    if (!response.ok) {
      console.error('API request failed, using mock response');
      return findMockResponse(scenario);
    }

    return await response.json() as CoachingResponse;
  } catch (error) {
    console.error('Failed to get coaching guidance:', error);
    return findMockResponse(scenario);
  }
}

export async function saveCoachingHistory(
  childId: string,
  scenario: string,
  response: CoachingResponse
): Promise<CoachingHistory | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('coaching_history')
      .insert({
        child_id: childId,
        scenario,
        strategy_name: response.strategy_name,
        response,
      })
      .select()
      .single();

    if (error) {
      // Table might not exist yet - that's okay, just log and continue
      console.warn('Could not save coaching history (table may not exist):', error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Could not save coaching history:', error);
    return null;
  }
}

export async function getCoachingHistory(
  childId: string,
  limit: number = 20
): Promise<CoachingHistory[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('coaching_history')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Table might not exist yet - that's okay
      console.warn('Could not fetch coaching history (table may not exist):', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Could not fetch coaching history:', error);
    return [];
  }
}

// Quick scenario buttons
export const QUICK_SCENARIOS = [
  { label: "Refusing to eat", scenario: "Nobel is refusing to eat his dinner" },
  { label: "Won't go to bed", scenario: "Nobel won't go to bed and keeps getting up" },
  { label: "Having a tantrum", scenario: "Nobel is having a tantrum and won't calm down" },
  { label: "Won't share with sister", scenario: "Nobel won't share his toys with his sister" },
  { label: "Resisting bathroom", scenario: "Nobel is resisting going to the bathroom" },
  { label: "Not listening", scenario: "Nobel is not listening to what I'm saying" },
  { label: "Hitting or pushing", scenario: "Nobel is hitting or pushing his sister" },
  { label: "Saying 'no' to everything", scenario: "Nobel is saying 'no' to everything I ask" },
];
