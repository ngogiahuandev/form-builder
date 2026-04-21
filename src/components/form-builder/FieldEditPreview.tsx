"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/types";

interface FieldEditPreviewProps {
  field: FormField;
}

export function FieldEditPreview({ field }: FieldEditPreviewProps) {
  const placeholder = field.placeholder;

  switch (field.type) {
    case "short_text":
      return (
        <Input
          disabled
          placeholder={placeholder ?? "Short answer"}
          className="mt-2 cursor-default"
        />
      );

    case "long_text":
      return (
        <Textarea
          disabled
          placeholder={placeholder ?? "Long answer…"}
          rows={3}
          className="mt-2 cursor-default resize-none"
        />
      );

    case "number":
      return (
        <Input
          type="number"
          disabled
          placeholder={placeholder ?? "0"}
          className="mt-2 cursor-default"
        />
      );

    case "date":
      return (
        <Button
          variant="outline"
          disabled
          className="text-muted-foreground mt-2 w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {placeholder ?? "Pick a date"}
        </Button>
      );

    case "single_choice": {
      const options = field.options ?? [];
      if (options.length === 0) {
        return (
          <p className="text-muted-foreground mt-2 text-xs italic">
            No options yet — add them in the settings panel
          </p>
        );
      }
      if (field.variant === "select") {
        return (
          <Select disabled>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder={placeholder ?? "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return (
        <RadioGroup disabled className="mt-2 flex flex-col gap-2">
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <RadioGroupItem
                value={opt.value}
                id={`edit-${field.id}-${opt.id}`}
                disabled
              />
              <Label
                htmlFor={`edit-${field.id}-${opt.id}`}
                className="text-foreground/70 font-normal"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }

    case "multiple_choice": {
      const options = field.options ?? [];
      if (options.length === 0) {
        return (
          <p className="text-muted-foreground mt-2 text-xs italic">
            No options yet — add them in the settings panel
          </p>
        );
      }
      return (
        <div className="mt-2 flex flex-col gap-2">
          {options.map((opt) => (
            <div key={opt.id} className="flex items-center gap-2">
              <Checkbox id={`edit-mc-${field.id}-${opt.id}`} disabled />
              <Label
                htmlFor={`edit-mc-${field.id}-${opt.id}`}
                className="text-foreground/70 font-normal"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      );
    }

    case "select": {
      const options = field.options ?? [];
      if (options.length === 0) {
        return (
          <p className="text-muted-foreground mt-2 text-xs italic">
            No options yet — add them in the settings panel
          </p>
        );
      }
      return (
        <Select disabled>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder={placeholder ?? "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    case "linear_scale": {
      const from = field.validation?.scaleFrom ?? 1;
      const to = field.validation?.scaleTo ?? 5;
      const jump = field.validation?.scaleJump ?? 1;
      const steps: number[] = [];
      for (let i = from; i <= to; i += jump) steps.push(i);
      return (
        <div className="mt-2 flex flex-wrap gap-2">
          {steps.map((n) => (
            <Button key={n} variant="outline" size="icon" disabled>
              {n}
            </Button>
          ))}
        </div>
      );
    }

    case "divider":
      return <Separator className="my-4" />;
  }
}
