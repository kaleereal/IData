import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { CardTheme, CardThemeDefinition, CARD_THEMES } from '../types';
import { getCachedThemeDefinition, registerThemeDefinitions, clearCardLayoutCache } from '../utils/themeCache';

interface CardThemeContextType {
  cardTheme: CardTheme;
  allThemes: CardThemeDefinition[];
  customCardThemes: CardThemeDefinition[];
  setCardTheme?: (theme: CardTheme) => void;
  getThemeDefinition: (themeId?: CardTheme) => CardThemeDefinition;
}

const CardThemeContext = createContext<CardThemeContextType>({
  cardTheme: 'default',
  allThemes: CARD_THEMES,
  customCardThemes: [],
  getThemeDefinition: () => CARD_THEMES[0],
});

export const CardThemeProvider: React.FC<{
  value: CardTheme;
  customCardThemes?: CardThemeDefinition[];
  onChange?: (theme: CardTheme) => void;
  children: React.ReactNode;
}> = ({ value, customCardThemes = [], onChange, children }) => {
  // Sync custom themes to theme cache
  useEffect(() => {
    if (customCardThemes && customCardThemes.length > 0) {
      registerThemeDefinitions(customCardThemes);
      clearCardLayoutCache();
    }
  }, [customCardThemes]);

  const allThemes = useMemo(() => {
    const themeMap = new Map<string, CardThemeDefinition>();
    CARD_THEMES.forEach(t => themeMap.set(t.id, t));
    (customCardThemes || []).forEach(t => {
      if (t && t.id) {
        themeMap.set(t.id, { ...t, isCustom: true });
      }
    });
    return Array.from(themeMap.values());
  }, [customCardThemes]);

  const getThemeDefinition = useCallback(
    (themeId?: CardTheme): CardThemeDefinition => {
      const id = themeId || value || 'default';
      return getCachedThemeDefinition(id, customCardThemes);
    },
    [value, customCardThemes]
  );

  const contextValue = useMemo<CardThemeContextType>(
    () => ({
      cardTheme: value,
      allThemes,
      customCardThemes,
      setCardTheme: onChange,
      getThemeDefinition,
    }),
    [value, allThemes, customCardThemes, onChange, getThemeDefinition]
  );

  return (
    <CardThemeContext.Provider value={contextValue}>
      {children}
    </CardThemeContext.Provider>
  );
};

export const useCardTheme = (): CardTheme => {
  const context = useContext(CardThemeContext);
  return context?.cardTheme || 'default';
};

export const useCardThemeContext = (): CardThemeContextType => {
  return useContext(CardThemeContext);
};
