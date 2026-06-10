"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signUpAgency, signUpWithInvite } from "@/app/(app)/app/actions";
import { FormFieldGroup, SimpleInputField } from "@/components/forms/simple-field";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";

export function AuthForm({
  invite,
}: {
  invite?: { token: string; email: string; orgName: string; role: string } | null;
}) {
  const isInvite = !!invite;
  const [mode, setMode] = useState<"signin" | "signup">(isInvite ? "signup" : "signin");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (invite?.token) {
      formData.set("inviteToken", invite.token);
    }

    let result: { error?: string } | void;
    if (mode === "signin") {
      result = await signIn(formData);
    } else if (isInvite) {
      result = await signUpWithInvite(formData);
    } else {
      result = await signUpAgency(formData);
    }

    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <Card className="mx-auto max-w-md border-border/80 shadow-lg shadow-primary/5">
      <CardHeader className="space-y-1 border-b border-border/60 bg-muted/20 pb-6">
        <CardTitle>
          {isInvite
            ? `Join ${invite.orgName}`
            : mode === "signin"
              ? "Agent sign in"
              : "Start free trial"}
        </CardTitle>
        <CardDescription>
          {isInvite
            ? `You were invited as ${invite.role}. Sign in or create an account with ${invite.email}.`
            : "Migration practice dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {!isInvite && (
          <div className="mb-5 flex gap-2 rounded-lg bg-muted/50 p-1">
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("signin")}
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Sign up
            </Button>
          </div>
        )}
        {isInvite && (
          <div className="mb-5 flex gap-2 rounded-lg bg-muted/50 p-1">
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("signup")}
            >
              Create account
            </Button>
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setMode("signin")}
            >
              I have an account
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormFieldGroup>
            {mode === "signup" && !isInvite && (
              <SimpleInputField id="orgName" name="orgName" label="Practice name" required />
            )}
            {(mode === "signup" || isInvite) && (
              <SimpleInputField id="fullName" name="fullName" label="Your name" required={mode === "signup"} />
            )}
            <SimpleInputField
              id="email"
              name="email"
              type="email"
              label="Email"
              required
              autoComplete="email"
              defaultValue={invite?.email}
              readOnly={!!invite}
            />
            <SimpleInputField
              id="password"
              name="password"
              type="password"
              label="Password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
            {mode === "signup" && !isInvite && (
              <Field orientation="horizontal" className="items-start">
                <input
                  type="checkbox"
                  id="platformMarketing"
                  name="platformMarketing"
                  className="mt-0.5 size-4 shrink-0 rounded border border-input accent-primary"
                />
                <div className="flex flex-col gap-0.5">
                  <FieldLabel htmlFor="platformMarketing">Product tips and release notes</FieldLabel>
                  <FieldDescription>Optional marketing emails from the platform.</FieldDescription>
                </div>
              </Field>
            )}
            {mode === "signin" && !isInvite && (
              <p className="text-right text-sm">
                <Link href="/login/reset" className="text-primary hover:underline">
                  Forgot password?
                </Link>
              </p>
            )}
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending
                ? "Please wait…"
                : isInvite
                  ? mode === "signin"
                    ? "Sign in and join"
                    : "Create account and join"
                  : mode === "signin"
                    ? "Sign in"
                    : "Create account"}
            </Button>
          </FormFieldGroup>
        </form>
        {!isInvite && (
          <>
            <Separator className="my-6" />
            <p className="text-center text-sm text-muted-foreground">
              New here? Use Sign up to start a trial workspace.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
