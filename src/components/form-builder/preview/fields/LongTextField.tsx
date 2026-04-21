"use client";

import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect } from "react";
import { Controller, type Control, type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { PreviewField } from "@/components/form-builder/preview/PreviewField";
import type { FormField } from "@/types";

interface LongTextEditorProps {
  placeholder?: string;
  onChange: (value: string) => void;
  hasError: boolean;
}

function LongTextEditor({
  placeholder,
  onChange,
  hasError,
}: LongTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "Type your answer…",
      }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getText()),
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <EditorContent
      editor={editor}
      className={cn(
        "bg-background min-h-[120px] rounded-md border px-3 py-2 text-sm transition-colors",
        "focus-within:ring-ring focus-within:ring-1",
        hasError && "border-destructive",
        "[&_.tiptap]:min-h-[88px] [&_.tiptap]:outline-none",
        "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
      )}
    />
  );
}

interface LongTextFieldProps {
  field: FormField;
  control: Control<FieldValues>;
}

export function LongTextField({ field, control }: LongTextFieldProps) {
  return (
    <Controller
      name={field.id}
      control={control}
      render={({ field: rhf, fieldState }) => (
        <PreviewField field={field} error={fieldState.error?.message}>
          <LongTextEditor
            placeholder={field.placeholder}
            onChange={rhf.onChange}
            hasError={!!fieldState.error}
          />
        </PreviewField>
      )}
    />
  );
}
