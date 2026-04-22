/**
 * Home Page
 * Landing page for the application
 */

import { HomeLayout } from "@/layouts/home/home-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Sparkles,
  TimerReset,
  Users,
  Workflow,
} from "lucide-react";

export default function HomePage() {
  const capabilities = [
    {
      icon: Workflow,
      title: "Connected SDLC workspace",
      description:
        "Unify documentation, requirements, tasks, and decision history in one operational system.",
    },
    {
      icon: TimerReset,
      title: "Faster delivery cycles",
      description:
        "Reduce handoff friction with traceable updates and clear ownership across product and engineering.",
    },
    {
      icon: Shield,
      title: "Enterprise-ready governance",
      description:
        "Role-based controls and auditable activity streams keep teams aligned and compliant.",
    },
  ];

  const outcomes = [
    "From idea to implementation with full requirement traceability",
    "A shared source of truth for product, engineering, and stakeholders",
    "Cleaner delivery operations with less process noise",
  ];

  return (
    <HomeLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(1200px 420px at 50% -10%, color-mix(in oklch, var(--primary) 20%, transparent), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="container relative py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Serious tooling for modern software delivery
            </div>

            <h1 className="mt-6 text-balance text-4xl leading-tight font-semibold tracking-tight md:text-6xl lg:text-7xl">
              SDLC orchestration for teams shipping real products
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Ragnarock helps engineering organizations manage the full software development life cycle with
              clarity, speed, and discipline. Plan better, align teams, and deliver with confidence.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/dashboard/projects">
                  Enter workspace
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/help">View product tour</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
              {outcomes.map((item) => (
                <div key={item} className="rounded-md border bg-card/70 px-3 py-2">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value / Capability Section */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-3 text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Why teams choose Ragnarock</p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Built for serious delivery environments
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground md:text-lg">
              A clean interface with operational depth: everything needed to run software programs with high signal and
              low overhead.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-card/90"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-10 size-40 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-70"
                  style={{ background: "color-mix(in oklch, var(--primary) 22%, transparent)" }}
                />
                <div className="relative">
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process Snapshot */}
      <section className="container py-12 md:py-18">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-2xl border bg-card/60 p-6 shadow-sm md:grid-cols-4 md:p-8">
          {[
            { step: "01", title: "Capture", copy: "Document business intent, scope, and requirements." },
            { step: "02", title: "Align", copy: "Bring product, engineering, and stakeholders into one workflow." },
            { step: "03", title: "Execute", copy: "Track progress from specification to delivery milestones." },
            { step: "04", title: "Improve", copy: "Use activity insight to refine process quality over time." },
          ].map((item) => (
            <div key={item.step} className="space-y-2">
              <p className="font-mono text-xs tracking-widest text-primary">{item.step}</p>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-20">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-2xl border bg-muted/40 px-6 py-12 text-center md:px-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-80"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklch, var(--primary) 18%, transparent), transparent)",
            }}
          />
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Build with confidence. Ship with clarity.
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Give your team a higher-quality operating system for software development life cycle execution.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard/projects">
                Open Ragnarock
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Team-first workflows
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Traceable execution
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" />
              Enterprise-ready control
            </span>
          </div>
        </div>
      </section>
    </HomeLayout>
  );
}
