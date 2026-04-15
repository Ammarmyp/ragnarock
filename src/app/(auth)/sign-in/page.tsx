/**
 * Sign In Page
 * User authentication with email and password
 */

import { Suspense } from "react";
import { AuthLayout } from "@/layouts/auth/auth-layout";
import { SignInForm } from "@/layouts/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue managing your requirements and collaborating with your team"
    >
      <Suspense fallback={null}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
