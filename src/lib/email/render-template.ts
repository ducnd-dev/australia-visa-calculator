export function renderTemplate(
  html: string,
  variables: Record<string, string | number | undefined>
): string {
  let out = html;
  for (const [key, value] of Object.entries(variables)) {
    const safe = value === undefined ? "" : String(value);
    out = out.replaceAll(`{{${key}}}`, safe);
  }
  return out;
}
