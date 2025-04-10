/// <reference types="vite/client" />
/// <reference types="react" />
/// <reference types="react-dom" />

import React from 'react'
import { ReactNode } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  interface Window {
    REACT_APP_ENV?: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly DEV: boolean;
    readonly VITE_APP_ENV: string;
    readonly VITE_ENABLE_ANALYTICS: boolean;
    readonly VITE_ENABLE_BETA_FEATURES: boolean;
  }
}

// Extend React FC to include children prop
declare module 'react' {
  interface FC<P = {}> {
    (props: PropsWithChildren<P>): ReactElement | null;
  }
} 