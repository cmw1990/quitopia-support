import React from 'react';
import { BaseCMSTest } from './BaseCMSTest';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  content: '# Welcome\n\nThis is a rich text content.\n\n## Features\n\n- GraphQL API\n- Custom fields\n- Access control',
  fields: [
    { name: 'author', value: 'John Doe', type: 'text' },
    { name: 'category', value: 'Technology', type: 'select' },
    { name: 'publishDate', value: new Date().toISOString().split('T')[0], type: 'date' }
  ],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

const KeystoneTest: React.FC = () => {
  const [content, setContent] = React.useState(testContent);
  const [isPreview, setIsPreview] = React.useState(false);

  const handleEdit = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFieldEdit = (index: number, value: string) => {
    const newFields = [...content.fields];
    newFields[index] = { ...newFields[index], value };
    handleEdit('fields', newFields);
  };

  return (
    <BaseCMSTest
      name="Keystone"
      description="TypeScript-first headless CMS with GraphQL API"
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
            <div className="mt-4" dangerouslySetInnerHTML={{ __html: content.content }} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              {content.fields.map((field, index) => (
                <div key={index} className="border p-4 rounded">
                  <h3 className="font-medium">{field.name}</h3>
                  <p>{field.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Status: {content.status}
              <br />
              Last Modified: {new Date(content.lastModified).toLocaleString()}
            </p>
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
              <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
              <textarea
                value={content.content}
                onChange={(e) => handleEdit('content', e.target.value)}
                className="w-full p-2 border rounded font-mono"
                rows={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Custom Fields</label>
              {content.fields.map((field, index) => (
                <div key={index} className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">{field.name}</label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleFieldEdit(index, e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={field.value}
                        onChange={(e) => handleFieldEdit(index, e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="Technology">Technology</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                      </select>
                    )}
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={field.value}
                        onChange={(e) => handleFieldEdit(index, e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                    )}
                  </div>
                </div>
              ))}
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
                  // In a real implementation, this would save to Keystone via GraphQL
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

export default KeystoneTest;
