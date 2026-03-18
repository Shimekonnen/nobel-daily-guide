# Nobel's Daily Guide

## Project Overview
AI-powered daily planning and developmental tracking app for Nobel (age 4, advanced learner). Generates personalized daily schedules, book recommendations, and adaptive assessments.

## Tech Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- AI: Anthropic API (Claude Sonnet) for content generation
- Hosting: Vercel (frontend) + Supabase (backend)

## Key Files
- docs/nobel-daily-guide-requirements.md — Full PRD with data model, AI prompts, and implementation plan
- src/pages/ — All page components
- src/components/ — Shared components
- src/lib/supabase.ts — Supabase client (to be configured)

## Design Principles
- Parent-facing UI should be clean, modern, informative
- Assessment UI (for Nobel) should be colorful, game-like, large touch targets
- Mobile-first responsive design
- Warm color palette: primary blue (#4A90D9), accent orange (#F5A623), background (#F8F9FA)

## Content Rules
- All activities calibrated to Nobel's level (reading: 1st-2nd grade, math: K-1st grade)
- Never repeat activities within a 2-week window
- Avoid LGBTQ content per parent preference
- Max 1 hour screen time per day with parent guidance
- Amharic practice: ~30 min daily split into two blocks
