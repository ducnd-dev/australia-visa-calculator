"use client";

import { useState } from "react";
import { submitContactForm } from "@/app/(marketing)/contact/actions";
import { FormFieldGroup, SimpleInputField, SimpleTextareaField } from "@/components/forms/simple-field";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await submitContactForm(new FormData(e.currentTarget));
    if (result?.error) setError(result.error);
    else {
      setSent(true);
      e.currentTarget.reset();
    }
    setPending(false);
  }

  if (sent) {
    return (
      <div className="not-prose mt-6 max-w-lg rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-900">
        <p className="font-medium">Message sent</p>
        <p className="mt-1 text-green-800">We will reply to your email as soon as we can.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="not-prose mt-6 max-w-lg space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
    >
      <FormFieldGroup>
        <SimpleInputField id="name" name="name" label="Your name" required />
        <SimpleInputField id="email" name="email" type="email" label="Email" required />
        <SimpleTextareaField id="message" name="message" label="Message" rows={5} required />
        {error ? <FieldError>{error}</FieldError> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send message"}
        </Button>
      </FormFieldGroup>
    </form>
  );
}
