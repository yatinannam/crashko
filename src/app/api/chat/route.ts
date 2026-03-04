import { NextResponse } from "next/server";
import { callGroq } from "@/lib/groqClient";
import type { GroqCallInput } from "@/lib/groqClient";

/**
 * POST /api/chat
 * Regenerates an AI response for the same burnout context.
 * Body: same shape as GroqCallInput
 */
export async function POST(req: Request) {
  try {
    const body: GroqCallInput = await req.json();

    if (typeof body.score !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ai = await callGroq(body);
    return NextResponse.json({ ai });
  } catch (err) {
    console.error("[chat] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
