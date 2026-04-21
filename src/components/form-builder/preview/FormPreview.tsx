"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  generateDefaultValues,
  generateZodSchema,
} from "@/lib/generate-zod-schema";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types";
import { DateField } from "@/components/form-builder/preview/fields/DateField";
import { LongTextField } from "@/components/form-builder/preview/fields/LongTextField";
import { MultipleChoiceField } from "@/components/form-builder/preview/fields/MultipleChoiceField";
import { NumberField } from "@/components/form-builder/preview/fields/NumberField";
import { ShortTextField } from "@/components/form-builder/preview/fields/ShortTextField";
import { SingleChoiceField } from "@/components/form-builder/preview/fields/SingleChoiceField";

function renderField(
  field: FormField,
  control: ReturnType<typeof useForm<FieldValues>>["control"],
) {
  switch (field.type) {
    case "short_text":
      return <ShortTextField key={field.id} field={field} control={control} />;
    case "long_text":
      return <LongTextField key={field.id} field={field} control={control} />;
    case "single_choice":
      return (
        <SingleChoiceField key={field.id} field={field} control={control} />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceField key={field.id} field={field} control={control} />
      );
    case "number":
      return <NumberField key={field.id} field={field} control={control} />;
    case "date":
      return <DateField key={field.id} field={field} control={control} />;
  }
}

export function FormPreview() {
  const { schema } = useFormBuilderStore();
  const zodSchema = generateZodSchema(schema.fields);

  const form = useForm<FieldValues>({
    resolver: zodResolver(zodSchema),
    defaultValues: generateDefaultValues(schema.fields),
  });

  const onSubmit = (_data: FieldValues) => {
    console.log("Form submitted with data:", _data);
    toast.success(schema.settings.successMessage);
    form.reset();
  };

  if (schema.fields.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No fields to preview. Switch to Edit to add fields.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header — matches FormHeader layout exactly */}
      <div className="mb-10 pl-11">
        {schema.title && (
          <h1 className="text-3xl leading-tight font-bold">{schema.title}</h1>
        )}
        {schema.description && (
          <p className="text-muted-foreground mt-2">{schema.description}</p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Field list — matches Canvas pl-8 + FieldBlock px-3 py-2 */}
        <div className="flex flex-col pl-8">
          {schema.fields.map((field) => renderField(field, form.control))}
        </div>
        <div className="mt-4 pl-11">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {schema.settings.submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
