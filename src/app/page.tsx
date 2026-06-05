// src/app/page.tsx
// Landing page — no "use client" needed; all interactions are CSS/anchor-based
// Replace the existing src/app/page.tsx with this file

import Link from "next/link";

// ─── Static data (keep in a separate constants file if it grows) ────────────

const FEATURES = [
  {
    icon: "✦",
    title: "Canvas Editor",
    description:
      "Drag-and-drop slide builder with text, images, shapes, and icons. Full control over position, size, and style for every element.",
  },
  {
    icon: "◈",
    title: "Presentation Mode",
    description:
      "Present your slides live in-browser with a full-screen preview. No PowerPoint, no Keynote — just a link.",
  },
  {
    icon: "⬡",
    title: "Resume & CV Slides",
    description:
      "Purpose-built templates for professionals. Turn your experience into a visual story that stands out from PDF resumes.",
  },
  {
    icon: "⬙",
    title: "Export & Share",
    description:
      "Export individual slides as images or share your entire project via a public link. Your work, your way.",
  },
  {
    icon: "▣",
    title: "Multi-slide Projects",
    description:
      "Organize your work into projects. Reorder slides, duplicate layouts, and keep every presentation in one place.",
  },
  {
    icon: "◎",
    title: "Rich Typography",
    description:
      "Choose from curated font pairings — Playfair, Cabinet Grotesk, Satoshi, and more — to match your personal brand.",
  },
] as const;

const STEPS = [
  {
    step: "01",
    label: "Create a project",
    detail: "Name it, describe it, tag it.",
  },
  {
    step: "02",
    label: "Add slides",
    detail: "Start from blank or pick a layout.",
  },
  {
    step: "03",
    label: "Design freely",
    detail: "Drag, resize, style every element.",
  },
  {
    step: "04",
    label: "Present or export",
    detail: "Share the link or download.",
  },
] as const;

