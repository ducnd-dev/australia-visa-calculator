export function PageIntro({
  title,
  description,
  eyebrow,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-8 space-y-3">
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-tight">
        {title}
      </h1>
      {description ? (
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
      {children}
    </header>
  );
}
