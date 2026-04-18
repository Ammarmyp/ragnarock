"use client";

/**
 * Sign Up Form Component
 * Registration form with email, password, and consent checkboxes
 */

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth/auth-client";
import { navigateToOAuthUrl, resolveAuthCallbackUrl } from "@/lib/auth/oauth-redirect";
import { cn } from "@/utils/cn";

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeToTerms) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setIsLoading(true);

    try {
      const loadingToast = toast.loading("Creating account...");

      const signUpResult = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
      });

      if (signUpResult.error) {
        toast.error("Could not create your account", { id: loadingToast });
        return;
      }

      toast.success("Account created. OTP sent to your email", { id: loadingToast });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&flow=email-verification`);
    } catch (error) {
      console.error("Sign up failed", error);
      toast.error("Sign-up failed. Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password.length >= 8 && agreeToTerms;

  const handleSocialSignUp = async (provider: "google" | "github") => {
    if (!agreeToTerms) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setIsLoading(true);
    try {
      const loadingToast = toast.loading("Redirecting...");
      const callbackURL = resolveAuthCallbackUrl("/dashboard");
      const result = await authClient.signIn.social({
        provider,
        callbackURL,
      });

      if (result.error) {
        const msg =
          typeof result.error === "object" &&
          result.error !== null &&
          "message" in result.error &&
          typeof (result.error as { message?: string }).message === "string"
            ? (result.error as { message: string }).message
            : "Social sign-up is not available. Check provider configuration.";
        toast.error(msg, { id: loadingToast });
        return;
      }

      toast.success("Redirecting…", { id: loadingToast });
      if (navigateToOAuthUrl(result.data)) {
        return;
      }
      toast.error("Could not start social sign-up");
    } catch (error) {
      console.error("Social sign-up failed", error);
      toast.error("Social sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sign up</h1>
        <p className="text-muted-foreground mt-2">
          Sign up for free to access to any of our products
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
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <>
                  <EyeOff className="size-3.5" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  Show
                </>
              )}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Use 8 or more characters with a mix of letters, numbers & symbols
          </p>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Agree to our{" "}
              <Link
                href="/terms"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of use
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="newsletter"
              checked={subscribeNewsletter}
              onCheckedChange={(checked) =>
                setSubscribeNewsletter(checked as boolean)
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor="newsletter"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Subscribe to our monthly newsletter
            </label>
          </div>
        </div>

        {/* reCAPTCHA placeholder - uncomment when ready to implement */}
        {/* <div className="pt-2">
          <div className="border rounded-md p-4 bg-muted/20 text-center text-xs text-muted-foreground">
            reCAPTCHA placeholder
          </div>
        </div> */}

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
              Creating account...
            </div>
          ) : (
            "Sign up"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="h-11"
          onClick={() => void handleSocialSignUp("google")}
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          className="h-11"
          onClick={() => void handleSocialSignUp("github")}
        >
          <svg className="mr-2 size-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
