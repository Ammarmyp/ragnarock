"use client";

/**
 * Forgot Password Form Component
 * Request password reset via email
 */

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // TODO: Implement actual password reset logic with your API
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Password reset email sent to:", email);

      // Show success state
      setIsSuccess(true);
    } catch (error) {
      console.error("Password reset failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && email.includes("@");

  if (isSuccess) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center size-16 rounded-full bg-green-100 dark:bg-green-500/10">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Check your email
          </h1>
          <p className="text-muted-foreground mt-2 text-center">
            We&apos;ve sent password reset instructions to
          </p>
          <p className="text-sm text-foreground font-medium mt-1 text-center">
            {email}
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="text-primary font-medium hover:underline"
              >
                try another email address
              </button>
            </p>
          </div>

          <Button
            type="button"
            onClick={() => router.push("/sign-in")}
            variant="outline"
            className="w-full h-11"
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground mt-2">
          No worries, we&apos;ll send you reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-11"
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            "w-full h-11 text-[15px] font-medium transition-all",
            isLoading && "cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Sending instructions...
            </div>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>

      {/* Back to Sign In */}
      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 2L4 6L8 10" />
          </svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
