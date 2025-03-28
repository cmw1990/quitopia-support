import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define types for our translations and context
export type Translations = Record<string, string>;
type TranslationContextType = {
  t: (key: string, options?: Record<string, any>) => string;
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  availableLanguages: string[];
};

// Create context with default values
const TranslationContext = createContext<TranslationContextType>({
  t: (key) => key,
  currentLanguage: 'en',
  changeLanguage: async () => {},
  availableLanguages: ['en'],
});

// Define props for the provider component
interface I18nProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ 
  children, 
  defaultLanguage = 'en'
}) => {
  // State to hold current language and translations
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    localStorage.getItem('app-language') || defaultLanguage
  );
  const [translations, setTranslations] = useState<Translations>({});
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en']);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load translations for a specific language
  const loadTranslations = async (lang: string): Promise<Translations> => {
    try {
      // Dynamic import to load the translation file
      const module = await import(`./translations/${lang}.json`);
      return module.default;
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      // Fallback to English if the requested language fails to load
      if (lang !== 'en') {
        return loadTranslations('en');
      }
      return {};
    }
  };

  // Function to check available languages
  const checkAvailableLanguages = async () => {
    try {
      // This would ideally be a dynamic lookup of available files
      // For simplicity, we're hardcoding the supported languages
      const languages = ['en', 'es', 'fr', 'de', 'zh'];
      setAvailableLanguages(languages);
    } catch (error) {
      console.error('Failed to get available languages:', error);
    }
  };

  // Load translations when language changes
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await checkAvailableLanguages();
      const loadedTranslations = await loadTranslations(currentLanguage);
      setTranslations(loadedTranslations);
      localStorage.setItem('app-language', currentLanguage);
      setIsLoading(false);
    };

    init();
  }, [currentLanguage]);

  // Translation function
  const t = (key: string, options?: Record<string, any>): string => {
    if (isLoading) return key; // Return the key if translations aren't loaded yet
    
    let text = translations[key] || key;
    
    // Simple variable substitution
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      });
    }
    
    return text;
  };

  // Function to change the current language
  const changeLanguage = async (lang: string): Promise<void> => {
    if (availableLanguages.includes(lang)) {
      setCurrentLanguage(lang);
    } else {
      console.warn(`Language ${lang} is not available, using English instead.`);
      setCurrentLanguage('en');
    }
  };

  // Provide the translation functions and state to the app
  return (
    <TranslationContext.Provider 
      value={{ 
        t, 
        currentLanguage, 
        changeLanguage, 
        availableLanguages 
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use translations
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
};

// Trans component for inline JSX translations
interface TransProps {
  children: string;
  components?: Record<string, ReactNode>;
}

export const Trans: React.FC<TransProps> = ({ children, components = {} }) => {
  const { t } = useTranslation();
  const translatedText = t(children);
  
  // If no components to inject, just return the translated text
  if (Object.keys(components).length === 0) {
    return <>{translatedText}</>;
  }
  
  // Split the text by component markers and inject the components
  const parts = translatedText.split(/(<\d+>.*?<\/\d+>)/g);
  
  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/<(\d+)>(.*?)<\/\1>/);
        if (match) {
          const [, id, content] = match;
          const Component = components[id];
          return Component ? <React.Fragment key={index}>{React.cloneElement(Component as React.ReactElement, {}, content)}</React.Fragment> : content;
        }
        return part;
      })}
    </>
  );
};

export default I18nProvider; 