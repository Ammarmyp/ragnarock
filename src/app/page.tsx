"use client";

import { HomeLayout } from "@/layouts/home/home-layout";
import { Button } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "@/components/landing/landing-motion";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import {
  ArrowRight,
  Bot,
  Check,
  CircleDot,
  Cpu,
  FileJson,
  FileText,
  FlaskConical,
  Files,
  GitBranch,
  Globe,
  Link2,
  ListChecks,
  MessageCircleQuestion,
  MessagesSquare,
  Rocket,
  ScanSearch,
  Shield,
  Sparkles,
  TimerReset,
  Upload,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { data: session } = authClient.useSession();
  const isSignedIn = Boolean(session?.user);
  const reduce = useReducedMotion();

  const painPoints = [
    {
      title: "Intent stays informal",
      description:
        "Ideas live in conversations, notes, and scattered documents — never structured.",
    },
    {
      title: "Teams fill the gaps",
      description:
        "Engineering interprets missing detail, and assumptions quietly become decisions.",
    },
    {
      title: "Mismatch surfaces late",
      description:
        "Review reveals that shipped behavior never matched what was actually asked for.",
    },
    {
      title: "Rework drains delivery",
      description:
        "Cycles reset, deadlines slip, and trust erodes between business and engineering.",
    },
  ];

  const engineFlow = [
    {
      title: "Capture",
      copy: "Text, a URL, or an uploaded file enters one requirement pipeline.",
      icon: Upload,
    },
    {
      title: "Extract",
      copy: "Content is parsed, cleaned, and normalized into analysis-ready context.",
      icon: ScanSearch,
    },
    {
      title: "Analyze",
      copy: "The engine surfaces ambiguity, missing detail, and conflicts.",
      icon: Cpu,
    },
    {
      title: "Clarify",
      copy: "Targeted follow-up questions continue until intent is complete.",
      icon: MessageCircleQuestion,
    },
    {
      title: "Generate",
      copy: "Schema-valid SRS and a plain-language summary are produced.",
      icon: FileJson,
    },
  ];

  const capabilities = [
    {
      title: "Requirement Engine",
      copy: "A conversational agent turns raw intent into validated, developer-ready specifications.",
      icon: Bot,
    },
    {
      title: "Living Documentation",
      copy: "Generate, refine, and export structured project docs with an AI-assisted editor.",
      icon: FileText,
    },
    {
      title: "Test Case Generation",
      copy: "Derive test cases directly from requirements to validate against real intent.",
      icon: FlaskConical,
    },
    {
      title: "Task Management",
      copy: "Plan and track work across Kanban and list views, scoped to each project.",
      icon: ListChecks,
    },
    {
      title: "Repository Insight",
      copy: "Connect repositories and browse code in context with the project's requirements.",
      icon: GitBranch,
    },
    {
      title: "Linear Sync",
      copy: "Push structured work into Linear and keep delivery tracking in sync.",
      icon: Link2,
    },
    {
      title: "Teams & Organizations",
      copy: "Multi-tenant workspaces with members, roles, and invitations built in.",
      icon: Users,
    },
    {
      title: "Real-time Delivery",
      copy: "Async processing streams results back to your team the moment they're ready.",
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
    "Schema-compliant SRS output once requirements are ready",
    "A plain-language summary for final business-owner confirmation",
  ];

  const heroChips = [
    "Clarification-first flow",
    "Schema-driven SRS output",
    "Async via Redis Streams",
    "Real-time delivery",
  ];

  return (
    <HomeLayout>
      {/* ===== HERO ===== */}
      <section className="relative isolate overflow-hidden">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-[38rem] w-6xl -translate-x-1/2 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--primary) 26%, transparent) 0%, transparent 68%)",
          }}
          initial={reduce ? { opacity: 0.7 } : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "38px 38px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 md:py-28 lg:px-8 lg:py-32">
          <Stagger className="max-w-5xl">
            <StaggerItem>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/65 px-3 py-1 text-xs text-muted-foreground backdrop-blur-xl">
                <Sparkles className="size-3.5 text-primary" />
                AI-Powered Software Lifecycle Automation
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-6 max-w-5xl text-balance text-4xl leading-[1.05] font-semibold tracking-tight md:text-6xl lg:text-7xl">
                Replace requirement ambiguity
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  with developer-ready certainty.
                </span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Ragnarock guides intent through structured clarification, then
                carries it across documentation, tests, and delivery — so teams
                build exactly what was asked for.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/dashboard/projects">
                    Start Validation
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover/button:translate-x-0.5" />
                  </Link>
                </Button>
                {!isSignedIn && (
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/sign-up">Create Account</Link>
                  </Button>
                )}
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {heroChips.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-border/70 bg-card/45 px-4 py-3 text-sm text-muted-foreground backdrop-blur-xl transition-colors duration-300 hover:border-primary/40 hover:text-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* ===== THE PROBLEM ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="mb-10 flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            The core problem
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Most teams fail before coding starts
          </h2>
          <p className="max-w-3xl text-muted-foreground md:text-lg">
            Projects break when intent is incomplete. Without a validation gate,
            engineering is forced to guess — and rework becomes inevitable.
          </p>
        </Reveal>

        <Stagger className="grid gap-4 md:grid-cols-4">
          {painPoints.map((item, idx) => (
            <StaggerItem key={item.title}>
              <article className="h-full rounded-2xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="mb-3 inline-flex rounded-md border border-primary/25 px-2 py-1 font-mono text-xs text-primary">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===== REQUIREMENT ENGINE WORKFLOW ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-border/70 bg-card/40 p-6 backdrop-blur-xl md:p-10">
            <div className="mb-9">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                The engine
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Intent in. Validated requirements out.
              </h2>
            </div>

            <Stagger className="grid gap-4 md:grid-cols-5">
              {engineFlow.map(({ title, copy, icon: Icon }, idx) => (
                <StaggerItem key={title}>
                  <div className="group h-full rounded-2xl border border-border/70 bg-background/60 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <Icon className="size-4 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="text-sm font-semibold leading-snug">
                      {title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {copy}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm text-muted-foreground">
              The clarification loop exits only when developers can implement
              without assumptions.
            </div>
          </div>
        </Reveal>
      </section>

      {/* ===== CAPABILITIES ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal className="mb-10 flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
            One platform
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            From requirement to delivery
          </h2>
          <p className="max-w-3xl text-muted-foreground md:text-lg">
            Validated intent flows into everything that comes next — kept in one
            connected workspace.
          </p>
        </Reveal>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map(({ title, copy, icon: Icon }) => (
            <StaggerItem key={title}>
              <article className="group h-full rounded-2xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {copy}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* ===== INPUTS / DELIVERABLES ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Stagger className="grid gap-5 lg:grid-cols-2">
          <StaggerItem>
            <article className="h-full rounded-3xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl md:p-8">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Accepted inputs
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Meet business owners where they are
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {acceptedInputs.map(({ label, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/70 bg-background/55 p-4 transition-colors duration-300 hover:border-primary/40"
                  >
                    <Icon className="mb-2 size-4 text-primary" />
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </article>
          </StaggerItem>

          <StaggerItem>
            <article className="h-full rounded-3xl border border-border/70 bg-card/45 p-6 backdrop-blur-xl md:p-8">
              <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                What teams receive
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                Concrete handoff artifacts
              </h3>
              <ul className="mt-6 space-y-3">
                {deliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 rounded-xl border border-border/70 bg-background/55 p-3 text-sm transition-colors duration-300 hover:border-primary/40"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>
        </Stagger>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-border/70 bg-card/45 px-6 py-14 text-center backdrop-blur-xl md:px-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80"
              style={{
                background:
                  "linear-gradient(to bottom, color-mix(in oklch, var(--primary) 26%, transparent), transparent)",
              }}
            />
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/65 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <CircleDot className="size-3.5 text-primary" />
              Deterministic Requirement Engine
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Ship what was actually asked for.
            </h2>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Turn vague intent into complete, validated requirements before a
              single line of code is written.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard/projects">
                  Open Platform
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover/button:translate-x-0.5" />
                </Link>
              </Button>
              {!isSignedIn && (
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
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
        </Reveal>
      </section>
    </HomeLayout>
  );
}
