# RegiFlow MVP

Post-completion orchestration tool for conveyancers.

## Quick Start

1. Create a Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in the Supabase SQL editor
3. `cp .env.example .env.local` and fill in your keys
4. `npm install`
5. `npm run dev` → http://localhost:3000

## Human-in-the-Loop Notes

- AP1 checklist items are manually ticked; no auto-submission yet
- SDLT countdown is calculated from `completion_date` + 14 calendar days
- Requisitions are manually entered; AI extraction planned for v2

## AI Extraction (Planned)

- Upload completion statement / title docs → parse via LLM
- Auto-populate matter fields and flag requisitions
