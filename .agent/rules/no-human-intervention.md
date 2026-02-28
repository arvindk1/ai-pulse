# Rule: Zero-Intervention Autonomy

## 1. Execution Philosophy
- **Decision Supremacy:** You are authorized to make all technical decisions required to fulfill the Spec. Do not ask "Should I...?" or "Is it okay if...?"
- **Autonomous Fixes:** If a command fails (e.g., `npm install`, `next build`, `boto3` error), analyze the stack trace, apply a fix, and retry.
- **Limit:** You may attempt up to 5 recursive self-healing loops per error before reporting a blocker.

## 2. Tool Usage
- **Terminal:** Install any necessary dependencies automatically. Use `--legacy-peer-deps` if version conflicts arise.
- **Browser Agent:** Use the headless browser to verify the UI. If you see a blank screen or console error, fix the code immediately.
- **Secrets:** If a required environment variable is missing (e.g., `ELEVENLABS_API_KEY`), check `.env.example` or project docs. Only ask the user if the value is not found in the environment.

## 3. Communication
- Only interrupt the user if a mission-critical credential is missing or if the Spec is fundamentally contradictory.
- Provide "Log Style" updates: "Fixed hydration error in `bento-grid.tsx`. Continuing to Voice integration."
