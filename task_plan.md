# The Pipeline (Elite User Workflow)

This project strictly follows the 6-agent, artifact-first pipeline where "Spec > Design" is a hard gate before writing any code. Code is implemented in small, testable slices.

## 0. Initial Setup [x]
- [x] Configure ADE Agent Anti-Slop guardrails (Request Review for Terminal, Browser, and overall Review policy).
- [x] Create core directories (`docs/`, `docs/adrs/`).
- [x] Move existing documentation into pipeline structure.

## 1. Specification (PM Agent) [ ]
- [ ] Ensure `docs/spec.md` includes Problem Statement, Success Metrics, User Stories, Non-Goals, and Constraints.
- [ ] Define precise Acceptance Criteria for the AI Pulse Dashboard.

## 2. Design (Architect Agent) [ ]
- [ ] Define API contracts / schemes in `docs/architecture.md`.
- [ ] Define DB model / storage approach.
- [ ] Identify Failure modes (retries on LLM calls, scrape failures).
- [ ] Log major technical decisions in `docs/adrs/`.

## 3. Implementation (FE/BE Agents) [ ]
Implementation happens in parallel or sequentially based on slices.
- [ ] Slice 1: The Aggregator Data Layer (Vercel Cron + LLM processing)
- [ ] Slice 2: The UI Bento Grid (Next.js 16 + Tailwind)
- [ ] Slice 3: The Voice Agent (ElevenLabs Integration)

## 4. Verification (QA Agent) [ ]
- [ ] Format/Lint checks
- [ ] Unit & Integration tests for LLM functions
- [ ] E2E smoke tests for the dashboard view
- [ ] Agent proof artifact provided on completion

## 5. Documentation (Docs Agent) [ ]
- [ ] Keep `README.md` in sync.
- [ ] Ensure "How to run" takes < 10 minutes for a new engineer.