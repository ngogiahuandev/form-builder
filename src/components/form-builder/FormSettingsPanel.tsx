"use client";

import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { FORM_FONTS, getFormFont } from "@/lib/form-fonts";
import {
  BORDER_RADIUS_LABELS,
  BORDER_RADIUS_VALUES,
  DEFAULT_BORDER_RADIUS,
  DEFAULT_FORM_COLOR_KEY,
  FORM_COLORS,
} from "@/lib/form-appearance";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FormFont } from "@/lib/form-fonts";

function groupFonts(fonts: FormFont[]) {
  const groups: Record<FormFont["category"], FormFont[]> = {
    Sans: [],
    Serif: [],
    Display: [],
    Mono: [],
  };
  for (const font of fonts) groups[font.category].push(font);
  return groups;
}

export function FormSettingsPanel() {
  const { schema, updateSettings } = useFormBuilderStore();
  const { settings } = schema;
  const [open, setOpen] = useState(false);

  const grouped = useMemo(() => groupFonts(FORM_FONTS), []);
  const activeFont = getFormFont(settings.fontFamily);

  const borderRadius = settings.borderRadius ?? DEFAULT_BORDER_RADIUS;
  const primaryColor = settings.primaryColor ?? DEFAULT_FORM_COLOR_KEY;
  const radiusLabel = BORDER_RADIUS_LABELS[borderRadius] ?? "LG";
  const radiusValue = BORDER_RADIUS_VALUES[borderRadius] ?? "0.625rem";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Form settings">
          <Settings2 />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Form settings</SheetTitle>
        </SheetHeader>
        <div className="px-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-font">Font family</FieldLabel>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSettings({ fontFamily: value })}
              >
                <SelectTrigger
                  id="form-font"
                  className="w-full"
                  style={{ fontFamily: activeFont.fontFamily }}
                >
                  <SelectValue placeholder="Choose a font" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "Sans",
                      "Serif",
                      "Display",
                      "Mono",
                    ] as FormFont["category"][]
                  ).map((category) =>
                    grouped[category].length === 0 ? null : (
                      <SelectGroup key={category}>
                        <SelectLabel>{category}</SelectLabel>
                        {grouped[category].map((font) => (
                          <SelectItem
                            key={font.key}
                            value={font.key}
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <div className="mb-2 flex items-center justify-between">
                <FieldLabel>Border radius</FieldLabel>
                <span
                  className="text-muted-foreground font-mono text-xs"
                  style={{
                    borderRadius: radiusValue,
                    border: "1.5px solid currentColor",
                    padding: "1px 6px",
                  }}
                >
                  {radiusLabel}
                </span>
              </div>
              <Slider
                min={0}
                max={4}
                step={1}
                value={[borderRadius]}
                onValueChange={([value]) =>
                  updateSettings({ borderRadius: value })
                }
              />
              <div className="text-muted-foreground mt-1.5 flex justify-between text-xs">
                {BORDER_RADIUS_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </Field>

            <Field>
              <FieldLabel>Primary color</FieldLabel>
              <div className="mt-1 flex flex-wrap gap-2">
                {FORM_COLORS.map((color) => {
                  const isSelected = primaryColor === color.key;
                  return (
                    <button
                      key={color.key}
                      type="button"
                      title={color.label}
                      onClick={() =>
                        updateSettings({ primaryColor: color.key })
                      }
                      className="size-7 rounded-full border-2 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      style={{
                        backgroundColor: color.hex,
                        borderColor: "transparent",
                        boxShadow: isSelected
                          ? `0 0 0 2px var(--background), 0 0 0 4px ${color.hex}`
                          : undefined,
                      }}
                      aria-label={color.label}
                      aria-pressed={isSelected}
                    />
                  );
                })}
              </div>
            </Field>
          </FieldGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
}
