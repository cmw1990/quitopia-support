import React from 'react';
import { BaseCMSTest } from './BaseCMSTest';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  content: '# Welcome\n\nThis is a rich text content.\n\n## Features\n\n- Visual Editor\n- Component System\n- Asset Management',
  components: [
    { type: 'hero', content: { heading: 'Welcome', subheading: 'Test your content' } },
    { type: 'feature', content: { title: 'Feature 1', description: 'Description 1' } },
    { type: 'feature', content: { title: 'Feature 2', description: 'Description 2' } }
  ],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

const StoryblokTest: React.FC = () => {
  const [content, setContent] = React.useState(testContent);
  const [isPreview, setIsPreview] = React.useState(false);

  const handleEdit = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleComponentEdit = (index: number, field: string, value: string) => {
    const newComponents = [...content.components];
    newComponents[index] = {
      ...newComponents[index],
      content: {
        ...newComponents[index].content,
        [field]: value
      }
    };
    handleEdit('components', newComponents);
  };

  return (
    <BaseCMSTest
      name="Storyblok"
      description="Component-based headless CMS with visual editor"
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
            <div className="mt-4 space-y-8">
              {content.components.map((component, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="text-sm text-gray-500 mb-2">{component.type}</div>
                  {component.type === 'hero' ? (
                    <>
                      <h2>{component.content.heading}</h2>
                      <p>{component.content.subheading}</p>
                    </>
                  ) : (
                    <>
                      <h3>{component.content.title}</h3>
                      <p>{component.content.description}</p>
                    </>
                  )}
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
              <label className="block text-sm font-medium mb-1">Components</label>
              {content.components.map((component, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="text-sm font-medium mb-2">{component.type}</div>
                  {component.type === 'hero' ? (
                    <>
                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Heading</label>
                        <input
                          type="text"
                          value={component.content.heading}
                          onChange={(e) => handleComponentEdit(index, 'heading', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Subheading</label>
                        <input
                          type="text"
                          value={component.content.subheading}
                          onChange={(e) => handleComponentEdit(index, 'subheading', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-2">
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input
                          type="text"
                          value={component.content.title}
                          onChange={(e) => handleComponentEdit(index, 'title', e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={component.content.description}
                          onChange={(e) => handleComponentEdit(index, 'description', e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      const newComponents = content.components.filter((_, i) => i !== index);
                      handleEdit('components', newComponents);
                    }}
                    className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Remove Component
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newComponents = [...content.components, {
                      type: 'hero',
                      content: { heading: '', subheading: '' }
                    }];
                    handleEdit('components', newComponents);
                  }}
                  className="px-3 py-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  Add Hero
                </button>
                <button
                  onClick={() => {
                    const newComponents = [...content.components, {
                      type: 'feature',
                      content: { title: '', description: '' }
                    }];
                    handleEdit('components', newComponents);
                  }}
                  className="px-3 py-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                >
                  Add Feature
                </button>
              </div>
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
                  // In a real implementation, this would save to Storyblok via API
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

export default StoryblokTest;
