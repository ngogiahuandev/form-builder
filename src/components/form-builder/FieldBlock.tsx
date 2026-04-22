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
import { FIELD_TYPES } from "@/lib/field-types";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import type { FieldType, FormField } from "@/types";
import { FieldEditPreview } from "@/components/form-builder/FieldEditPreview";
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

  const handleSelect = (type: FieldType) => {
    addFieldAt(type, index + 1);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 transition-opacity group-hover/block:opacity-100"
        >
          <Plus />
          <span className="sr-only">Add field below</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 p-2">
        <div className="flex flex-col gap-0.5">
          {FIELD_TYPES.map(({ type, label, description }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              className="hover:bg-accent flex items-start gap-3 rounded-md px-3 py-2 text-left transition-colors"
            >
              <FieldTypeIcon
                type={type}
                className="text-muted-foreground mt-0.5 shrink-0"
              />
              <div>
                <p className="text-sm leading-none font-medium">{label}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>
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
      <div className="bg-popover absolute top-full left-0 z-20 mt-1 w-64 rounded-lg border p-2 shadow-md">
        <p className="text-muted-foreground mb-1 px-2 text-xs font-medium">
          Insert field
        </p>
        {FIELD_TYPES.map(({ type, label, description }) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className="hover:bg-accent flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition-colors"
          >
            <FieldTypeIcon
              type={type}
              className="text-muted-foreground mt-0.5 shrink-0"
            />
            <div>
              <p className="text-sm leading-none font-medium">{label}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
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
            size="icon-sm"
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
            size="icon-sm"
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
          size="icon-sm"
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
          size="icon-sm"
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
          size="icon-sm"
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
