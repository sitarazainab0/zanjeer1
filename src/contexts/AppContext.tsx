import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ur";

export interface ClearedData {
  messages: boolean;
  voiceMessages: boolean;
  files: boolean;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
  toggleTheme: () => void;
  t: (en: string, ur: string) => string;
  clearedData: ClearedData;
  clearDataCategory: (category: keyof ClearedData) => void;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("ur");
  const [isDark, setIsDark] = useState(false);
  const [clearedData, setClearedData] = useState<ClearedData>({
    messages: false,
    voiceMessages: false,
    files: false,
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((p) => !p);
  const t = (en: string, ur: string) => (language === "en" ? en : ur);

  const clearDataCategory = (category: keyof ClearedData) => {
    setClearedData((prev) => ({ ...prev, [category]: true }));
  };

  const clearAllData = () => {
    setClearedData({ messages: true, voiceMessages: true, files: true });
  };

  return (
    <AppContext.Provider value={{ language, setLanguage, isDark, toggleTheme, t, clearedData, clearDataCategory, clearAllData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
