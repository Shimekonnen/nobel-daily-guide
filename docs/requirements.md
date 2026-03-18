# Nobel's Daily Guide — Product Requirements Document

## 1. Product Overview

**Product Name:** Nobel's Daily Guide (working title)
**Purpose:** An AI-powered daily planning and developmental tracking app for Nobel (age 4, advanced learner) that generates personalized schedules, activities, book recommendations, and adaptive assessments — eliminating the daily cognitive burden of "what should we teach/do today?" for his parents.

**Users:**
- **Primary:** Shim (father) and wife (mother) — schedule viewers, activity facilitators, progress reviewers
- **Secondary:** Nobel — interacts with on-screen assessments (game-like, max 1 hour screen time/day with parent guidance)

**Core Problem:** Nobel is an advanced child with rich resources (books, toys, play areas, engaged parents) but the daily challenge of filling each time block with fresh, developmentally appropriate, varied content requires significant mental energy. The app replaces that daily planning with AI-generated, adaptive, personalized schedules.

**MVP Scope:**
- Weekdays only (Monday–Friday)
- Coverage: 9:00 AM – 9:00 PM
- Features: daily schedule with time blocks, book & activity recommendations, progress tracking with on-screen assessments
- Deferred: meal planning, book inventory tracking, weekend schedules

---

## 2. Child Profile — Nobel

### Identity
- **Name:** Nobel
- **DOB:** November 11, 2021 (age 4)
- **Location:** Stafford, Virginia, USA
- **Family:** Lives with both parents and younger sister (16 months)
- **Status:** Home full-time (no preschool/daycare)

### Academic & Cognitive Profile

**Reading (1st–2nd grade level):**
- Reads fluently well above age level
- Strong decoding and comprehension
- Reads chapter books independently
- Completed a 1st grade activity book with no problems
- Enjoys discussing meaning, cause-and-effect, "why" questions
- Recent interests: maps, space, spring/gardening
- Curious and open to all topics
- Independent reading nightly 8–9 PM

**Math (Kindergarten–1st grade level):**
- Addition and subtraction including some double digits
- Counts well past 100
- Writes numbers; understands place value (hundreds, thousands)
- Strong number sense and pattern recognition
- Enjoys problem-solving in real contexts (money, counting, building, time)

**Writing & Expression:**
- Can write letters and words
- Forms sentences verbally and in writing with support
- Enjoys explaining ideas and narrating builds/discoveries

**Reasoning & Curiosity:**
- Asks thoughtful questions
- Understands relationships between ideas
- Enjoys building, engineering challenges, experimentation
- Becomes disengaged if content is repetitive or overly basic

### Language — Amharic
- Knows Amharic alphabet
- Early vocabulary and listening comprehension
- Goal: build conversational fluency through ~30 min daily exposure
- Parents speak English at home; Amharic practice is intentional/structured

### Social & Emotional
- Very social and cooperative
- Plays well with other children and his sister
- Enjoys structured activities and open-ended play
- Responds well to encouragement and challenge
- Benefits from movement breaks and variety

### Physical Environment & Resources

**Basement Play Area:**
- Indoor slides
- Music keyboard/piano
- Indoor trampoline
- Indoor basketball hoop
- Blocks and building toys (Legos)
- Large toy collection

**Bedroom:**
- Personal reading space
- Used for quiet time and independent reading

**Outdoor:**
- Bikes
- Access to walks, playgrounds, outdoor activities

**Books:**
- Extensive home library
- Regular library visits
- Recent topics: maps, space, spring/gardening

### Content Restrictions
- Avoid all LGBTQ-related content
- No unsupervised screen time
- Max 1 hour screen time per day with parent guidance
- Currently: TV only (< 1 hour/day), no phones

---

## 3. Daily Schedule Template

Based on Nobel's actual "perfect day" rhythm:

