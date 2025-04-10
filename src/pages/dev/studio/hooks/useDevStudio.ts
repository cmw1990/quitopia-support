import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { WireframePage, WireframeComponent, CodeGenConfig } from '../types';
import { generateComponentCode } from '../utils/codeGenerator';
import { routes } from '@/routes/config';

export const useDevStudio = () => {
  const [pages, setPages] = useLocalStorage<WireframePage[]>('devstudio_pages', []);
  const [activePage, setActivePage] = useState<WireframePage | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<WireframeComponent | null>(null);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [codeGenConfig, setCodeGenConfig] = useLocalStorage<CodeGenConfig>('devstudio_config', {
    framework: 'react',
    styling: 'tailwind',
    typescript: true,
    prettier: true,
    eslint: true,
    testFiles: true
  });

  const addComponent = useCallback((component: WireframeComponent) => {
    if (!activePage) return;

    setActivePage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        components: [...prev.components, component]
      };
    });
  }, [activePage]);

  const updateComponent = useCallback((component: WireframeComponent) => {
    if (!activePage) return;

    setActivePage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        components: prev.components.map(c =>
          c.id === component.id ? component : c
        )
      };
    });

    setSelectedComponent(component);
  }, [activePage]);

  const deleteComponent = useCallback((id: string) => {
    if (!activePage) return;

    setActivePage(prev => {
      if (!prev) return null;
      return {
        ...prev,
        components: prev.components.filter(c => c.id !== id)
      };
    });

    setSelectedComponent(null);
  }, [activePage]);

  const savePage = useCallback(async () => {
    if (!activePage) return;

    // Save to local storage
    setPages(prev =>
      prev.map(p => (p.id === activePage.id ? activePage : p))
    );

    // Generate and save code files
    const code = await generateComponentCode(activePage, codeGenConfig);

    // Update route configuration if needed
    const route = routes.find(r => r.path === activePage.route);
    if (!route) {
      // Add new route
      // Note: This would typically involve updating your route configuration
      console.log('New route needs to be added:', activePage.route);
    }

    return code;
  }, [activePage, codeGenConfig, setPages]);

  const generateCode = useCallback(async () => {
    if (!activePage) return;

    const code = await generateComponentCode(activePage, codeGenConfig);
    return code;
  }, [activePage, codeGenConfig]);

  const previewPage = useCallback(() => {
    if (!activePage) return;

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Preview - ${activePage.name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          </head>
          <body>
            <div id="root"></div>
            <script>
              const components = ${JSON.stringify(activePage.components)};
              // Render components here
            </script>
          </body>
        </html>
      `;
      previewWindow.document.write(html);
    }
  }, [activePage]);

  const importFromRoute = useCallback((route: string) => {
    // Import existing page component and convert to wireframe
    // This would involve parsing the component file and creating a wireframe representation
    console.log('Importing from route:', route);
  }, []);

  return {
    pages,
    activePage,
    selectedComponent,
    viewport,
    codeGenConfig,
    setViewport,
    setCodeGenConfig,
    addComponent,
    updateComponent,
    deleteComponent,
    savePage,
    generateCode,
    previewPage,
    importFromRoute
  };
};

export default useDevStudio;
