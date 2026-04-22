"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types";

interface NumberValidationProps {
  field: FormField;
}

export function NumberValidation({ field }: NumberValidationProps) {
  const updateFieldDeferred = useFormBuilderStore((s) => s.updateFieldDeferred);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field>
        <FieldLabel htmlFor="field-min">Min</FieldLabel>
        <Input
          id="field-min"
          type="number"
          value={field.validation?.min ?? ""}
          onChange={(e) =>
            updateFieldDeferred(field.id, {
              validation: {
                ...field.validation,
                min: e.target.value === "" ? undefined : Number(e.target.value),
              },
            })
          }
        />
      </Field>
      <Field>
        <FieldLabel htmlFor="field-max">Max</FieldLabel>
        <Input
          id="field-max"
          type="number"
          value={field.validation?.max ?? ""}
          onChange={(e) =>
            updateFieldDeferred(field.id, {
              validation: {
                ...field.validation,
                max: e.target.value === "" ? undefined : Number(e.target.value),
              },
            })
          }
        />
      </Field>
    </div>
  );
}