| Time Block | Category | Description |
|---|---|---|
| 9:00–9:30 | 🎭 Sibling Play | Guided play activity with sister |
| 9:30–10:30 | 🧩 Independent Play | Solo play in basement (building, imaginative, music) |
| 10:30–12:00 | 📚 Focused Learning | Reading, comprehension, math, activities in living room (with play breaks) |
| 12:00–12:15 | 🇪🇹 Amharic Practice | Conversational Amharic (can be during lunch prep or separate) |
| 12:15–1:00 | 🍽️ Lunch | Lunch with sister |
| 1:00–2:15 | 🎭 Afternoon Play | Basement activities — mix of group (with sister) and independent |
| 2:15–2:45 | 🚶 Outdoor Activity | Walk, playground, bike, outdoor exploration |
| 2:45–3:45 | 😴 Rest Time | Quiet time in bedroom (self-directed reading) |
| 3:45–4:00 | 🇪🇹 Amharic Practice | Second short Amharic block (conversation, vocabulary) |
| 4:00–6:15 | 🎭 Afternoon Play & Activities | Basement play, creative projects, movement |
| 6:15–6:30 | 🧹 Cleanup & Transition | Cleanup routine, transition to dinner |
| 6:30–7:30 | 🍽️ Dinner & Family | Dinner time |
| 7:30–8:00 | 🛁 Evening Routine | Bath, preparation for bed |
| 8:00–9:00 | 📖 Independent Reading | Nobel reads independently in his room |

**Notes:**
- The AI fills in the SPECIFIC activities/books/games for each block daily
- Times are approximate — app should allow ±15 min flexibility
- Sister's nap (~10:30 AM and sometimes afternoon) creates focused learning windows
- Amharic split into two ~15-min blocks for better retention
- Total structured learning: ~2.5 hours (reading, math, Amharic)
- Total active play: ~4.5 hours
- Rest + independent reading: ~2 hours

---

## 4. Feature Requirements — MVP

### 4.1 Daily Schedule Generation

**Description:** Each weekday morning, the app generates a complete day schedule populated with specific activities, book suggestions, learning exercises, and play ideas for every time block.

**Requirements:**
- AI generates fresh content daily — no repeating the same activity within a 2-week window
- Activities must be calibrated to Nobel's current developmental level
- Each time block includes:
  - Activity name
  - Brief description (1–2 sentences)
  - Materials needed (if any)
  - Learning objective (hidden from Nobel, visible to parents)
  - Difficulty indicator (for parents)
  - Category tag (reading, math, physical, creative, social, Amharic)
- Schedule follows the template rhythm but varies specific content
- Parents can mark activities as "done," "skipped," or "swapped"
- Parents can regenerate a single time block if the suggestion doesn't work

**AI Generation Logic:**
- Weekly plan generated on Sunday evening → stored in database
- Each morning at 8:00 AM, daily adjustments run:
  - Check previous day's completion data
  - Check assessment results from last session
  - Adjust difficulty if needed
  - Swap any activities based on weather (outdoor blocks) or parent feedback
- The AI prompt includes Nobel's full profile, last 7 days of activity history, and latest assessment scores

### 4.2 Book & Activity Recommendations

**Description:** The app recommends books (library or purchase) and activities (toys, games, experiences) based on Nobel's interests, reading level, and developmental goals.

**Requirements:**
- 3–5 book recommendations per week, categorized:
  - "This week's reading" (matched to current topics)
  - "Challenge read" (slightly above current level)
  - "Just for fun" (interest-based, lighter)
  - "Amharic" (bilingual or Amharic-language books)
- Each book recommendation includes:
  - Title, author, brief summary
  - Why it's recommended (connection to Nobel's interests/level)
  - Suggested reading approach (independent, read-aloud, discussion questions)
  - Availability hint (likely at library vs. purchase)
- Activity recommendations (2–3 per week):
  - Toys, kits, or materials that support current learning goals
  - Free/low-cost preferred but not required
  - DIY activities using household items
- Recommendations refresh weekly and avoid repeats

### 4.3 Progress Tracking & Adaptive Assessment

**Description:** The app presents game-like assessment questions directly to Nobel on screen. Results are tracked over time and used to adjust difficulty levels across all content areas.

**Requirements:**

