"use client";

import { Controller, type Control, type FieldValues } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { PreviewField } from "@/components/form-builder/preview/PreviewField";
import type { FormField } from "@/types";

interface NumberFieldProps {
  field: FormField;
  control: Control<FieldValues>;
}

export function NumberField({ field, control }: NumberFieldProps) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <PreviewField field={field} error={fieldState.error?.message}>
          <Input
            type="number"
            value={
              typeof rhf.value === "number" && !isNaN(rhf.value)
                ? rhf.value
                : ""
            }
            onChange={(e) =>
              rhf.onChange(
                isNaN(e.target.valueAsNumber)
                  ? undefined
                  : e.target.valueAsNumber,
              )
            }
            onBlur={rhf.onBlur}
            name={rhf.name}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        </PreviewField>
      )}
    />
  );
}
