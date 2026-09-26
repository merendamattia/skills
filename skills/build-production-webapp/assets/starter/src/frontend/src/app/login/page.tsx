"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (!isPending && session) router.replace("/"); }, [isPending, router, session]);
  if (!isPending && session) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.username({
        username: String(form.get("username")),
        password: String(form.get("password")),
      });
      if (result.error) return setError("Username or password is incorrect.");
      router.replace("/");
    } catch {
      setError("Sign-in service is unavailable. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Sign in</CardTitle><CardDescription>Use an administrator-created account.</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={submit}>
            <FieldGroup>
              <Field data-invalid={Boolean(error)}><FieldLabel htmlFor="username">Username</FieldLabel><Input id="username" name="username" autoComplete="username" required /></Field>
              <Field data-invalid={Boolean(error)}><FieldLabel htmlFor="password">Password</FieldLabel><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
              <FieldError>{error}</FieldError>
              <Button type="submit" disabled={loading || isPending}>{loading ? <><Spinner data-icon="inline-start" /> Signing in…</> : "Sign in"}</Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
