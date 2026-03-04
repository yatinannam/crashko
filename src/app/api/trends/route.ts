import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";

/**
 * GET /api/trends?days=7
 * Returns burnout logs for charting the last N days.
 * userId is always taken from the authenticated session.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const days = Math.min(30, Number(searchParams.get("days") ?? "7"));

    const db = await connectToMongo();

    if (!db) {
      return NextResponse.json({ data: [] });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await BurnoutLog.find({ userId, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .select("createdAt sleepHours studyHours stressLevel burnoutScore risk crashProbability")
      .lean();

    const seen = new Set<string>();
    const deduped = logs.filter((log) => {
      const day = (log.createdAt as Date).toISOString().split("T")[0];
      if (seen.has(day)) return false;
      seen.add(day);
      return true;
    });

    deduped.sort(
      (a, b) =>
        (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime(),
    );

    const data = deduped.map((log) => ({
      date: (log.createdAt as Date).toISOString(),
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

