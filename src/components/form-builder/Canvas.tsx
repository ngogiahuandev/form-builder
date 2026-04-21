"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useFormBuilderStore } from "@/stores/form-builder-store";
import { BlockPalette } from "@/components/form-builder/BlockPalette";
import { FieldBlock } from "@/components/form-builder/FieldBlock";
import { FieldBlockGhost } from "@/components/form-builder/FieldBlockGhost";
import { SubmitButtonBlock } from "@/components/form-builder/SubmitButtonBlock";

export function Canvas() {
  const { schema, reorderFields } = useFormBuilderStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = schema.fields.findIndex((f) => f.id === active.id);
    const toIndex = schema.fields.findIndex((f) => f.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderFields(fromIndex, toIndex);
    }
  };

  const activeField = schema.fields.find((f) => f.id === activeId);

  if (schema.fields.length === 0) {
    return (
      <div className="pl-0">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground text-sm">
            No fields yet. Add your first one.
          </p>
          <BlockPalette />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={schema.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col pl-0">
            {schema.fields.map((field, index) => (
              <FieldBlock key={field.id} field={field} index={index} />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeField ? <FieldBlockGhost field={activeField} /> : null}
        </DragOverlay>
      </DndContext>
      <div className="mt-4 px-3">
        <BlockPalette />
      </div>
      <div className="mt-2">
        <SubmitButtonBlock />
      </div>
    </div>
  );
}
