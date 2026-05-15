/**
 * Home Page
 * Landing page for the application
 */

import { HomeLayout } from "@/layouts/home/home-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CircleDashed,
  CircleDot,
  Cpu,
  Database,
  FileJson,
  Files,
  Globe,
  MessageCircleQuestion,
  MessagesSquare,
  Shield,
  Sparkles,
  Rocket,
  ScanSearch,
  TimerReset,
  Upload,
  Users,
  Waypoints,
  Workflow,
} from "lucide-react";

export default function HomePage() {
  const painPoints = [
    {
      title: "Intent is informal",
      description: "Business ideas start as conversations, notes, and documents without structure.",
    },
    {
      title: "Teams fill in gaps",
      description: "Engineering interprets missing details and assumptions become implementation decisions.",
    },
    {
      title: "Mismatch appears late",
      description: "Product review exposes that shipped behavior does not match stakeholder intent.",
    },
    {
      title: "Rework drains delivery",
      description: "Cycles reset, deadlines slip, and trust erodes between business and engineering.",
    },
  ];

  const engineFlow = [
    {
      title: "Capture",
      copy: "Text, URL, or file upload enters a single requirement pipeline.",
      icon: Upload,
    },
    {
      title: "Extract",
      copy: "Content is parsed, cleaned, and normalized into analysis-ready context.",
      icon: ScanSearch,
    },
    {
      title: "Analyze",
      copy: "The AI identifies ambiguity, missing details, and requirement conflicts.",
      icon: Cpu,
    },
    {
      title: "Clarify",
      copy: "Targeted follow-up questions continue until requirements are complete.",
      icon: MessageCircleQuestion,
    },
    {
      title: "Generate",
      copy: "Validated SRS JSON and business-owner summary are produced for handoff.",
      icon: FileJson,
    },
  ];

  const architectureFlow = [
    {
      title: "Business Owner",
      copy: "Submits text, URL, or document",
      icon: Users,
    },
    {
      title: "NestJS Backend",
      copy: "Auth, persistence, queue publish",
      icon: Workflow,
    },
    {
      title: "Redis Streams",
      copy: "Async jobs and results transport",
      icon: Waypoints,
    },
    {
      title: "FastAPI AI Layer",
      copy: "Requirement analysis and SRS generation",
      icon: Sparkles,
    },
    {
      title: "WebSocket Update",
      copy: "Real-time turn completion to client",
      icon: MessagesSquare,
    },
  ];

  const acceptedInputs = [
    { label: "Direct text input", icon: MessagesSquare },
    { label: "PDF, DOCX, TXT files", icon: Files },
    { label: "Public website URL", icon: Globe },
  ];

  const deliverables = [
    "Targeted clarification questions when requirements are incomplete",
    "Strict schema-compliant SRS JSON when requirements are complete",
    "Plain-language summary for final business-owner confirmation",
  ];

  const guardrails = [
    "No architecture recommendation in MVP",
    "No sprint planning or task breakdown",
    "No code generation",
    "No multi-agent orchestration",
  ];

  return (
    <HomeLayout>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-[38rem] w-6xl -translate-x-1/2 opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--primary) 26%, transparent) 0%, transparent 68%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/65 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xl">
              <Sparkles className="size-3.5 text-primary" />
              AI-Powered Requirement Validation Platform
            </div>

            <h1 className="mt-6 max-w-5xl text-balance text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl lg:text-7xl">
              Replace requirement ambiguity
              <span className="block text-primary">with developer-ready certainty.</span>
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Ragnarock guides business owners through structured clarification and document analysis, then delivers
              complete SRS output only when requirements are implementation-ready.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard/projects">
                  Start Validation
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Clarification-first requirement flow",
                "Strict schema-driven outputs",
                "Async processing via Redis Streams",
                "Real-time delivery to business owners",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-border/70 bg-card/45 px-4 py-3 text-sm text-muted-foreground backdrop-blur-xl"
                >
                  {item}
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">The core problem</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Most teams fail before coding starts</h2>
          <p className="max-w-3xl text-muted-foreground md:text-lg">
            Projects break when intent is incomplete. Without a requirement validation gate, engineering is forced to
            guess, and rework becomes inevitable.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {painPoints.map((item, idx) => (
            <article key={item.title} className="rounded-2xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl">
              <div className="mb-3 inline-flex rounded-md border border-primary/25 px-2 py-1 font-mono text-xs text-primary">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-card/40 p-6 backdrop-blur-xl md:p-8">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">The solution</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Requirement Engine workflow</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {engineFlow.map(({ title, copy, icon: Icon }, idx) => (
              <div key={title} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-primary">{String(idx + 1).padStart(2, "0")}</span>
                  <Icon className="size-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold leading-snug">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-muted-foreground">
            Clarification loop exits only when developers can implement without assumptions.
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Accepted inputs</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Meet business owners where they are</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {acceptedInputs.map(({ label, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-border/70 bg-background/55 p-4">
                  <Icon className="mb-2 size-4 text-primary" />
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">What teams receive</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Concrete handoff artifacts</h3>
            <ul className="mt-5 space-y-3">
              {deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/55 p-3 text-sm"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 md:pb-20 lg:px-8">
        <div className="rounded-3xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl md:p-8">
          <div className="mb-7 flex items-center gap-2">
            <Database className="size-4 text-primary" />
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Runtime architecture</p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {architectureFlow.map(({ title, copy, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                <Icon className="mb-2 size-4 text-primary" />
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground">{copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {guardrails.map((item) => (
              <div key={item} className="rounded-xl border border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border/70 bg-card/45 px-6 py-12 text-center backdrop-blur-xl md:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklch, var(--primary) 26%, transparent), transparent)",
            }}
          />
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/65 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <CircleDot className="size-3.5 text-primary" />
            Deterministic Requirement Engine
          </div>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Ship what was actually asked for.
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Turn vague intent into complete, validated requirements before implementation begins.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard/projects">
                Open Platform
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Shield className="size-4 text-primary" />
              Less ambiguity
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TimerReset className="size-4 text-primary" />
              Less rework
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Rocket className="size-4 text-primary" />
              Faster delivery
            </span>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
