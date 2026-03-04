"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { TrendDay } from "@/types";

interface TrendGraphProps {
  data: TrendDay[];
}

type Tab = "risk" | "recovery" | "stress";

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "risk", label: "Risk", emoji: "🔥" },
  { id: "recovery", label: "Recovery", emoji: "🌙" },
  { id: "stress", label: "Stress", emoji: "⚡" },
];

const TAB_META: Record<
  Tab,
  {
    key: string;
    color: string;
    gradId: string;
    unit: string;
    domain: [number, number];
  }[]
> = {
  risk: [
    {
      key: "Burnout Score",
      color: "#ef4444",
      gradId: "burnout",
      unit: "",
      domain: [0, 100],
    },
    {
      key: "Crash %",
      color: "#f97316",
      gradId: "crash",
      unit: "%",
      domain: [0, 100],
    },
  ],
  recovery: [
    {
      key: "Sleep (h)",
      color: "#0ea5e9",
      gradId: "sleep",
      unit: "h",
      domain: [0, 12],
    },
    {
      key: "Study (h)",
      color: "#8b5cf6",
      gradId: "study",
      unit: "h",
      domain: [0, 12],
    },
  ],
  stress: [
    {
      key: "Stress",
      color: "#f59e0b",
      gradId: "stress",
      unit: "/10",
      domain: [0, 10],
    },
  ],
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipEntry {
  dataKey?: string | number;
  value?: number | string;
  color?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
      <p className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      {payload.map((p) => (
        <div
          key={String(p.dataKey)}
          className="flex items-center gap-2 text-sm"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-slate-600 dark:text-slate-300">
            {p.dataKey}
          </span>
          <span
            className="ml-auto pl-4 font-bold tabular-nums"
            style={{ color: p.color }}
          >
            {p.value !== undefined ? Math.round(Number(p.value)) : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function TrendGraph({ data }: TrendGraphProps) {
  const [tab, setTab] = useState<Tab>("risk");

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

  const series = TAB_META[tab];
  const yDomain = series[0].domain;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-start justify-between px-6 pt-6 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            7-Day Trends
          </h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Your daily patterns over the last week
          </p>
        </div>

        {/* Tab pills */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                tab === t.id
                  ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend dots */}
      <div className="flex gap-4 px-6 pb-3">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {s.key}
              {s.unit && <span className="text-slate-400"> ({s.unit})</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={chartData}
            margin={{ top: 6, right: 16, left: -8, bottom: 0 }}
          >
            <defs>
              {series.map((s) => (
                <linearGradient
                  key={s.gradId}
                  id={s.gradId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#${s.gradId})`}
                dot={{ r: 3.5, fill: s.color, strokeWidth: 0 }}
                activeDot={{
                  r: 6,
                  fill: s.color,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
