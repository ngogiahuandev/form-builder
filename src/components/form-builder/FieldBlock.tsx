"use client";

import { Extension } from "@tiptap/core";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FieldType, FormField } from "@/types";
import { FieldEditPreview } from "@/components/form-builder/FieldEditPreview";
import { FieldPaletteContent } from "@/components/form-builder/FieldPaletteContent";
import { FieldTypeIcon } from "@/components/form-builder/FieldTypeIcon";

const SingleLine = Extension.create({
  name: "singleLine",
  addKeyboardShortcuts() {
    return {
      Enter: () => true,
      "Shift-Enter": () => true,
    };
  },
});

interface FieldBlockProps {
  field: FormField;
  index: number;
}

function InsertPalette({ index }: { index: number }) {
  const addFieldAt = useFormBuilderStore((s) => s.addFieldAt);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Plus />
          <span className="sr-only">Add field below</span>
        </Button>
      </PopoverTrigger>
      {/* Same content + sizing as the bottom `Add field` palette so both
          popovers look identical. */}
      <PopoverContent side="bottom" align="start" className="w-64 p-0">
        <FieldPaletteContent
          onSelect={(type) => {
            addFieldAt(type, index + 1);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function SlashCommandMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: FieldType) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      {/* Mirrors the popover shell used by `InsertPalette` / `BlockPalette`. */}
      <div className="bg-popover absolute top-full left-0 z-20 mt-1 w-64 overflow-hidden rounded-md border p-0 shadow-md">
        <FieldPaletteContent onSelect={onSelect} />
      </div>
    </>
  );
}

const HEADING_CLASSES = {
  h1: "text-3xl font-bold",
  h2: "text-2xl font-semibold",
  h3: "text-xl font-medium",
} as const;

const TEXT_ALIGN_CLASSES = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

interface InlineTextBlockProps {
  field: FormField;
  index: number;
  isSelected: boolean;
  setNodeRef: (node: HTMLElement | null) => void;
  setActivatorNodeRef: (node: HTMLElement | null) => void;
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  style: React.CSSProperties;
}

/**
 * Shared block used by both "heading" and "description" — a bare, inline,
 * self-sized TipTap editor with no type icon or label row. Clicking the text
 * just edits; clicking the surrounding block opens the settings sheet (where
 * heading level / text align live).
 */
function InlineTextBlock({
  field,
  index,
  isSelected,
  setNodeRef,
  setActivatorNodeRef,
  attributes,
  listeners,
  style,
}: InlineTextBlockProps) {
  const { setSelectedFieldId, updateFieldLabel, removeField, duplicateField } =
    useFormBuilderStore();

  const isHeading = field.type === "heading";
  const level = field.headingLevel ?? "h2";
  const align = field.textAlign ?? "left";

  const editor = useEditor({
    extensions: [
      StarterKit,
      SingleLine,
      Placeholder.configure({
        placeholder: isHeading ? "Heading" : "Add a description…",
      }),
    ],
    content: field.label,
    immediatelyRender: false,
    onUpdate: ({ editor }) => updateFieldLabel(field.id, editor.getText()),
  });

  const label = isHeading ? "heading" : "description";

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setSelectedFieldId(field.id)}
      className={cn(
        "group/block hover:bg-accent/40 relative cursor-pointer rounded-md px-3 py-2 transition-colors",
        isSelected && "bg-accent/40 ring-primary/20 ring-1",
      )}
    >
      {/* Left gutter — visible on hover */}
      <div className="absolute top-0 right-full flex items-center gap-0.5 pr-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
          className="hover:bg-destructive/10 hover:text-destructive opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Trash2 />
          <span className="sr-only">Delete {label}</span>
        </Button>
        <InsertPalette index={index} />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            duplicateField(field.id);
          }}
          className="opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Copy />
          <span className="sr-only">Duplicate {label}</span>
        </Button>
        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFieldId(field.id);
          }}
          className="cursor-grab opacity-0 transition-opacity group-hover/block:opacity-100 active:cursor-grabbing"
        >
          <GripVertical />
          <span className="sr-only">Drag to reorder</span>
        </Button>
      </div>

      {/* Inline-editable text. Clicking the text just edits; clicking outside
          the text (on the surrounding block) opens the settings sheet. The
          wrapper div carries the alignment so it works even while editing. */}
      <div className={cn("leading-tight", TEXT_ALIGN_CLASSES[align])}>
        <EditorContent
          editor={editor}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-block w-fit min-w-4",
            "[&_.tiptap]:inline-block [&_.tiptap]:w-fit [&_.tiptap]:min-w-4 [&_.tiptap]:outline-none",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/60",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
            "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
            isHeading
              ? HEADING_CLASSES[level]
              : "text-muted-foreground text-sm leading-relaxed",
          )}
        />
      </div>
    </div>
  );
}

