import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { UIThemeDefinition, AppTheme } from '../types';
import { DEFAULT_UI_THEMES } from '../data/defaultUIThemes';
import { resolveUITheme, applyUIThemeCSSVariables, FALLBACK_UI_THEME } from '../utils/uiThemeEngine';

interface UIThemeContextType {
  currentThemeId: string;
  activeTheme: UIThemeDefinition;
  allThemes: UIThemeDefinition[];
  customUIThemes: UIThemeDefinition[];
  setUITheme?: (themeId: string) => void;
  getUIThemeDefinition: (themeId?: string) => UIThemeDefinition;
}

const UIThemeContext = createContext<UIThemeContextType>({
  currentThemeId: 'modern_amber',
  activeTheme: FALLBACK_UI_THEME,
  allThemes: DEFAULT_UI_THEMES,
  customUIThemes: [],
  getUIThemeDefinition: () => FALLBACK_UI_THEME,
});

export const UIThemeProvider: React.FC<{
  value: string;
  customUIThemes?: UIThemeDefinition[];
  appTheme?: AppTheme;
  onChange?: (themeId: string) => void;
  children: React.ReactNode;
}> = ({ value, customUIThemes = [], appTheme = 'dark', onChange, children }) => {
  const allThemes = useMemo(() => {
    const themeMap = new Map<string, UIThemeDefinition>();
    DEFAULT_UI_THEMES.forEach(t => themeMap.set(t.id, t));
    (customUIThemes || []).forEach(t => {
      if (t && t.id) {
        themeMap.set(t.id, { ...t, isCustom: true });
      }
    });
    return Array.from(themeMap.values());
  }, [customUIThemes]);

  const getUIThemeDefinition = useCallback(
    (themeId?: string): UIThemeDefinition => {
      const targetId = themeId || value || 'modern_amber';
      const found = allThemes.find(t => t.id === targetId);
      const isDark = appTheme !== 'light' && appTheme !== 'sepia';
      return resolveUITheme(found || FALLBACK_UI_THEME, isDark);
    },
    [value, allThemes, appTheme]
  );

  const activeTheme = useMemo(() => {
    return getUIThemeDefinition(value);
  }, [value, getUIThemeDefinition]);

  // Dynamically apply CSS variables to the document root on theme change
  useEffect(() => {
    const isDark = appTheme !== 'light' && appTheme !== 'sepia';
    applyUIThemeCSSVariables(activeTheme, isDark);
  }, [activeTheme, appTheme]);

  const contextValue = useMemo<UIThemeContextType>(
    () => ({
      currentThemeId: value || 'modern_amber',
      activeTheme,
      allThemes,
      customUIThemes,
      setUITheme: onChange,
      getUIThemeDefinition,
    }),
    [value, activeTheme, allThemes, customUIThemes, onChange, getUIThemeDefinition]
  );

  return (
    <UIThemeContext.Provider value={contextValue}>
      {children}
    </UIThemeContext.Provider>
  );
};

export const useUITheme = (): UIThemeDefinition => {
  const context = useContext(UIThemeContext);
  return context?.activeTheme || FALLBACK_UI_THEME;
};

export const useUIThemeContext = (): UIThemeContextType => {
  return useContext(UIThemeContext);
};
