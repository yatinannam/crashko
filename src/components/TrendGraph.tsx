"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { TrendDay } from "@/types";

interface TrendGraphProps {
  data: TrendDay[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TrendGraph({ data }: TrendGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900">
        No trend data yet. Log a few more days to see your chart!
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: formatDate(d.date),
    "Burnout Score": d.burnoutScore,
    "Crash %": d.crashProbability ?? undefined,
    "Sleep (h)": d.sleepHours,
    "Study (h)": d.studyHours,
    Stress: d.stressLevel,
  }));

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
        7-Day Trends
      </h2>
      <p className="mb-5 text-sm text-slate-400">
        Burnout score, sleep, study, and stress over time.
      </p>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Line
            type="monotone"
            dataKey="Burnout Score"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="Crash %"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="4 2"
            dot={{ r: 3 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="Sleep (h)"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Study (h)"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="Stress"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
