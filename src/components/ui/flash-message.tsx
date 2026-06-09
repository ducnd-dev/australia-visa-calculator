import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

type FlashVariant = "success" | "error" | "warning" | "info"

const variantClass: Record<FlashVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-900 [&_[data-slot=alert-description]]:text-green-800",
  error: "border-destructive/30 bg-destructive/5 text-destructive [&_[data-slot=alert-description]]:text-destructive/90",
  warning: "border-amber-200 bg-amber-50 text-amber-950 [&_[data-slot=alert-description]]:text-amber-900",
  info: "border-border bg-muted/50 text-foreground [&_[data-slot=alert-description]]:text-muted-foreground",
}

export function FlashMessage({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: FlashVariant
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Alert className={cn("mt-4", variantClass[variant], className)} role="alert">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
