/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Trash2, Plus } from 'lucide-react'

// Types
interface Field {
  id: string
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum'
  label: string
  required: boolean
  options?: string[]
  labelStyle?: 'h1' | 'h2' | 'h3'
}

// Field Editor Component
export default function FieldEditor({
  field,
  onUpdate,
  onClose,
}: {
  field: Field
  onUpdate: (updates: Partial<Field>) => void
  onClose: () => void
}) {
  const [localField, setLocalField] = useState(field)

  const handleSave = () => {
    onUpdate(localField)
    onClose()
  }

  const addOption = () => {
    const newOptions = [...(localField.options || []), '']
    setLocalField({ ...localField, options: newOptions })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])]
    newOptions[index] = value
    setLocalField({ ...localField, options: newOptions })
  }

  const removeOption = (index: number) => {
    const newOptions = localField.options?.filter((_, i) => i !== index) || []
    setLocalField({ ...localField, options: newOptions })
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Field</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) =>
              setLocalField({ ...localField, label: e.target.value })
            }
            className="w-full border rounded p-2"
            placeholder="Field label"
          />
        </div>

        {localField.type === 'label' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <select
              value={localField.labelStyle || 'h2'}
              onChange={(e) =>
                setLocalField({
                  ...localField,
                  labelStyle: e.target.value as 'h1' | 'h2' | 'h3',
                })
              }
              className="w-full border rounded p-2"
            >
              <option value="h1">H1 - Large</option>
              <option value="h2">H2 - Medium</option>
              <option value="h3">H3 - Small</option>
            </select>
          </div>
        )}

        {localField.type !== 'label' && (
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={localField.required}
                onChange={(e) =>
                  setLocalField({ ...localField, required: e.target.checked })
                }
                className="mr-2"
              />
              Required field
            </label>
          </div>
        )}

        {localField.type === 'enum' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options
            </label>
            <div className="space-y-2">
              {localField.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 border rounded p-2"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} />
                Add Option
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 border py-2 px-4 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