// ─── Component ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-md">
        <span className="font-semibold tracking-tight text-white text-lg">
          Slide<span className="text-[#A8FF78]">Studio</span>
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-[#A8FF78] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-20 px-6 text-center">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#A8FF78]/[0.06] blur-[120px] pointer-events-none" />

        {/* Badge */}
        <div className="relative mb-8 inline-flex items-center gap-2 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/50 bg-white/[0.03]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A8FF78] animate-pulse" />
          Visual presentation builder for professionals
        </div>

        {/* Headline */}
        <h1 className="relative max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.08] tracking-tight mb-6">
          Your resume, <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8FF78] to-[#78FFCB]">
            redesigned as a story.
          </span>
        </h1>

        <p className="relative max-w-xl text-base sm:text-lg text-white/50 leading-relaxed mb-10">
          Build stunning slide presentations for your CV, portfolio, or pitch
          deck — directly in the browser. No design tools required.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#A8FF78] text-black text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#78FFCB] transition-colors"
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/10 text-white/70 text-sm px-6 py-3 rounded-full hover:border-white/20 hover:text-white transition-colors"
          >
            Sign in to dashboard
          </Link>
        </div>

        {/* Fake slide preview */}
        <div className="relative mt-20 w-full max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="flex-1 mx-4 bg-white/[0.05] rounded-md px-3 py-1 text-xs text-white/20">
                slidestudio.app/projects/my-portfolio
              </div>
            </div>

            {/* Slide canvas mockup */}
            <div className="flex h-64 sm:h-80">
              {/* Slide list */}
              <div className="w-20 sm:w-24 border-r border-white/[0.06] p-2 flex flex-col gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`w-full aspect-video rounded border text-[8px] flex items-center justify-center font-medium ${
                      n === 1
                        ? "border-[#A8FF78]/40 bg-[#A8FF78]/5 text-[#A8FF78]/60"
                        : "border-white/[0.06] text-white/20"
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Main canvas */}
              <div className="flex-1 p-8 flex flex-col justify-center items-start gap-4">
                <div className="w-1/3 h-2 rounded-full bg-[#A8FF78]/30" />
                <div className="w-2/3 h-5 rounded-full bg-white/10" />
                <div className="w-1/2 h-5 rounded-full bg-white/10" />
                <div className="mt-2 flex gap-3">
                  <div className="w-20 h-16 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                  <div className="w-20 h-16 rounded-lg bg-white/[0.04] border border-white/[0.06]" />
                </div>
              </div>

              {/* Properties panel */}
              <div className="hidden sm:flex w-40 border-l border-white/[0.06] p-3 flex-col gap-3">
                <div className="text-[10px] text-white/20 uppercase tracking-widest">
                  Style
                </div>
                {["Font", "Color", "Size", "Alignment"].map((label) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-[10px] text-white/30">{label}</span>
                    <div className="w-10 h-2 rounded-full bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fade overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none rounded-b-2xl" />
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="px-6 py-32 max-w-5xl mx-auto">
        <p className="text-xs text-[#A8FF78] font-medium tracking-widest uppercase mb-4">
          Process
        </p>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-16">
          From blank to beautiful
          <br />
          in four steps.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ step, label, detail }) => (
            <div
              key={step}
              className="group border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-colors"
            >
              <div className="text-[11px] font-mono text-[#A8FF78]/60 mb-3">
                {step}
              </div>
              <div className="text-base font-medium text-white mb-1">
                {label}
              </div>
              <div className="text-sm text-white/40">{detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#A8FF78] font-medium tracking-widest uppercase mb-4">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-14">
            Everything you need,
            <br />
            nothing you don't.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, description }) => (
              <div
                key={title}
                className="border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-colors group"
              >
                <div className="text-xl text-[#A8FF78] mb-4 group-hover:scale-110 transition-transform inline-block">
                  {icon}
                </div>
                <h3 className="text-base font-medium text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use cases ────────────────────────────────────────────────────── */}
      <section className="px-6 py-32 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
          <div className="lg:w-1/3">
            <p className="text-xs text-[#A8FF78] font-medium tracking-widest uppercase mb-4">
              Use cases
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Built for every kind of presentation.
            </h2>
          </div>

          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Job seekers",
                detail:
                  "Make your resume impossible to ignore with visual slide CVs.",
                emoji: "🎯",
              },
              {
                label: "Freelancers",
                detail:
                  "Present your portfolio to clients in a polished, shareable format.",
                emoji: "⚡",
              },
              {
                label: "Students",
                detail:
                  "Submit assignments and presentations that go beyond plain text.",
                emoji: "📖",
              },
              {
                label: "Teams & startups",
                detail:
                  "Build pitch decks and internal presentations without leaving the browser.",
                emoji: "🚀",
              },
            ].map(({ label, detail, emoji }) => (
              <div
                key={label}
                className="border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.12] transition-colors"
              >
                <div className="text-2xl mb-3">{emoji}</div>
                <div className="font-medium text-white mb-1 text-sm">
                  {label}
                </div>
                <div className="text-sm text-white/40">{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="px-6 py-32 border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto text-center">
          {/* Glow */}
          <div className="absolute left-1/2 -translate-x-1/2 w-96 h-40 bg-[#A8FF78]/[0.08] blur-[80px] pointer-events-none" />

          <h2 className="relative text-4xl sm:text-5xl font-semibold tracking-tight mb-4">
            Ready to present{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8FF78] to-[#78FFCB]">
              your best self?
            </span>
          </h2>
          <p className="text-white/40 mb-8 text-base">
            Create your first project in seconds. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#A8FF78] text-black text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-[#78FFCB] transition-colors"
          >
            Create free account
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M8 2l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="px-8 py-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm font-medium">
          Slide<span className="text-[#A8FF78]">Studio</span>
        </span>
        <div className="flex items-center gap-6 text-xs text-white/30">
          <Link href="/login" className="hover:text-white/60 transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="hover:text-white/60 transition-colors"
          >
            Register
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-white/60 transition-colors"
          >
            Dashboard
          </Link>
        </div>
        <span className="text-xs text-white/20">
          © {new Date().getFullYear()} SlideStudio
        </span>
      </footer>
    </div>
  );
}
