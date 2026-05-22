"use client";

/**
 * OTP Verification Form Component
 * Six-digit OTP input for email verification
 */

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";
import { safeDashboardRedirect } from "@/lib/auth/redirect";
import { cn } from "@/utils/cn";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const email = searchParams.get("email") ?? "";
  const flow = searchParams.get("flow") ?? "email-verification";
  const redirectTo = safeDashboardRedirect(searchParams.get("redirectTo"));

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === "v" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, "").slice(0, 6).split("");
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
      });
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");

    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });
    setOtp(newOtp);

    // Focus last filled input or first empty
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);

    try {
      const loadingToast = toast.loading("Verifying OTP...");
      const otpValue = otp.join("");
      const result =
        flow === "sign-in"
          ? await authClient.signIn.emailOtp({
              email,
              otp: otpValue,
            })
          : await authClient.emailOtp.verifyEmail({
              email,
              otp: otpValue,
            });

      if (result.error) {
        toast.error("Invalid or expired OTP", { id: loadingToast });
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      toast.success("OTP verified successfully", { id: loadingToast });
      if (flow === "email-verification") {
        router.replace(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
      } else {
        router.replace(redirectTo);
        router.refresh();
      }
    } catch (error) {
      console.error("OTP verification failed", error);
      toast.error("Could not verify OTP");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!email) {
      toast.error("Missing email address for OTP");
      return;
    }

    try {
      const loadingToast = toast.loading("Sending OTP...");
      const result = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: flow === "sign-in" ? "sign-in" : "email-verification",
      });

      if (result.error) {
        toast.error("Could not resend OTP", { id: loadingToast });
        return;
      }

      setResendCooldown(60);
      toast.success("OTP sent", { id: loadingToast });
    } catch (error) {
      console.error("Failed to resend OTP", error);
      toast.error("Failed to resend OTP");
    }
  };

  const isFormValid = otp.every((digit) => digit !== "");

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground mt-2">
          Enter the 6-digit code we sent to your email.
        </p>
        <p className="text-sm text-foreground font-medium mt-1">
          {email || "No email provided"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* OTP Input */}
        <div className="space-y-2">
          <div className="flex gap-2 justify-between">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={cn(
                  "flex size-12 sm:size-14 items-center justify-center rounded-lg border border-input bg-background text-center text-lg font-semibold transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  digit && "border-primary",
                )}
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            "w-full h-11 text-[15px] font-medium transition-all",
            isLoading && "cursor-not-allowed",
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="size-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              Verifying...
            </div>
          ) : (
            "Verify email"
          )}
        </Button>
      </form>

      {/* Resend Code */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground font-medium">
              Resend in {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
            >
              Resend code
            </button>
          )}
        </p>
      </div>

      {/* Back to Sign In */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sign in
        </button>
      </div>
    </div>
  );
}
