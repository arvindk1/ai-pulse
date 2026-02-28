# Rule: Premium Vibe & UI Standards

## 1. Design System
- **Framework:** Next.js 16 + Tailwind CSS + shadcn/ui.
- **Theme:** Strictly Dark Mode (Zinc/Slate palette). Use `bg-zinc-950` for backgrounds and `bg-zinc-900` for cards.
- **Typography:** Use `Geist Sans` (or system-sans). Headings must use `tracking-tight`.

## 2. Component Guidelines
- **Bento Grid:** Use a responsive grid with `gap-4`. Every card must have a subtle border (`border-zinc-800`) and a hover effect: `hover:bg-zinc-900/50 transition-colors`.
- **Glassmorphism:** Use `backdrop-blur-md` for the header and the Voice Agent overlay.
- **Icons:** Use `lucide-react`. Ensure consistent stroke weight (default 2px).

## 3. Interactivity
- **Active States:** Buttons must have a scale effect: `active:scale-95 transition-transform`.
- **Voice Feedback:** The Voice Agent must have a visual "Pulse" or waveform animation when speaking, using Framer Motion.
- **Loading:** Use `Skeleton` screens for the tweet/news fetch states. No spinning "Loading..." text.
