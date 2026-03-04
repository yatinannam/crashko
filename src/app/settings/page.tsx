"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Remove any legacy localStorage userId that may have been set previously
    localStorage.removeItem("crashko_user_id");
  }, []);

  const handleClearData = async () => {
    if (!confirm("Delete ALL your burnout logs? This cannot be undone."))
      return;
    setClearing(true);
    try {
      await fetch("/api/history", { method: "DELETE" });
      setCleared(true);
      setTimeout(() => setCleared(false), 3000);
    } catch {
      // silently ignore
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
          <Section title="Account">
            <div className="flex flex-col gap-3">
              {session?.user ? (
                <>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {session.user.name ?? "—"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {session.user.email ?? "—"}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Not signed in.</p>
              )}
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
                Permanently delete all your burnout logs. This action cannot be
                undone.
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
