"use client";

import { useRef, useEffect, useState, useCallback, Fragment } from "react";
import { useDocSession } from "@/hooks/useDocSession";
import UploadZone from "@/components/UploadZone";
import ChatMessage from "@/components/ChatMessage";
import DocumentLibrary from "@/components/DocumentLibrary";
import { GravityStarsBackground } from "@/components/GravityStarsBackground";
import { ToastContainer, ToastItem } from "@/components/Toast";

/* ─── SVG icon helpers ─── */

const IconLock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconBolt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);

const IconCite = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconUsers = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const IconScales = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
);

const IconChart = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const IconCog = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const IconChat = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
  </svg>
);

/* ─── Static data ─── */

const USE_CASES = [
  {
    Icon: IconUsers,
    label: "Human Resources",
    example: "What is our remote work policy?",
    desc: "Query policy handbooks, onboarding guides, and compliance docs without external exposure.",
  },
  {
    Icon: IconScales,
    label: "Legal",
    example: "What are the liability clauses?",
    desc: "Search contracts and agreements privately. Nothing reaches a third-party AI model.",
  },
  {
    Icon: IconChart,
    label: "Finance",
    example: "What was Q3 revenue by region?",
    desc: "Ask your quarterly reports and audits — zero data leak risk.",
  },
  {
    Icon: IconCog,
    label: "Operations",
    example: "What is the escalation procedure?",
    desc: "Surface answers from SOPs, runbooks, and vendor agreements in seconds.",
  },
];

const HOW_IT_WORKS = [
  { n: "01", title: "Upload your document", desc: "PDF is parsed, chunked into segments, and embedded. Nothing is sent to OpenAI." },
  { n: "02", title: "Stored in private vectors", desc: "Embeddings go into your isolated Upstash Vector namespace — siloed per document." },
  { n: "03", title: "Ask. Get cited answers.", desc: "Claude retrieves the most relevant passages and streams an answer with source citations." },
];

/* ─── Component ─── */

