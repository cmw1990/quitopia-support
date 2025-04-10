import { WireframePage, WireframeComponent, CodeGenConfig } from '../types';
import prettier from 'prettier';
import { nanoid } from 'nanoid';

const generateImports = (components: WireframeComponent[]): string => {
  const imports = new Set<string>();
  
  // Add React import
  imports.add("import React from 'react';");
  
  // Add component-specific imports
  components.forEach(component => {
    if (component.sourceCode?.imports) {
      component.sourceCode.imports.forEach(imp => imports.add(imp));
    }
  });

  return Array.from(imports).join('\n');
};

const generatePropTypes = (components: WireframeComponent[]): string => {
  const props = new Set<string>();
  
  components.forEach(component => {
    if (component.props) {
      Object.keys(component.props).forEach(key => {
        const value = component.props[key];
        if (typeof value === 'string') {
          props.add(`${key}: string;`);
        } else if (typeof value === 'number') {
          props.add(`${key}: number;`);
        } else if (typeof value === 'boolean') {
          props.add(`${key}: boolean;`);
        } else if (typeof value === 'object') {
          props.add(`${key}: Record<string, any>;`);
        }
      });
    }
  });

  if (props.size === 0) return '';

  return `
interface ${nanoid(6)}Props {
  ${Array.from(props).join('\n  ')}
}
`;
};

const generateComponentJSX = (component: WireframeComponent, indent = 0): string => {
  const spaces = '  '.repeat(indent);
  let jsx = '';

  switch (component.type) {
    case 'container':
      jsx = `${spaces}<div${generateProps(component.props)}>\n`;
      if (component.children) {
        jsx += component.children
          .map(child => generateComponentJSX(child, indent + 1))
          .join('\n');
      }
      jsx += `\n${spaces}</div>`;
      break;

    case 'text':
      jsx = `${spaces}<p${generateProps(component.props)}>${
        component.props.children || ''
      }</p>`;
      break;

    case 'button':
      jsx = `${spaces}<button${generateProps(component.props)}>${
        component.props.children || ''
      }</button>`;
      break;

    case 'input':
      jsx = `${spaces}<input${generateProps(component.props)} />`;
      break;

    case 'card':
      jsx = `${spaces}<div${generateProps(component.props)}>${
        component.props.children || ''
      }</div>`;
      break;

    case 'image':
      jsx = `${spaces}<img${generateProps(component.props)} />`;
      break;

    case 'custom':
      if (component.sourceCode?.component) {
        jsx = component.sourceCode.component;
      }
      break;

    default:
      jsx = `${spaces}<div${generateProps(component.props)} />`;
  }

  return jsx;
};

const generateProps = (props: Record<string, any>): string => {
  if (!props) return '';

  const propsArray = Object.entries(props).map(([key, value]) => {
    if (key === 'className') {
      return `className="${value}"`;
    }
    if (key === 'style') {
      return `style={${JSON.stringify(value)}}`;
    }
    if (typeof value === 'string') {
      return `${key}="${value}"`;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return `${key}={${value}}`;
    }
    if (typeof value === 'object') {
      return `${key}={${JSON.stringify(value)}}`;
    }
    return '';
  });

  return propsArray.length ? ` ${propsArray.join(' ')}` : '';
};

export const generateComponentCode = async (
  page: WireframePage,
  config: CodeGenConfig
): Promise<string> => {
  const componentName = page.name.replace(/\s+/g, '');
  
  let code = `
${generateImports(page.components)}

${config.typescript ? generatePropTypes(page.components) : ''}

export const ${componentName} = () => {
  return (
${page.components.map(component => generateComponentJSX(component, 2)).join('\n')}
  );
};

export default ${componentName};
`;

  if (config.prettier) {
    try {
      code = await prettier.format(code, {
        parser: 'typescript',
        semi: true,
        singleQuote: true,
        trailingComma: 'es5',
      });
    } catch (error) {
      console.error('Error formatting code:', error);
    }
  }

  return code;
};

export const generatePageCode = async (
  page: WireframePage,
  config: CodeGenConfig
): Promise<Record<string, string>> => {
  const files: Record<string, string> = {};
  
  // Generate main component file
  files[`${page.name}.tsx`] = await generateComponentCode(page, config);

  // Generate test file if needed
  if (config.testFiles) {
    files[`${page.name}.test.tsx`] = `
import { render, screen } from '@testing-library/react';
import ${page.name} from './${page.name}';

describe('${page.name}', () => {
  it('renders without crashing', () => {
    render(<${page.name} />);
  });
});
`;
  }

  return files;
};

export default {
  generateComponentCode,
  generatePageCode,
};
