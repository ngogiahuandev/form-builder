"use client";

import { cn } from "@/lib/utils";
import type { FormField } from "@/types";

interface HeadingFieldProps {
  field: FormField;
}

const HEADING_CLASSES = {
  h1: "text-3xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-medium",
} as const;

export function HeadingField({ field }: HeadingFieldProps) {
  const level = field.headingLevel ?? "h2";
  const Tag = level;

  return (
    <div className="px-3 py-2">
      <Tag className={cn("leading-tight", HEADING_CLASSES[level])}>
        {field.label || "Heading"}
      </Tag>
    </div>
  );
}
