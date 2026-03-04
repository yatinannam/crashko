"use client";

interface CrashAlertBannerProps {
  crashProbability: number;
  flags: string[];
}

export default function CrashAlertBanner({
  crashProbability,
  flags,
}: CrashAlertBannerProps) {
  if (crashProbability < 65) return null;

  return (
    <div className="w-full rounded-2xl border border-red-300 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🚨</span>
        <div>
          <p className="font-semibold text-red-700 dark:text-red-400">
            High Crash Risk Detected — {crashProbability}% probability
          </p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            Your patterns suggest an imminent burnout crash. Immediate action
            recommended.
          </p>
          {flags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {flags.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/40 dark:text-red-300"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="font-medium text-red-700 dark:text-red-300">
              Immediate steps:
            </span>
            <span className="text-red-600 dark:text-red-400">
              💧 Hydrate now
            </span>
            <span className="text-red-600 dark:text-red-400">
              😴 Sleep 7–8h tonight
            </span>
            <span className="text-red-600 dark:text-red-400">
              📵 30-min screen break
            </span>
            <span className="text-red-600 dark:text-red-400">
              🚶 Short walk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
