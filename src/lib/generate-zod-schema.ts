import { z } from "zod";
import type { FormField } from "@/types";

function buildFieldSchema(field: FormField): z.ZodTypeAny {
  switch (field.type) {
    case "short_text":
    case "long_text": {
      let str = z.string();
      const { minLength, maxLength } = field.validation ?? {};

      if (field.required && !minLength)
        str = str.min(1, "This field is required");
      if (minLength)
        str = str.min(
          minLength,
          `At least ${minLength} character${minLength === 1 ? "" : "s"}`,
        );
      if (maxLength)
        str = str.max(
          maxLength,
          `At most ${maxLength} character${maxLength === 1 ? "" : "s"}`,
        );
      return field.required ? str : str.optional();
    }
    case "number": {
      let base = z.coerce.number();
      if (field.validation?.min !== undefined)
        base = base.min(field.validation.min);
      if (field.validation?.max !== undefined)
        base = base.max(field.validation.max);
      return field.required ? base : base.optional();
    }
    case "date": {
      let base = z.coerce.date();
      if (field.validation?.minDate)
        base = base.min(
          new Date(field.validation.minDate),
          `Date must be on or after ${field.validation.minDate}`,
        );
      if (field.validation?.maxDate)
        base = base.max(
          new Date(field.validation.maxDate),
          `Date must be on or before ${field.validation.maxDate}`,
        );
      return field.required ? base : base.optional();
    }
    case "single_choice": {
      const values = (field.options ?? []).map((o) => o.value);
      if (values.length < 1) {
        return field.required
          ? z.string().min(1, "Select an option")
          : z.string().optional();
      }
      const enumSchema = z.enum(values as [string, ...string[]]);
      return field.required ? enumSchema : enumSchema.optional();
    }
    case "multiple_choice": {
      const values = (field.options ?? []).map((o) => o.value);
      if (values.length < 1) {
        const base = z.array(z.string());
        return field.required
          ? base.min(1, "Select at least one option")
          : base.optional();
      }
      const base = z.array(z.enum(values as [string, ...string[]]));
      return field.required
        ? base.min(1, "Select at least one option")
        : base.optional();
    }
  }
}

export function generateZodSchema(
  fields: FormField[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field.id] = buildFieldSchema(field);
  }
  return z.object(shape);
}

export function generateDefaultValues(
  fields: FormField[],
): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case "short_text":
      case "long_text":
        defaults[field.id] = field.defaultValue ?? "";
        break;
      case "number":
        defaults[field.id] =
          field.defaultValue !== undefined
            ? Number(field.defaultValue)
            : undefined;
        break;
      case "single_choice":
        defaults[field.id] = field.defaultValue;
        break;
      case "multiple_choice":
        defaults[field.id] = field.defaultValues ?? [];
        break;
      case "date":
        defaults[field.id] = field.defaultValue
          ? new Date(field.defaultValue)
          : undefined;
        break;
    }
  }
  return defaults;
}
