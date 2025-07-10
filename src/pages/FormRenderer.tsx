/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
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

interface Template {
  id: string
  name: string
  sections: Section[]
  createdAt: Date
  updatedAt: Date
}

// Form Renderer Component
export default function FormRenderer({
  template,
  onSubmit,
  onBack,
}: {
  template: Template
  onSubmit: (data: Record<string, any>) => void
  onBack: () => void
}) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateField = (field: Field, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return 'This field is required'
    }

    if (field.type === 'number' && value && isNaN(Number(value))) {
      return 'Please enter a valid number'
    }

    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type !== 'label') {
          const error = validateField(field, formData[field.id])
          if (error) {
            newErrors[field.id] = error
          }
        }
      })
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  const updateField = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }))
    }
  }

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'label':
        const Tag = field.labelStyle || 'h2'
        return (
          <div
            className={`font-bold mb-4 ${
              Tag === 'h1' ? 'text-2xl' : Tag === 'h2' ? 'text-xl' : 'text-lg'
            }`}
          >
            {field.label}
          </div>
        )
      case 'text':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={`w-full border rounded p-2 ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
              placeholder="Enter text"
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        )
      case 'number':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={`w-full border rounded p-2 ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
              placeholder="Enter number"
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        )
      case 'boolean':
        return (
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData[field.id] || false}
                onChange={(e) => updateField(field.id, e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        )
      case 'enum':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formData[field.id] || ''}
              onChange={(e) => updateField(field.id, e.target.value)}
              className={`w-full border rounded p-2 ${
                errors[field.id] ? 'border-red-500' : ''
              }`}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          ← Back to Templates
        </button>
        <h1 className="text-2xl font-bold mt-2">{template.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {template.sections.map((section) => (
          <div key={section.id} className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            {section.fields.map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))}
          </div>
        ))}

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Submit Form
          </button>
          <button
            type="button"
            onClick={onBack}
            className="border py-2 px-6 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
