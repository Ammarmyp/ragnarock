"use client";

export function AccountSettingsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-3xl px-4 pb-20 pt-6 md:px-8 md:pt-10">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent dark:from-primary/[0.04]"
        aria-hidden
      />
      <div className="relative space-y-10">{children}</div>
    </div>
  );
}
