import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function SimpleField({
  label,
  htmlFor,
  description,
  children,
}: {
  label: string
  htmlFor: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Field>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  )
}

export function SimpleInputField(
  props: React.ComponentProps<typeof Input> & { label: string; description?: string }
) {
  const { label, description, id, ...inputProps } = props
  const fieldId = id ?? props.name
  if (!fieldId) throw new Error("SimpleInputField requires id or name")
  return (
    <SimpleField label={label} htmlFor={fieldId} description={description}>
      <Input id={fieldId} {...inputProps} />
    </SimpleField>
  )
}

export function SimpleTextareaField(
  props: React.ComponentProps<typeof Textarea> & { label: string; description?: string }
) {
  const { label, description, id, className, ...textareaProps } = props
  const fieldId = id ?? props.name
  if (!fieldId) throw new Error("SimpleTextareaField requires id or name")
  return (
    <SimpleField label={label} htmlFor={fieldId} description={description}>
      <Textarea id={fieldId} className={className} {...textareaProps} />
    </SimpleField>
  )
}

export function FormFieldGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return <FieldGroup className={className}>{children}</FieldGroup>
}