**Assessment Design:**
- Questions framed as games/adventures, not tests
  - Example: "The astronaut needs to count the stars! Can you help?" (math)
  - Example: "This explorer found a map! Can you read what it says?" (reading)
  - Example: "What comes next in the pattern?" (reasoning)
- Visual, colorful, engaging interface — feels like play
- 5–8 questions per session
- Sessions occur 2x per week (e.g., Tuesday & Friday)
- Max 10–15 minutes per assessment session
- Covers: reading comprehension, math skills, pattern recognition, vocabulary, Amharic basics
- Difficulty auto-adjusts based on performance:
  - 80%+ correct → increase difficulty next session
  - 60–79% correct → maintain current level
  - Below 60% → decrease difficulty, flag for parent review

**Progress Dashboard (Parent View):**
- Current level per skill area (reading, math, reasoning, Amharic)
- Trend over time (weekly snapshots)
- Recent assessment results with detail
- AI-generated summary: "Nobel mastered double-digit addition this week. Ready to introduce basic multiplication concepts through counting groups."
- Recommendations for focus areas

**Data Model for Assessments:**
```
assessment_sessions:
  - id
  - date
  - skill_area (reading | math | reasoning | amharic | vocabulary)
  - questions[] (question_text, correct_answer, nobel_answer, is_correct, difficulty_level)
  - score_percentage
  - difficulty_level_at_time
  - ai_notes (generated summary)

skill_levels:
  - skill_area
  - current_level (1-10 scale)
  - last_updated
  - history[] (date, level, trigger)
```

---

## 5. Data Model

### Core Entities

```
-- CHILD PROFILE (single record for MVP, multi-child for scale)
child_profiles:
  id                UUID PRIMARY KEY
  name              TEXT
  date_of_birth     DATE
  reading_level     TEXT          -- e.g., "1st-2nd grade"
  math_level        TEXT          -- e.g., "K-1st grade"
  amharic_level     TEXT          -- e.g., "alphabet, early vocabulary"
  interests         TEXT[]        -- e.g., ["maps", "space", "gardening"]
  learning_style    TEXT          -- e.g., "hands-on, real-world, play-based"
  content_restrictions TEXT[]     -- topics to avoid
  physical_resources TEXT[]       -- available equipment/spaces
  screen_time_limit_minutes INT  -- 60
  created_at        TIMESTAMP
  updated_at        TIMESTAMP

-- WEEKLY PLANS
weekly_plans:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  week_start_date   DATE          -- Monday of the week
  generated_at      TIMESTAMP
  ai_prompt_used    TEXT          -- for debugging/iteration
  ai_response_raw   JSONB         -- full AI response stored
  status            TEXT          -- draft | active | completed

-- DAILY SCHEDULES
daily_schedules:
  id                UUID PRIMARY KEY
  weekly_plan_id    UUID REFERENCES weekly_plans
  child_id          UUID REFERENCES child_profiles
  date              DATE
  generated_at      TIMESTAMP
  adjusted_at       TIMESTAMP     -- last daily adjustment
  status            TEXT          -- upcoming | active | completed

-- TIME BLOCKS (the individual activities)
time_blocks:
  id                UUID PRIMARY KEY
  daily_schedule_id UUID REFERENCES daily_schedules
  start_time        TIME
  end_time          TIME
  category          TEXT          -- sibling_play | independent_play | focused_learning | amharic | lunch | outdoor | rest | reading | dinner | routine
  activity_name     TEXT
  description       TEXT
  materials_needed  TEXT[]
  learning_objective TEXT         -- parent-facing
  difficulty        TEXT          -- easy | moderate | challenging
  tags              TEXT[]        -- e.g., ["math", "fine-motor", "creative"]
  status            TEXT          -- pending | done | skipped | swapped
  parent_notes      TEXT          -- optional freeform notes
  completed_at      TIMESTAMP

-- BOOK RECOMMENDATIONS
book_recommendations:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  week_start_date   DATE
  title             TEXT
  author            TEXT
  summary           TEXT
  why_recommended   TEXT
  reading_approach  TEXT          -- independent | read-aloud | discussion
  category          TEXT          -- this_week | challenge | fun | amharic
  availability_hint TEXT          -- library_likely | purchase | free_online
  status            TEXT          -- recommended | reading | completed | skipped

-- ACTIVITY RECOMMENDATIONS
activity_recommendations:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  week_start_date   DATE
  name              TEXT
  description       TEXT
  category          TEXT          -- toy | kit | diy | experience
  estimated_cost    TEXT          -- free | under_10 | under_25 | over_25
  learning_connection TEXT
  url               TEXT          -- optional purchase/info link
  status            TEXT          -- recommended | acquired | completed | skipped

-- ASSESSMENT SESSIONS
assessment_sessions:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  date              DATE
  skill_area        TEXT
  difficulty_level  INT           -- 1-10
  questions         JSONB         -- array of question objects
  score_percentage  DECIMAL
  ai_summary        TEXT
  created_at        TIMESTAMP

-- SKILL LEVELS (running tracker)
skill_levels:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  skill_area        TEXT          -- reading | math | reasoning | amharic | vocabulary
  current_level     INT           -- 1-10
  level_history     JSONB         -- [{date, level, trigger}]
  updated_at        TIMESTAMP

-- ACTIVITY LOG (what was actually done for AI memory)
activity_log:
  id                UUID PRIMARY KEY
  child_id          UUID REFERENCES child_profiles
  date              DATE
  time_block_id     UUID REFERENCES time_blocks
  actual_activity   TEXT          -- what actually happened (may differ from plan)
  engagement_level  TEXT          -- high | medium | low (parent-reported)
  notes             TEXT
```

