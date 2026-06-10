"use client";

import { useState } from "react";
import { updatePassword } from "@/app/(app)/app/actions";
import { FormFieldGroup, SimpleInputField } from "@/components/forms/simple-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);
    if (result?.error) setError(result.error);
    setPending(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New password</CardTitle>
        <CardDescription>Enter a new password for your practice account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FormFieldGroup>
            <SimpleInputField
              id="password"
              name="password"
              type="password"
              label="New password"
              required
              minLength={6}
              autoComplete="new-password"
            />
            {error ? <FieldError>{error}</FieldError> : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Update password"}
            </Button>
          </FormFieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
