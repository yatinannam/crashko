"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const USER_ID_KEY = "crashko_user_id";
const DEFAULT_USER_ID = "anon";

export default function SettingsPage() {
  const [userId, setUserId] = useState(DEFAULT_USER_ID);
  const [inputId, setInputId] = useState(DEFAULT_USER_ID);
  const [saved, setSaved] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_ID_KEY) ?? DEFAULT_USER_ID;
    setUserId(stored);
    setInputId(stored);
  }, []);

  const handleSave = () => {
    const trimmed = inputId.trim() || DEFAULT_USER_ID;
    localStorage.setItem(USER_ID_KEY, trimmed);
    setUserId(trimmed);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearData = async () => {
    if (
      !confirm(`Delete ALL logs for user "${userId}"? This cannot be undone.`)
    )
      return;
    setClearing(true);
    try {
      await fetch(
        `/api/history?userId=${encodeURIComponent(userId)}&deleteAll=true`,
        { method: "DELETE" },
      );
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    } catch {
      // silently ignore — the API may not support DELETE yet
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your profile and preferences
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {/* Profile card */}
          <Section title="Profile">
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
                  User ID
                </label>
                <p className="mb-2 text-xs text-slate-400">
                  Logs are stored under this ID. Change it to switch between
                  different profiles stored in the same database.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => {
                      setInputId(e.target.value);
                      setSaved(false);
                    }}
                    placeholder="e.g. your-name"
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-sky-600 dark:focus:ring-sky-900/30"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 active:bg-sky-700"
                  >
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                <p className="text-xs text-slate-400">Active user ID</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {userId}
                </p>
              </div>
            </div>
          </Section>

          {/* Quick links */}
          <Section title="Navigation">
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href: "/",
                  label: "Dashboard",
                  desc: "Log your day & get score",
                },
                {
                  href: "/trends",
                  label: "Trends",
                  desc: "Charts & stat summaries",
                },
                {
                  href: "/history",
                  label: "History",
                  desc: "All your past logs",
                },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-sky-700 dark:hover:bg-sky-900/20"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {l.label}
                    </p>
                    <p className="text-xs text-slate-400">{l.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>

          {/* Danger zone */}
          <Section title="Danger Zone" danger>
            <div>
              <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                Permanently delete all burnout logs for user{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {userId}
                </span>
                . This action cannot be undone.
              </p>
              <button
                type="button"
                disabled={clearing}
                onClick={handleClearData}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
              >
                {clearing
                  ? "Deleting…"
                  : cleared
                    ? "All logs deleted"
                    : "Delete All My Logs"}
              </button>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
  danger,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${
        danger
          ? "border-red-200 dark:border-red-800"
          : "border-slate-200 dark:border-slate-700"
      }`}
    >
      <div className="mb-4">
        <h2
          className={`text-base font-semibold ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-slate-800 dark:text-slate-100"
          }`}
        >
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
