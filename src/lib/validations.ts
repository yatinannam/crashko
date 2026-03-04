import { z } from "zod";

export const burnoutInputSchema = z.object({
  sleepHours: z
    .number({ error: "Sleep hours required" })
    .min(0, "Cannot be negative")
    .max(24, "Cannot exceed 24 hours"),

  studyHours: z
    .number({ error: "Study hours required" })
    .min(0, "Cannot be negative")
    .max(24, "Cannot exceed 24 hours"),

  stressLevel: z
    .number({ error: "Stress level required" })
    .min(1, "Minimum stress level is 1")
    .max(10, "Maximum stress level is 10"),

  tasksPending: z
    .number({ error: "Pending tasks required" })
    .min(0, "Cannot be negative")
    .max(100, "Too many tasks"),

  deadlinesSoon: z
    .number({ error: "Deadlines within 48h required" })
    .min(0, "Cannot be negative")
    .max(20, "Too many deadlines"),

  userId: z.string().optional().default("anon"),
});

export type BurnoutInputSchema = z.infer<typeof burnoutInputSchema>;