export function FieldBlock({ field, index }: FieldBlockProps) {
  const {
    selectedFieldId,
    setSelectedFieldId,
    updateFieldLabel,
    addFieldAt,
    removeField,
    duplicateField,
  } = useFormBuilderStore();
  const isSelected = selectedFieldId === field.id;
  const [showSlash, setShowSlash] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      SingleLine,
      Placeholder.configure({ placeholder: "Question" }),
    ],
    content: field.label,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      if (text === "/") {
        setShowSlash(true);
      } else {
        setShowSlash(false);
        updateFieldLabel(field.id, text);
      }
    },
  });

  const handleSlashSelect = (type: FieldType) => {
    editor?.commands.clearContent();
    setShowSlash(false);
    addFieldAt(type, index + 1);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="pointer-events-none rounded-md px-3 py-2 opacity-0"
      >
        <div className="flex items-center gap-1.5">
          <FieldTypeIcon type={field.type} className="shrink-0" />
          <span className="text-sm font-medium">{field.label}</span>
        </div>
        {field.helpText && (
          <p className="mt-0.5 pl-0 text-xs">{field.helpText}</p>
        )}
        <div className="pl-0">
          <FieldEditPreview field={field} />
        </div>
      </div>
    );
  }

  // Heading & Description — rendered like the form title: a bare, inline,
  // self-sized editor with no type icon or label row. Clicking the text
  // itself just edits; clicking the surrounding block opens the settings
  // sheet (where heading level / text align live).
  if (field.type === "heading" || field.type === "description") {
    return (
      <InlineTextBlock
        field={field}
        index={index}
        isSelected={isSelected}
        setNodeRef={setNodeRef}
        setActivatorNodeRef={setActivatorNodeRef}
        attributes={attributes}
        listeners={listeners}
        style={style}
      />
    );
  }

  // Divider — simplified block without label editor
  if (field.type === "divider") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={() => setSelectedFieldId(field.id)}
        className={cn(
          "group/block hover:bg-accent/40 relative cursor-pointer rounded-md px-3 py-2 transition-colors",
          isSelected && "bg-accent/40 ring-primary/20 ring-1",
        )}
      >
        {/* Left gutter — visible on hover */}
        <div className="absolute top-0 right-full flex items-center gap-0.5 pr-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              removeField(field.id);
            }}
            className="hover:bg-destructive/10 hover:text-destructive opacity-0 transition-opacity group-hover/block:opacity-100"
          >
            <Trash2 />
            <span className="sr-only">Delete field</span>
          </Button>
          <InsertPalette index={index} />
          <Button
            ref={setActivatorNodeRef}
            variant="ghost"
            size="icon"
            {...attributes}
            {...listeners}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFieldId(field.id);
            }}
            className="cursor-grab opacity-0 transition-opacity group-hover/block:opacity-100 active:cursor-grabbing"
          >
            <GripVertical />
            <span className="sr-only">Drag to reorder</span>
          </Button>
        </div>

        <FieldEditPreview field={field} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => setSelectedFieldId(field.id)}
      className={cn(
        "group/block hover:bg-accent/40 relative cursor-pointer rounded-md px-3 py-2 transition-colors",
        isSelected && "bg-accent/40 ring-primary/20 ring-1",
      )}
    >
      {/* Left gutter — visible on hover */}
      <div className="absolute top-0 right-full flex items-center gap-0.5 pr-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
          className="hover:bg-destructive/10 hover:text-destructive opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Trash2 />
          <span className="sr-only">Delete field</span>
        </Button>
        <InsertPalette index={index} />
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            duplicateField(field.id);
          }}
          className="opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Copy />
          <span className="sr-only">Duplicate field</span>
        </Button>

        <Button
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon"
          {...attributes}
          {...listeners}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedFieldId(field.id);
          }}
          className="cursor-grab opacity-0 transition-opacity group-hover/block:opacity-100 active:cursor-grabbing"
        >
          <GripVertical />
          <span className="sr-only">Drag to reorder</span>
        </Button>
      </div>

      {/* Label row */}
      <div className="relative flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0">
        <FieldTypeIcon
          type={field.type}
          className="text-muted-foreground/50 mr-1 shrink-0"
        />
        <EditorContent
          editor={editor}
          onClick={(e) => e.stopPropagation()}
          className="[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground min-w-4 [&_.tiptap]:inline-block [&_.tiptap]:min-w-4 [&_.tiptap]:text-sm [&_.tiptap]:font-medium [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        />
        {field.required && (
          <span className="text-destructive shrink-0 text-sm leading-none">
            *
          </span>
        )}

        {/* Slash command menu */}
        {showSlash && (
          <SlashCommandMenu
            onSelect={handleSlashSelect}
            onClose={() => {
              setShowSlash(false);
              editor?.commands.clearContent();
            }}
          />
        )}
      </div>

      {/* Help text */}
      {field.helpText && (
        <p className="text-muted-foreground mt-0.5 pl-0 text-xs">
          {field.helpText}
        </p>
      )}

      {/* Disabled field preview */}
      <div className="pl-0">
        <FieldEditPreview field={field} />
      </div>
    </div>
  );
}
