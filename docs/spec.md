Spec: AI Pulse (v1.0) — "The Signal in the Noise"

Goal: A high-performance, real-time dashboard aggregating the "Top 1% of AI" (Releases, Models, and Tweets) paired with a low-latency voice-first interactive agent.

## 0. Product Definition

**Problem Statement**
AI engineers and researchers are overwhelmed by noise across X, GitHub, and Hugging Face. Important releases are lost in the feed.

**Success Metrics**
- Quick time to value (Users see immediate signal-to-noise improvement).
- Low latency (<500ms TTFB) on Voice interactions.
- Zero hydration or console errors.

**User Stories & Acceptance Criteria**
- **US 1:** As a user, I want to see a curated feed of top AI news so I don't miss important updates.
  - *AC 1.1:* Feed only contains items scored > 8 by the LLM filter.
  - *AC 1.2:* Items display a "Bottom Line" summary instead of just raw text.
- **US 2:** As a user, I want to ask "What's new?" and get a fast voice summary.
  - *AC 2.1:* Voice agent responds in <500ms using ElevenLabs WebSocket integration.
  - *AC 2.2:* Voice agent uses the current dashboard state as its "Ephemeral Memory".
- **US 3:** As a user, I want to see trending GitHub AI repos and Hugging Face models.
  - *AC 3.1:* 'Model Forge' bento box displays new AI repos with star velocity and AI summary.
  - *AC 3.2:* Hugging Face updates show model name, download counts, and capability breakdown.
- **US 4:** As a user, I want the UI to be visually stunning and responsive.
  - *AC 4.1:* Uses "Premium Dark" aesthetic (Tailwind Slate-950/900).
  - *AC 4.2:* No hydration or console errors on load.

**Non-Goals**
- Do NOT build user authentication or settings pages.
- Do NOT maintain long-term multi-day user sessions.
- Do NOT build a general-purpose chat interface (only "Read to me" summaries).

**Constraints**
- Latency and cost-efficiency (fluid compute).
- No heavy RDBMS for primary feed (use Redis/JSON for O(1) reads).

1. Core Features (v1.0)

1.1 The Aggregator (The "Signal" Layer)

Autonomous Scanning:

X (Twitter): Whitelist-based monitoring of "God-tier" AI researchers (e.g., Karpathy, Altman, Lecun, Hassabis).

GitHub: Tracking trending repositories filtered by the AI and Machine Learning topics.

Hugging Face: Daily "Trending" models and datasets.

Noise Filter: A background worker (Inngest or Vercel Cron) that uses gemini-2.0-flash to score items 1-10 on "Industry Impact." Only scores > 8 reach the dashboard.

1.2 The "Why it Matters" Engine

Semantic Summarization: Instead of headlines, the UI displays a "Bottom Line" (e.g., "Reduces VRAM requirements for 70B models by 40% via 4-bit quantization optimization").

1.3 Bento-Grid UI

Design Language: "Premium Dark" (Tailwind Slate-950/900).

Command Blocks: * News Pulse: Vertical ticker of high-impact tweets.

Model Forge: New HF/GitHub releases with star/download velocity.

Tool Lab: New AI productivity tools or frameworks.

1.4 Voice Interactivity (The "Pulse Agent")

Latency Target: < 500ms for "Time to First Word."

Behavior: Floating orb component with VAD (Voice Activity Detection). Supports interruption and maintains context of the current dashboard view.

2. Technical Stack & Implementation

Component

Technology

Reasoning

Framework

Next.js 16 (Canary)

App Router, Server Actions, and React Server Components.

Hosting

Vercel

Fluid Compute for agentic bursts and AI Gateway for caching LLM prompts.

AI Orchestration

Vercel AI SDK 4.0+

Unified stream handling for both text and voice sockets.

Voice

ElevenLabs (Conversational AI)

Best-in-class low-latency WebSockets with interruptible audio.

Database

Supabase (PostgreSQL)

Using pgvector for RAG-based search over archived news.

Cache/Memory

Upstash Redis

Extremely low latency for "Thread Memory" and rate-limiting scrapers.

3. Memory & State Architecture

To ensure the agent isn't "forgetful," we implement a tri-tier memory system:

Ephemeral (24h Window): Current dashboard data stored in Redis. The agent's "Primary Context."

Short-term (Thread Memory): The last 10 turns of the current conversation. Managed via Vercel AI SDK useChat or useConversation hooks.

Long-term (Vector Store): Semantic search over the last 30 days of scans. Used for comparative questions (e.g., "How is this different from the DeepSeek release last Tuesday?").

4. Roadmap

Phase

Focus

Key Deliverables

v1.0 (MVP)

Foundational Signal

X/GH Scrapers, Shadcn Bento-Grid, Voice "Listen/Respond."

v2.0 (Analyst)

Deep Intelligence

Perplexity API integration for "Deep Search," Sentiment tracking.

v3.0 (Executor)

Actionable AI

"One-click Sandbox" (deploying model demos directly to Vercel/Replicate).

5. ADE "Elite" Configuration

Rule: enforce-shadcn-premium.md

Use framer-motion for all transitions.

Enforce glassmorphism on the Pulse Agent orb.

Standardize on Lucide-React for icons.

Workflow: /build-pulse

Scaffold: npx create-next-app@canary --typescript --tailwind --eslint.

SDK Init: Install @ai-sdk/openai, @elevenlabs/client, and upstash/redis.

Core Socket: Implement the ElevenLabs Conversation instance as a Global Provider.

Self-Heal: Run next lint and tsc checks on every component generation.