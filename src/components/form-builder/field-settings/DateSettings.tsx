"use client";

import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField } from "@/types";

interface DateSettingsProps {
  field: FormField;
}

export function DateSettings({ field }: DateSettingsProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const defaultDate = field.defaultValue
    ? new Date(field.defaultValue)
    : undefined;

  return (
    <>
      <Field>
        <FieldLabel>Default date</FieldLabel>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "flex-1 justify-start text-left font-normal",
                  !defaultDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon data-icon="inline-start" />
                {defaultDate
                  ? format(defaultDate, "PPP")
                  : "Pick a default date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={defaultDate}
                onSelect={(date) =>
                  updateField(field.id, { defaultValue: date?.toISOString() })
                }
              />
            </PopoverContent>
          </Popover>
          {defaultDate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updateField(field.id, { defaultValue: undefined })}
            >
              <Trash2 />
              <span className="sr-only">Clear date</span>
            </Button>
          )}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="field-min-date">Min date</FieldLabel>
          <Input
            id="field-min-date"
            type="date"
            value={field.validation?.minDate ?? ""}
            onChange={(e) =>
              updateField(field.id, {
                validation: {
                  ...field.validation,
                  minDate: e.target.value || undefined,
                },
              })
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="field-max-date">Max date</FieldLabel>
          <Input
            id="field-max-date"
            type="date"
            value={field.validation?.maxDate ?? ""}
            onChange={(e) =>
              updateField(field.id, {
                validation: {
                  ...field.validation,
                  maxDate: e.target.value || undefined,
                },
              })
            }
          />
        </Field>
      </div>
    </>
  );
}