---

## 6. AI Prompt Architecture

### 6.1 Weekly Plan Generation Prompt

This prompt runs Sunday evening to generate the skeleton for the upcoming week.

```
SYSTEM PROMPT:

You are Nobel's Daily Guide — an expert early childhood development AI
specializing in gifted/advanced preschoolers. Your job is to create a
complete weekly plan for Nobel, a 4-year-old boy with abilities
significantly above age level.

CHILD PROFILE:
{child_profile JSON — full profile from database}

CURRENT SKILL LEVELS:
{skill_levels — latest from database}

RECENT ASSESSMENT RESULTS:
{last 2 assessment sessions with scores and AI summaries}

ACTIVITY HISTORY (last 14 days):
{activity_log — list of activities done in last 2 weeks to avoid repeats}

BOOKS READ RECENTLY:
{book_recommendations where status = completed, last 30 days}

DAILY SCHEDULE TEMPLATE:
{the time block template from Section 3}

CONSTRAINTS:
- Generate plans for Monday through Friday only
- Follow the daily schedule template for time blocks
- NEVER repeat an activity that appears in the 14-day history
- Calibrate all content to current skill levels
- Include variety across the week: rotate between math, reading, science,
  creative, music, engineering/building activities
- Include 2 assessment sessions (Tuesday and Friday) during the
  10:30 AM focused learning block
- Suggest 3-5 books for the week with reading approach
- Suggest 2-3 activity/toy recommendations
- Each focused learning block should have a specific learning objective
- Amharic blocks should progress conversationally (not just alphabet drills)
- Outdoor activities should vary (walk, playground, bike, nature explore)
- Independent play suggestions should leverage available equipment
  (trampoline, basketball, keyboard, Legos, blocks, slides)
- Sibling play suggestions must be appropriate for a 16-month-old
  participating alongside a 4-year-old
- Content must avoid: {content_restrictions from profile}

OUTPUT FORMAT:
Return a JSON object with this structure:
{
  "week_start": "YYYY-MM-DD",
  "theme_of_week": "optional loose theme connecting activities",
  "daily_schedules": {
    "monday": {
      "time_blocks": [
        {
          "start_time": "09:00",
          "end_time": "09:30",
          "category": "sibling_play",
          "activity_name": "...",
          "description": "...",
          "materials_needed": [],
          "learning_objective": "...",
          "difficulty": "moderate",
          "tags": ["social", "motor"]
        }
      ]
    },
    // ... tuesday through friday
  },
  "book_recommendations": [
    {
      "title": "...",
      "author": "...",
      "summary": "...",
      "why_recommended": "...",
      "reading_approach": "independent",
      "category": "this_week",
      "availability_hint": "library_likely"
    }
  ],
  "activity_recommendations": [
    {
      "name": "...",
      "description": "...",
      "category": "diy",
      "estimated_cost": "free",
      "learning_connection": "..."
    }
  ],
  "developmental_notes": "Brief AI summary of focus areas for the week"
}
```

