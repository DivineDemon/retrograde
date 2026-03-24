"use client";

import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type AdminLoginBody, adminLoginBody } from "@/lib/form-schemas";

export function AdminLoginForm() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<AdminLoginBody>({
    resolver: typeboxResolver(adminLoginBody),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/admin/auth/me", {
          credentials: "include",
        });
        if (!cancelled && response.ok) {
          router.replace("/admin");
          return;
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (isSubmitting) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username.trim(),
          password: values.password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setServerError(payload?.error ?? "Login failed. Please try again.");
        return;
      }

      router.replace("/admin");
    } catch {
      setServerError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isCheckingSession) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-4">
        <p className="font-press-start text-[10px] leading-4 text-ink">
          Checking admin session...
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center justify-center p-4">
      <section className="w-full border-4 border-ink bg-white p-4 shadow-retro-sm sm:p-6">
        <h1 className="font-press-start text-[12px] leading-6 text-ink">
          ADMIN LOGIN
        </h1>
        <p className="mt-2 font-press-start text-[9px] leading-4 text-ink/70">
          Enter your admin credentials to access the CMS dashboard.
        </p>

        <form
          className="mt-4 flex flex-col gap-5"
          onSubmit={onSubmit}
          noValidate
        >
          <Field>
            <FieldLabel
              htmlFor="username"
              className="font-press-start text-[9px] leading-4 text-ink"
            >
              USERNAME
            </FieldLabel>
            <FieldContent>
              <Input
                id="username"
                {...form.register("username")}
                autoComplete="username"
                variant="retro"
                className="border-2 bg-canvas leading-4"
                disabled={isSubmitting}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.username]}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel
              htmlFor="password"
              className="font-press-start text-[9px] leading-4 text-ink"
            >
              PASSWORD
            </FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                autoComplete="current-password"
                variant="retro"
                className="border-2 bg-canvas leading-4"
                disabled={isSubmitting}
              />
              <FieldError
                className="font-press-start text-[8px] leading-4 text-red-700"
                errors={[form.formState.errors.password]}
              />
            </FieldContent>
          </Field>

          {serverError ? (
            <p className="border-2 border-ink bg-red-100 px-2 py-2 font-press-start text-[9px] leading-4 text-red-800">
              {serverError}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="retro"
            className="h-auto w-full border-4 bg-yellow py-2 leading-4 disabled:opacity-60"
          >
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          </Button>
        </form>
      </section>
    </main>
  );
}
