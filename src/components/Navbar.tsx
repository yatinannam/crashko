"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Linkedin, LogOut, Code2, ChevronDown } from "lucide-react";

/* ── Developer info ─────────────────────────────────────────── */
const DEVELOPERS = [
  {
    name: "Yatin Annam",
    role: "Full-Stack Dev",
    github: "https://github.com/yatinannam",
    linkedin: "https://linkedin.com/in/yatinannam",
  },
  {
    name: "Enugula Rohit",
    role: "Full-Stack Dev",
    github: "https://github.com/rohit-1123",
    linkedin: "https://www.linkedin.com/in/enugula-rohit",
  },
];

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/trends", label: "Trends" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

/* ── Avatar ─────────────────────────────────────────────────── */
function Avatar({ src, name }: { src?: string | null; name?: string | null }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? "User"}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-semibold text-white ring-2 ring-white/10">
      {initials}
    </span>
  );
}

/* ── Dropdown panel shell ────────────────────────────────────── */
function DropPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className="absolute right-0 top-11 z-50 overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: "rgba(12, 15, 26, 0.97)",
        border: "1px solid rgba(255,255,255,0.10)",
        backdropFilter: "blur(24px)",
      }}
    >
      {children}
    </motion.div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [devOpen, setDevOpen] = useState(false);
  const [logoShake, setLogoShake] = useState(false);

  const authAreaRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogoClick = () => {
    setLogoShake(false);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setLogoShake(true)),
    );
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        authAreaRef.current &&
        !authAreaRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
        setDevOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "rgba(5, 7, 15, 0.80)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* ── Logo ──────────────────────────────────────────── */}
        <Link
          href="/"
          onClick={handleLogoClick}
          onAnimationEnd={() => setLogoShake(false)}
          className="flex items-center gap-2"
        >
          <span
            className={`text-2xl font-extrabold tracking-tight gradient-text${logoShake ? " logo-shake" : ""}`}
          >
            Crashko
          </span>
        </Link>

        {/* ── Desktop ───────────────────────────────────────── */}
        <div className="hidden items-center gap-1 sm:flex">
          {/* Nav links */}
          <nav className="flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {isActive(link.href) && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Auth area */}
          {status !== "loading" && (
            <div
              ref={authAreaRef}
              className="ml-2 flex items-center gap-2 pl-3"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.10)" }}
            >
              {session ? (
                <>
                  {/* ── Developer button — its own dropdown ── */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setDevOpen((v) => !v);
                        setProfileOpen(false);
                      }}
                      aria-label="Developer info"
                      aria-expanded={devOpen}
                      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        background: devOpen
                          ? "rgba(167,139,250,0.15)"
                          : "rgba(255,255,255,0.05)",
                        border: devOpen
                          ? "1px solid rgba(167,139,250,0.35)"
                          : "1px solid rgba(255,255,255,0.08)",
                        color: devOpen ? "#a78bfa" : "#94a3b8",
                      }}
                    >
                      <Code2 size={13} />
                      <span className="hidden lg:inline">Devs</span>
                      <motion.span
                        animate={{ rotate: devOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={11} />
                      </motion.span>
                    </button>

                    <AnimatePresence>
                      {devOpen && (
                        <DropPanel>
                          <div className="w-64 p-3 space-y-2">
                            <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
                              Meet the Devs
                            </p>
                            {DEVELOPERS.map((dev, i) => (
                              <div
                                key={i}
                                className="rounded-xl px-3 py-3"
                                style={{
                                  background: "rgba(255,255,255,0.04)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                }}
                              >
                                <p className="text-sm font-semibold text-white">
                                  {dev.name}
                                </p>
                                <p className="mb-2.5 text-xs text-slate-500">
                                  {dev.role}
                                </p>
                                <div className="flex gap-2">
                                  <a
                                    href={dev.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
                                    style={{
                                      border:
                                        "1px solid rgba(255,255,255,0.08)",
                                      background: "rgba(255,255,255,0.03)",
                                    }}
                                  >
                                    <Github size={11} />
                                    GitHub
                                  </a>
                                  <a
                                    href={dev.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-blue-400"
                                    style={{
                                      border:
                                        "1px solid rgba(255,255,255,0.08)",
                                      background: "rgba(255,255,255,0.03)",
                                    }}
                                  >
                                    <Linkedin size={11} />
                                    LinkedIn
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </DropPanel>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── Profile avatar — own dropdown (no dev section) ── */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen((v) => !v);
                        setDevOpen(false);
                      }}
                      aria-label="Account menu"
                      aria-expanded={profileOpen}
                      className="flex items-center rounded-full p-0.5 transition hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                    >
                      <Avatar
                        src={session.user?.image}
                        name={session.user?.name}
                      />
                    </button>

                    <AnimatePresence>
                      {profileOpen && (
                        <DropPanel>
                          <div className="w-56">
                            <div
                              className="flex items-center gap-3 px-4 py-3.5"
                              style={{
                                borderBottom:
                                  "1px solid rgba(255,255,255,0.07)",
                              }}
                            >
                              <Avatar
                                src={session.user?.image}
                                name={session.user?.name}
                              />
                              <div className="min-w-0">
                                {session.user?.name && (
                                  <p className="truncate text-sm font-semibold text-white">
                                    {session.user.name}
                                  </p>
                                )}
                                <p className="truncate text-xs text-slate-400">
                                  {session.user?.email}
                                </p>
                              </div>
                            </div>
                            <div className="p-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setProfileOpen(false);
                                  signOut({ callbackUrl: "/login" });
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                              >
                                <LogOut size={14} />
                                Sign out
                              </button>
                            </div>
                          </div>
                        </DropPanel>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
                  }}
                >
                  Sign in with Google
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────────── */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/8 hover:text-white sm:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            {mobileOpen ? (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              />
            ) : (
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              />
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden sm:hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="px-3 pb-4 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-white/8 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {status !== "loading" && (
                <div
                  className="mt-3 space-y-2 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {session ? (
                    <>
                      <div className="flex items-center gap-3 px-3 pb-1">
                        <Avatar
                          src={session.user?.image}
                          name={session.user?.name}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {session.user?.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className="rounded-xl p-3 space-y-2"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">
                          Developers
                        </p>
                        {DEVELOPERS.map((dev, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-400">
                              {dev.name}
                            </span>
                            <div className="flex gap-3">
                              <a
                                href={dev.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-white transition-colors"
                              >
                                <Github size={13} />
                              </a>
                              <a
                                href={dev.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-blue-400 transition-colors"
                              >
                                <Linkedin size={13} />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          signOut({ callbackUrl: "/login" });
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        signIn("google", { callbackUrl: "/" });
                      }}
                      className="block w-full rounded-xl px-4 py-2 text-center text-sm font-semibold text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #06d6d0 0%, #818cf8 50%, #f472b6 100%)",
                      }}
                    >
                      Sign in with Google
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
