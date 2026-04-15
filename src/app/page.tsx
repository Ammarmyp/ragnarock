/**
 * Home Page
 * Landing page for the application
 */

import { HomeLayout } from "@/layouts/home/home-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Shield, Users } from "lucide-react";

export default function HomePage() {
  return (
    <HomeLayout>
      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 py-20 md:py-32">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl">
            Modern Requirements Management
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}
              Made Simple
            </span>
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
            Streamline your project requirements with Ragnarock. Collaborate
            with your team, track changes, and deliver better products faster.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/help">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20 md:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Everything you need
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Built with modern technologies and best practices to help your
              team succeed
            </p>
          </div>

          <div className="grid w-full gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast & Efficient</h3>
              <p className="text-sm text-muted-foreground">
                Lightning-fast performance built on Next.js 15 and React 19
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access control and enterprise-grade security
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-card p-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together seamlessly with real-time updates and sharing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20 md:py-24">
        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-8 rounded-lg border bg-muted/50 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to get started?
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Join teams who are already using Ragnarock to manage their
            requirements and ship better products.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Start Managing Requirements
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </HomeLayout>
  );
}
