import React from 'react';
import { BaseCMSTest } from './BaseCMSTest';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

export const BuilderTest: React.FC = () => {
  const [content, setContent] = React.useState(testContent);
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);

  const handleEdit = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const features = [...content.features];
    const draggedFeature = features[draggedItem];
    features.splice(draggedItem, 1);
    features.splice(index, 0, draggedFeature);
    handleEdit('features', features);
    setDraggedItem(index);
  };

  return (
    <BaseCMSTest
      name="Builder.io"
      description="Visual CMS with drag-and-drop"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            Drag and drop features to reorder them. This demonstrates Builder.io's visual editing capabilities.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => handleEdit('title', e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={content.description}
            onChange={(e) => handleEdit('description', e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Features (Drag to Reorder)</label>
          {content.features.map((feature, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              className="flex gap-2 mb-2 cursor-move bg-white"
            >
              <div className="p-2 bg-gray-100">≡</div>
              <input
                type="text"
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...content.features];
                  newFeatures[index] = e.target.value;
                  handleEdit('features', newFeatures);
                }}
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => {
                  const newFeatures = content.features.filter((_, i) => i !== index);
                  handleEdit('features', newFeatures);
                }}
                className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => handleEdit('features', [...content.features, ''])}
            className="px-3 py-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
          >
            Add Feature
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={content.status}
            onChange={(e) => handleEdit('status', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={() => {
              handleEdit('lastModified', new Date().toISOString());
              // In a real implementation, this would save to Builder.io
              console.log('Saving content:', content);
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Save Changes
          </button>
        </div>
      </div>
    </BaseCMSTest>
  );
};
