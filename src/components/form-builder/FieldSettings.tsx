"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
import { Input } from "@/components/ui/input";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { CommonFields } from "./field-settings/CommonFields";
import { DateSettings } from "./field-settings/DateSettings";
import { HeadingSettings } from "./field-settings/HeadingSettings";
import { LinearScaleSettings } from "./field-settings/LinearScaleSettings";
import { NumberValidation } from "./field-settings/NumberValidation";
import { OptionsEditor } from "./field-settings/OptionsEditor";
import { PhoneSettings } from "./field-settings/PhoneSettings";
import { RatingSettings } from "./field-settings/RatingSettings";
import { TextValidation } from "./field-settings/TextValidation";
import { UrlSettings } from "./field-settings/UrlSettings";

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
                {/* ── Divider ── */}
                {field.type === "divider" && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDelete}
                  >
                    <Trash2 data-icon="inline-start" />
                    Delete divider
                  </Button>
                )}

                {/* ── Heading ── */}
                {field.type === "heading" && (
                  <>
                    <HeadingSettings field={field} />
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete heading
                    </Button>
                  </>
                )}

                {/* ── All input field types ── */}
                {field.type !== "divider" && field.type !== "heading" && (
                  <>
                    <CommonFields
                      field={field}
                      showPlaceholder={
                        field.type !== "rating" && field.type !== "yes_no"
                      }
                      showDefaultText={
                        field.type === "short_text" ||
                        field.type === "long_text" ||
                        field.type === "email" ||
                        field.type === "url" ||
                        field.type === "number"
                      }
                      placeholderHint={
                        field.type === "email"
                          ? "e.g. your@email.com"
                          : field.type === "url"
                            ? "e.g. https://example.com"
                            : field.type === "phone"
                              ? "e.g. +1 (555) 000-0000"
                              : field.type === "time"
                                ? "e.g. 09:00"
                                : undefined
                      }
                    />

                    {/* Time default */}
                    {field.type === "time" && (
                      <Field>
                        <FieldLabel htmlFor="field-default-time">
                          Default time
                        </FieldLabel>
                        <Input
                          id="field-default-time"
                          type="time"
                          value={field.defaultValue ?? ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              defaultValue: e.target.value || undefined,
                            })
                          }
                        />
                      </Field>
                    )}

                    {/* Date */}
                    {field.type === "date" && <DateSettings field={field} />}

                    {/* Phone */}
                    {field.type === "phone" && <PhoneSettings field={field} />}

                    {/* URL */}
                    {field.type === "url" && <UrlSettings field={field} />}

                    {/* Single choice variant */}
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

                    {/* Options */}
                    {(field.type === "single_choice" ||
                      field.type === "multiple_choice" ||
                      field.type === "select") && (
                      <OptionsEditor field={field} />
                    )}

                    {/* Rating */}
                    {field.type === "rating" && (
                      <RatingSettings field={field} />
                    )}

                    {/* Linear scale */}
                    {field.type === "linear_scale" && (
                      <LinearScaleSettings field={field} />
                    )}

                    {/* Text validation */}
                    {(field.type === "short_text" ||
                      field.type === "long_text") && (
                      <TextValidation field={field} />
                    )}

                    {/* Number validation */}
                    {field.type === "number" && (
                      <NumberValidation field={field} />
                    )}

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      <Trash2 data-icon="inline-start" />
                      Delete field
                    </Button>
                  </>
                )}
              </FieldGroup>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
