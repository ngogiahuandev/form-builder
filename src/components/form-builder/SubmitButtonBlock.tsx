"use client";

import { AlignCenter, AlignLeft, AlignRight, Settings2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";

export function SubmitButtonBlock() {
  const { schema, updateSettings } = useFormBuilderStore();
  const { settings } = schema;
  const [open, setOpen] = useState(false);

  const alignment = settings.submitAlignment ?? "left";

  return (
    <>
      <div className="group/submit hover:bg-accent/40 relative rounded-md px-3 py-2 transition-colors">
        {/* Left gutter */}
        <div className="absolute top-0 right-full flex items-center pr-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(true)}
            className="opacity-0 transition-opacity group-hover/submit:opacity-100"
          >
            <Settings2 />
            <span className="sr-only">Submit button settings</span>
          </Button>
        </div>

        <div className={cn("flex", alignment === "right" && "justify-end")}>
          <Button
            type="button"
            tabIndex={-1}
            className={cn(
              "pointer-events-none",
              alignment === "center" && "w-full",
            )}
          >
            {settings.submitLabel}
          </Button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submit button</SheetTitle>
            <SheetDescription>
              Customize the submit button label and alignment.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="submit-label">Button label</FieldLabel>
                <Input
                  id="submit-label"
                  value={settings.submitLabel}
                  onChange={(e) =>
                    updateSettings({ submitLabel: e.target.value })
                  }
                  placeholder="Submit"
                />
              </Field>

              <Field>
                <FieldLabel>Alignment</FieldLabel>
                <ToggleGroup
                  type="single"
                  value={alignment}
                  onValueChange={(v) =>
                    v &&
                    updateSettings({
                      submitAlignment: v as "left" | "center" | "right",
                    })
                  }
                >
                  <ToggleGroupItem value="left">
                    <AlignLeft />
                    <span className="sr-only">Left</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center">
                    <AlignCenter />
                    <span className="sr-only">Center (full width)</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right">
                    <AlignRight />
                    <span className="sr-only">Right</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="success-message">
                  Success message
                </FieldLabel>
                <Input
                  id="success-message"
                  value={settings.successMessage}
                  onChange={(e) =>
                    updateSettings({ successMessage: e.target.value })
                  }
                  placeholder="Thank you for your response!"
                />
              </Field>
            </FieldGroup>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
