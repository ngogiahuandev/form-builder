"use client";

import { Controller, type Control, type FieldValues } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewField } from "@/components/form-builder/preview/PreviewField";
import type { FormField } from "@/types";

interface SelectFieldProps {
  field: FormField;
  control: Control<FieldValues>;
}

export function SelectField({ field, control }: SelectFieldProps) {
  const options = field.options ?? [];

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <PreviewField field={field} error={fieldState.error?.message}>
          <Select
            value={typeof rhf.value === "string" ? rhf.value : ""}
            onValueChange={rhf.onChange}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder ?? "Select an option"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </PreviewField>
      )}
    />
  );
}
