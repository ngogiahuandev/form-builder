"use client";

import {
  AlignLeft,
  Braces,
  Calendar,
  CheckSquare,
  ChevronsUpDown,
  CircleDot,
  Clock,
  Globe,
  Hash,
  Heading,
  Mail,
  Minus,
  Phone,
  Pilcrow,
  SlidersHorizontal,
  Star,
  ThumbsUp,
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
  select: ChevronsUpDown,
  linear_scale: SlidersHorizontal,
  divider: Minus,
  email: Mail,
  phone: Phone,
  url: Globe,
  rating: Star,
  time: Clock,
  yes_no: ThumbsUp,
  heading: Heading,
  description: Pilcrow,
  code: Braces,
} as const satisfies Record<FieldType, ComponentType<{ className?: string }>>;

interface FieldTypeIconProps {
  type: FieldType;
  className?: string;
}

export function FieldTypeIcon({ type, className }: FieldTypeIconProps) {
  const Icon = ICON_MAP[type];
  return <Icon className={cn("h-4 w-4", className)} />;
}
