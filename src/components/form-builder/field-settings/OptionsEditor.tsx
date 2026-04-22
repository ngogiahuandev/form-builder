"use client";

import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField, FormFieldOption } from "@/types";

interface OptionsEditorProps {
  field: FormField;
}

export function OptionsEditor({ field }: OptionsEditorProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const updateFieldDeferred = useFormBuilderStore((s) => s.updateFieldDeferred);
  const options = field.options ?? [];
  const isMultiple = field.type === "multiple_choice";

  const isDefault = (optValue: string) => {
    if (isMultiple) return (field.defaultValues ?? []).includes(optValue);
    return field.defaultValue === optValue;
  };

  const handleToggleDefault = (optValue: string) => {
    if (isMultiple) {
      const current = field.defaultValues ?? [];
      updateField(field.id, {
        defaultValues: current.includes(optValue)
          ? current.filter((v) => v !== optValue)
          : [...current, optValue],
      });
    } else {
      updateField(field.id, {
        defaultValue: field.defaultValue === optValue ? undefined : optValue,
      });
    }
  };

  const handleAdd = () => {
    const n = options.length + 1;
    const newOption: FormFieldOption = {
      id: crypto.randomUUID(),
      label: `Option ${n}`,
      value: `option_${n}`,
    };
    updateField(field.id, { options: [...options, newOption] });
  };

  const handleLabelChange = (optionId: string, label: string) => {
    updateFieldDeferred(field.id, {
      options: options.map((o) =>
        o.id === optionId
          ? {
              ...o,
              label,
              value: label.toLowerCase().replace(/\s+/g, "_") || o.value,
            }
          : o,
      ),
    });
  };

  const handleRemove = (optionId: string) => {
    const opt = options.find((o) => o.id === optionId);
    const updates: Partial<FormField> = {
      options: options.filter((o) => o.id !== optionId),
    };
    if (opt) {
      if (!isMultiple && field.defaultValue === opt.value)
        updates.defaultValue = undefined;
      if (isMultiple && (field.defaultValues ?? []).includes(opt.value))
        updates.defaultValues = (field.defaultValues ?? []).filter(
          (v) => v !== opt.value,
        );
    }
    updateField(field.id, updates);
  };

  return (
    <Field>
      <FieldLabel>Options</FieldLabel>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <div key={option.id} className="group/option flex items-center gap-2">
            <Input
              value={option.label}
              onChange={(e) => handleLabelChange(option.id, e.target.value)}
              placeholder="Option label"
              className="flex-1"
            />
            {isDefault(option.value) ? (
              <button
                type="button"
                onClick={() => handleToggleDefault(option.value)}
                className="shrink-0"
              >
                <Badge variant="secondary" className="cursor-pointer text-xs">
                  Default
                </Badge>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleDefault(option.value)}
                className="text-muted-foreground hover:text-foreground shrink-0 text-xs opacity-0 transition-opacity group-hover/option:opacity-100"
              >
                Set default
              </button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleRemove(option.id)}
            >
              <Trash2 />
              <span className="sr-only">Remove option</span>
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAdd}>
          <Plus data-icon="inline-start" />
          Add option
        </Button>
      </div>
    </Field>
  );
}
