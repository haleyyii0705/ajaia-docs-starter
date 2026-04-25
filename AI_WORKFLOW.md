# AI Workflow Note

## Goal

Use AI assistance to accelerate implementation, debugging, and documentation while keeping all final decisions and validation under human review.

## Workflow Used

1. **Scope and requirements extraction**
   - Clarified expected deliverables (code, setup docs, architecture note, workflow note, submission note, deployment URL, and walkthrough reference).
2. **Codebase understanding**
   - Used AI-assisted search and file reading to map data flow (`UI -> hook -> repository -> Supabase`).
3. **Implementation support**
   - Used AI to draft and refine code-level fixes for environment-variable and persistence-related behavior.
4. **Deployment troubleshooting**
   - Used AI to diagnose production mismatch (local works, deployed version falls back), then validated against Vite/Supabase env conventions.
5. **Documentation generation**
   - Used AI to create structured project documents and ensure submission completeness.

## Validation and Quality Controls

- Manually reviewed AI suggestions before applying.
- Kept changes aligned with existing project structure and naming.
- Ensured documentation reflects actual code behavior (especially fallback mode and required env vars).
- Verified that required files exist in the repository root for evaluator discoverability.

## What AI Was Used For

- Rapid codebase navigation and explanation.
- Drafting documentation and checklists.
- Diagnosing likely deployment configuration gaps.

## What Was Human-Driven

- Final technical decisions and acceptance of changes.
- Supabase/Vercel configuration values.
- End-to-end sanity checks and delivery packaging.
