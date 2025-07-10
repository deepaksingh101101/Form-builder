/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Plus, Edit3, Eye, Save, FileText } from 'lucide-react';

// Types
interface Field {
  id: string;
  type: 'label' | 'text' | 'number' | 'boolean' | 'enum';
  label: string;
  required: boolean;
  options?: string[];
  labelStyle?: 'h1' | 'h2' | 'h3';
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface Template {
  id: string;
  name: string;
  sections: Section[];
  createdAt: Date;
  updatedAt: Date;
}

interface FormData {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, any>;
  submittedAt: Date;
}

const fieldTypes = [
  { type: 'label', label: 'Label', icon: '🔠' },
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'boolean', label: 'Boolean', icon: '✅' },
  { type: 'enum', label: 'Dropdown', icon: '⬇️' },
];

// Draggable Field Component
function DraggableField({
  field,
  onEdit,
  onDelete,
  isSelected,
}: {
  field: Field;
  onEdit: () => void;
  onDelete: () => void;
  isSelected: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderFieldPreview = () => {
    switch (field.type) {
      case 'label':
        const Tag = field.labelStyle || 'h2';
        return (
          <div className={`font-bold ${
            Tag === 'h1' ? 'text-2xl' : Tag === 'h2' ? 'text-xl' : 'text-lg'
          }`}>
            {field.label || 'Label Text'}
          </div>
        );
      case 'text':
        return (
          <input
            type="text"
            className="w-full border rounded p-2 mt-1"
            placeholder="Enter text"
            disabled
          />
        );
      case 'number':
        return (
          <input
            type="number"
            className="w-full border rounded p-2 mt-1"
            placeholder="Enter number"
            disabled
          />
        );
      case 'boolean':
        return (
          <label className="inline-flex items-center gap-2 mt-1">
            <input type="checkbox" disabled />
            <span>Yes/No</span>
          </label>
        );
      case 'enum':
        return (
          <select className="w-full border rounded p-2 mt-1" disabled>
            {field.options?.map((opt, idx) => (
              <option key={idx}>{opt}</option>
            )) || <option>No options</option>}
          </select>
        );
      default:
        return null;
    }
  };

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
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-500 hover:text-blue-600"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Component
function SectionComponent({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onDeleteField,
  selectedField,
  setSelectedField,
}: {
  section: Section;
  onUpdateSection: (id: string, updates: Partial<Section>) => void;
  onDeleteSection: (id: string) => void;
  onAddField: (sectionId: string, fieldType: string) => void;
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  selectedField: Field | null;
  setSelectedField: (field: Field | null) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over?.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id);
      const newIndex = section.fields.findIndex((f) => f.id === over?.id);
      const newFields = arrayMove(section.fields, oldIndex, newIndex);
      onUpdateSection(section.id, { fields: newFields });
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={section.title}
          onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
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
  );
}

// Field Editor Component
function FieldEditor({
  field,
  onUpdate,
  onClose,
}: {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onClose: () => void;
}) {
  const [localField, setLocalField] = useState(field);

  const handleSave = () => {
    onUpdate(localField);
    onClose();
  };

  const addOption = () => {
    const newOptions = [...(localField.options || []), ''];
    setLocalField({ ...localField, options: newOptions });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(localField.options || [])];
    newOptions[index] = value;
    setLocalField({ ...localField, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = localField.options?.filter((_, i) => i !== index) || [];
    setLocalField({ ...localField, options: newOptions });
  };

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
            onChange={(e) => setLocalField({ ...localField, label: e.target.value })}
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
              onChange={(e) => setLocalField({ ...localField, labelStyle: e.target.value as 'h1' | 'h2' | 'h3' })}
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
                onChange={(e) => setLocalField({ ...localField, required: e.target.checked })}
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
  );
}

// Form Renderer Component
function FormRenderer({
  template,
  onSubmit,
  onBack,
}: {
  template: Template;
  onSubmit: (data: Record<string, any>) => void;
  onBack: () => void;
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: Field, value: any): string | null => {
    if (field.required && (!value || value === '')) {
      return 'This field is required';
    }
    
    if (field.type === 'number' && value && isNaN(Number(value))) {
      return 'Please enter a valid number';
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.type !== 'label') {
          const error = validateField(field, formData[field.id]);
          if (error) {
            newErrors[field.id] = error;
          }
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const updateField = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const renderField = (field: Field) => {
    switch (field.type) {
      case 'label':
        const Tag = field.labelStyle || 'h2';
        return (
          <div className={`font-bold mb-4 ${
            Tag === 'h1' ? 'text-2xl' : Tag === 'h2' ? 'text-xl' : 'text-lg'
          }`}>
            {field.label}
          </div>
        );
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
              className={`w-full border rounded p-2 ${errors[field.id] ? 'border-red-500' : ''}`}
              placeholder="Enter text"
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
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
              className={`w-full border rounded p-2 ${errors[field.id] ? 'border-red-500' : ''}`}
              placeholder="Enter number"
            />
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
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
        );
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
              className={`w-full border rounded p-2 ${errors[field.id] ? 'border-red-500' : ''}`}
            >
              <option value="">Select an option</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {errors[field.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

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
              <div key={field.id}>
                {renderField(field)}
              </div>
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
  );
}

// Main Application Component
export default function FormTemplateBuilder() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [view, setView] = useState<'list' | 'builder' | 'preview' | 'form'>('list');
  const [formSubmissions, setFormSubmissions] = useState<FormData[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('formTemplates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }

    const savedSubmissions = localStorage.getItem('formSubmissions');
    if (savedSubmissions) {
      setFormSubmissions(JSON.parse(savedSubmissions));
    }
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    localStorage.setItem('formTemplates', JSON.stringify(templates));
  }, [templates]);

  // Save form submissions to localStorage
  useEffect(() => {
    localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
  }, [formSubmissions]);

  const createNewTemplate = () => {
    if (templates.length >= 5) {
      alert('Maximum 5 templates allowed');
      return;
    }

    const newTemplate: Template = {
      id: Date.now().toString(),
      name: `Template ${templates.length + 1}`,
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTemplates([...templates, newTemplate]);
    setCurrentTemplate(newTemplate);
    setView('builder');
  };

  const saveTemplate = () => {
    if (!currentTemplate) return;

    const updatedTemplate = {
      ...currentTemplate,
      updatedAt: new Date(),
    };

    setTemplates(prev => 
      prev.map(t => t.id === currentTemplate.id ? updatedTemplate : t)
    );
    setCurrentTemplate(updatedTemplate);
    alert('Template saved successfully!');
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const addSection = () => {
    if (!currentTemplate) return;

    const newSection: Section = {
      id: Date.now().toString(),
      title: `Section ${currentTemplate.sections.length + 1}`,
      fields: [],
    };

    setCurrentTemplate({
      ...currentTemplate,
      sections: [...currentTemplate.sections, newSection],
    });
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.filter(s => s.id !== sectionId),
    });
  };

  const addField = (sectionId: string, fieldType: string) => {
    if (!currentTemplate) return;

    const newField: Field = {
      id: Date.now().toString(),
      type: fieldType as Field['type'],
      label: fieldType === 'label' ? 'Label Text' : `${fieldType} Field`,
      required: false,
      options: fieldType === 'enum' ? ['Option 1', 'Option 2'] : undefined,
      labelStyle: fieldType === 'label' ? 'h2' : undefined,
    };

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.map(s => 
        s.id === sectionId 
          ? { ...s, fields: [...s.fields, newField] }
          : s
      ),
    });
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.map(s => 
        s.id === sectionId 
          ? {
              ...s,
              fields: s.fields.map(f => 
                f.id === fieldId ? { ...f, ...updates } : f
              )
            }
          : s
      ),
    });
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    if (!currentTemplate) return;

    setCurrentTemplate({
      ...currentTemplate,
      sections: currentTemplate.sections.map(s => 
        s.id === sectionId 
          ? { ...s, fields: s.fields.filter(f => f.id !== fieldId) }
          : s
      ),
    });
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    if (!currentTemplate) return;

    const newSubmission: FormData = {
      id: Date.now().toString(),
      templateId: currentTemplate.id,
      templateName: currentTemplate.name,
      data,
      submittedAt: new Date(),
    };

    setFormSubmissions(prev => [...prev, newSubmission]);
    alert('Form submitted successfully!');
    setView('list');
  };

  // Template List View
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Form Templates</h1>
            <button
              onClick={createNewTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              disabled={templates.length >= 5}
            >
              <Plus size={16} />
              New Template ({templates.length}/5)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.sections.length} sections • {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentTemplate(template);
                      setView('builder');
                    }}
                    className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTemplate(template);
                      setView('preview');
                    }}
                    className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-50"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTemplate(template);
                      setView('form');
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <FileText size={14} />
                    Fill Form
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {formSubmissions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Form Submissions</h2>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4">Template</th>
                      <th className="text-left p-4">Submitted At</th>
                      <th className="text-left p-4">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-t">
                        <td className="p-4">{submission.templateName}</td>
                        <td className="p-4">{new Date(submission.submittedAt).toLocaleString()}</td>
                        <td className="p-4">
                          <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(submission.data, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Form View
  if (view === 'form' && currentTemplate) {
    return (
      <FormRenderer
        template={currentTemplate}
        onSubmit={handleFormSubmit}
        onBack={() => setView('list')}
      />
    );
  }

  // Preview View
  if (view === 'preview' && currentTemplate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Templates
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setView('builder')}
                className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50"
              >
                <Edit3 size={16} />
                Edit Template
              </button>
              <button
                onClick={() => setView('form')}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <FileText size={16} />
                Fill Form
              </button>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">{currentTemplate.name} - Preview</h1>
            
            {currentTemplate.sections.map((section) => (
              <div key={section.id} className="mb-8">
                <h2 className="text-xl font-semibold mb-4 border-b pb-2">{section.title}</h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <div key={field.id} className="border-l-4 border-blue-200 pl-4">
                      {field.type === 'label' ? (
                        <div className={`font-bold ${
                          field.labelStyle === 'h1' ? 'text-2xl' : 
                          field.labelStyle === 'h2' ? 'text-xl' : 'text-lg'
                        }`}>
                          {field.label}
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          <div className="text-sm text-gray-500">
                            Type: {field.type}
                            {field.type === 'enum' && field.options && (
                              <span> • Options: {field.options.join(', ')}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {currentTemplate.sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sections added yet. Go to edit mode to add sections and fields.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Builder View
  if (view === 'builder' && currentTemplate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Templates
            </button>
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate({
                  ...currentTemplate,
                  name: e.target.value
                })}
                className="text-lg font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView('preview')}
                className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-50"
              >
                <Eye size={16} />
                Preview
              </button>
              <button
                onClick={saveTemplate}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6 p-6">
          <div className="col-span-8">
            <div className="space-y-4">
              {currentTemplate.sections.map((section) => (
                <SectionComponent
                  key={section.id}
                  section={section}
                  onUpdateSection={updateSection}
                  onDeleteSection={deleteSection}
                  onAddField={addField}
                  onUpdateField={updateField}
                  onDeleteField={deleteField}
                  selectedField={selectedField}
                  setSelectedField={setSelectedField}
                />
              ))}

              <button
                onClick={addSection}
                className="w-full bg-white border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:bg-gray-50 hover:border-gray-400"
              >
                <Plus className="inline-block mr-2" size={16} />
                Add Section
              </button>
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-white border rounded-lg p-4 sticky top-6">
              {selectedField ? (
                <FieldEditor
                  field={selectedField}
                  onUpdate={(updates) => {
                    const section = currentTemplate.sections.find(s => 
                      s.fields.some(f => f.id === selectedField.id)
                    );
                    if (section) {
                      updateField(section.id, selectedField.id, updates);
                    }
                  }}
                  onClose={() => setSelectedField(null)}
                />
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Field Types</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Click on a field in the form to edit its properties, or add new fields using the buttons in each section.
                  </div>
                  <div className="space-y-3">
                    {fieldTypes.map((fieldType) => (
                      <div
                        key={fieldType.type}
                        className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
                      >
                        <span className="text-xl">{fieldType.icon}</span>
                        <div>
                          <div className="font-medium">{fieldType.label}</div>
                          <div className="text-sm text-gray-500">
                            {fieldType.type === 'label' && 'Display text with H1, H2, H3 styling'}
                            {fieldType.type === 'text' && 'Single line text input'}
                            {fieldType.type === 'number' && 'Numeric input with validation'}
                            {fieldType.type === 'boolean' && 'Checkbox for yes/no questions'}
                            {fieldType.type === 'enum' && 'Dropdown with predefined options'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}