# MISSION: AI PULSE v1.0
Build a real-time AI News & Tool aggregator dashboard following the **Elite User** Agentic Workflow.

## EXECUTION PARAMETERS (Anti-Slop Guardrails)
- **Review Policy**: "Request Review" (agent must stop and show artifacts/diffs before proceeding).
- **Terminal Execution**: "Request review" (no surprise commands).
- **Browser JS**: "Request review" or "Disabled" unless actively doing E2E validation.
- **Workflow Pipeline**: Adhere strictly to the 6-agent assembly line (Spec -> Design -> Code -> Test -> Docs -> Commit).
- RULE: Use `@rules/ui-vibe-standards.md` for the "Zinc/Slate" premium SaaS look.
- WORKFLOW: Initiate/plan before writing any code.
- RULE: Use @rules/no-human-intervention.md
- SKILL: Use @skills/x-pulse-fetcher to gather the raw X data.
- SKILL: Use @skills/schema-enforcer to validate the Claude 4.6 output before writing to the Edge Config.

## AGENT ROLES
1. **PM/Spec Agent**: Outputs `docs/spec.md`
2. **Architect Agent**: Outputs `docs/architecture.md` + ADRs
3. **Frontend Agent**: UI implementation + Component tests
4. **Backend Agent**: API + DB + Unit/Integration tests
5. **QA Agent**: E2E tests + test plan
6. **Docs Agent**: Always-in-sync docs

## DEFINITION OF DONE (Per Change)
1. **Spec updated** (`docs/spec.md`)
2. **Design updated** (`docs/architecture.md` + ADR)
3. **Implementation** (small testable slices)
4. **Tests added/updated**
5. **Docs updated**
6. **Commit**
7. **PR includes artifact links** (plan, diffs, test proof)