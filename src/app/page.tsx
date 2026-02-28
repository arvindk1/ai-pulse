import { Suspense } from "react";
import { getPulseData } from "@/lib/pulse-service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// Strategy 1: Streaming — page shell renders instantly, data streams in
// Strategy 3: Stale-while-revalidate — Next.js serves stale cache while revalidating in background
export const revalidate = 60;
export const dynamic = "force-dynamic";

// Async server component that fetches data — will stream when resolved
async function DashboardData() {
  const data = await getPulseData();
  return <DashboardClient initialData={data} />;
}

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8 relative min-h-screen">
      <div className="absolute top-0 w-full h-[500px] bg-zinc-900/30 blur-[100px] -z-10 rounded-full pointer-events-none" />
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50 mb-2">AI Pulse</h1>
          <p className="text-zinc-400">The Top 1% of AI Signal, aggregated in real-time.</p>
        </div>
      </header>

      {/* Suspense boundary: skeleton shows immediately while data is fetched */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </main>
  );
}
