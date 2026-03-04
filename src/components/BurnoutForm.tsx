"use client";

import { useState } from "react";
import type { BurnoutInput } from "@/types";

interface BurnoutFormProps {
  onSubmit: (data: BurnoutInput) => void;
  loading: boolean;
}

const defaultValues: BurnoutInput = {
  sleepHours: 7,
  studyHours: 5,
  stressLevel: 5,
  tasksPending: 3,
  deadlinesSoon: 0,
};

export default function BurnoutForm({ onSubmit, loading }: BurnoutFormProps) {
  const [form, setForm] = useState<BurnoutInput>(defaultValues);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BurnoutInput, string>>
  >({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (form.sleepHours < 0 || form.sleepHours > 24)
      e.sleepHours = "0–24 hours";
    if (form.studyHours < 0 || form.studyHours > 24)
      e.studyHours = "0–24 hours";
    if (form.stressLevel < 1 || form.stressLevel > 10) e.stressLevel = "1–10";
    if (form.tasksPending < 0) e.tasksPending = "Cannot be negative";
    if (form.deadlinesSoon < 0) e.deadlinesSoon = "Cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key: keyof BurnoutInput, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const fields: {
    key: keyof BurnoutInput;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
    helper: string;
  }[] = [
    {
      key: "sleepHours",
      label: "Sleep Hours",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "hrs",
      helper: "How many hours did you sleep last night?",
    },
    {
      key: "studyHours",
      label: "Study Hours",
      min: 0,
      max: 24,
      step: 0.5,
      unit: "hrs",
      helper: "Total hours spent studying today.",
    },
    {
      key: "stressLevel",
      label: "Stress Level",
      min: 1,
      max: 10,
      step: 1,
      unit: "/10",
      helper: "Rate your current stress (1 = calm, 10 = overwhelmed).",
    },
    {
      key: "tasksPending",
      label: "Pending Tasks",
      min: 0,
      max: 100,
      step: 1,
      unit: "tasks",
      helper: "How many unfinished tasks do you have?",
    },
    {
      key: "deadlinesSoon",
      label: "Deadlines within 48h",
      min: 0,
      max: 20,
      step: 1,
      unit: "due",
      helper: "Assignments, exams, or submissions due within 48 hours.",
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    >
      <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
        Today's Check-in
      </h2>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Track honestly — the engine learns your patterns.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(({ key, label, min, max, step, unit, helper }) => (
          <div key={key} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor={key}
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                {label}
              </label>
              <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                {form[key]} {unit}
              </span>
            </div>
            <input
              id={key}
              type="number"
              min={min}
              max={max}
              step={step}
              value={form[key]}
              onChange={(e) => handleChange(key, parseFloat(e.target.value))}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-sky-400 dark:bg-slate-800 dark:text-slate-100 ${
                errors[key]
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            />
            {errors[key] ? (
              <p className="text-xs text-red-500">{errors[key]}</p>
            ) : (
              <p className="text-xs text-slate-400">{helper}</p>
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Analyzing…" : "Analyze My Burnout"}
      </button>
    </form>
  );
}
