/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Trash2 } from 'lucide-react'
import DraggableField from '../components/DraggableField'

// Types
interface Field {
  id: string
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum'
  label: string
  required: boolean
  options?: string[]
  labelStyle?: 'h1' | 'h2' | 'h3'
}

interface Section {
  id: string
  title: string
  fields: Field[]
}

const fieldTypes = [
  { type: 'label', label: 'Label', icon: '🔠' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'boolean', label: 'Boolean', icon: '✅' },
  { type: 'enum', label: 'Dropdown', icon: '⬇️' },
]

// Section Component
export default function SectionComponent({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onDeleteField,
  selectedField,
  setSelectedField,
}: {
  section: Section
  onUpdateSection: (id: string, updates: Partial<Section>) => void
  onDeleteSection: (id: string) => void
  onAddField: (sectionId: string, fieldType: string) => void
  onUpdateField: (
    sectionId: string,
    fieldId: string,
    updates: Partial<Field>,
  ) => void
  onDeleteField: (sectionId: string, fieldId: string) => void
  selectedField: Field | null
  setSelectedField: (field: Field | null) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor))

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over?.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id)
      const newIndex = section.fields.findIndex((f) => f.id === over?.id)
      const newFields = arrayMove(section.fields, oldIndex, newIndex)
      onUpdateSection(section.id, { fields: newFields })
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) =>
            onUpdateSection(section.id, { title: e.target.value })
          }
          className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
          placeholder="Section Title"
        />
        <button
          onClick={() => onDeleteSection(section.id)}
          className="text-gray-500 hover:text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={section.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {section.fields.map((field) => (
              <DraggableField
                key={field.id}
                field={field}
                onEdit={() => setSelectedField(field)}
                onDelete={() => onDeleteField(section.id, field.id)}
                isSelected={selectedField?.id === field.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 mt-4">
        {fieldTypes.map((fieldType) => (
          <button
            key={fieldType.type}
            onClick={() => onAddField(section.id, fieldType.type)}
            className="flex items-center gap-1 px-3 py-2 text-sm border rounded hover:bg-gray-50"
          >
            <span>{fieldType.icon}</span>
            <span>{fieldType.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
