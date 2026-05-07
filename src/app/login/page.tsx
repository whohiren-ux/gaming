import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="container grid min-h-[calc(100svh-4rem)] place-items-center py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
