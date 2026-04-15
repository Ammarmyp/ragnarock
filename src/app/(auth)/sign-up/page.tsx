/**
 * Sign Up Page
 * User registration with email and password
 */

import { AuthLayout } from "@/layouts/auth/auth-layout";
import { SignUpForm } from "@/layouts/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Welcome to Ragnarock"
      subtitle="Sign up for free to access all of our powerful requirements management tools"
    >
      <SignUpForm />
    </AuthLayout>
  );
}