### 6.2 Daily Adjustment Prompt

Runs each morning at 8:00 AM to refine today's schedule.

```
SYSTEM PROMPT:

You are reviewing today's pre-generated schedule for Nobel and making
adjustments based on recent data.

TODAY'S PLANNED SCHEDULE:
{today's time_blocks from weekly plan}

YESTERDAY'S RESULTS:
{yesterday's time_blocks with status and parent notes}

LATEST ASSESSMENT (if taken yesterday):
{assessment results}

CURRENT SKILL LEVELS:
{skill_levels}

ADJUSTMENT RULES:
- If yesterday's activity was marked "skipped" → suggest alternative
  in same category today
- If engagement_level was "low" on a category → swap to different
  approach (e.g., if worksheet math was low engagement, switch to
  hands-on math game)
- If assessment showed skill level change → adjust difficulty of
  related activities
- If weather is bad → swap outdoor blocks to indoor alternatives
- Keep overall daily balance intact (don't add extra screen time,
  maintain movement breaks)

OUTPUT: Return adjusted time_blocks array for today only, with a
brief "adjustment_reasoning" string.
```

### 6.3 Assessment Question Generation Prompt

Runs when an assessment session is triggered (Tuesday & Friday).

```
SYSTEM PROMPT:

You are creating a fun, game-themed assessment for Nobel (age 4,
advanced learner). The questions should feel like play, not a test.

SKILL AREA: {skill_area}
CURRENT LEVEL: {current_level}
PREVIOUS QUESTIONS (last 2 sessions in this area):
{to avoid repetition}

DESIGN RULES:
- Generate 6 questions (mix of difficulty: 2 easy, 3 moderate, 1 hard)
- Frame each question with a fun narrative/adventure theme
  (space exploration, treasure maps, animal rescue, building cities)
- Nobel can read the questions himself — use clear, simple language
- Include visual elements where possible (describe images to render)
- For math: use real-world contexts (counting stars, sharing cookies,
  measuring things)
- For reading: short passages with comprehension questions
- For Amharic: audio-supported vocabulary and simple phrases
- For reasoning: patterns, sequences, categorization, cause-and-effect
- Multiple choice (3-4 options) for easy scoring
- One open-ended question per session (parent records answer)

OUTPUT FORMAT:
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
}
```

### 6.4 Progress Summary Generation Prompt

Runs weekly (Sunday) to generate parent-facing developmental insights.

```
SYSTEM PROMPT:

You are generating a weekly developmental summary for Nobel's parents.
Be specific, encouraging, and actionable.

ASSESSMENT DATA (this week):
{all assessment sessions from the week}

ACTIVITY COMPLETION DATA:
{time_blocks with statuses for the week}

SKILL LEVEL CHANGES:
{skill_levels with history}

PARENT NOTES:
{any notes from time_blocks}

OUTPUT:
{
  "week_summary": "Plain language summary of the week",
  "achievements": ["specific things Nobel did well"],
  "growth_areas": ["areas showing improvement"],
  "focus_next_week": ["recommended focus areas"],
  "skill_updates": {
    "reading": { "level": 6, "change": "+1", "note": "..." },
    "math": { "level": 5, "change": "0", "note": "..." }
  },
  "parent_tips": ["1-2 specific suggestions for parents"]
}
```

---

## 7. Tech Stack & Architecture

### Frontend
- **React** (Vite scaffolded)
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** or React Context for state management
- Responsive design — works on phone and desktop

### Backend
- **Supabase** (PostgreSQL + Auth + Realtime)
  - Database: all tables from Section 5
  - Auth: email/password login (both parents share or have individual accounts)
  - Row Level Security: scope all queries to authenticated user's child_id
  - Cron: Supabase Edge Functions for scheduled generation

