"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/app/(app)/app/actions";
import { FormFieldGroup, SimpleInputField } from "@/components/forms/simple-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";

export function PasswordResetForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);
    if (result?.error) setError(result.error);
    else setSent(true);
    setPending(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>We will email you a link to set a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <p className="text-sm text-muted-foreground">
            If an account exists for that email, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <FormFieldGroup>
              <SimpleInputField id="email" name="email" type="email" label="Email" required autoComplete="email" />
              {error ? <FieldError>{error}</FieldError> : null}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending…" : "Send reset link"}
              </Button>
            </FormFieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
