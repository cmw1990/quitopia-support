import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        plugins: [
          [
            '@babel/plugin-transform-react-jsx',
            {
              throwIfNamespace: false,
              runtime: 'automatic',
              importSource: 'react',
            },
          ],
        ],
      },
    }),
    federation({
      name: 'missionFresh',
      filename: 'remoteEntry.js',
      exposes: {
        './MissionFreshApp': './src/MissionFreshApp.tsx',
        './Dashboard': './src/components/Dashboard.tsx',
        './Progress': './src/components/Progress.tsx',
        './ConsumptionLogger': './src/components/ConsumptionLogger.tsx',
        './NRTDirectory': './src/components/NRTDirectory.tsx',
        './AlternativeProducts': './src/components/AlternativeProducts.tsx',
        './GuidesHub': './src/components/GuidesHub.tsx',
        './WebTools': './src/components/WebTools.tsx',
        './Community': './src/components/Community.tsx',
        './Settings': './src/components/Settings.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom']
    })
  ],
  server: {
    port: 5001,
    strictPort: false,
    cors: true,
    host: true,
    hmr: {
      port: 5002,
    }
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
    host: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/MissionFreshApp.tsx'
    }
  },
  css: {
    // Configure CSS modules
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    // Improve CSS error reporting
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
}); 