### AI
- **Anthropic API** (Claude Sonnet for generation, cost-efficient for daily calls)
  - Weekly plan generation: ~1 call/week (large prompt, large response)
  - Daily adjustment: ~5 calls/week (smaller prompt)
  - Assessment generation: ~2 calls/week
  - Progress summary: ~1 call/week
  - Estimated: ~40 API calls/month

### Hosting
- **Vercel** (free tier) for React frontend
- **Supabase** (free tier) for backend
- **Supabase Edge Functions** for scheduled tasks and API calls

### Architecture Diagram

```
┌─────────────────┐     ┌──────────────────┐
│  React Frontend │────▶│  Supabase Auth   │
│  (Vercel)       │     └──────────────────┘
│                 │
│  - Schedule View│     ┌──────────────────┐
│  - Assessment UI│────▶│  Supabase DB     │
│  - Progress Dash│     │  (PostgreSQL)    │
│  - Book Recs    │     └──────────────────┘
└────────┬────────┘              │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  Supabase Edge  │────▶│  Anthropic API   │
│  Functions      │     │  (Claude Sonnet) │
│                 │     └──────────────────┘
│  - Weekly Gen   │
│  - Daily Adjust │
│  - Assessment   │
│  - Progress Sum │
└─────────────────┘
```

---

## 8. App Screens & Navigation

### 8.1 Today View (Home Screen)
- Date displayed prominently
- Scrollable timeline of today's time blocks
- Each block shows: time, activity name, category icon, brief description
- Tap to expand: full description, materials needed, learning objective
- Status buttons: ✅ Done | ⏭️ Skip | 🔄 Swap (regenerate this block)
- Optional: parent notes field per block
- Top banner: "Good morning! Today's theme: Ocean Explorers 🌊"

### 8.2 Week View
- Monday–Friday tab bar or horizontal scroll
- Condensed view of each day's key activities
- Color-coded by category
- Tap any day to navigate to its detailed schedule

### 8.3 Assessment Screen
- Accessed from the schedule when an assessment block is active
- Full-screen, colorful, game-like interface
- Large text Nobel can read himself
- Visual question presentation (illustrations, icons)
- Tap-to-select answers (large touch targets)
- Progress indicator (question 3 of 6)
- Encouraging feedback after each question (not right/wrong — just "Great job!" or "Let's try another one!")
- Results saved automatically; parent summary available after

### 8.4 Progress Dashboard (Parent View)
- Skill level cards (reading, math, reasoning, Amharic, vocabulary)
- Trend charts (weekly level over time)
- This week's assessment results
- AI-generated weekly summary
- Recommendations for focus areas

### 8.5 Book & Activity Recommendations
- This week's book picks with details
- Activity suggestions with materials/cost
- Status tracking: recommended → reading → completed
- "Get more like this" button for books Nobel enjoyed

### 8.6 Settings
- Nobel's profile (editable interests, levels, restrictions)
- Schedule template (adjust time blocks)
- Notification preferences
- Assessment frequency
- Parent account management

---

## 9. Claude Code Implementation Plan

### Phase 1: Foundation (Day 1–2)
```bash
# Step 1: Project scaffold
# Prompt: "Create a new React + Vite + Tailwind project called
# nobel-daily-guide. Set up React Router with routes for:
# /today, /week, /assess, /progress, /books, /settings.
# Create a clean layout with bottom tab navigation."

# Step 2: Supabase setup
# Prompt: "Set up Supabase client configuration. Create all
# database tables from this schema: [paste Section 5 data model].
# Set up Row Level Security policies. Create auth with
# email/password."

# Step 3: Seed Nobel's profile
# Prompt: "Create a seed script that populates the child_profiles
# table with Nobel's full profile and initializes skill_levels
# at: reading=6, math=5, reasoning=5, amharic=2, vocabulary=6."
```

