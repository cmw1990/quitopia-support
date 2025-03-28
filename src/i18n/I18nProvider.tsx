import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Translations {
  [key: string]: string | Translations;
}

interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
  supportedLocales: string[];
}

const defaultTranslations: Record<string, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      retry: 'Retry',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
    },
  },
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Se produjo un error',
      retry: 'Reintentar',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      submit: 'Enviar',
      back: 'Atrás',
      next: 'Siguiente',
    },
    auth: {
      signIn: 'Iniciar Sesión',
      signUp: 'Registrarse',
      signOut: 'Cerrar Sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      forgotPassword: '¿Olvidó su contraseña?',
      resetPassword: 'Restablecer Contraseña',
    },
  },
};

const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];
const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ar'];

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
  isRTL: false,
  supportedLocales: SUPPORTED_LOCALES,
});

export const useI18n = () => useContext(I18nContext);

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  initialLocale = 'en'
}) => {
  const [translations, setTranslations] = useState<Record<string, Translations>>(defaultTranslations);
  const [locale, setLocale] = useState(initialLocale);
  const isRTL = RTL_LOCALES.includes(locale);

  useEffect(() => {
    // Set the dir attribute on document based on RTL
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // You could load additional translations for other languages here
    // For example, by fetching them from an API or importing dynamically
  }, [locale, isRTL]);

  const translate = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') {
        return key; // Fallback to the key if not found
      }
      value = value[k];
    }
    
    if (typeof value !== 'string') {
      return key; // Fallback to the key if not a string
    }
    
    // Replace parameters in the translation
    if (params) {
      return Object.entries(params).reduce(
        (str, [param, val]) => str.replace(new RegExp(`{${param}}`, 'g'), val),
        value
      );
    }
    
    return value;
  };

  const changeLocale = (newLocale: string) => {
    // Validate that the locale is supported
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      setLocale(newLocale);
      localStorage.setItem('app-locale', newLocale);
    } else {
      console.warn(`Locale ${newLocale} is not supported.`);
    }
  };

  return (
    <I18nContext.Provider 
      value={{ 
        locale, 
        setLocale: changeLocale, 
        t: translate, 
        isRTL,
        supportedLocales: SUPPORTED_LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}; 