/**
 * OTP Verification Page
 * Verify email address with one-time password
 */

import { Suspense } from "react";
import { AuthLayout } from "@/layouts/auth/auth-layout";
import { VerifyOtpForm } from "@/layouts/auth/components/verify-otp-form";

export default function VerifyOtpPage() {
  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="We've sent a verification code to your email address. Enter it below to complete your registration"
    >
      <Suspense fallback={null}>
        <VerifyOtpForm />
      </Suspense>
    </AuthLayout>
  );
}
