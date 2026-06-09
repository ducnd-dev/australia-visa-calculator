"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

export function CheckboxField({
  id,
  name,
  label,
  description,
  defaultChecked,
  checked,
  onCheckedChange,
}: {
  id: string
  name?: string
  label: string
  description?: string
  defaultChecked?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <Field orientation="horizontal">
      <Checkbox
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange?.(!!v)}
      />
      <div className="flex flex-col gap-0.5">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description ? <FieldDescription>{description}</FieldDescription> : null}
      </div>
    </Field>
  )
}