export default function Home() {
  const {
    user, signIn, signOut,
    activeDoc, docs, activeDocId,
    messages, input, setInput, handleSubmit, isLoading, sources,
    uploading, uploadStep, uploadError, handleUpload,
    switchDoc, startNewUpload, deleteDoc, exportTranscript,
    rateLimited, setRateLimited,
  } = useDocSession();

  // Replace with your Tally / Google Form / Typeform waitlist URL
  const WAITLIST_URL = "https://tally.so/r/1AMLNl";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "chat">("upload");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastItem["variant"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDeleteDoc = useCallback((id: string) => {
    deleteDoc(id);
    addToast("Document deleted", "info");
  }, [deleteDoc, addToast]);

  const handleExport = useCallback(() => {
    exportTranscript();
    addToast("Transcript exported", "success");
  }, [exportTranscript, addToast]);

  const prevUploading = useRef(false);
  useEffect(() => {
    if (prevUploading.current && !uploading && !uploadError && activeDoc) {
      addToast("Document ready — start asking questions", "success");
      setActiveTab("chat");
    }
    prevUploading.current = uploading;
  }, [uploading, uploadError, activeDoc, addToast]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (activeDoc && input.trim() && !isLoading) formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeDoc, input, isLoading]);

  const handleSuggestedQuestion = useCallback((q: string) => {
    setInput(q);
    setActiveTab("chat");
    setTimeout(() => formRef.current?.requestSubmit(), 60);
  }, [setInput]);

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <main className="min-h-screen bg-k-bg text-k-text overflow-x-hidden relative">

      {/* Fixed star field */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GravityStarsBackground
          starsCount={110} starsSize={1.5} starsOpacity={0.45}
          glowIntensity={18} glowAnimation="ease"
          mouseInfluence={140} gravityStrength={90} movementSpeed={0.25}
        />
      </div>

      {/* ══ HEADER ══ */}
      <header className="border-b border-white/[0.06] bg-k-bg/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-k-accent flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-k-bg text-sm">K</span>
            </div>
            <span className="font-display font-semibold text-k-text text-lg tracking-tight">Konfide</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-k-text/70 font-mono">
            <a href="#use-cases" className="hover:text-k-accent transition-colors">Who it&apos;s for</a>
            <a href="#how-it-works" className="hover:text-k-accent transition-colors">How it works</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-k-accent/20 border border-k-accent/30 flex items-center justify-center text-k-accent text-xs font-bold flex-shrink-0">
                    {user.email?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <span className="text-sm text-k-text/70 hidden sm:block truncate max-w-[140px]">{user.email}</span>
                </div>
                <button onClick={signOut} className="text-xs text-k-dim hover:text-k-muted transition-colors">Sign out</button>
              </>
            ) : (
              <button onClick={signIn} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-k-muted hover:border-k-accent/40 hover:text-k-accent transition-all btn-glow-sm">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in
              </button>
            )}
            <a href="#tool" className="hidden sm:block px-4 py-1.5 rounded-lg bg-k-accent text-k-bg text-xs font-bold btn-glow">
              Try it →
            </a>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 z-10 overflow-hidden">
        {/* Drifting grid */}
        <div className="absolute inset-0 hero-grid-overlay pointer-events-none" />
        {/* Radial vignette */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_20%,#09090e_100%)]" />
        {/* Scan line — one sweep on load */}
        <div className="scan-line" />

        <div className="relative z-10 max-w-5xl mx-auto">

          {/* Floating badge */}
          <div className="float-anim inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-k-accent/25 bg-k-accent/[0.07] text-k-accent text-xs font-mono uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-k-accent animate-pulse flex-shrink-0" />
            Private Document Intelligence
          </div>

          {/* Headline — 3 explicit lines, clamp font-size */}
          <h1
            className="font-display font-extrabold tracking-tight text-k-text mb-6"
            style={{ fontSize: "clamp(2.4rem, 6vw, 3.75rem)", lineHeight: "1.1" }}
          >
            Ask your documents<br />
            anything.<br />
            <span className="glow-gold">In private.</span>
          </h1>

          {/* Subheadline — brighter, readable */}
          <p className="text-k-text/85 text-base sm:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            No data sent to OpenAI. No AI training on your files.<br className="hidden sm:block" />
            Upload a PDF. Get source-cited answers instantly.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <a href="#tool" className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-k-accent text-k-bg text-sm font-bold tracking-wide btn-glow transition-all">
              Upload your first PDF →
            </a>
            <a href="#how-it-works" className="w-full sm:w-auto px-7 py-3.5 rounded-xl border border-k-accent/35 text-k-accent text-sm font-medium btn-glow-sm hover:border-k-accent/60 hover:bg-k-accent/[0.06] transition-all text-center">
              How it works
            </a>
          </div>

          {/* Trust stats — terminal card style, clearly visible */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {[
              { Icon: IconLock, label: "Zero data to OpenAI" },
              { Icon: IconBolt, label: "Answers in seconds" },
              { Icon: IconCite, label: "Source citations included" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-white/[0.14] bg-k-surface/80 backdrop-blur-sm">
                <span className="text-k-accent flex-shrink-0"><Icon className="w-3.5 h-3.5" /></span>
                <span className="text-sm text-k-text/90 font-mono whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST STRIP ══ */}
      <div className="divider-accent" />
      <div className="border-y border-white/[0.05] bg-k-surface relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          {[
            { Icon: IconLock, title: "Privacy First", body: "Your files never train any AI model, ever." },
            { Icon: IconCite, title: "Any PDF", body: "Policies, contracts, reports, manuals." },
            { Icon: IconBolt, title: "Source-Cited", body: "Every answer references the exact passage." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="px-8 py-8 text-center">
              <div className="w-10 h-10 rounded-xl bg-k-accent/10 border border-k-accent/15 flex items-center justify-center text-k-accent mx-auto mb-3 icon-pulse">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-k-text mb-1.5 font-mono uppercase tracking-wider">{title}</p>
              <p className="text-sm text-k-text/75 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="divider-accent" />

      {/* ══ WHO IS IT FOR ══ */}
      <section id="use-cases" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14" data-reveal>
            <p className="text-xs font-mono text-k-accent/80 uppercase tracking-widest mb-3">Who is it for</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-k-text mb-4">
              Built for teams that handle sensitive data
            </h2>
            <p className="text-k-text/70 text-base max-w-md mx-auto leading-relaxed">
              Konfide keeps your most confidential documents private while making them instantly searchable and answerable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map(({ Icon, label, example, desc }, i) => (
              <div
                key={label}
                data-reveal
                data-delay={String(i + 1)}
                className="relative bg-k-surface border border-white/[0.07] rounded-2xl p-6 group cursor-default card-glow corner-bracket"
              >
                <span className="absolute top-4 right-5 text-[10px] font-mono text-k-accent/40 tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="w-10 h-10 rounded-xl bg-k-accent/10 border border-k-accent/15 flex items-center justify-center text-k-accent mb-5 transition-all group-hover:bg-k-accent/20 group-hover:border-k-accent/40">
                  <Icon />
                </div>
                <p className="font-display font-bold text-k-text text-sm mb-2">{label}</p>
                <p className="text-sm text-k-text/70 leading-relaxed mb-4">{desc}</p>
                <p className="text-sm text-k-text/60 italic border-t border-white/[0.07] pt-3 leading-relaxed">
                  &ldquo;{example}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <div className="divider-accent" />
      <section id="how-it-works" className="py-24 bg-[#0b0b11] relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-20" data-reveal>
            <p className="text-xs font-mono text-k-accent/80 uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-k-text">
              Three steps.<br />Zero compromise.
            </h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-0">
            {HOW_IT_WORKS.map(({ n, title, desc }, i) => (
              <Fragment key={n}>
                {/* Step */}
                <div data-reveal data-delay={String(i + 1)} className="relative flex-1 md:px-4 lg:px-6">
                  {/* Ghost number — same clamp for all three */}
                  <div
                    className="font-display font-extrabold leading-none select-none step-num-glow -ml-2 mb-1 tabular-nums"
                    style={{ fontSize: "clamp(80px, 10vw, 120px)" }}
                  >
                    {n}
                  </div>
                  <div className="-mt-10 relative z-10 pl-1">
                    <p className="text-xs font-mono text-k-accent/90 uppercase tracking-widest mb-2">Step {n}</p>
                    <h3 className="font-display font-bold text-k-text text-base sm:text-lg mb-2">{title}</h3>
                    <p className="text-sm text-k-text/75 leading-relaxed">{desc}</p>
                  </div>
                </div>

                {/* Arrow connector — horizontal (desktop), vertical (mobile) */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <>
                    {/* Desktop: animated horizontal arrow */}
                    <div className="hidden md:flex items-center flex-shrink-0 justify-center" style={{ paddingTop: "52px" }}>
                      <div className="step-arrow">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                    {/* Mobile: static down arrow */}
                    <div className="flex md:hidden justify-center -my-2">
                      <svg className="w-5 h-5 text-k-accent/35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                    </div>
                  </>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
      <div className="divider-accent" />

      {/* ══ THE TOOL ══ */}
      <section id="tool" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-12" data-reveal>
            <p className="text-xs font-mono text-k-accent/80 uppercase tracking-widest mb-3">Try it now</p>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-k-text mb-3">
              Drop a PDF. Start asking.
            </h2>
            <p className="text-base text-k-text/75 max-w-sm mx-auto">
              Upload any document and get source-cited answers in seconds.
            </p>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden items-center bg-k-surface border border-white/[0.07] rounded-xl p-1 mb-4 gap-1">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === "upload" ? "mobile-tab-active" : "text-k-muted hover:text-k-text"
                }`}
            >
              <IconCite className="w-3.5 h-3.5" />
              Document
              {activeDoc && <span className="w-1.5 h-1.5 rounded-full bg-k-accent flex-shrink-0" />}
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${activeTab === "chat" ? "mobile-tab-active" : "text-k-muted hover:text-k-text"
                }`}
            >
              <IconChat className="w-3.5 h-3.5" />
              Chat
              {messages.length > 0 && (
                <span className="bg-k-surface2 border border-white/[0.08] text-k-dim text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                  {messages.length}
                </span>
              )}
            </button>
          </div>

          {/* Two-panel with gradient border */}
          <div className="gradient-border">
            <div className="bg-k-bg rounded-[1.2rem] grid grid-cols-1 lg:grid-cols-[360px_1fr] overflow-hidden">

              {/* Left: Upload + Library */}
              <div className={`${activeTab === "chat" ? "hidden" : "flex"} lg:flex flex-col gap-4 p-5 border-b lg:border-b-0 lg:border-r border-white/[0.07] bg-k-surface/40`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-k-text">{activeDoc ? "Active Document" : "Your Document"}</h3>
                    <p className="text-sm text-k-text/70 mt-0.5">Upload any PDF — policy, contract, report, manual.</p>
                  </div>
                  {activeDoc && (
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <button onClick={startNewUpload} className="text-xs text-k-accent font-medium whitespace-nowrap hover:text-k-text transition-colors">+ New</button>
                      <button onClick={() => handleDeleteDoc(activeDocId)} className="text-xs text-k-dim hover:text-red-400 transition-colors font-medium">Delete</button>
                    </div>
                  )}
                </div>

                <UploadZone onUpload={handleUpload} uploading={uploading} uploadStep={uploadStep} doc={activeDoc} />

                {uploadError && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{uploadError}</div>
                )}

                {activeDoc?.summary && (
                  <div className="bg-k-accent/[0.07] border border-k-accent/20 rounded-xl px-3 py-3">
                    <p className="text-xs font-semibold text-k-accent mb-1">Document summary</p>
                    <p className="text-sm text-k-text/75 leading-relaxed">{activeDoc.summary}</p>
                  </div>
                )}

                {!activeDoc && Object.keys(docs).length === 0 && (
                  <div className="text-xs bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-3 leading-relaxed">
                    <p className="font-mono uppercase tracking-wider text-xs text-k-text/60 mb-2">Works great with</p>
                    <ul className="space-y-1.5">
                      {["HR policy handbooks", "Legal contracts", "Financial reports", "Company SOPs", "Product catalogs"].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-sm text-k-text/70">
                          <span className="w-1 h-1 rounded-full bg-k-accent/50 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <DocumentLibrary docs={docs} activeDocId={activeDocId} onSwitch={switchDoc} onDelete={handleDeleteDoc} />

                <div className="border-t border-white/[0.06] pt-3 mt-auto">
                  {user ? (
                    <p className="text-sm text-k-text/70 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-k-accent flex-shrink-0" />
                      Synced to your account
                    </p>
                  ) : (
                    <p className="text-sm text-k-text/70 leading-relaxed">
                      <button onClick={signIn} className="text-k-accent hover:underline font-medium">Sign in</button>{" "}
                      to save documents across devices.
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Chat */}
              <div className={`${activeTab === "upload" ? "hidden" : "flex"} lg:flex flex-col h-[520px] sm:h-[580px] lg:h-[640px] bg-k-bg`}>
                {activeDoc && (
                  <div className="px-5 py-2.5 border-b border-white/[0.06] flex items-center gap-2 flex-shrink-0 bg-k-surface/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-k-accent animate-pulse flex-shrink-0" />
                    <span className="text-sm text-k-text/60 font-mono">Chatting with:</span>
                    <span className="text-xs font-medium text-k-accent truncate">{activeDoc.filename}</span>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-10">
                      <div className="w-14 h-14 rounded-2xl bg-k-surface border border-white/[0.08] flex items-center justify-center">
                        {activeDoc
                          ? <IconChat className="w-6 h-6 text-k-accent" />
                          : <IconLock className="w-6 h-6 text-k-dim" />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-k-text/85 mb-1">
                          {activeDoc ? `"${activeDoc.filename}" is ready.` : "Upload a document to start"}
                        </p>
                        <p className="text-sm text-k-text/65">
                          {activeDoc ? "Ask any question about your document." : "Answers include source citations."}
                        </p>
                      </div>
                      {!activeDoc && (
                        <button onClick={() => setActiveTab("upload")} className="lg:hidden text-xs text-k-accent border border-k-accent/30 px-4 py-2 rounded-lg hover:bg-k-accent/[0.08] transition-colors btn-glow-sm">
                          Go to upload
                        </button>
                      )}
                      {activeDoc && (
                        <div className="flex flex-col gap-2 w-full max-w-xs mt-1">
                          {(activeDoc.suggestedQuestions?.length
                            ? activeDoc.suggestedQuestions.slice(0, 3)
                            : ["What is this document about?", "Give me a summary.", "What are the key points?"]
                          ).map((q) => (
                            <button
                              key={q}
                              onClick={() => handleSuggestedQuestion(q)}
                              className="text-xs px-3 py-2.5 rounded-xl border border-k-accent/20 text-k-accent hover:bg-k-accent/[0.07] hover:border-k-accent/40 transition-all text-left btn-glow-sm font-mono"
                            >
                              {q}
                            </button>
                          ))}
                          {!activeDoc.suggestedQuestions && (
                            <p className="text-sm text-k-text/55 animate-pulse font-mono">Generating suggestions...</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {messages.map((m, i) => {
                    const isLast = i === messages.length - 1;
                    return (
                      <ChatMessage
                        key={m.id}
                        role={m.role as "user" | "assistant"}
                        content={m.content}
                        sources={isLast && m.role === "assistant" ? sources : undefined}
                      />
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-start">
                      <div className="bg-k-surface2 border border-white/[0.07] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2.5">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-k-accent animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                        <span className="text-sm text-k-text/65 font-mono">Searching document...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-white/[0.06] p-4 flex-shrink-0 bg-k-surface/20">
                  <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={activeDoc ? "Ask a question about your document..." : "Upload a PDF first"}
                      disabled={!activeDoc || isLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-k-surface border border-white/[0.08] text-sm text-k-text placeholder-k-muted/50 focus:outline-none focus:ring-1 focus:ring-k-accent/40 focus:border-k-accent/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    />
                    <button type="submit" disabled={!activeDoc || !input.trim() || isLoading}
                      className="px-4 py-2.5 rounded-xl bg-k-accent text-k-bg text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-k-accent2 btn-glow flex-shrink-0">
                      Send
                    </button>
                  </form>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-k-text/60 font-mono">
                      Grounded in your document · Citations included
                      {activeDoc && <span className="hidden sm:inline text-k-text/40"> · ⌘↵ to send</span>}
                    </p>
                    {messages.length > 0 && (
                      <button onClick={handleExport} className="text-[10px] text-k-muted hover:text-k-accent transition-colors whitespace-nowrap ml-2 font-mono">
                        Export transcript
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <div className="divider-accent" />
      <footer className="py-10 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-k-accent flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-k-bg text-xs">K</span>
            </div>
            <span className="font-display text-k-text/80 text-sm font-semibold tracking-tight">Konfide</span>
            <span className="text-k-text/50 text-sm font-mono">/ Private Document Intelligence</span>
          </div>
          <p className="text-sm text-k-text/65 font-mono text-center sm:text-right">
            Built by{" "}
            <a href="https://github.com/shireen-mvps" target="_blank" rel="noopener noreferrer"
              className="text-k-text/80 hover:text-k-accent transition-colors">Shireen</a>
            {" · "}Powered by Claude Code + Upstash Vector
          </p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ══ RATE LIMIT MODAL ══ */}
      {rateLimited && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-k-bg/80 backdrop-blur-md"
            onClick={() => setRateLimited(false)}
          />

          {/* Card */}
          <div className="relative z-10 w-full max-w-md bg-k-surface border border-k-accent/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(232,160,32,0.12)]">

            {/* Close */}
            <button
              onClick={() => setRateLimited(false)}
              className="absolute top-4 right-4 text-k-dim hover:text-k-muted transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-k-accent/10 border border-k-accent/20 flex items-center justify-center text-k-accent mb-5 mx-auto">
              <IconLock className="w-6 h-6" />
            </div>

            {/* Heading */}
            <h2 className="font-display font-bold text-k-text text-xl text-center mb-2">
              You've reached the demo limit
            </h2>
            <p className="text-sm text-k-text/70 text-center leading-relaxed mb-6">
              The free demo includes <span className="text-k-accent font-semibold">3 uploads</span> and <span className="text-k-accent font-semibold">20 questions</span> per day — enough to genuinely evaluate Konfide.
              <br /><br />
              For full access — unlimited documents, persistent storage, and team use — request access below.
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <a
                href={WAITLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-k-accent text-k-bg text-sm font-bold text-center btn-glow hover:bg-k-accent2 transition-all"
              >
                Request full access →
              </a>
              <button
                onClick={() => setRateLimited(false)}
                className="w-full py-3 rounded-xl border border-white/10 text-sm text-k-text/70 hover:border-white/20 hover:text-k-text/90 transition-all"
              >
                Back to demo
              </button>
            </div>

            {/* Fine print */}
            <p className="text-xs text-k-text/40 text-center mt-4 font-mono">
              Demo limits reset every 24 hours.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
