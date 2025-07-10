/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, Edit3 } from 'lucide-react'

// Types
interface Field {
  id: string
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum'
  label: string
  required: boolean
  options?: string[]
  labelStyle?: 'h1' | 'h2' | 'h3'
}

// Draggable Field Component
export default function DraggableField({
  field,
  onEdit,
  onDelete,
  isSelected,
}: {
  field: Field
  onEdit: () => void
  onDelete: () => void
  isSelected: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'label':
        const Tag = field.labelStyle || 'h2'
        return (
          <div
            className={`font-bold ${
              Tag === 'h1' ? 'text-2xl' : Tag === 'h2' ? 'text-xl' : 'text-lg'
            }`}
          >
            {field.label || 'Label Text'}
          </div>
        )
      case 'text':
        return (
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            placeholder="Enter text"
            disabled
          />
        )
      case 'number':
        return (
          <input
            type="number"
            className="w-full border rounded p-2 mt-1"
            placeholder="Enter number"
            disabled
          />
        )
      case 'boolean':
        return (
          <label className="inline-flex items-center gap-2 mt-1">
            <input type="checkbox" disabled />
            <span>Yes/No</span>
          </label>
        )
      case 'enum':
        return (
          <select className="w-full border rounded p-2 mt-1" disabled>
            {field.options?.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            )) || <option>No options</option>}
          </select>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'border-blue-500 bg-blue-50' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          {field.type !== 'label' && (
            <label className="block text-sm font-medium text-gray-700">
              {field.label || 'Untitled Field'}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          {renderFieldPreview()}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="text-gray-500 hover:text-blue-600"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
