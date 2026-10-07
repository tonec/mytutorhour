# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

MyTutorHour turns a tutor's short post-lesson voice note (or typed bullets) into a structured lesson log, a parent-friendly update and next steps. The tutor reviews everything before it is sent. The audience is solo UK tutors, mostly on mobile. The repo is at a very early stage: a `create-next-app` scaffold with empty placeholders for the DB and storage clients. Product thinking lives in the Spec Kit files (see Specs below).

## Commands

```bash
npm run dev      # Next.js dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (flat config); Prettier runs as an ESLint rule
npx eslint --fix <path>   # lint and auto-format specific files
npm run test     # Vitest in watch mode
npm run test:unitRun      # Vitest single run (use before merge)
npx vitest run <path>     # run a single test file
npm run test:e2e          # Playwright E2E, all browser projects (starts or reuses the dev server)
npm run test:e2e:ui       # Playwright UI mode for debugging
npx playwright test --project=mobile   # one project: chromium | firefox | webkit | mobile
npx playwright install    # one-off: download the browser binaries
npx supabase start        # start the local Supabase stack (Docker)
npm run db:reset          # local only: reapply migrations and load supabase/seed.sql
npm run db:types          # regenerate src/lib/supabase/database.types.ts after a migration
npx supabase test db      # pgTAP database tests (RLS and data rules)
```

`supabase/seed.sql` creates a local test tutor, `tutor@example.test` / `password123`, with 9 families, 25 students (20 children, 5 adults) and 6 tags for manual testing. E2E tests don't use it: each test signs up its own throwaway tutor.

Unit tests use Vitest + React Testing Library (`vitest.config.mts`, `vitest.setup.ts`), colocated as `src/**/*.test.ts(x)`. Tests import `describe`/`it`/`expect` from `vitest` explicitly (no globals). Vitest can't render `async` Server Components, so cover those with E2E tests.

E2E tests live in `e2e/*.spec.ts` (`playwright.config.ts`). They run against desktop Chromium, Firefox and WebKit plus a `mobile` project (iPhone SE, 375px wide). The dev server reads `.env.local`, so the Supabase env vars must be set; in CI they must be provided as secrets, and `CI=1` starts a fresh server instead of reusing one.

## Stack and code layout

- **Next.js 16 App Router + React 19**, TypeScript strict, Tailwind CSS v4 (via `@tailwindcss/postcss`; no `tailwind.config`). Source lives in `src/`, and the `@/*` path alias maps to `src/*`. As AGENTS.md says, check `node_modules/next/dist/docs/` before using Next.js APIs.
- **Supabase** (Postgres + Auth) and **Cloudflare R2** (file storage), hosted on Cloudflare via vinext. `src/lib/db.ts` and `src/lib/storage/client.ts` are empty placeholders for those clients. Every table needs row-level security scoped to `tutor_id = auth.uid()`. The Supabase secret key (`sb_secret_…`, which replaces the legacy service-role key) is server-side only; app code never reads it, and only the E2E fixtures use it (as `SUPABASE_SECRET_KEY`).
- Env files (`.env*`) are gitignored. Claude is denied read access to them in `.claude/settings.json`.
- Formatting (`.prettierrc`): single quotes, semicolons, 100-column lines, ES5 trailing commas, LF line endings.

## Specs (source of truth for product decisions)

Product decisions live in Spec Kit files. Read these before building features:

- `.specify/memory/constitution.md`: the project principles and quality gates. It overrides other guidance.
- `specs/001-student-list/`: students (adult or child), families and tags. Built first.
- `specs/002-voice-note-to-update/`: the voice note → lesson log and parent update flow.

Each feature folder holds `spec.md` (numbered FR/SC IDs; use them when referring to requirements) and, once planned, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md` and `tasks.md`. `.specify/feature.json` points to the feature currently being worked on.

## Product rules that shape the code

These come from the constitution and specs and are hard requirements, not nice-to-haves:

- **Nothing reaches a parent without explicit tutor approval.** A parent update moves through `draft` → `approved` → `sent`/`copied`, and only `approved` content can be sent or copied.
- **Tutor private notes are never included in parent updates**, analytics or logs. This holds even after a regenerate.
- **The LLM must not invent facts.** If something isn't mentioned, leave the field empty or null. Validate LLM output against the spec's JSON schema; if it fails, retry once and then show an error with the transcript preserved.
- **Audio is transient.** Delete it after a successful transcription and keep only the transcript and outputs.
- **Children's data:** collect the minimum, prefer UK/EU data residency, isolate every row per tutor, and keep student data out of error logs and analytics.
- Transcription and generation run as **async jobs** that show their status (`uploading` → `transcribing` → `generating` → `ready`). Prompts are versioned in the repo.
- **Mobile-first:** fully usable at 375px wide, with WCAG 2.2 AA on core flows.

## Testing Standards

### Unit Testing Rules

- Framework: Vitest and Jest
- Pattern: Always follow Arrange-Act-Assert (AAA) structure.
- Isolation: Mock external network calls and database dependencies. Prefer real instances over over-mocking internal logic.

### E2E Testing Rules

- Framework: Playwright (separate `e2e/` folder, cross-browser)
- Selectors: Priority must be `data-testid` > `role` > `text`. Never use brittle CSS classes or internal database IDs.
- Execution: Always spin up the local development server automatically before executing E2E tests.
- Prohibited: Never use hardcoded `sleep()` or `waitForTimeout()`. Rely strictly on event-driven assertions.

## Common Commands

```bash
  npm run test:unitRun  # Run unit tests
  npm run test:e2e      # Run e2e (same as npx playwright test)
```
