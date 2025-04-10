import React from 'react';
import { CMSTestProps } from './types';

const testContent = {
  title: 'Test Content',
  description: 'This is a test content for CMS evaluation',
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  status: 'draft' as const,
  lastModified: new Date().toISOString(),
};

export const BaseCMSTest: React.FC<{
  name: string;
  description: string;
  children?: React.ReactNode;
}> = ({ name, description, children }) => {
  return (
    <div className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{name}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Edit Content</h3>
          {children}
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="prose max-w-none">
            <h1>{testContent.title}</h1>
            <p>{testContent.description}</p>
            <ul>
              {testContent.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <div className="text-sm text-muted-foreground mt-4">
              Status: {testContent.status}
              <br />
              Last Modified: {new Date(testContent.lastModified).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
