import { NextResponse } from "next/server";
import { connectToMongo } from "@/lib/mongodb";
import BurnoutLog from "@/models/BurnoutLog";
import { computeBurnout } from "@/lib/burnoutEngine";
import { callGroq } from "@/lib/groqClient";
import { burnoutInputSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = burnoutInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { sleepHours, studyHours, stressLevel, tasksPending, deadlinesSoon, userId } =
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