### Phase 2: Schedule Engine (Day 3–4)
```bash
# Step 4: Weekly generation
# Prompt: "Create a Supabase Edge Function called generate-weekly-plan
# that calls the Anthropic API with this system prompt: [paste 6.1].
# It should read Nobel's profile and recent data from the database,
# generate the plan, and store it in weekly_plans and daily_schedules
# tables. Schedule it to run Sunday at 8 PM ET."

# Step 5: Daily adjustment
# Prompt: "Create a Supabase Edge Function called adjust-daily-schedule
# that runs at 8 AM ET weekdays. It reads yesterday's results and
# today's planned schedule, calls the Anthropic API with this prompt:
# [paste 6.2], and updates today's time_blocks."

# Step 6: Today View UI
# Prompt: "Build the Today View screen. It should fetch today's
# daily_schedule and display time blocks as a scrollable timeline.
# Each block shows time, category icon, activity name, description.
# Tap to expand for details. Include Done/Skip/Swap buttons."
```

### Phase 3: Assessments (Day 5–6)
```bash
# Step 7: Assessment generation
# Prompt: "Create a Supabase Edge Function called generate-assessment
# that creates a game-themed assessment session using this prompt:
# [paste 6.3]. Store questions in assessment_sessions table."

# Step 8: Assessment UI
# Prompt: "Build the Assessment screen — a full-screen, colorful,
# game-like interface. Large text, big touch targets, fun theme
# (space/adventure). Show one question at a time with a progress
# bar. Record answers and calculate score. Show encouraging
# animations between questions."

# Step 9: Scoring & level adjustment
# Prompt: "After an assessment is completed, calculate the score
# and update skill_levels: 80%+ → level up, 60-79% → maintain,
# below 60% → level down and flag for parent review."
```

### Phase 4: Progress & Recommendations (Day 7–8)
```bash
# Step 10: Progress Dashboard
# Prompt: "Build the Progress Dashboard with skill level cards,
# trend charts using Recharts, latest assessment results, and
# the AI-generated weekly summary."

# Step 11: Weekly summary generation
# Prompt: "Create a Supabase Edge Function called generate-weekly-summary
# using this prompt: [paste 6.4]. Run Sunday morning before the
# new weekly plan generates."

# Step 12: Book & Activity Recommendations UI
# Prompt: "Build the Books & Activities screen showing this week's
# recommendations from the weekly plan. Each book shows title,
# author, summary, and a status selector (recommended/reading/completed)."
```

### Phase 5: Polish (Day 9–10)
```bash
# Step 13: Settings screen
# Prompt: "Build Settings with editable child profile, schedule
# template customization, and assessment frequency toggle."

# Step 14: Auth flow
# Prompt: "Add login/signup screens. After login, check if a child
# profile exists. If not, run a setup wizard that collects the
# child's information."

# Step 15: Manual trigger buttons
# Prompt: "On the Settings screen, add manual trigger buttons for:
# Generate This Week's Plan, Adjust Today's Schedule, Start Assessment.
# These call the Edge Functions on demand for testing."

# Step 16: Responsive polish
# Prompt: "Ensure all screens work well on mobile (375px width)
# and desktop. Assessment screen should be optimized for tablet
# size. Add loading states, error handling, and empty states."
```

---

## 10. Future Roadmap (Post-MVP)

### v1.1 — Quality of Life
- Book inventory: log books you own, recommendations work around them
- Meal planning integration
- Weather-aware outdoor activity swaps (API integration)
- Print-friendly daily schedule view

### v1.2 — Engagement
- Nobel's own dashboard (simple, visual, showing his "missions")
- Achievement badges and streaks
- Voice narration for assessment questions
- Photo journal: parents can attach photos to completed activities

### v1.3 — Scale
- Multi-child support (add sister as she grows)
- Weekend activity suggestions (lighter, family-focused)
- Community: share activity ideas between families
- Generalized onboarding for new families

### v2.0 — Product
- Subscription model for other families
- Customizable curriculum tracks (STEM-focus, arts-focus, bilingual)
- Professional educator review/input
- Integration with library systems for book availability

---

## Appendix A: Sample Generated Day

**Monday — Week Theme: "Map Makers & Explorers"**

