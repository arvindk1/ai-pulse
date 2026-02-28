import { getPulseData } from "@/lib/pulse-service";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const revalidate = 60; // optionally revalidate every minute

export default async function Home() {
  const data = await getPulseData();

  return (
    <main className="container mx-auto p-4 md:p-8 relative min-h-screen">
      <div className="absolute top-0 w-full h-[500px] bg-zinc-900/30 blur-[100px] -z-10 rounded-full pointer-events-none" />
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-50 mb-2">AI Pulse</h1>
          <p className="text-zinc-400">The Top 1% of AI Signal, aggregated in real-time.</p>
        </div>
      </header>

      <DashboardClient initialData={data} />
    </main>
  );
}
