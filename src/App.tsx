import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Artist,
  ActiveTab,
  DatabaseSchema,
  CountryOption,
  AppSettings,
  AppFontSize,
  RankingFilterDimension,
  CustomPageEntry,
  CardThemeDefinition,
} from './types';
import { INITIAL_ARTISTS } from './data/initialArtists';
import { DEFAULT_DATABASE_SCHEMA } from './data/defaultSchema';
import { INITIAL_CUSTOM_PAGES } from './data/initialCustomPages';
import { FloatingActionHub } from './components/FloatingActionHub';
import { BottomNav } from './components/BottomNav';
import { ArtistList } from './components/ArtistList';
import { ArtistDetail } from './components/ArtistDetail';
import { RankingPage } from './components/RankingPage';
import { ComparePage } from './components/ComparePage';
import { ArtistFormPage } from './components/ArtistFormPage';
import { ScoreInfoModal } from './components/ScoreInfoModal';
import { DatabaseEditor } from './components/DatabaseEditor';
import { SettingsPage } from './components/SettingsPage';
import { CustomPagesList } from './components/CustomPagesList';
import { CustomPageForm } from './components/CustomPageForm';
import { CustomPageView } from './components/CustomPageView';
import { LayoutScoreSettingsPage } from './components/LayoutScoreSettingsPage';
import { ExportStudioPage } from './components/ExportStudioPage';
import { DynamicSchemaPage, DynamicSchemaTab } from './components/DynamicSchemaPage';
import { CardThemeStudio } from './components/theme/CardThemeStudio';
import { CardThemeProvider } from './context/CardThemeContext';
import { UIThemeProvider } from './context/UIThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { AlertCircle } from 'lucide-react';
import { getTranslation, resolveLocalizedSchema } from './utils/i18n';
import { DEFAULT_APP_SETTINGS } from './types';
import { syncArtistsWithSchema } from './utils/schemaSync';
import { BUILTIN_COLOR_THEMES } from './data/themePresets';
import { applyAppColorThemePreset } from './utils/uiThemeEngine';

const ARTISTS_STORAGE_KEY = 'talent_rating_artists_v1';
const SCHEMA_STORAGE_KEY = 'talent_rating_db_schema_v1';
const SETTINGS_STORAGE_KEY = 'talent_rating_app_settings_v1';
const CUSTOM_PAGES_STORAGE_KEY = 'talent_rating_custom_pages_v1';

