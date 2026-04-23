"use client";

import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FORM_FONTS, getFormFont } from "@/lib/form-fonts";
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
          <SheetDescription>
            Settings that apply to the entire form.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-font">Font family</FieldLabel>
              <FieldDescription>
                Applies to the form title, labels, and all inputs.
              </FieldDescription>
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
              <FieldLabel>Preview</FieldLabel>
              <div
                className="bg-muted/40 rounded-md border p-4"
                style={{ fontFamily: activeFont.fontFamily }}
              >
                <p className="text-xl font-bold">The quick brown fox</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  jumps over the lazy dog — 0123456789
                </p>
              </div>
            </Field>
          </FieldGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
}
