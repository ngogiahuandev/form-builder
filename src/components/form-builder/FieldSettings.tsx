"use client";

import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormField, FormFieldOption } from "@/types";

interface OptionsEditorProps {
  field: FormField;
}

function OptionsEditor({ field }: OptionsEditorProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);
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
    updateField(field.id, {
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
      if (!isMultiple && field.defaultValue === opt.value) {
        updates.defaultValue = undefined;
      }
      if (isMultiple && (field.defaultValues ?? []).includes(opt.value)) {
        updates.defaultValues = (field.defaultValues ?? []).filter(
          (v) => v !== opt.value,
        );
      }
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

export function FieldSettings() {
  const {
    schema,
    selectedFieldId,
    setSelectedFieldId,
    updateField,
    removeField,
  } = useFormBuilderStore();
  const field = schema.fields.find((f) => f.id === selectedFieldId);

  const handleDelete = () => {
    if (field) {
      removeField(field.id);
      setSelectedFieldId(null);
    }
  };

  const defaultDate = field?.defaultValue
    ? new Date(field.defaultValue)
    : undefined;

  return (
    <Sheet
      open={!!field}
      onOpenChange={(open) => {
        if (!open) setSelectedFieldId(null);
      }}
    >
      <SheetContent className="overflow-y-auto">
        {field && (
          <>
            <SheetHeader>
              <SheetTitle>Field settings</SheetTitle>
              <SheetDescription>
                Customize this field&apos;s label, placeholder, and behavior.
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="field-label">Question</FieldLabel>
                  <Input
                    id="field-label"
                    value={field.label}
                    onChange={(e) =>
                      updateField(field.id, { label: e.target.value })
                    }
                    placeholder="e.g. What is your name?"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="field-placeholder">
                    Placeholder
                  </FieldLabel>
                  <Input
                    id="field-placeholder"
                    value={field.placeholder ?? ""}
                    onChange={(e) =>
                      updateField(field.id, { placeholder: e.target.value })
                    }
                    placeholder="e.g. Enter your name…"
                  />
                </Field>

                {(field.type === "short_text" ||
                  field.type === "long_text" ||
                  field.type === "number") && (
                  <Field>
                    <FieldLabel htmlFor="field-default">
                      Default value
                    </FieldLabel>
                    <Input
                      id="field-default"
                      type={field.type === "number" ? "number" : "text"}
                      value={field.defaultValue ?? ""}
                      onChange={(e) =>
                        updateField(field.id, {
                          defaultValue: e.target.value || undefined,
                        })
                      }
                      placeholder="Pre-filled value"
                    />
                  </Field>
                )}

                {field.type === "date" && (
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
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={defaultDate}
                            onSelect={(date) =>
                              updateField(field.id, {
                                defaultValue: date?.toISOString(),
                              })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      {defaultDate && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() =>
                            updateField(field.id, { defaultValue: undefined })
                          }
                        >
                          <Trash2 />
                          <span className="sr-only">Clear date</span>
                        </Button>
                      )}
                    </div>
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="field-help">Help text</FieldLabel>
                  <Input
                    id="field-help"
                    value={field.helpText ?? ""}
                    onChange={(e) =>
                      updateField(field.id, { helpText: e.target.value })
                    }
                    placeholder="A short description below the label"
                  />
                </Field>

                <Field orientation="horizontal">
                  <FieldLabel htmlFor="field-required">Required</FieldLabel>
                  <Switch
                    id="field-required"
                    checked={field.required}
                    onCheckedChange={(checked) =>
                      updateField(field.id, { required: checked })
                    }
                  />
                </Field>

                {field.type === "single_choice" && (
                  <Field>
                    <FieldLabel>Display as</FieldLabel>
                    <Select
                      value={field.variant ?? "radio"}
                      onValueChange={(v) =>
                        updateField(field.id, {
                          variant: v as "radio" | "select",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="radio">Radio buttons</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}

                {(field.type === "single_choice" ||
                  field.type === "multiple_choice") && (
                  <OptionsEditor field={field} />
                )}

                {field.type === "number" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field>
                      <FieldLabel htmlFor="field-min">Min</FieldLabel>
                      <Input
                        id="field-min"
                        type="number"
                        value={field.validation?.min ?? ""}
                        onChange={(e) =>
                          updateField(field.id, {
                            validation: {
                              ...field.validation,
                              min:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
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
                          updateField(field.id, {
                            validation: {
                              ...field.validation,
                              max:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                            },
                          })
                        }
                      />
                    </Field>
                  </div>
                )}

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  <Trash2 data-icon="inline-start" />
                  Delete field
                </Button>
              </FieldGroup>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
