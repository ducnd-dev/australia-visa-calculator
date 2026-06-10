"use client";

import { useMemo, useState } from "react";
import { searchAnzsco } from "@/lib/occupations/anzsco-subset";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function OccupationCombobox({
  defaultCode = "",
  defaultTitle = "",
}: {
  defaultCode?: string;
  defaultTitle?: string;
}) {
  const [query, setQuery] = useState(
    defaultCode && defaultTitle ? `${defaultCode} — ${defaultTitle}` : defaultCode || defaultTitle
  );
  const [code, setCode] = useState(defaultCode);
  const [title, setTitle] = useState(defaultTitle);
  const [open, setOpen] = useState(false);

  const results = useMemo(() => searchAnzsco(query), [query]);

  function select(codeVal: string, titleVal: string) {
    setCode(codeVal);
    setTitle(titleVal);
    setQuery(`${codeVal} — ${titleVal}`);
    setOpen(false);
  }

  return (
    <Field>
      <FieldLabel htmlFor="occupationSearch">Nominated occupation (ANZSCO)</FieldLabel>
      <div className="relative">
        <Input
          id="occupationSearch"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) {
              setCode("");
              setTitle("");
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search by code or title, e.g. Software Engineer"
          autoComplete="off"
        />
        <input type="hidden" name="anzscoCode" value={code} />
        <input type="hidden" name="anzscoTitle" value={title} />
        {open && results.length > 0 && (
          <ul
            className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
            role="listbox"
          >
            {results.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-muted",
                    code === o.code && "bg-muted"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => select(o.code, o.title)}
                >
                  <span className="font-mono text-xs text-muted-foreground">{o.code}</span>
                  <span className="ml-2">{o.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FieldDescription>
        Reference only — confirm eligibility on current skilled occupation lists.
      </FieldDescription>
    </Field>
  );
}
