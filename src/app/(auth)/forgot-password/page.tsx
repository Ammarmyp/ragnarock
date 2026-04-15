/**
 * Forgot Password Page
 * Password reset request with email
 */

import { AuthLayout } from "@/layouts/auth/auth-layout";
import { ForgotPasswordForm } from "@/layouts/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Don't worry, it happens. Enter your email and we'll send you instructions to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
