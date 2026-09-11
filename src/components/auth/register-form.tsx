"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/validations";
import type { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRules = [
  { label: "At least 8 characters", hint: "8+", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", hint: "A-Z", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", hint: "a-z", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", hint: "0-9", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", hint: "!@#", test: (p: string) => /[^A-Za-z0-9]/.test(p) }
];

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" }
  });

  const passwordValue = watch("password");

  const passwordResults = useMemo(
    () => passwordRules.map((rule) => ({ ...rule, met: rule.test(passwordValue) })),
    [passwordValue]
  );

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed.");
      }

      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      });
      toast.success("Account ready.");
      router.push("/booking");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create account</CardTitle>
        <p className="text-sm text-muted-foreground">Book online and keep QR confirmations in your profile.</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" {...register("name")} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="Your phone number" {...register("phone")} />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 characters"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}

            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                passwordValue.length > 0 ? "mt-1 max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <ul className="space-y-1">
                {passwordResults.map((rule, i) => (
                  <li
                    key={rule.label}
                    className="flex items-center gap-1.5 text-xs transition-all duration-300 ease-in-out"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-in-out",
                        rule.met
                          ? "border-green-500 bg-green-500 text-white scale-110"
                          : "border-muted-foreground/40 bg-transparent scale-100"
                      )}
                    >
                      <Check
                        className={cn(
                          "h-3 w-3 transition-all duration-200 ease-in-out",
                          rule.met ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        "transition-colors duration-300",
                        rule.met ? "text-green-600" : "text-muted-foreground"
                      )}
                    >
                      {rule.label}
                    </span>
                    <span
                      className={cn(
                        "ml-auto rounded px-1 py-0.5 font-mono text-[10px] transition-all duration-300",
                        rule.met
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground/60"
                      )}
                    >
                      {rule.hint}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-neon-cyan">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
