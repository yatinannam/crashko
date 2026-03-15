"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, Clock, Trash2 } from "lucide-react";

const NAV_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    desc: "Log your day and get score",
    Icon: LayoutDashboard,
  },
  {
    href: "/trends",
    label: "Trends",
    desc: "Charts and stat summaries",
    Icon: TrendingUp,
  },
  {
    href: "/history",
    label: "History",
    desc: "All your past burnout logs",
    Icon: Clock,
  },
];

function GlassSection({
  title,
  children,
  danger,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  danger?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: danger
          ? "1px solid rgba(239,68,68,0.25)"
          : "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <h2
        className="mb-4 text-base font-semibold"
        style={{ color: danger ? "#f87171" : "#f1f5f9" }}
      >
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "clear-logs" | "delete-account" | null
  >(null);

  useEffect(() => {
    localStorage.removeItem("crashko_user_id");
  }, []);

  const handleClearData = async () => {
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

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete account");
      }
      await signOut({ callbackUrl: "/" });
    } catch {
      // silently ignore
    } finally {
      setDeletingAccount(false);
    }
  };

  const isConfirming = clearing || deletingAccount;

  const confirmTitle =
    confirmAction === "clear-logs" ? "Delete all logs?" : "Delete account?";

  const confirmMessage =
    confirmAction === "clear-logs"
      ? "This will permanently remove all your burnout logs. This action cannot be undone."
      : "This will permanently delete your account and all burnout logs. This action cannot be undone.";

  const confirmCta =
    confirmAction === "clear-logs" ? "Delete Logs" : "Delete Account";

  const handleConfirmProceed = async () => {
    if (confirmAction === "clear-logs") {
      await handleClearData();
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "delete-account") {
      await handleDeleteAccount();
    }
  };

  return (
    <div className="flex-1">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1
            className="text-2xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #06d6d0, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile and preferences.
          </p>
        </motion.div>

        <div className="flex flex-col gap-5">
          <GlassSection title="Account" delay={0.05}>
            <div className="flex flex-col gap-3">
              {session?.user ? (
                <>
                  <InfoRow label="Name" value={session.user.name ?? "—"} />
                  <InfoRow label="Email" value={session.user.email ?? "—"} />
                </>
              ) : (
                <p className="text-sm text-slate-500">Not signed in.</p>
              )}
            </div>
          </GlassSection>

          <GlassSection title="Navigation" delay={0.12}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {NAV_LINKS.map(({ href, label, desc, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col gap-2 rounded-xl p-4 transition-all hover:border-violet-500/30"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={18} className="text-violet-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassSection>

          <GlassSection title="Danger Zone" danger delay={0.2}>
            <p className="mb-4 text-sm text-slate-500 leading-relaxed">
              Permanently delete all your burnout logs. This action cannot be
              undone.
            </p>
            <button
              type="button"
              disabled={clearing}
              onClick={() => setConfirmAction("clear-logs")}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Trash2 size={14} />
              {clearing
                ? "Deleting…"
                : cleared
                  ? "All logs deleted"
                  : "Delete All My Logs"}
            </button>

            <button
              type="button"
              disabled={deletingAccount}
              onClick={() => setConfirmAction("delete-account")}
              className="mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-300 transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "rgba(239,68,68,0.14)",
                border: "1px solid rgba(239,68,68,0.28)",
              }}
            >
              <Trash2 size={14} />
              {deletingAccount ? "Deleting Account…" : "Delete My Account"}
            </button>
          </GlassSection>
        </div>
      </main>

      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 sm:items-center"
            onClick={() => {
              if (!isConfirming) setConfirmAction(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-5 sm:p-6"
              style={{
                background: "rgba(12,15,26,0.98)",
                border: "1px solid rgba(239,68,68,0.3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
            >
              <h3 className="text-lg font-semibold text-white">
                {confirmTitle}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {confirmMessage}
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={() => setConfirmAction(null)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:text-white disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={handleConfirmProceed}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50"
                  style={{
                    background: "rgba(239,68,68,0.85)",
                    border: "1px solid rgba(239,68,68,1)",
                  }}
                >
                  <Trash2 size={14} />
                  {isConfirming ? "Processing…" : confirmCta}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