export default function App() {
  // 1. App Settings State (Theme, Font, Font Size, Language, Primary Color, Presets)
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.theme && parsed.fontFamily) {
          return { ...DEFAULT_APP_SETTINGS, ...parsed };
        }
      } catch (e) {
        console.error('Failed to parse stored settings', e);
      }
    }
    return DEFAULT_APP_SETTINGS;
  });

  // Save Settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Apply Theme, Font Family, Global Text Scaling, and 5-Color Palette to Document Root
  useEffect(() => {
    const root = document.documentElement;

    // 1. Color Palette System (5 Colors: Text, Secondary, Primary, Accent, Background)
    const allPresets = [...BUILTIN_COLOR_THEMES, ...(settings.customColorPresets || [])];
    const colorPreset = allPresets.find(p => p.id === settings.selectedColorTheme);
    if (colorPreset) {
      applyAppColorThemePreset(colorPreset);
    } else if (allPresets.length > 0) {
      applyAppColorThemePreset(allPresets[0]);
    }

    // 2. Global Font Family
    root.style.setProperty(
      '--app-font-family',
      `'${settings.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    );

    // 3. Global Text Size Scale (Proportional Mobile & Tablet Scaling)
    let scalePercent = '100%';
    switch (settings.fontSize) {
      case 'xsmall':
        scalePercent = '80%';
        break;
      case 'small':
        scalePercent = '90%';
        break;
      case 'medium':
        scalePercent = '110%';
        break;
      case 'large':
        scalePercent = '125%';
        break;
      case 'xlarge':
        scalePercent = '140%';
        break;
      default:
        scalePercent = '100%';
        break;
    }
    root.style.fontSize = scalePercent;
    root.style.setProperty('--app-font-scale', scalePercent);
  }, [settings.theme, settings.fontFamily, settings.fontSize, settings.primaryColor, settings.selectedColorTheme, settings.customColorPresets]);

  // 2. State for Database Schema (Dynamic database configuration)
  const [schema, setSchema] = useState<DatabaseSchema>(() => {
    const saved = localStorage.getItem(SCHEMA_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fields && parsed.sectionTitles) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored schema', e);
      }
    }
    return DEFAULT_DATABASE_SCHEMA;
  });

  // Save Schema changes to localStorage
  useEffect(() => {
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schema));
  }, [schema]);

  // Dynamic UI Text version for instant live reactivity across components
  const [uiTextVersion, setUiTextVersion] = useState<number>(0);

  useEffect(() => {
    const handleUiTextUpdated = () => {
      setUiTextVersion(v => v + 1);
    };
    window.addEventListener('ui_text_cache_updated', handleUiTextUpdated);
    return () => window.removeEventListener('ui_text_cache_updated', handleUiTextUpdated);
  }, []);

  // Listen to external schema updates from Dynamic Schema editor
  useEffect(() => {
    const handleSchemaUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<DatabaseSchema>;
      if (customEvent.detail) {
        setSchema(customEvent.detail);
      }
    };
    window.addEventListener('applet:schema_updated', handleSchemaUpdated);
    return () => window.removeEventListener('applet:schema_updated', handleSchemaUpdated);
  }, []);

  // Resolve Localized Schema: translates standard labels while preserving user DB Editor customizations
  const localizedSchema = useMemo(
    () => resolveLocalizedSchema(schema, settings.language),
    [schema, settings.language, uiTextVersion]
  );

  // Translation dictionary for all system strings with dynamic live cache
  const t = useMemo(() => getTranslation(settings.language), [settings.language, uiTextVersion]);

  // 3. State for artists with local persistence
  const [artists, setArtists] = useState<Artist[]>(() => {
    const saved = localStorage.getItem(ARTISTS_STORAGE_KEY);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored artists', e);
      }
    }
    return INITIAL_ARTISTS;
  });

  // Save artists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(artists));
    } catch (err) {
      console.error('Error saving artists to localStorage:', err);
    }
  }, [artists]);

  // 4. State for Custom Pages (Separated from artists, locally persisted)
  const [customPages, setCustomPages] = useState<CustomPageEntry[]>(() => {
    const saved = localStorage.getItem(CUSTOM_PAGES_STORAGE_KEY);
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse stored custom pages', e);
      }
    }
    return INITIAL_CUSTOM_PAGES;
  });

  // Save custom pages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PAGES_STORAGE_KEY, JSON.stringify(customPages));
    } catch (err) {
      console.error('Error saving custom pages to localStorage:', err);
    }
  }, [customPages]);

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [historyStack, setHistoryStack] = useState<ActiveTab[]>(['home']);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [artistToEdit, setArtistToEdit] = useState<Artist | null>(null);
  const [selectedCustomPageId, setSelectedCustomPageId] = useState<string | null>(null);
  const [customPageToEdit, setCustomPageToEdit] = useState<CustomPageEntry | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Search State in Top Navbar
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Active quick filter from Profile clicks
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(
    null
  );
  const [rankingParams, setRankingParams] = useState<{
    tab: 'overall' | 'appearance' | 'impression' | 'proportional';
    dimension: RankingFilterDimension;
    subFilter: string;
    highlightArtistId?: string;
  }>({
    tab: 'overall',
    dimension: 'ALL',
    subFilter: 'ALL',
  });

  const [showNavbarDeleteModal, setShowNavbarDeleteModal] = useState(false);
  const [studioCardThemeDef, setStudioCardThemeDef] = useState<CardThemeDefinition | null>(null);
  const [dynamicSchemaInitialTab, setDynamicSchemaInitialTab] = useState<DynamicSchemaTab>('appeal');

  // Double-Back exit mechanism state
  const [lastBackPressTime, setLastBackPressTime] = useState<number>(0);
  const [showExitToast, setShowExitToast] = useState(false);

  // -------------------------------------------------------------
  // TAB SCROLL RESTORATION LOGIC (MEMPERTAHANKAN POSISI SCROLL)
  // -------------------------------------------------------------
  const scrollPositionsRef = useRef<Record<string, number>>({});

  // Continuously record scroll position for the current active tab
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionsRef.current[currentTab] = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentTab]);

  // Restore the saved scroll position whenever tab changes
  useEffect(() => {
    const savedY = scrollPositionsRef.current[currentTab] || 0;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    });
    const timer = setTimeout(() => {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    }, 25);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [currentTab]);

  // Selected artist object
  const selectedArtist = artists.find(a => a.id === selectedArtistId) || null;
  // Selected custom page object
  const selectedCustomPage = customPages.find(p => p.id === selectedCustomPageId) || null;

  // Custom Navigation function that maintains the navigation history stack and records current scroll
  const navigateToTab = (tab: ActiveTab, replace = false) => {
    if (tab === currentTab) return;
    // Save current tab scroll position before switching
    scrollPositionsRef.current[currentTab] = window.scrollY;
    if (!replace) {
      setHistoryStack(prev => [...prev, tab]);
    }
    setCurrentTab(tab);
  };

  // Back Navigation Handler
  // Rule: Non-landing pages return to previous page; Landing page requires double-back press to exit
  const handleBackAction = () => {
    if (currentTab !== 'home') {
      // Non-landing page: Go back to previous page in history
      scrollPositionsRef.current[currentTab] = window.scrollY;
      setHistoryStack(prev => {
        const nextStack = [...prev];
        nextStack.pop(); // Remove current page
        const previousTab = nextStack.length > 0 ? nextStack[nextStack.length - 1] : 'home';
        setCurrentTab(previousTab);
        if (previousTab === 'home') {
          setSelectedArtistId(null);
          setActiveFilter(null);
          setSearchHighlightField(undefined);
          setActiveSearchQueryForDetail('');
        }
        return nextStack.length > 0 ? nextStack : ['home'];
      });
    } else {
      // Landing page: Check for double back-press within 2 seconds
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        setShowExitToast(false);
      } else {
        setLastBackPressTime(now);
        setShowExitToast(true);
        setTimeout(() => setShowExitToast(false), 2000);
      }
    }
  };

  // Listen to Browser Back Button (popstate)
  useEffect(() => {
    window.history.pushState({ page: 'app-root' }, '');

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleBackAction();
      window.history.pushState({ page: 'app-root' }, '');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentTab, historyStack, lastBackPressTime]);

  // Handlers for Views with useCallback for optimal child memoization
  const handleSelectArtist = useCallback((artist: Artist) => {
    setSelectedArtistId(artist.id);
    setSearchHighlightField(undefined);
    setActiveSearchQueryForDetail('');
    navigateToTab('detail');
  }, [navigateToTab]);

  const handleOpenExportStudio = useCallback((artist: Artist) => {
    setSelectedArtistId(artist.id);
    navigateToTab('export_studio');
  }, [navigateToTab]);

  const handleAddNew = useCallback(() => {
    setArtistToEdit(null);
    navigateToTab('create');
  }, [navigateToTab]);

  const handleEditArtist = useCallback((artist: Artist) => {
    setArtistToEdit(artist);
    navigateToTab('edit');
  }, [navigateToTab]);

  const handleCancelForm = useCallback(() => {
    if (artistToEdit && selectedArtistId) {
      navigateToTab('detail');
    } else {
      navigateToTab('home');
    }
    setArtistToEdit(null);
  }, [artistToEdit, selectedArtistId, navigateToTab]);

  const handleSaveArtist = useCallback((artistData: Artist, customPageId?: string | null) => {
    setArtists(prev => {
      const exists = prev.some(a => a.id === artistData.id);
      if (exists) {
        return prev.map(a => (a.id === artistData.id ? artistData : a));
      }
      return [artistData, ...prev];
    });

    // Update Custom Page Link (Requirements 13, 19, 20)
    // Satu Entri Custom hanya dapat ditautkan kepada satu artis
    if (customPageId !== undefined) {
      setCustomPages(prev => {
        return prev.map(page => {
          if (page.id === customPageId) {
            // Tautkan ke artis ini
            return { ...page, linkedArtistId: artistData.id, updatedAt: new Date().toISOString() };
          } else if (page.linkedArtistId === artistData.id && page.id !== customPageId) {
            // Lepas tautan dari artis ini jika halaman custom berbeda
            return { ...page, linkedArtistId: null, updatedAt: new Date().toISOString() };
          }
          return page;
        });
      });
    }

    setSelectedArtistId(artistData.id);
    setArtistToEdit(null);
    navigateToTab('detail');
  }, [navigateToTab]);

  const handleDeleteArtist = useCallback((id: string) => {
    try {
      setArtists(prev => {
        const next = prev.filter(a => a.id !== id);
        try {
          localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(next));
        } catch (storageErr) {
          console.error('Error updating localStorage:', storageErr);
        }
        return next;
      });

      // Unlink any custom pages that were linked to this artist
      setCustomPages(prev =>
        prev.map(p => (p.linkedArtistId === id ? { ...p, linkedArtistId: null } : p))
      );

      if (selectedArtistId === id) {
        setSelectedArtistId(null);
        navigateToTab('home');
      }
    } catch (err) {
      console.error('Failed to delete artist:', err);
    }
  }, [selectedArtistId, navigateToTab]);

  const handleBatchDeleteArtists = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    const idSet = new Set(ids);
    try {
      setArtists(prev => {
        const next = prev.filter(a => !idSet.has(a.id));
        try {
          localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(next));
        } catch (storageErr) {
          console.error('Error updating localStorage:', storageErr);
        }
        return next;
      });

      // Unlink any custom pages
      setCustomPages(prev =>
        prev.map(p => (p.linkedArtistId && idSet.has(p.linkedArtistId) ? { ...p, linkedArtistId: null } : p))
      );

      if (selectedArtistId && idSet.has(selectedArtistId)) {
        setSelectedArtistId(null);
        navigateToTab('home');
      }
    } catch (err) {
      console.error('Failed to batch delete artists:', err);
    }
  }, [selectedArtistId, navigateToTab]);

  // -------------------------------------------------------------
  // CUSTOM PAGES HANDLERS (Requirements 1 - 21)
  // -------------------------------------------------------------
  const handleOpenCustomPages = useCallback(() => {
    navigateToTab('custom_pages');
  }, [navigateToTab]);

  const handleOpenDynamicSchema = useCallback((tab: DynamicSchemaTab = 'appeal') => {
    setDynamicSchemaInitialTab(tab);
    navigateToTab('dynamic_schema');
  }, [navigateToTab]);

  const handleOpenCardThemeStudio = useCallback((themeDef?: CardThemeDefinition | null) => {
    setStudioCardThemeDef(themeDef || null);
    navigateToTab('card_theme_studio');
  }, [navigateToTab]);

  const handleSaveCardThemeFromStudio = useCallback((newTheme: CardThemeDefinition) => {
    const existingCustom = settings.customCardThemes || [];
    const idx = existingCustom.findIndex(t => t.id === newTheme.id);
    let updatedCustom: CardThemeDefinition[];
    if (idx >= 0) {
      updatedCustom = [...existingCustom];
      updatedCustom[idx] = newTheme;
    } else {
      updatedCustom = [...existingCustom, newTheme];
    }
    setSettings(prev => ({
      ...prev,
      customCardThemes: updatedCustom,
      cardTheme: newTheme.id as any,
    }));
  }, [settings.customCardThemes]);

  const handleApplyLiveCardThemeFromStudio = useCallback((themeDef: CardThemeDefinition) => {
    setSettings(prev => ({
      ...prev,
      cardTheme: themeDef.id as any,
    }));
  }, []);

  const handleCreateCustomPage = useCallback(() => {
    setCustomPageToEdit(null);
    navigateToTab('custom_page_create');
  }, [navigateToTab]);

  const handleEditCustomPage = useCallback((entry: CustomPageEntry) => {
    setCustomPageToEdit(entry);
    navigateToTab('custom_page_edit');
  }, [navigateToTab]);

  const handleViewCustomPage = useCallback((pageId: string) => {
    setSelectedCustomPageId(pageId);
    navigateToTab('custom_page_view');
  }, [navigateToTab]);

  const handleCancelCustomPageForm = useCallback(() => {
    if (customPageToEdit && selectedCustomPageId) {
      navigateToTab('custom_page_view');
    } else {
      navigateToTab('custom_pages');
    }
    setCustomPageToEdit(null);
  }, [customPageToEdit, selectedCustomPageId, navigateToTab]);

  const handleSaveCustomPage = useCallback((savedEntry: CustomPageEntry) => {
    setCustomPages(prev => {
      let updated = [...prev];
      // Jika halaman ini menautkan artis tertentu, pastikan halaman custom lain tidak menautkan artis yang sama (1:1)
      if (savedEntry.linkedArtistId) {
        updated = updated.map(p => {
          if (p.id !== savedEntry.id && p.linkedArtistId === savedEntry.linkedArtistId) {
            return { ...p, linkedArtistId: null, updatedAt: new Date().toISOString() };
          }
          return p;
        });
      }
      const existsIndex = updated.findIndex(p => p.id === savedEntry.id);
      if (existsIndex >= 0) {
        updated[existsIndex] = savedEntry;
      } else {
        updated.unshift(savedEntry);
      }
      return updated;
    });
    setSelectedCustomPageId(savedEntry.id);
    setCustomPageToEdit(null);
    navigateToTab('custom_page_view');
  }, [navigateToTab]);

  const handleDirectSaveCustomPage = useCallback((savedEntry: CustomPageEntry) => {
    setCustomPages(prev => {
      let updated = [...prev];
      if (savedEntry.linkedArtistId) {
        updated = updated.map(p => {
          if (p.id !== savedEntry.id && p.linkedArtistId === savedEntry.linkedArtistId) {
            return { ...p, linkedArtistId: null, updatedAt: new Date().toISOString() };
          }
          return p;
        });
      }
      const existsIndex = updated.findIndex(p => p.id === savedEntry.id);
      if (existsIndex >= 0) {
        updated[existsIndex] = savedEntry;
      } else {
        updated.unshift(savedEntry);
      }
      return updated;
    });
  }, []);

  const handleDeleteCustomPage = useCallback((id: string) => {
    setCustomPages(prev => prev.filter(p => p.id !== id));
    if (selectedCustomPageId === id) {
      setSelectedCustomPageId(null);
    }
    if (currentTab === 'custom_page_view' || currentTab === 'custom_page_edit') {
      navigateToTab('custom_pages');
    }
  }, [selectedCustomPageId, currentTab, navigateToTab]);

  const handleNavigateToRanking = (
    tab: 'overall' | 'appearance' | 'impression' | 'proportional' = 'overall',
    dimension: RankingFilterDimension = 'ALL',
    subFilter: string = 'ALL',
    highlightArtistId?: string
  ) => {
    setRankingParams({ tab, dimension, subFilter, highlightArtistId });
    navigateToTab('rank');
  };

  const handleFilterByAttribute = (filterType: string, value: string) => {
    setActiveFilter({ type: filterType, value });
    navigateToTab('home');
  };

  const handleSaveSchema = (updatedSchema: DatabaseSchema) => {
    setArtists(prev => {
      const synchronized = syncArtistsWithSchema(prev, updatedSchema, schema);
      localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(synchronized));
      return synchronized;
    });
    setSchema(updatedSchema);
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(updatedSchema));
  };

  const [searchHighlightField, setSearchHighlightField] = useState<string | undefined>();
  const [activeSearchQueryForDetail, setActiveSearchQueryForDetail] = useState<string>('');

  const handleSelectSearchResult = (artist: Artist, matchedField?: string) => {
    setSelectedArtistId(artist.id);
    setSearchHighlightField(matchedField);
    setActiveSearchQueryForDetail(searchQuery || '');
    navigateToTab('detail');
  };

  const handleResetSchema = () => {
    setSchema(DEFAULT_DATABASE_SCHEMA);
    localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(DEFAULT_DATABASE_SCHEMA));
  };

  const handleAddNewCountry = (newCountry: CountryOption) => {
    setSchema(prev => {
      if (prev.countries.some(c => c.name.toLowerCase() === newCountry.name.toLowerCase())) {
        return prev;
      }
      const updated = {
        ...prev,
        countries: [...prev.countries, newCountry],
      };
      localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleOpenCompare = (artist?: Artist) => {
    if (artist) {
      setSelectedArtistId(artist.id);
    }
    navigateToTab('compare');
  };

  // Restore Database Handler (Overwrite or Merge)
  const handleRestoreData = (
    newArtists: Artist[],
    newSchema?: DatabaseSchema,
    mode: 'overwrite' | 'merge' = 'overwrite'
  ) => {
    if (mode === 'overwrite') {
      setArtists(newArtists);
      localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(newArtists));
      if (newSchema) {
        setSchema(newSchema);
        localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(newSchema));
      }
    } else {
      setArtists(prev => {
        const merged = [...prev];
        newArtists.forEach(na => {
          const idx = merged.findIndex(
            a =>
              a.id === na.id ||
              (a.firstName.toLowerCase() === na.firstName.toLowerCase() &&
                a.lastName.toLowerCase() === na.lastName.toLowerCase())
          );
          if (idx >= 0) {
            merged[idx] = na;
          } else {
            merged.push(na);
          }
        });
        localStorage.setItem(ARTISTS_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
      if (newSchema) {
        setSchema(newSchema);
        localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(newSchema));
      }
    }
  };

  const allColorPresets = useMemo(
    () => [...BUILTIN_COLOR_THEMES, ...(settings.customColorPresets || [])],
    [settings.customColorPresets]
  );
  const activeColorPreset = useMemo(() => {
    return allColorPresets.find(p => p.id === settings.selectedColorTheme) || allColorPresets[0];
  }, [allColorPresets, settings.selectedColorTheme]);

  return (
    <CardThemeProvider
      value={settings.cardTheme}
      customCardThemes={settings.customCardThemes || []}
      onChange={(ct) => setSettings((s) => ({ ...s, cardTheme: ct }))}
    >
      <UIThemeProvider
        value={settings.uiTheme || 'modern_amber'}
        customUIThemes={settings.customUIThemes || []}
        appTheme="dark"
        onChange={(themeId) => setSettings((s) => ({ ...s, uiTheme: themeId }))}
      >
        <LocalizationProvider initialLocale={settings.language}>
          <FavoritesProvider>
            <div
              style={{
                backgroundColor: activeColorPreset?.background || 'var(--color-bg-app, #0C0A09)',
                color: activeColorPreset?.text || 'var(--color-text-main, #f5f3f8)',
                fontFamily: 'var(--ui-font-family, var(--app-font-family))',
              }}
              className="min-h-screen w-full transition-colors duration-200"
            >
        {/* Landing Page Double-Back Exit Toast */}
        {showExitToast && (
          <div
            style={{
              backgroundColor: activeColorPreset?.secondary || 'var(--color-surface, #16131c)',
              borderColor: activeColorPreset?.primary || 'var(--color-primary, #958ab8)',
              color: activeColorPreset?.text || 'var(--color-text-main, #f5f3f8)',
            }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl border text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3"
          >
            <AlertCircle
              style={{ color: activeColorPreset?.primary || 'var(--color-primary, #958ab8)' }}
              className="w-4 h-4"
            />
            <span>{t.pressAgainToExit}</span>
          </div>
        )}

        {/* Main View Container (Header removed across all pages per request) */}
        {(() => {
          const isInnerPage =
            currentTab === 'detail' ||
            currentTab === 'export_studio' ||
            currentTab === 'create' ||
            currentTab === 'edit' ||
            currentTab === 'dynamic_schema' ||
            currentTab === 'db_editor' ||
            currentTab === 'layout_score_settings' ||
            currentTab === 'card_theme_studio' ||
            currentTab === 'custom_pages' ||
            currentTab === 'custom_page_create' ||
            currentTab === 'custom_page_edit' ||
            currentTab === 'custom_page_view';

          const showBottomNav = !isInnerPage;

          return (
            <>
              <main
                className={`${
                  currentTab === 'card_theme_studio' || currentTab === 'dynamic_schema'
                    ? 'w-full max-w-7xl mx-auto px-0 pt-0 overflow-visible'
                    : 'max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 overflow-x-clip'
                } ${
                  showBottomNav
                    ? 'pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:pb-32'
                    : 'pb-12 sm:pb-16'
                } min-w-0 w-full`}
              >
                {currentTab === 'dynamic_schema' ? (
                  /* Standalone Page: Pengaturan Skema Dinamis Full-Page View */
                  <DynamicSchemaPage
                    schema={schema}
                    onSaveSchema={handleSaveSchema}
                    onResetSchema={handleResetSchema}
                    onBack={handleBackAction}
                    initialTab={dynamicSchemaInitialTab}
                  />
                ) : currentTab === 'settings' ? (
                  /* Halaman Pengaturan Aplikasi (Offline-First, Theme, Font, Bahasa, DB Editor, Backup/Restore, Halaman Custom) */
                  <SettingsPage
                    settings={settings}
                    onUpdateSettings={setSettings}
                    onResetSettings={() => setSettings(DEFAULT_APP_SETTINGS)}
                    onOpenDbEditor={() => navigateToTab('db_editor')}
                    onOpenDynamicSchema={() => handleOpenDynamicSchema('appeal')}
                    onOpenCustomPages={handleOpenCustomPages}
                    onOpenLayoutScoreSettings={() => navigateToTab('layout_score_settings')}
                    onOpenCardThemeStudio={handleOpenCardThemeStudio}
                    customPagesCount={customPages.length}
                    artists={artists}
                    schema={localizedSchema}
                    onRestoreData={handleRestoreData}
                    onBackToHome={() => navigateToTab('home')}
                  />
                ) : currentTab === 'card_theme_studio' ? (
                  /* Standalone Mode: Card Theme Customizer Studio Full-Page View */
                  <CardThemeStudio
                    initialTheme={studioCardThemeDef}
                    sampleArtists={artists}
                    settings={settings}
                    onSaveTheme={handleSaveCardThemeFromStudio}
                    onApplyLive={handleApplyLiveCardThemeFromStudio}
                    onClose={() => navigateToTab('settings')}
                  />
                ) : currentTab === 'layout_score_settings' ? (
                  /* Halaman Kustomisasi Tata Letak & Visual Score & Spek (Fixed Live Preview) */
                  <LayoutScoreSettingsPage
                    settings={settings}
                    onUpdateSettings={setSettings}
                    onBack={() => navigateToTab('settings')}
                    artists={artists}
                    schema={localizedSchema}
                  />
                ) : currentTab === 'db_editor' ? (
                  /* Mode Editor Database (Advanced Schema & Taxonomy Editor) */
                  <DatabaseEditor
                    schema={schema}
                    onSaveSchema={handleSaveSchema}
                    onResetSchema={handleResetSchema}
                    onBack={() => navigateToTab('settings')}
                    onBackToViewer={() => navigateToTab('home')}
                    onOpenCustomPages={handleOpenCustomPages}
                    onOpenDynamicSchema={() => handleOpenDynamicSchema('appeal')}
                  />
                ) : currentTab === 'custom_pages' ? (
                  /* Mode: Halaman Custom List (Entri Terpisah dari Artis) */
                  <CustomPagesList
                    customPages={customPages}
                    artists={artists}
                    onSelectPage={handleViewCustomPage}
                    onAddNewPage={handleCreateCustomPage}
                    onEditPage={handleEditCustomPage}
                    onDeletePage={handleDeleteCustomPage}
                    onBack={() => navigateToTab('settings')}
                    onBackToHome={() => navigateToTab('home')}
                  />
                ) : currentTab === 'custom_page_create' ? (
                  /* Mode: Form Buat Entri Custom Baru */
                  <CustomPageForm
                    onCancel={handleCancelCustomPageForm}
                    onSave={handleSaveCustomPage}
                    entryToEdit={null}
                    artists={artists}
                    customPages={customPages}
                  />
                ) : currentTab === 'custom_page_edit' ? (
                  /* Mode: Form Edit Entri Custom */
                  <CustomPageForm
                    onCancel={handleCancelCustomPageForm}
                    onSave={handleSaveCustomPage}
                    entryToEdit={customPageToEdit || selectedCustomPage}
                    artists={artists}
                    customPages={customPages}
                  />
                ) : currentTab === 'custom_page_view' && selectedCustomPage ? (
                  /* Mode: Lihat Halaman Custom */
                  <CustomPageView
                    entry={selectedCustomPage}
                    artists={artists}
                    onBack={() => navigateToTab('custom_pages')}
                    onBackToHome={() => navigateToTab('home')}
                    onEdit={handleEditCustomPage}
                    onDelete={handleDeleteCustomPage}
                    onSelectArtist={handleSelectArtist}
                  />
                ) : currentTab === 'create' ? (
                  /* Standalone Page: Buat Artis Baru */
                  <ArtistFormPage
                    onCancel={handleCancelForm}
                    onSave={handleSaveArtist}
                    artistToEdit={null}
                    schema={localizedSchema}
                    onAddNewCountry={handleAddNewCountry}
                    customPages={customPages}
                    onUpdateSchema={handleSaveSchema}
                    onSaveCustomPageDirect={handleDirectSaveCustomPage}
                    onOpenDynamicSchema={handleOpenDynamicSchema}
                  />
                ) : currentTab === 'edit' ? (
                  /* Standalone Page: Edit Artis */
                  <ArtistFormPage
                    onCancel={handleCancelForm}
                    onSave={handleSaveArtist}
                    artistToEdit={artistToEdit || selectedArtist}
                    schema={localizedSchema}
                    onAddNewCountry={handleAddNewCountry}
                    customPages={customPages}
                    onUpdateSchema={handleSaveSchema}
                    onSaveCustomPageDirect={handleDirectSaveCustomPage}
                    onOpenDynamicSchema={handleOpenDynamicSchema}
                  />
                ) : currentTab === 'compare' ? (
                  /* Mode Tampilan: Full Page Compare Artis */
                  <ComparePage
                    primaryArtistId={selectedArtistId}
                    allArtists={artists}
                    schema={localizedSchema}
                    onBackToHome={() => navigateToTab('home')}
                    onSelectArtist={handleSelectArtist}
                  />
                ) : currentTab === 'export_studio' && selectedArtist ? (
                  /* Standalone Mode: Export Studio Artis (Bebas Lag, Kustomisasi Penuh PNG & PDF) */
                  <ExportStudioPage
                    artist={selectedArtist}
                    allArtists={artists}
                    schema={localizedSchema}
                    onBack={() => navigateToTab('detail')}
                  />
                ) : currentTab === 'detail' && selectedArtist ? (
                  /* Mode Tampilan: Detail Artis */
                  <ArtistDetail
                    artist={selectedArtist}
                    allArtists={artists}
                    schema={localizedSchema}
                    layoutScoreConfig={settings.layoutScoreConfig}
                    onBackToHome={() => {
                      setSelectedArtistId(null);
                      navigateToTab('home');
                    }}
                    onEdit={handleEditArtist}
                    onDelete={handleDeleteArtist}
                    onNavigateToRanking={handleNavigateToRanking}
                    onFilterByAttribute={handleFilterByAttribute}
                    onSelectArtist={handleSelectArtist}
                    onOpenCompare={handleOpenCompare}
                    customPages={customPages}
                    onOpenCustomPageView={handleViewCustomPage}
                    onOpenExportStudio={handleOpenExportStudio}
                    searchHighlightField={searchHighlightField}
                    searchQuery={activeSearchQueryForDetail}
                  />
                ) : currentTab === 'rank' ? (
                  /* Mode Tampilan: Halaman Ranking */
                  <RankingPage
                    artists={artists}
                    onSelectArtist={handleSelectArtist}
                    defaultSortCategory={rankingParams.tab}
                    defaultDimension={rankingParams.dimension}
                    defaultSubFilter={rankingParams.subFilter}
                    highlightArtistId={rankingParams.highlightArtistId}
                    onClearHighlight={() => setRankingParams(prev => ({ ...prev, highlightArtistId: undefined }))}
                    theme={settings.theme}
                    t={t}
                    schema={localizedSchema}
                  />
                ) : (
                  /* Mode Tampilan: Daftar Katalog Artis (Home) */
                  <ArtistList
                    artists={artists}
                    schema={localizedSchema}
                    onSelectArtist={handleSelectArtist}
                    onAddNew={handleAddNew}
                    onEdit={handleEditArtist}
                    onDelete={handleDeleteArtist}
                    onBatchDelete={handleBatchDeleteArtists}
                    onOpenDatabaseEditor={() => navigateToTab('settings')}
                    activeFilter={activeFilter}
                    onClearActiveFilter={() => setActiveFilter(null)}
                    externalSearchQuery={searchQuery}
                    theme={settings.theme}
                    t={t}
                    onOpenCompare={handleOpenCompare}
                  />
                )}
              </main>

              {/* Bottom Floating Navigation Bar (Only displayed on primary tabs) */}
              {showBottomNav && (
                <BottomNav
                  currentTab={currentTab}
                  onTabChange={tab => {
                    if (tab === 'home') {
                      setSelectedArtistId(null);
                      setActiveFilter(null);
                    }
                    navigateToTab(tab);
                  }}
                  onAddNew={handleAddNew}
                  theme={settings.theme}
                  t={t}
                />
              )}

              {/* Floating Action Button (FAB) Hub - Hidden on DB Editor, Custom, Create/Edit, Card Theme Studio, Compare, Ranking */}
              {(() => {
                const isFABExcludedPage =
                  currentTab === 'dynamic_schema' ||
                  currentTab === 'db_editor' ||
                  currentTab === 'custom_pages' ||
                  currentTab === 'custom_page_create' ||
                  currentTab === 'custom_page_edit' ||
                  currentTab === 'custom_page_view' ||
                  currentTab === 'create' ||
                  currentTab === 'edit' ||
                  currentTab === 'card_theme_studio' ||
                  currentTab === 'compare' ||
                  currentTab === 'rank';

                if (isFABExcludedPage) return null;

                return (
                  <FloatingActionHub
                    currentTab={currentTab}
                    onTabChange={tab => {
                      if (tab === 'home') {
                        setSelectedArtistId(null);
                        setActiveFilter(null);
                      }
                      navigateToTab(tab);
                    }}
                    onOpenGuidelines={() => setIsGuidelinesOpen(true)}
                    onAddNew={handleAddNew}
                    onOpenSettings={() => navigateToTab('settings')}
                    onResetSettings={() => setSettings(DEFAULT_APP_SETTINGS)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    totalArtists={artists.length}
                    selectedArtist={selectedArtist}
                    onEditArtist={selectedArtist ? () => handleEditArtist(selectedArtist) : undefined}
                    onDeleteArtist={selectedArtist ? () => setShowNavbarDeleteModal(true) : undefined}
                    onSelectSearchResult={handleSelectSearchResult}
                    schema={localizedSchema}
                    theme={settings.theme}
                    t={t}
                    artists={artists}
                    hasBottomNav={showBottomNav}
                  />
                );
              })()}
            </>
          );
        })()}

        {/* Scoring Guidelines & Appeal Rubrics Modal */}
        <ScoreInfoModal
          isOpen={isGuidelinesOpen}
          onClose={() => setIsGuidelinesOpen(false)}
        />

        {/* Navbar Delete Confirmation Modal */}
        {showNavbarDeleteModal && selectedArtist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div
              style={{
                backgroundColor: activeColorPreset?.card || 'var(--color-surface, #16131c)',
                borderColor: activeColorPreset?.border || 'var(--color-border, #2e273b)',
              }}
              className="border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <h3
                style={{ color: activeColorPreset?.text || 'var(--color-text-main, #f5f3f8)' }}
                className="text-lg font-bold flex items-center gap-2"
              >
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                {t.deleteConfirmTitle}
              </h3>
              <p
                style={{ color: activeColorPreset?.text || 'var(--color-text-main, #f5f3f8)' }}
                className="text-sm opacity-90"
              >
                {t.deleteConfirmDesc}{' '}
                <strong>
                  {selectedArtist.firstName} {selectedArtist.lastName}
                </strong>
                ?
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNavbarDeleteModal(false)}
                  style={{
                    backgroundColor: activeColorPreset?.secondary || 'var(--color-surface-sub, #201b29)',
                    borderColor: activeColorPreset?.border || 'var(--color-border, #2e273b)',
                    color: activeColorPreset?.text || 'var(--color-text-main, #f5f3f8)',
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors hover:opacity-80"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteArtist(selectedArtist.id);
                    setShowNavbarDeleteModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-950"
                >
                  {t.deleteButton}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
          </FavoritesProvider>
        </LocalizationProvider>
      </UIThemeProvider>
    </CardThemeProvider>
  );
}
