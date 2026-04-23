"use client";

import { CodeField } from "@/components/form-builder/preview/fields/CodeField";
import { DateField } from "@/components/form-builder/preview/fields/DateField";
import { DescriptionField } from "@/components/form-builder/preview/fields/DescriptionField";
import { MarkdownField } from "@/components/form-builder/preview/fields/MarkdownField";
import { EmailField } from "@/components/form-builder/preview/fields/EmailField";
import { HeadingField } from "@/components/form-builder/preview/fields/HeadingField";
import { LinearScaleField } from "@/components/form-builder/preview/fields/LinearScaleField";
import { LongTextField } from "@/components/form-builder/preview/fields/LongTextField";
import { MultipleChoiceField } from "@/components/form-builder/preview/fields/MultipleChoiceField";
import { NumberField } from "@/components/form-builder/preview/fields/NumberField";
import { PhoneField } from "@/components/form-builder/preview/fields/PhoneField";
import { RatingField } from "@/components/form-builder/preview/fields/RatingField";
import { SelectField } from "@/components/form-builder/preview/fields/SelectField";
import { ShortTextField } from "@/components/form-builder/preview/fields/ShortTextField";
import { SingleChoiceField } from "@/components/form-builder/preview/fields/SingleChoiceField";
import { TimeField } from "@/components/form-builder/preview/fields/TimeField";
import { UrlField } from "@/components/form-builder/preview/fields/UrlField";
import { YesNoField } from "@/components/form-builder/preview/fields/YesNoField";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  generateDefaultValues,
  generateZodSchema,
} from "@/lib/generate-zod-schema";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldValues } from "react-hook-form";
import { toast } from "sonner";

function renderField(
  field: FormField,
  control: ReturnType<typeof useForm<FieldValues>>["control"],
) {
  switch (field.type) {
    case "short_text":
      return <ShortTextField key={field.id} field={field} control={control} />;
    case "long_text":
      return <LongTextField key={field.id} field={field} control={control} />;
    case "email":
      return <EmailField key={field.id} field={field} control={control} />;
    case "phone":
      return <PhoneField key={field.id} field={field} control={control} />;
    case "url":
      return <UrlField key={field.id} field={field} control={control} />;
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
    case "time":
      return <TimeField key={field.id} field={field} control={control} />;
    case "select":
      return <SelectField key={field.id} field={field} control={control} />;
    case "rating":
      return <RatingField key={field.id} field={field} control={control} />;
    case "yes_no":
      return <YesNoField key={field.id} field={field} control={control} />;
    case "linear_scale":
      return (
        <LinearScaleField key={field.id} field={field} control={control} />
      );
    case "code":
      return <CodeField key={field.id} field={field} control={control} />;
    case "heading":
      return <HeadingField key={field.id} field={field} />;
    case "description":
      return <DescriptionField key={field.id} field={field} />;
    case "markdown":
      return <MarkdownField key={field.id} field={field} />;
    case "divider":
      return <Separator key={field.id} className="my-4" />;
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
      <div className="mb-10 px-3">
        {schema.title && (
          <h1 className="text-3xl leading-tight font-bold">{schema.title}</h1>
        )}
        {schema.description && (
          <p className="text-muted-foreground mt-2">{schema.description}</p>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col">
          {schema.fields.map((field) => renderField(field, form.control))}
        </div>
        <div
          className={cn(
            "mt-4 flex px-3",
            schema.settings.submitAlignment === "right" && "justify-end",
          )}
        >
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className={cn(
              schema.settings.submitAlignment === "center" && "w-full",
            )}
          >
            {schema.settings.submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
