import { CSSProperties } from 'react';

export interface WireframeComponent {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'card' | 'image' | 'icon' | 'custom';
  name: string;
  props: {
    className?: string;
    style?: CSSProperties;
    [key: string]: any;
  };
  children?: WireframeComponent[];
  parentId?: string;
  sourceCode?: {
    component: string;
    imports: string[];
    props: Record<string, any>;
  };
  metadata?: {
    route?: string;
    isTemplate?: boolean;
    description?: string;
    tags?: string[];
  };
}

export interface WireframeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  components: WireframeComponent[];
  thumbnail?: string;
}

export interface ComponentDefinition {
  name: string;
  type: WireframeComponent['type'];
  defaultProps: Record<string, any>;
  propTypes: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      required?: boolean;
      options?: any[];
      default?: any;
    };
  };
  preview: string;
}

export interface WireframePage {
  id: string;
  name: string;
  route: string;
  layout?: string;
  components: WireframeComponent[];
  styles?: Record<string, CSSProperties>;
  metadata: {
    title: string;
    description?: string;
    isPublic?: boolean;
    requiresAuth?: boolean;
    tags?: string[];
    version?: string;
    lastModified: string;
  };
}

export interface CodeGenConfig {
  framework: 'react';
  styling: 'tailwind' | 'css' | 'styled-components';
  typescript: boolean;
  prettier: boolean;
  eslint: boolean;
  testFiles: boolean;
}

export interface ComponentLibrary {
  name: string;
  components: ComponentDefinition[];
  category: string;
  description: string;
  version: string;
}
