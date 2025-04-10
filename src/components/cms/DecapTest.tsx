import React from 'react';
import { BaseCMSTest } from './BaseCMSTest';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  body: '# Welcome\n\nThis is a markdown content.\n\n## Features\n\n- Easy to use\n- Git-based\n- Markdown support',
  tags: ['test', 'demo', 'decap'],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

const DecapTest: React.FC = () => {
  const [content, setContent] = React.useState(testContent);
  const [isPreview, setIsPreview] = React.useState(false);

  const handleEdit = (field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Decap CMS</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Access Decap Dashboard</h2>
        <p className="text-gray-600 mb-6">
          The Decap CMS dashboard is integrated directly into this page. You can manage your content right here.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <iframe
            src="/tools/cms/decap/admin"
            style={{ width: '100%', height: '800px', border: 'none' }}
            title="Decap CMS Dashboard"
          />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Guide</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Content Types Available:</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li>Blog Posts - <code className="bg-gray-100 px-2 py-1 rounded">content/blog</code></li>
              <li>Documentation - <code className="bg-gray-100 px-2 py-1 rounded">content/docs</code></li>
              <li>Settings - <code className="bg-gray-100 px-2 py-1 rounded">content/settings</code></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Features:</h3>
            <ul className="list-disc list-inside text-gray-600">
              <li>Git-based content management</li>
              <li>Markdown editor with preview</li>
              <li>Media management</li>
              <li>No authentication required in development</li>
            </ul>
          </div>
        </div>
      </div>

      <BaseCMSTest
        name="Decap CMS"
        description="Git-based CMS with Markdown support"
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
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: content.body }} />
              <div className="mt-4 flex gap-2">
                {content.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {tag}
                  </span>
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
                  value={content.body}
                  onChange={(e) => handleEdit('body', e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {content.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => {
                          const newTags = [...content.tags];
                          newTags[index] = e.target.value;
                          handleEdit('tags', newTags);
                        }}
                        className="w-24 bg-transparent border-none focus:outline-none text-sm"
                      />
                      <button
                        onClick={() => {
                          const newTags = content.tags.filter((_, i) => i !== index);
                          handleEdit('tags', newTags);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleEdit('tags', [...content.tags, ''])}
                    className="px-2 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200"
                  >
                    + Add Tag
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
                    // In a real implementation, this would save to Git via Decap CMS
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
    </div>
  );
};

export default DecapTest;
