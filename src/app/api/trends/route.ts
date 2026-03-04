import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";

/**
 * GET /api/trends?userId=anon&days=7
 * Returns burnout logs for charting the last N days.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") ?? "anon";
    const days = Math.min(30, Number(searchParams.get("days") ?? "7"));

    const db = await connectToMongo();

    // Return empty data gracefully when DB is not configured
    if (!db) {
      return NextResponse.json({ data: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await BurnoutLog.find({ userId, createdAt: { $gte: since } })
      .sort({ createdAt: -1 }) // newest first so we pick latest per day
      .select("createdAt sleepHours studyHours stressLevel burnoutScore risk crashProbability")
      .lean();

    // Deduplicate: keep only the latest entry per calendar day
    const seen = new Set<string>();
    const deduped = logs.filter((log) => {
      const day = (log.createdAt as Date).toISOString().split("T")[0];
      if (seen.has(day)) return false;
      seen.add(day);
      return true;
    });

    // Re-sort ascending for chart display
    deduped.sort(
      (a, b) =>
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime(),
    );

    const data = deduped.map((log) => ({
      date: (log.createdAt as Date).toISOString(), // full timestamp — client formats in local TZ
      sleepHours: log.sleepHours,
      studyHours: log.studyHours,
      stressLevel: log.stressLevel,
      burnoutScore: log.burnoutScore,
      risk: log.risk,
      crashProbability: log.crashProbability,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[trends] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
