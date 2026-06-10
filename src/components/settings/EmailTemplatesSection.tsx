import {
  resetOrgEmailTemplate,
  saveOrgEmailTemplate,
} from "@/app/(app)/app/settings/email-template-actions";
import { SectionCard } from "@/components/layout/SectionCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export type EmailTemplateRow = {
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  isCustomized: boolean;
};

export function EmailTemplatesSection({ templates }: { templates: EmailTemplateRow[] }) {
  if (templates.length === 0) return null;

  return (
    <SectionCard
      title="Email templates"
      description="Customize transactional templates for your practice. Use {{clientName}}, {{agencyName}}, {{disclaimer}}, {{unsubscribeUrl}}."
    >
      <div className="space-y-10">
        {templates.map((tpl) => (
            <form key={tpl.slug} action={saveOrgEmailTemplate} className="space-y-4 rounded-xl border border-border/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-foreground">{tpl.name}</p>
                {tpl.isCustomized ? (
                  <span className="text-xs text-primary">Customized</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Default</span>
                )}
              </div>
              <input type="hidden" name="slug" value={tpl.slug} />
              <Field>
                <FieldLabel htmlFor={`subject-${tpl.slug}`}>Subject</FieldLabel>
                <Input id={`subject-${tpl.slug}`} name="subject" defaultValue={tpl.subject} required />
              </Field>
              <Field>
                <FieldLabel htmlFor={`body-${tpl.slug}`}>Body HTML</FieldLabel>
                <Textarea
                  id={`body-${tpl.slug}`}
                  name="bodyHtml"
                  rows={6}
                  defaultValue={tpl.body_html}
                  className="font-mono text-xs"
                  required
                />
                <FieldDescription>Preview variables will be replaced when sending.</FieldDescription>
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">
                  Save template
                </Button>
                {tpl.isCustomized ? (
                  <Button formAction={resetOrgEmailTemplate} type="submit" size="sm" variant="outline">
                    Reset to default
                  </Button>
                ) : null}
              </div>
            </form>
        ))}
      </div>
    </SectionCard>
  );
}
