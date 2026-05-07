"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password.");
      return;
    }

    toast.success("Welcome back.");
    router.push(search.get("callbackUrl") || "/admin");
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <p className="text-sm text-muted-foreground">Access bookings, memberships, and admin operations.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New player?{" "}
          <Link href="/register" className="font-semibold text-neon-cyan">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
