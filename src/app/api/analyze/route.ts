import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";
import { computeBurnout } from "@/lib/burnoutEngine";
import { callGroq } from "@/lib/groqClient";
import { burnoutInputSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate limit: 8 analyses per minute per user
    if (!rateLimit(`analyze:${userId}`, 8, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 },
      );
    }

    const body = await req.json();

    // Validate input (userId is read from session, not request body)
    const parsed = burnoutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { sleepHours, studyHours, stressLevel, tasksPending, deadlinesSoon } =
      parsed.data;

    const db = await connectToMongo();

    // Fetch last 7 days for pattern analysis (skip if DB unavailable)
    const last7 = db
      ? await BurnoutLog.find({ userId }).sort({ createdAt: -1 }).limit(7).lean()
      : [];

    // Compute burnout score
    const result = computeBurnout({
      sleepHours,
      studyHours,
      stressLevel,
      tasksPending,
      deadlinesSoon,
      lastNdays: last7,
    });

    // Persist log only when DB is available
    if (db) {
      await BurnoutLog.create({
        userId,
        sleepHours,
        studyHours,
        stressLevel,
        tasksPending,
        deadlinesSoon,
        burnoutScore: result.score,
        risk: result.risk,
        flags: result.flags,
        crashProbability: result.crashProbability,
        focusMode: result.focusMode,
      });
    }

    // Call Groq LLM
    const ai = await callGroq({
      ...result,
      sleepHours,
      studyHours,
      stressLevel,
      deadlinesSoon,
      tasksPending,
    });

    return NextResponse.json({ result, ai });
  } catch (err) {
    console.error("[analyze] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
