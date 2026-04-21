"use client";

import { useId } from "react";
import { FormSection } from "../base/form-section";
import { LinkItem } from "../templates/simple";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X, PlusCircle } from "lucide-react";

interface LinksProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

interface SortableLinkItemProps {
  link: LinkItem;
  onUpdate: (id: string, field: keyof LinkItem, value: string) => void;
  onRemove: (id: string) => void;
}

function SortableLinkItem({ link, onUpdate, onRemove }: SortableLinkItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative mb-6 group">
      <button
        className="absolute top-2 -left-8 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-6 w-6 text-slate-500" />
      </button>
      <button
        onClick={() => onRemove(link.id)}
        className="hidden group-hover:flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-600 absolute -right-3 -top-3 hover:bg-slate-300 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="shadow sm:overflow-hidden sm:rounded-md">
        <div className="space-y-6 bg-white px-4 py-5 sm:p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
              >
                Icon Key (optional)
              </label>
              <input
                type="text"
                value={link.icon}
                onChange={(e) => onUpdate(link.id, "icon", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
              >
                Label
              </label>
              <input
                type="text"
                value={link.label}
                onChange={(e) => onUpdate(link.id, "label", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-sm font-medium text-gray-700"
              >
                URL
              </label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => onUpdate(link.id, "url", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          {(!link.label || !link.url) && (
            <p className="mt-2 text-xs text-center text-slate-400">
              Link shown in preview once label and url are added
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function Links({ links, onChange }: LinksProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((item) => item.id === active.id);
      const newIndex = links.findIndex((item) => item.id === over.id);
      onChange(arrayMove(links, oldIndex, newIndex));
    }
  };

  const updateLink = (id: string, field: keyof LinkItem, value: string) => {
    const newLinks = links.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onChange(newLinks);
  };

  const removeLink = (id: string) => {
    onChange(links.filter((link) => link.id !== id));
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: crypto.randomUUID(),
      icon: "",
      label: "",
      url: "",
    };
    onChange([...links, newLink]);
  };

  return (
    <FormSection
      title="Links"
      description="Add some links here"
      helperText={
        <p className="mt-1 text-xs text-gray-600">
          Icon keys can be found in{" "}
          <a
            className="underline"
            href="https://icones.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://icones.js.org/
          </a>
          .
        </p>
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={links} strategy={verticalListSortingStrategy}>
          {links.map((link) => (
            <SortableLinkItem
              key={link.id}
              link={link}
              onUpdate={updateLink}
              onRemove={removeLink}
            />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={addLink}
        className="mt-8 border-2 text-slate-500 border-slate-300 rounded-lg flex items-center justify-center w-full py-2 hover:bg-slate-50 transition-colors"
      >
        <PlusCircle className="h-6 w-6" />
      </button>
    </FormSection>
  );
}
