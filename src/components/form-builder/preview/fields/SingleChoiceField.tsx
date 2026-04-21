"use client";

import { Controller, type Control, type FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PreviewField } from "@/components/form-builder/preview/PreviewField";
import type { FormField } from "@/types";

interface SingleChoiceFieldProps {
  field: FormField;
  control: Control<FieldValues>;
}

export function SingleChoiceField({ field, control }: SingleChoiceFieldProps) {
  const options = field.options ?? [];

  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <PreviewField field={field} error={fieldState.error?.message}>
          {field.variant === "select" ? (
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
                {options.map((opt) => (
                  <SelectItem key={opt.id} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <RadioGroup
              value={typeof rhf.value === "string" ? rhf.value : ""}
              onValueChange={rhf.onChange}
              className="flex flex-col gap-2"
            >
              {options.map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={opt.value}
                    id={`${field.id}-${opt.id}`}
                  />
                  <Label
                    htmlFor={`${field.id}-${opt.id}`}
                    className="font-normal"
                  >
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </PreviewField>
      )}
    />
  );
}
