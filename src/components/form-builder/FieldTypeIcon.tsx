"use client";

import {
  AlignLeft,
  Calendar,
  CheckSquare,
  CircleDot,
  Hash,
  Type,
} from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import type { FieldType } from "@/types";

const ICON_MAP = {
  short_text: Type,
  long_text: AlignLeft,
  single_choice: CircleDot,
  multiple_choice: CheckSquare,
  number: Hash,
  date: Calendar,
} as const satisfies Record<FieldType, ComponentType<{ className?: string }>>;

interface FieldTypeIconProps {
  type: FieldType;
  className?: string;
}

export function FieldTypeIcon({ type, className }: FieldTypeIconProps) {
  const Icon = ICON_MAP[type];
  return <Icon className={cn("h-4 w-4", className)} />;
}
