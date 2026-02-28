# ADR 0001: Use Next.js 16 App Router & React Server Components

## Context
AI Pulse requires a low-latency, high-performance UI capable of streaming real-time AI API responses, handling Voice WebSockets, and rendering a highly interactive Bento Grid UI without client-side bloating.

## Decision
We will use Next.js 16 (Canary) with the App Router architecture.
- **Data Fetching:** React Server Components (RSC) to fetch Redis data directly on the server, ensuring zero-hydration mismatches and delivering HTML instantly to the client.
- **Intergalactic Mutations:** Server Actions for handling UI updates (like triggering on-demand scrapes or refreshing data).
- **Hosting:** Vercel to leverage Edge Network for low-latency Voice API routing and Upstash Redis caching.

## Consequences
**Positive:**
- Dramatically reduced client bundle size.
- Improved LCP (Largest Contentful Paint) and TTFB (Time to First Byte).
- Native integration with Vercel's AI SDK 4.0 for streaming responses.

**Negative:**
- Steeper learning curve for strict Client/Server component boundaries.
- Canary builds may occasionally contain upstream bugs (mitigated by strict version locking).
