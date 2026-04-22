"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types";

interface HeadingSettingsProps {
  field: FormField;
}

export function HeadingSettings({ field }: HeadingSettingsProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const updateFieldDeferred = useFormBuilderStore((s) => s.updateFieldDeferred);

  return (
    <>
      <Field>
        <FieldLabel htmlFor="heading-label">Heading text</FieldLabel>
        <Input
          id="heading-label"
          value={field.label}
          onChange={(e) =>
            updateFieldDeferred(field.id, { label: e.target.value })
          }
          placeholder="e.g. Section title"
        />
      </Field>
      <Field>
        <FieldLabel>Heading level</FieldLabel>
        <Select
          value={field.headingLevel ?? "h2"}
          onValueChange={(v) =>
            updateField(field.id, { headingLevel: v as "h1" | "h2" | "h3" })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="h1">H1 — Large</SelectItem>
            <SelectItem value="h2">H2 — Medium</SelectItem>
            <SelectItem value="h3">H3 — Small</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}
