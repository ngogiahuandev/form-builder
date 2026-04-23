"use client";

import { CalendarIcon, Star } from "lucide-react";
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
import { CodeEditor } from "@/components/form-builder/CodeEditor";
import { AUTO_DETECT_KEY, getCodeLanguage } from "@/lib/code-languages";
import { cn } from "@/lib/utils";
import type { FormField } from "@/types";

interface FieldEditPreviewProps {
  field: FormField;
}

const HEADING_CLASSES = {
  h1: "text-2xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-medium",
} as const;

const TEXT_ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

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

    case "email":
      return (
        <Input
          disabled
          type="email"
          placeholder={placeholder ?? "your@email.com"}
          className="mt-2 cursor-default"
        />
      );

    case "phone":
      return (
        <Input
          disabled
          type="tel"
          placeholder={placeholder ?? "+1 (555) 000-0000"}
          className="mt-2 cursor-default"
        />
      );

    case "url":
      return (
        <Input
          disabled
          type="url"
          placeholder={placeholder ?? "https://example.com"}
          className="mt-2 cursor-default"
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

    case "time":
      return <Input type="time" disabled className="mt-2 cursor-default" />;

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

    case "rating": {
      const max = field.validation?.max ?? 5;
      return (
        <div className="mt-2 flex gap-1">
          {Array.from({ length: max }, (_, i) => (
            <Star key={i} className="text-muted-foreground/50 h-6 w-6" />
          ))}
        </div>
      );
    }

    case "yes_no":
      return (
        <div className="mt-2 flex gap-3">
          <Button variant="outline" disabled className="flex-1">
            Yes
          </Button>
          <Button variant="outline" disabled className="flex-1">
            No
          </Button>
        </div>
      );

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

    case "code": {
      const isAuto = field.codeLanguage === AUTO_DETECT_KEY;
      const badgeLabel = isAuto
        ? "Auto-detect"
        : getCodeLanguage(field.codeLanguage).label;
      return (
        <div className="mt-2 flex flex-col gap-1.5">
          <div className="text-muted-foreground flex items-center text-xs">
            <span className="bg-muted inline-flex items-center rounded px-1.5 py-0.5 font-mono">
              {badgeLabel}
            </span>
          </div>
          <div className="pointer-events-none">
            <CodeEditor
              value={field.defaultValue ?? ""}
              language={field.codeLanguage}
              placeholder={placeholder ?? "Write your code…"}
              readOnly
              minHeight="6rem"
              maxHeight="12rem"
            />
          </div>
        </div>
      );
    }

    case "heading": {
      const level = field.headingLevel ?? "h2";
      const align = field.textAlign ?? "left";
      const Tag = level;
      return (
        <Tag
          className={cn(
            "mt-1 leading-tight",
            HEADING_CLASSES[level],
            TEXT_ALIGN_CLASSES[align],
          )}
        >
          {field.label || "Heading"}
        </Tag>
      );
    }

    case "description": {
      const align = field.textAlign ?? "left";
      return (
        <p
          className={cn(
            "text-muted-foreground mt-1 text-sm leading-relaxed",
            TEXT_ALIGN_CLASSES[align],
          )}
        >
          {field.label || "Description"}
        </p>
      );
    }

    case "divider":
      return <Separator className="my-4" />;
  }
}
