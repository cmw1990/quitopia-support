import { _ as __vitePreload } from './react-vendor-773e5a75.js';

const currentImports = {};
      const exportSet = new Set(['Module', '__esModule', 'default', '_export_sfc']);
      let moduleMap = {
"./MissionFreshApp":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './MissionFreshApp');
      return __federation_import('/mission-fresh/assets/__federation_expose_MissionFreshApp-34a56e29.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Dashboard":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './Dashboard');
      return __federation_import('/mission-fresh/assets/__federation_expose_Dashboard-eb3ed0a6.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Progress":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './Progress');
      return __federation_import('/mission-fresh/assets/__federation_expose_Progress-d4457412.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Settings":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './Settings');
      return __federation_import('/mission-fresh/assets/__federation_expose_Settings-82dfa93e.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./Community":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './Community');
      return __federation_import('/mission-fresh/assets/__federation_expose_Community-b8bc9ee3.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./GuidesHub":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './GuidesHub');
      return __federation_import('/mission-fresh/assets/__federation_expose_GuidesHub-4af684b1.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./WebTools":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './WebTools');
      return __federation_import('/mission-fresh/assets/__federation_expose_WebTools-6f9b7618.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./NRTDirectory":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './NRTDirectory');
      return __federation_import('/mission-fresh/assets/__federation_expose_NRTDirectory-8ff50464.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./AlternativeProducts":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './AlternativeProducts');
      return __federation_import('/mission-fresh/assets/__federation_expose_AlternativeProducts-704febbd.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./ConsumptionLogger":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './ConsumptionLogger');
      return __federation_import('/mission-fresh/assets/__federation_expose_ConsumptionLogger-8e6d605f.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./LandingPage":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './LandingPage');
      return __federation_import('/mission-fresh/assets/__federation_expose_LandingPage-6a982906.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./ui":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './ui');
      return __federation_import('/mission-fresh/assets/__federation_expose_Ui-9bd7a9ac.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./utils":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './utils');
      return __federation_import('/mission-fresh/assets/__federation_expose_Utils-89aa12c7.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./hooks":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './hooks');
      return __federation_import('/mission-fresh/assets/__federation_expose_Hooks-d8394ee3.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},
"./types":()=>{
      dynamicLoadingCss(["style-49c5bb6e.css"], false, './types');
      return __federation_import('/mission-fresh/assets/__federation_expose_Types-4ed993c7.js').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},};
      const seen = {};
      const dynamicLoadingCss = (cssFilePaths, dontAppendStylesToHead, exposeItemName) => {
        const metaUrl = import.meta.url;
        if (typeof metaUrl === 'undefined') {
          console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".');
          return;
        }

        const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf('remoteEntry.js'));
        const base = '/mission-fresh/';
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
