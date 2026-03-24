"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "Login failed. Please try again.");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1">
            <span className="font-press-start text-[9px] leading-4 text-ink">
              USERNAME
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              className="w-full border-2 border-ink bg-canvas px-2 py-2 font-press-start text-[10px] leading-4 text-ink"
              disabled={isSubmitting}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-press-start text-[9px] leading-4 text-ink">
              PASSWORD
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="w-full border-2 border-ink bg-canvas px-2 py-2 font-press-start text-[10px] leading-4 text-ink"
              disabled={isSubmitting}
              required
            />
          </label>

          {error ? (
            <p className="border-2 border-ink bg-red-100 px-2 py-2 font-press-start text-[9px] leading-4 text-red-800">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full border-4 border-ink bg-yellow px-3 py-2 font-press-start text-[10px] leading-4 text-ink disabled:opacity-60"
          >
            {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </form>
      </section>
    </main>
  );
}
