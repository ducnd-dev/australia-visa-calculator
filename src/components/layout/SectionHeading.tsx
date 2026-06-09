import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  id,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-3 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
      >
        {title}
      </h2>
      <div
        className={cn(
          "mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-primary via-blue-500 to-sky-400",
          align === "center" && "mx-auto"
        )}
        aria-hidden
      />
      {description ? (
        <div
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
