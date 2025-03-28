import { _ as __vitePreload } from './preload-helper-1e3b7978.js';

const currentImports = {};
      const exportSet = new Set(['Module', '__esModule', 'default', '_export_sfc']);
      let moduleMap = {
"./MissionFreshApp":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './MissionFreshApp');
      return __federation_import('${__federation_expose_./MissionFreshApp}').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Dashboard":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './Dashboard');
      return __federation_import('./__federation_expose_Dashboard-567c6b53.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Progress":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './Progress');
      return __federation_import('./__federation_expose_Progress-990a2dda.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./ConsumptionLogger":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './ConsumptionLogger');
      return __federation_import('./__federation_expose_ConsumptionLogger-0684caaa.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./NRTDirectory":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './NRTDirectory');
      return __federation_import('./__federation_expose_NRTDirectory-f0fb7c5c.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./AlternativeProducts":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './AlternativeProducts');
      return __federation_import('./__federation_expose_AlternativeProducts-0a034389.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./GuidesHub":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './GuidesHub');
      return __federation_import('./__federation_expose_GuidesHub-82f8b7c9.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./WebTools":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './WebTools');
      return __federation_import('./__federation_expose_WebTools-3fa90134.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Community":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './Community');
      return __federation_import('./__federation_expose_Community-8b5b454c.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Settings":()=>{
      dynamicLoadingCss(["style-0cdb6ae7.css"], false, './Settings');
      return __federation_import('./__federation_expose_Settings-0bf416a2.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},};
      const seen = {};
      const dynamicLoadingCss = (cssFilePaths, dontAppendStylesToHead, exposeItemName) => {
        const metaUrl = import.meta.url;
        if (typeof metaUrl === 'undefined') {
          console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');
          return;
        }

        const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf('remoteEntry.js'));
        const base = '/';
        'assets';

        cssFilePaths.forEach(cssPath => {
         let href = '';
         const baseUrl = base || curUrl;
         if (baseUrl) {
           const trimmer = {
             trailing: (path) => (path.endsWith('/') ? path.slice(0, -1) : path),
             leading: (path) => (path.startsWith('/') ? path.slice(1) : path)
           };
           const isAbsoluteUrl = (url) => url.startsWith('http') || url.startsWith('//');
           
           const cleanBaseUrl = trimmer.trailing(baseUrl);
           const cleanCssPath = trimmer.leading(cssPath);
           const cleanCurUrl = trimmer.trailing(curUrl);
           
           if (isAbsoluteUrl(baseUrl)) {
             href = [cleanBaseUrl, cleanCssPath].filter(Boolean).join('/');
           } else {
             href = [cleanCurUrl + cleanBaseUrl, cleanCssPath].filter(Boolean).join('/');
           }
         } else {
           href = cssPath;
         }

          if (href in seen) return;
          seen[href] = true;

          if (!dontAppendStylesToHead) {
            const element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = href;
            document.head.appendChild(element);
            return;
          }

          const key = 'css__' + options.name + '__' + exposeItemName;
          window[key] = window[key] || [];
          window[key].push(href);
        });
      };
      async function __federation_import(name) {
        currentImports[name] ??= __vitePreload(() => import(name),true?[]:void 0);
        return currentImports[name]
      }      const get =(module) => {
        if(!moduleMap[module]) throw new Error('Can not find remote module ' + module)
        return moduleMap[module]();
      };
      const init =(shareScope) => {
        globalThis.__federation_shared__= globalThis.__federation_shared__|| {};
        Object.entries(shareScope).forEach(([key, value]) => {
          const versionKey = Object.keys(value)[0];
          const versionValue = Object.values(value)[0];
          const scope = versionValue.scope || 'default';
          globalThis.__federation_shared__[scope] = globalThis.__federation_shared__[scope] || {};
          const shared= globalThis.__federation_shared__[scope];
          (shared[key] = shared[key]||{})[versionKey] = versionValue;
        });
      };

export { dynamicLoadingCss, get, init };
