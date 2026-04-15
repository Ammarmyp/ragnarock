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
