import React from 'react';
import { BaseCMSTest } from './BaseCMSTest';
import TinaCMS from 'tinacms';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

const TinaCMSTest: React.FC = () => {
  const [content, setContent] = React.useState(testContent);
  const [isPreview, setIsPreview] = React.useState(false);

  const handleEdit = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <BaseCMSTest
      name="TinaCMS"
      description="Git-based CMS with real-time visual editing"
    >
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
          >
            {isPreview ? 'Edit Mode' : 'Preview Mode'}
          </button>
        </div>

        {isPreview ? (
          <div className="prose max-w-none">
            <h1>{content.title}</h1>
            <p>{content.description}</p>
            <h2>Features</h2>
            <ul>
              {content.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <p>Status: {content.status}</p>
            <p>Last Modified: {new Date(content.lastModified).toLocaleString()}</p>
          </div>
        ) : (
          <>
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
              <label className="block text-sm font-medium mb-1">Features</label>
              {content.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
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
                  // In a real implementation, this would save to Git via TinaCMS
                  console.log('Saving content:', content);
                }}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </BaseCMSTest>
  );
};

export default TinaCMSTest;