| Time | Activity | Details |
|---|---|---|
| 9:00–9:30 | 🎭 Treasure Map Walk | Hide 5 "treasures" around basement. Nobel draws a map for his sister to follow. She toddles along while he guides her. Materials: paper, crayons, small toys to hide. |
| 9:30–10:30 | 🧩 Lego City Builder | Build a city with Legos. Challenge: make buildings of specific heights (5 blocks, 10 blocks). Count windows and doors. Use the keyboard to compose "city music." |
| 10:30–11:15 | 📚 Reading: "Me on the Map" | Read "Me on the Map" by Joan Sweeney. Discussion: Where is our house? Our street? Virginia? Activity: Draw a simple map of our house. |
| 11:15–11:45 | 📐 Math: Map Coordinates | Simple grid game. "Go 3 squares right, 2 squares up. What did you find?" Introduce basic coordinate concepts with a treasure grid. Materials: printed grid, stickers. |
| 11:45–12:00 | 🏀 Movement Break | Basketball shooting: count makes vs. misses. "Can you make 7 out of 10?" |
| 12:00–12:15 | 🇪🇹 Amharic: Directions | Learn "left" (ግራ), "right" (ቀኝ), "up" (ላይ), "down" (ታች). Play Simon Says in Amharic with directions. |
| 12:15–1:00 | 🍽️ Lunch | — |
| 1:00–2:15 | 🎭 Cardboard Map Project | Build a 3D map of the neighborhood using cardboard, tape, markers. Sister can help with stickers. Nobel labels streets and landmarks. |
| 2:15–2:45 | 🚶 Neighborhood Walk | Walk the actual route they mapped. Nobel points out landmarks. Count houses, trees, mailboxes. |
| 2:45–3:45 | 😴 Rest Time | Suggested quiet reading: "National Geographic Little Kids First Big Book of the World" |
| 3:45–4:00 | 🇪🇹 Amharic: Colors Review | Review colors in Amharic using Lego blocks. "Give me the ቀይ (red) block." |
| 4:00–5:00 | 🎨 Creative: Pirate Map Art | Make a "pirate treasure map" — tear edges, tea-stain paper (with help), draw compass rose, X marks the spot. |
| 5:00–6:15 | 🎭 Free Play | Basement free play. Available: trampoline, slides, blocks, keyboard. |
| 6:15–6:30 | 🧹 Cleanup | "Map Explorer cleanup mission: can you find and put away 20 items in 2 minutes?" |
| 6:30–7:30 | 🍽️ Dinner | — |
| 7:30–8:00 | 🛁 Evening Routine | — |
| 8:00–9:00 | 📖 Independent Reading | Suggested: Continue chapter book or explore atlas |

---

## Appendix B: Sample Assessment Session

**Theme: Space Explorer Mission (Math — Level 5)**

**Question 1 (Easy):**
🚀 "The rocket needs exactly 15 fuel pods to launch. You loaded 8 pods. How many more do you need?"
- A) 6  B) 7  C) 8  D) 5
- ✅ B) 7

**Question 2 (Easy):**
🌙 "Count the craters: ⭕⭕⭕⭕⭕⭕⭕ and ⭕⭕⭕⭕⭕. Write the total number."
- Open response: 12
- ✅ 12

**Question 3 (Moderate):**
⭐ "The space station has 3 rooms. Each room has 4 astronauts. How many astronauts are there in total?"
- A) 7  B) 10  C) 12  D) 15
- ✅ C) 12 (introduces multiplication concept)

**Question 4 (Moderate):**
🪐 "Planet A is 24 light-years away. Planet B is 18 light-years away. How much farther is Planet A?"
- A) 4  B) 5  C) 6  D) 42
- ✅ C) 6 (double-digit subtraction)

**Question 5 (Moderate):**
🛸 "The alien collected stars in this pattern: 2, 4, 6, 8, ___. What comes next?"
- A) 9  B) 10  C) 11  D) 12
- ✅ B) 10

**Question 6 (Hard):**
🌍 "Earth has 156 satellites. Mars has 100 fewer. How many satellites does Mars have?"
- Open response: ___
- ✅ 56 (three-digit subtraction stretch)
