"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDeleteButton({
  action,
  label = "Delete permanently",
  confirmMessage = "Delete this client and all saved assessments? This cannot be undone.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  confirmMessage?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        {label}
      </Button>
    </form>
  );
}
