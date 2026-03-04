import type { BurnoutResult } from "@/types";

/** Keep this server-side only — never import in client components */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a concise mental performance assistant for engineering students.
Given structured student burnout data, produce a JSON response with EXACTLY these keys:
- shortDiagnosis (string, 1-2 sentences)
- recoveryPlan (array of 4-6 actionable strings for the next 24 hours)
- studyRestructuring (string, how to reorder tasks + use focus mode)
- oneMotivationalLine (string, short and genuine)
- recommendedPomodoroMinutes (number: 25, 45, or 60)
- tags (array of short label strings, e.g. ["low-sleep","deadline-cluster"])

Return ONLY valid JSON. No extra text, no markdown, no code fences.`;

export interface GroqCallInput extends BurnoutResult {
  sleepHours: number;
  studyHours: number;
  stressLevel: number;
  deadlinesSoon: number;
  tasksPending: number;
}

/** Extracts JSON from text even when the model wraps it in markdown/prose */
function extractJSON(text: string): string {
  // Try to find a JSON object in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : text;
}

export async function callGroq(userData: GroqCallInput) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("Missing GROQ_API_KEY environment variable");

  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: JSON.stringify(userData, null, 2) },
    ],
    max_tokens: 500,
    temperature: 0.2,
    response_format: { type: "json_object" },
  };

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text: string = data.choices?.[0]?.message?.content ?? "";

  try {
    return JSON.parse(extractJSON(text));
  } catch {
    // Graceful fallback — surface raw text so UI can show something
    return {
      shortDiagnosis: "Unable to parse AI response.",
      recoveryPlan: ["Rest", "Hydrate", "Take a short walk"],
      studyRestructuring: "Focus on one task at a time.",
      oneMotivationalLine: "You've got this.",
      recommendedPomodoroMinutes: 25,
      tags: [],
      raw: text,
    };
  }
}
