import { b as reactDomExports, i as importShared } from './react-vendor-773e5a75.js';
import { A as AuthProvider } from './AuthProvider-b0b4665b.js';
import { j as jsxRuntimeExports } from './ui-vendor-336c871f.js';
import { MissionFreshApp } from './__federation_expose_MissionFreshApp-34a56e29.js';

var client = {};

var m = reactDomExports;
{
  var i = m.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  client.createRoot = function(c, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.createRoot(c, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
  client.hydrateRoot = function(c, h, o) {
    i.usingClientEntryPoint = true;
    try {
      return m.hydrateRoot(c, h, o);
    } finally {
      i.usingClientEntryPoint = false;
    }
  };
}

const {createContext,useContext,useEffect,useState} = await importShared('react');
const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {
  }
});
const ThemeProvider = ({
  children
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored) {
      return stored === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ThemeContext.Provider,
    { value: { isDarkMode, toggleTheme }, children }
  );
};

const originalLog = console.log;
console.log = function(...args) {
  const isDevToolsMessage = args.length > 0 && typeof args[0] === "string" && args[0].includes("Download the React DevTools");
  if (!isDevToolsMessage) {
    originalLog.apply(console, args);
  }
};

const index = '';

const React = await importShared('react');
const {BrowserRouter} = await importShared('react-router-dom');
{
  const root = document.getElementById("_mission-fresh-dev-root");
  if (!root) {
    const rootDiv = document.createElement("div");
    rootDiv.id = "_mission-fresh-dev-root";
    document.body.appendChild(rootDiv);
  }
  client.createRoot(root).render(
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      React.StrictMode,
      { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        BrowserRouter,
        { basename: "/mission-fresh", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          ThemeProvider,
          { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            AuthProvider,
            { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MissionFreshApp, {}) }
          ) }
        ) }
      ) }
    )
  );
}
