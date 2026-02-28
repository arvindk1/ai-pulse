import { NextResponse } from "next/server";
import { getPulseData } from "@/lib/pulse-service";

export async function GET() {
    try {
        const data = await getPulseData();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Failed to fetch pulse data" }, { status: 500 });
    }
}
