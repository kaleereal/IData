import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import {
  AppSettings,
  AppTheme,
  AppFontFamily,
  AppFontSize,
  AppLanguage,
  Artist,
  DatabaseSchema,
  CardTheme,
  CardThemeDefinition,
  CARD_THEMES,
  UIThemeDefinition,
} from '../types';
import { getTranslation } from '../utils/i18n';
import {
  exportDatabaseAsJSON,
  exportDatabaseAsHTML,
  exportDatabaseAsMarkdown,
  parseJSONBackup,
  parseHTMLBackup,
  parseMarkdownBackup,
  ParseResult,
} from '../utils/backupRestore';
import {
  exportCardThemeAsJSON,
  exportCardThemeAsZIP,
  importCardThemeFromFile,
  parseCardThemeJSON,
} from '../utils/cardThemeExport';
import { exportUIThemeAsJSON, parseUIThemeJSON } from '../utils/uiThemeExport';
import { downloadCardThemeGuide, downloadUIThemeGuide } from '../utils/themeGuides';
import { applyAppColorThemePreset } from '../utils/uiThemeEngine';
import { useCardThemeContext } from '../context/CardThemeContext';
import { useUIThemeContext } from '../context/UIThemeContext';
import { ArtistCard } from './ArtistCard';
import { LayoutScoreSettingsSection } from './LayoutScoreSettingsSection';
import { StickyHeaderWrapper } from './StickyHeaderWrapper';
import {
  BUILTIN_UI_THEMES,
  BUILTIN_COLOR_THEMES,
  AppUIThemePreset,
  AppColorThemePreset,
} from '../data/themePresets';
import { ColorSliderPicker } from './theme/ColorSliderPicker';
import { ThemeMiniPreviewStack } from './theme/ThemeMiniPreviewStack';
import { CardThemeStudio } from './theme/CardThemeStudio';
import {
  Moon,
  Sun,
  Type,
  Languages,
  Database,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertCircle,
  FileJson,
  FileCode,
  FileText,
  Sparkles,
  ArrowRight,
  HardDrive,
  Eye,
  Sliders,
  Layers,
  FileCheck,
  Crown,
  LayoutGrid,
  CheckCircle2,
  Palette,
  Trash2,
  X,
  Terminal,
  Feather,
  Cpu,
  Monitor,
  Layout,
  Columns,
  Plus,
  Compass,
  BookOpen,
  Trees,
  BarChart3,
  Camera,
  Zap,
  Shield,
  MoreVertical,
} from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetSettings: () => void;
  onOpenDbEditor: () => void;
  onOpenDynamicSchema?: () => void;
  onOpenCustomPages?: () => void;
  onOpenLayoutScoreSettings?: () => void;
  onOpenCardThemeStudio?: (themeDef?: CardThemeDefinition | null) => void;
  customPagesCount?: number;
  artists: Artist[];
  schema: DatabaseSchema;
  onRestoreData: (newArtists: Artist[], newSchema?: DatabaseSchema, mode?: 'overwrite' | 'merge') => void;
  onBackToHome: () => void;
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onResetSettings,
  onOpenDbEditor,
  onOpenDynamicSchema,
  onOpenCustomPages,
  onOpenLayoutScoreSettings,
  onOpenCardThemeStudio,
  customPagesCount = 0,
  artists,
  schema,
  onRestoreData,
}) => {
  const t = getTranslation(settings.language);
  const isDark = settings.theme !== 'light' && settings.theme !== 'sepia';

  const { allThemes, getThemeDefinition, customCardThemes } = useCardThemeContext();
  const {
    allThemes: allUIThemes,
    getUIThemeDefinition: getUIDefinition,
    customUIThemes,
    activeTheme: activeUITheme,
  } = useUIThemeContext();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importModal, setImportModal] = useState<ParseResult | null>(null);
  const [importMode, setImportMode] = useState<'overwrite' | 'merge'>('overwrite');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardThemeFileInputRef = useRef<HTMLInputElement>(null);
  const uiThemeFileInputRef = useRef<HTMLInputElement>(null);
  const [importedThemePreview, setImportedThemePreview] = useState<CardThemeDefinition | null>(null);
  const [importedUIThemePreview, setImportedUIThemePreview] = useState<UIThemeDefinition | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'home' | 'artist' | 'ranking' | 'compare' | 'tokens'>('home');
  
  const [cardThemeCatalogTab, setCardThemeCatalogTab] = useState<'builtin' | 'custom' | 'all'>('builtin');
  const [uiThemeCatalogTab, setUiThemeCatalogTab] = useState<'builtin' | 'custom' | 'all'>('builtin');
  const [uiThemeSubCategory, setUiThemeSubCategory] = useState<'all' | 'Paket Bawaan' | 'Paket UI'>('all');
  const [openCardThemeMenuId, setOpenCardThemeMenuId] = useState<string | null>(null);
  const [openUIThemeMenuId, setOpenUIThemeMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenCardThemeMenuId(null);
      setOpenUIThemeMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  
  const SETTINGS_ACTIVE_CATEGORY_KEY = 'talent_rating_settings_active_category';
  const [activeCategory, setActiveCategory] = useState<
    'app_theme' | 'card_theme' | 'typography' | 'language' | 'database' | 'backup' | 'restore'
  >(() => {
    const saved = localStorage.getItem('talent_rating_settings_active_category');
    const valid = ['app_theme', 'card_theme', 'typography', 'language', 'database', 'backup', 'restore'];
    if (saved && valid.includes(saved)) {
      return saved as any;
    }
    return 'app_theme';
  });

  const [appThemeSubTab, setAppThemeSubTab] = useState<'color'>('color');
  const [colorFilterTab, setColorFilterTab] = useState<'all' | 'dark' | 'light' | 'custom'>('all');

  // Custom 5-Element Color Customizer & Preset Creator State
  const [isCustomColorEditorOpen, setIsCustomColorEditorOpen] = useState(false);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorDesc, setCustomColorDesc] = useState('');
  const [customColors, setCustomColors] = useState({
    background: '#0b0f19',
    secondary: '#151c2c',
    primary: '#d97706',
    text: '#f8fafc',
    accent: '#fbbf24',
    buttonText: '#ffffff',
    isDark: true,
  });

  // Card Theme Studio State
  const [isCardStudioOpen, setIsCardStudioOpen] = useState<boolean>(false);
  const [editingCardStudioTheme, setEditingCardStudioTheme] = useState<CardThemeDefinition | null>(null);

  const handleApplyLiveCustomColors = () => {
    const customPreset: AppColorThemePreset = {
      id: `custom_live_${Date.now()}`,
      name: customColorName.trim() || 'Warna Kustom',
      description: customColorDesc.trim() || 'Skema 6-elemen warna kustom',
      background: customColors.background,
      secondary: customColors.secondary,
      primary: customColors.primary,
      text: customColors.text,
      accent: customColors.accent,
      buttonText: customColors.buttonText || '#ffffff',
      card: customColors.secondary,
      surface: customColors.secondary,
      border: `${customColors.primary}40`,
      isDark: true,
    };
    applyAppColorThemePreset(customPreset);
    onUpdateSettings({
      ...settings,
      selectedColorTheme: customPreset.id,
      primaryColor: customPreset.primary,
      theme: 'dark',
    });
    showToast('Warna kustom berhasil diterapkan!');
  };

  const handleSaveNewCustomColorPreset = () => {
    const name = customColorName.trim() || `Preset Kustom #${(settings.customColorPresets || []).length + 1}`;
    const newPreset: AppColorThemePreset = {
      id: `custom_color_${Date.now()}`,
      name,
      description: customColorDesc.trim() || `Preset warna kustom (${name})`,
      background: customColors.background,
      secondary: customColors.secondary,
      primary: customColors.primary,
      text: customColors.text,
      accent: customColors.accent,
      buttonText: customColors.buttonText || '#ffffff',
      card: customColors.secondary,
      surface: customColors.secondary,
      border: `${customColors.primary}40`,
      isDark: true,
    };
    const updated = [...(settings.customColorPresets || []), newPreset];
    applyAppColorThemePreset(newPreset);
    onUpdateSettings({
      ...settings,
      customColorPresets: updated,
      selectedColorTheme: newPreset.id,
      primaryColor: newPreset.primary,
      theme: 'dark',
    });
    setCustomColorName('');
    setCustomColorDesc('');
    setIsCustomColorEditorOpen(false);
    showToast(`Preset warna "${name}" berhasil disimpan dan diterapkan!`);
  };

  const handleDeleteCustomColorPreset = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = (settings.customColorPresets || []).filter(p => p.id !== presetId);
    onUpdateSettings({
      ...settings,
      customColorPresets: updated,
      selectedColorTheme: settings.selectedColorTheme === presetId ? 'midnight_gold' : settings.selectedColorTheme,
    });
    showToast('Preset warna kustom dihapus');
  };

  const handleLoadPresetIntoCustomizer = (preset: AppColorThemePreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomColors({
      background: preset.background,
      secondary: preset.secondary,
      primary: preset.primary,
      text: preset.text,
      accent: preset.accent,
      buttonText: preset.buttonText || '#ffffff',
      isDark: true,
    });
    setCustomColorName(`${preset.name} (Salinan)`);
    setCustomColorDesc(preset.description);
    setIsCustomColorEditorOpen(true);
    showToast(`Nilai warna "${preset.name}" dimuat ke panel kustomisasi`);
  };

  const allColorPresets = useMemo(() => {
    return [...BUILTIN_COLOR_THEMES, ...(settings.customColorPresets || [])];
  }, [settings.customColorPresets]);

  const activeColorPreset = useMemo(() => {
    return allColorPresets.find(p => p.id === (settings.selectedColorTheme || 'midnight_gold')) || allColorPresets[0];
  }, [allColorPresets, settings.selectedColorTheme]);

  const livePreviewColors = useMemo(() => {
    if (isCustomColorEditorOpen) {
      return {
        background: customColors.background,
        secondary: customColors.secondary,
        primary: customColors.primary,
        text: customColors.text,
        accent: customColors.accent,
        buttonText: customColors.buttonText || '#ffffff',
        isDark: true,
      };
    }
    return activeColorPreset;
  }, [isCustomColorEditorOpen, customColors, activeColorPreset]);

  const filteredColorPresets = useMemo(() => {
    if (colorFilterTab === 'dark') return allColorPresets.filter(p => p.isDark);
    if (colorFilterTab === 'light') return allColorPresets.filter(p => !p.isDark);
    if (colorFilterTab === 'custom') return (settings.customColorPresets || []);
    return allColorPresets;
  }, [allColorPresets, colorFilterTab, settings.customColorPresets]);

  const handleCategoryChange = (
    cat: 'app_theme' | 'card_theme' | 'typography' | 'language' | 'database' | 'backup' | 'restore'
  ) => {
    setActiveCategory(cat);
    localStorage.setItem(SETTINGS_ACTIVE_CATEGORY_KEY, cat);
  };

  // Category Tabs Swipe Navigation
  const categoryOrder: (
    | 'app_theme'
    | 'card_theme'
    | 'typography'
    | 'language'
    | 'database'
    | 'backup'
    | 'restore'
  )[] = useMemo(
    () => [
      'app_theme',
      'card_theme',
      'typography',
      'language',
      'database',
      'backup',
      'restore',
    ],
    []
  );

  const handleApplyUIThemePreset = (preset: AppUIThemePreset) => {
    onUpdateSettings({
      ...settings,
      selectedUITheme: preset.id,
      uiTheme: preset.id,
    });
    showToast(`Tema UI "${preset.name}" diterapkan`);
  };

  const handleApplyColorThemePreset = (preset: AppColorThemePreset) => {
    applyAppColorThemePreset(preset);

    onUpdateSettings({
      ...settings,
      selectedColorTheme: preset.id,
      primaryColor: preset.primary,
      theme: preset.isDark ? 'dark' : 'light',
    });
    showToast(`Skema 5-Warna "${preset.name}" diterapkan`);
  };

  const handleSwipeLeft = useCallback(() => {
    if (importModal || openCardThemeMenuId || openUIThemeMenuId) return;
    const currentIndex = categoryOrder.indexOf(activeCategory);
    if (currentIndex < categoryOrder.length - 1) {
      handleCategoryChange(categoryOrder[currentIndex + 1]);
    }
  }, [activeCategory, importModal, openCardThemeMenuId, openUIThemeMenuId, categoryOrder]);

  const handleSwipeRight = useCallback(() => {
    if (importModal || openCardThemeMenuId || openUIThemeMenuId) return;
    const currentIndex = categoryOrder.indexOf(activeCategory);
    if (currentIndex > 0) {
      handleCategoryChange(categoryOrder[currentIndex - 1]);
    }
  }, [activeCategory, importModal, openCardThemeMenuId, openUIThemeMenuId, categoryOrder]);

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 55,
  });

  // Color Slider and Hex Input State
  const currentPrimaryColor = (settings.primaryColor || '#FE9900').toUpperCase();
  const [hexInput, setHexInput] = useState<string>(currentPrimaryColor);
  const [sliderHue, setSliderHue] = useState<number>(36); // Approx hue for #FE9900

  useEffect(() => {
    setHexInput(currentPrimaryColor);
  }, [currentPrimaryColor]);

  // Color presets
  const presets =
    settings.colorPresets && settings.colorPresets.length > 0
      ? settings.colorPresets
      : ['#FE9900', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#3B82F6', '#00BCD5', '#10B981', '#EAB308', '#F97316'];

  // Preview Artist selection state (defaults to first special artist or first artist)
  const [previewArtistIndex, setPreviewArtistIndex] = useState<number>(0);
  const sampleArtist: Artist = artists[previewArtistIndex] || {
    id: 'sample-yua',
    firstName: 'Yua',
    lastName: 'Mikami',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    country: 'Japan',
    countryCode: 'JP',
    bornDate: '1993-08-16',
    debutDate: '2015-06-01',
    heightCm: 159,
    bodyType: 'Slim',
    typeCode: 'SL',
    measurements: {
      bustCm: 86,
      cupSize: 'F',
      waistCm: 58,
      hipCm: 86,
    },
    appeal: {
      maturity: 'Teen/Young',
      vibe: 'Girlfriend Experience',
      style: 'Elegant',
      bodyShape: 'Slim / Jam Pasir',
    },
    appearanceScores: {
      faceBeauty: 96,
      bodyProportions: 94,
      skinTone: 95,
      eyesSmile: 98,
      hairGrooming: 92,
    },
    impressionScores: {
      sexAppeal: 96,
      authenticity: 92,
      chemistry: 94,
      aura: 98,
    },
    attributes: ['Idol', 'Exclusive', 'Top Ranker'],
    specialty: ['Acting', 'Dancing', 'Fashion Modeling'],
    notes: 'Sample preview artist',
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCardThemeChange = (cardTheme: CardTheme) => {
    onUpdateSettings({ ...settings, cardTheme });
    const themeName = getThemeDefinition(cardTheme)?.name || cardTheme;
    showToast(`Tema Card diubah ke: ${themeName}`);
  };

  const handleExportCardTheme = (themeId: CardTheme, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const def = getThemeDefinition(themeId);
    if (!def) {
      showToast('Definisi tema tidak ditemukan.');
      return;
    }
    exportCardThemeAsJSON(def);
    showToast(`Tema "${def.name}" diekspor sebagai file JSON (.json).`);
  };

  const handleExportCardThemeZIP = async (themeId: CardTheme, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const def = getThemeDefinition(themeId);
    if (!def) {
      showToast('Definisi tema tidak ditemukan.');
      return;
    }
    try {
      await exportCardThemeAsZIP(def);
      showToast(`Tema "${def.name}" berhasil diekspor sebagai paket ZIP (.zip)!`);
    } catch (err: any) {
      showToast(`Gagal mengekspor ZIP: ${err.message || 'Error'}`);
    }
  };

  const handleCardThemeFileSelected = async (file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.json') && !name.endsWith('.zip')) {
      showToast('Harap pilih file dengan format .json atau paket .zip');
      return;
    }

    try {
      const res = await importCardThemeFromFile(file);
      if (res.success && res.theme) {
        setImportedThemePreview(res.theme);
        showToast(`Tema "${res.theme.name}" berhasil dibaca! Silakan pratinjau dan konfirmasi impor.`);
      } else {
        showToast(res.error || 'Format file tema tidak valid.');
      }
    } catch (err: any) {
      showToast(`Gagal mengimpor file: ${err.message || 'Error'}`);
    }
  };

  const handleConfirmImportTheme = () => {
    if (!importedThemePreview) return;

    const existingCustom = settings.customCardThemes || [];
    // Replace if same ID exists, otherwise append
    const filtered = existingCustom.filter(t => t.id !== importedThemePreview.id);
    const updatedCustom = [...filtered, importedThemePreview];

    onUpdateSettings({
      ...settings,
      customCardThemes: updatedCustom,
      cardTheme: importedThemePreview.id,
    });

    const themeName = importedThemePreview.name;
    setImportedThemePreview(null);
    showToast(`Tema "${themeName}" berhasil diimpor dan diaktifkan!`);
  };

  const handleDeleteCustomTheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingCustom = settings.customCardThemes || [];
    const updatedCustom = existingCustom.filter(t => t.id !== themeId);
    const isCurrentlyActive = settings.cardTheme === themeId;

    onUpdateSettings({
      ...settings,
      customCardThemes: updatedCustom,
      cardTheme: isCurrentlyActive ? 'default' : settings.cardTheme,
    });

    showToast('Tema kustom berhasil dihapus.');
  };

  const handleSaveStudioCardTheme = (newTheme: CardThemeDefinition) => {
    const existingCustom = settings.customCardThemes || [];
    const filtered = existingCustom.filter(t => t.id !== newTheme.id);
    const updatedCustom = [...filtered, newTheme];

    onUpdateSettings({
      ...settings,
      customCardThemes: updatedCustom,
      cardTheme: newTheme.id,
    });
    showToast(`Tema "${newTheme.name}" berhasil disimpan dan diaktifkan!`);
  };

  const handleApplyStudioCardTheme = (themeDef: CardThemeDefinition) => {
    const existingCustom = settings.customCardThemes || [];
    const filtered = existingCustom.filter(t => t.id !== themeDef.id);
    const updatedCustom = [...filtered, themeDef];

    onUpdateSettings({
      ...settings,
      customCardThemes: updatedCustom,
      cardTheme: themeDef.id,
    });
    showToast(`Tema "${themeDef.name}" berhasil diterapkan langsung!`);
  };

  const handleUIThemeChange = (themeId: string) => {
    const themeDef = getUIDefinition(themeId);
    const updatedSettings: AppSettings = {
      ...settings,
      uiTheme: themeId,
      ...(themeDef?.tokens?.typography?.fontFamily ? { fontFamily: themeDef.tokens.typography.fontFamily as any } : {}),
      ...(themeDef?.tokens?.colors?.primary ? { primaryColor: themeDef.tokens.colors.primary } : {}),
    };
    onUpdateSettings(updatedSettings);
    showToast(`Tema UI Aplikasi diubah ke: ${themeDef?.name || themeId}`);
  };

  const handleExportUITheme = (themeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const def = getUIDefinition(themeId);
    if (!def) {
      showToast('Definisi tema UI tidak ditemukan.');
      return;
    }
    exportUIThemeAsJSON(def);
    showToast(`Tema UI "${def.name}" diekspor sebagai JSON.`);
  };

  const handleUIThemeFileSelected = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('Harap pilih file dengan format .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const res = parseUIThemeJSON(content);
      if (res.success && res.theme) {
        setImportedUIThemePreview(res.theme);
      } else {
        showToast(res.error || 'Format file Tema UI JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImportUITheme = (activateNow: boolean = false) => {
    if (!importedUIThemePreview) return;

    const existingCustom = settings.customUIThemes || [];
    // Replace if same ID exists, otherwise append
    const filtered = existingCustom.filter(t => t.id !== importedUIThemePreview.id);
    const updatedCustom = [...filtered, importedUIThemePreview];

    const newSettings: AppSettings = {
      ...settings,
      customUIThemes: updatedCustom,
      ...(activateNow ? { uiTheme: importedUIThemePreview.id } : {}),
    };

    onUpdateSettings(newSettings);

    const themeName = importedUIThemePreview.name;
    setImportedUIThemePreview(null);
    showToast(
      activateNow
        ? `Tema UI "${themeName}" berhasil diimpor dan diaktifkan!`
        : `Tema UI "${themeName}" berhasil ditambahkan ke daftar tema.`
    );
  };

  const handleDeleteCustomUITheme = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existingCustom = settings.customUIThemes || [];
    const updatedCustom = existingCustom.filter(t => t.id !== themeId);
    const isCurrentlyActive = (settings.uiTheme || 'modern_amber') === themeId;

    onUpdateSettings({
      ...settings,
      customUIThemes: updatedCustom,
      uiTheme: isCurrentlyActive ? 'modern_amber' : settings.uiTheme,
    });

    showToast('Tema UI kustom berhasil dihapus.');
  };

  const getUIIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Feather':
        return <Feather className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Crown':
        return <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Layers':
        return <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Cpu':
        return <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
      default:
        return <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />;
    }
  };

  const renderUIMiniPreview = (theme: UIThemeDefinition) => {
    const accent = theme.accentColor || theme.global?.primaryColor || '#FE9900';
    const radius =
      theme.global?.borderRadius === 'none'
        ? 'rounded-none'
        : theme.global?.borderRadius === '3xl'
        ? 'rounded-md'
        : 'rounded-sm';
    const isChamfer = theme.global?.buttonStyle === 'chamfer' || theme.global?.tabStyle === 'chamfer';

    return (
      <div
        className={`w-full p-2 my-1.5 rounded-xl border flex flex-col gap-1 transition-all select-none overflow-hidden ${
          isDark ? 'bg-stone-950/90 border-stone-800/80' : 'bg-stone-100/90 border-stone-300/80'
        }`}
        style={{
          boxShadow: theme.global?.elevation === 'glowing' ? `0 0 8px ${accent}25` : undefined,
        }}
      >
        {/* Mini Topbar */}
        <div className="flex items-center justify-between pb-1 border-b border-stone-800/40">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
            <div className="w-6 sm:w-8 h-1 rounded bg-stone-700/60" />
          </div>
          <div className="flex gap-0.5">
            <div className="w-1.5 h-1 rounded bg-stone-700/40" />
            <div className="w-1.5 h-1 rounded bg-stone-700/40" />
          </div>
        </div>

        {/* Mini Tabs / Segmented bar */}
        <div className="flex gap-1 items-center">
          <div
            className={`h-1.5 sm:h-2 flex-1 ${radius} flex items-center justify-center`}
            style={{
              backgroundColor: isChamfer ? accent : `${accent}30`,
              borderBottom: theme.global?.tabStyle === 'underline' ? `1.5px solid ${accent}` : undefined,
            }}
          >
            <div className="w-2.5 h-0.5 rounded-full" style={{ backgroundColor: accent }} />
          </div>
          <div className={`h-1.5 sm:h-2 flex-1 ${radius} bg-stone-800/40`} />
          <div className={`h-1.5 sm:h-2 flex-1 ${radius} bg-stone-800/40`} />
        </div>

        {/* Mini Layout Items */}
        <div className="grid grid-cols-2 gap-1 pt-0.5">
          <div
            className={`p-1 ${radius} border flex flex-col gap-0.5`}
            style={{
              borderColor: `${accent}35`,
              backgroundColor: `${accent}08`,
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: `${accent}80` }} />
              <div className="w-4 h-0.5 rounded bg-stone-700/60" />
            </div>
            <div className="w-full h-0.5 rounded" style={{ backgroundColor: `${accent}50` }} />
          </div>
          <div className={`p-1 ${radius} border border-stone-800/60 bg-stone-900/40 flex flex-col gap-0.5`}>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-700/40 shrink-0" />
              <div className="w-4 h-0.5 rounded bg-stone-700/40" />
            </div>
            <div className="w-full h-0.5 rounded bg-stone-700/30" />
          </div>
        </div>
      </div>
    );
  };

  const handleThemeChange = (theme: AppTheme) => {
    onUpdateSettings({ ...settings, theme });
    const names: Record<AppTheme, string> = {
      dark: 'Tema Gelap (Hitam)',
      light: 'Tema Terang (Putih)',
      midnight: 'Tema Midnight (Biru)',
      slate: 'Tema Slate (Abu-Abu)',
      sepia: 'Tema Krem (Sepia)',
      forest: 'Tema Forest (Hijau)',
    };
    showToast(`${names[theme] || 'Tema'} diaktifkan`);
  };

  const handleFontFamilyChange = (fontFamily: AppFontFamily) => {
    onUpdateSettings({ ...settings, fontFamily });
    showToast(`Font diubah ke ${fontFamily}`);
  };

  const handleFontSizeChange = (fontSize: AppFontSize) => {
    onUpdateSettings({ ...settings, fontSize });
    showToast(`Ukuran teks diubah`);
  };

  const handleLanguageChange = (language: AppLanguage) => {
    onUpdateSettings({ ...settings, language });
    showToast('Bahasa aplikasi diperbarui');
  };

  // Color Slider Handlers
  const handleApplyColor = (colorHex: string) => {
    let formatted = colorHex.trim();
    if (!formatted.startsWith('#')) formatted = '#' + formatted;
    if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
      const uppercaseHex = formatted.toUpperCase();
      onUpdateSettings({ ...settings, primaryColor: uppercaseHex });
      setHexInput(uppercaseHex);
      showToast(`Warna utama diubah ke ${uppercaseHex}`);
    }
  };

  const handleSavePreset = () => {
    const colorToSave = (settings.primaryColor || '#FE9900').toUpperCase();
    if (!presets.map(p => p.toUpperCase()).includes(colorToSave)) {
      const updatedPresets = [...presets, colorToSave];
      onUpdateSettings({ ...settings, colorPresets: updatedPresets });
      showToast(`Warna ${colorToSave} disimpan ke preset`);
    } else {
      showToast(`Warna ${colorToSave} sudah ada dalam preset`);
    }
  };

  const handleDeletePreset = () => {
    const colorToDelete = (settings.primaryColor || '#FE9900').toUpperCase();
    if (presets.map(p => p.toUpperCase()).includes(colorToDelete)) {
      if (presets.length <= 1) {
        showToast('Minimal harus ada 1 preset tersisa');
        return;
      }
      const updatedPresets = presets.filter(c => c.toUpperCase() !== colorToDelete);
      onUpdateSettings({
        ...settings,
        colorPresets: updatedPresets,
        primaryColor: updatedPresets[0],
      });
      showToast(`Warna ${colorToDelete} dihapus dari preset`);
    } else {
      showToast(`Warna ${colorToDelete} tidak ditemukan di preset`);
    }
  };

  // File Upload Handlers
  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;

      let result: ParseResult = { success: false, error: 'File tidak terbaca.' };
      if (fileName.endsWith('.json')) {
        result = parseJSONBackup(content);
      } else if (fileName.endsWith('.html') || fileName.endsWith('.htm')) {
        result = parseHTMLBackup(content);
      } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
        result = parseMarkdownBackup(content);
      } else {
        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
          result = parseJSONBackup(content);
        } else if (content.includes('<!DOCTYPE') || content.includes('<html')) {
          result = parseHTMLBackup(content);
        } else {
          result = parseMarkdownBackup(content);
        }
      }

      if (result.success && result.artists && result.artists.length > 0) {
        setImportModal(result);
      } else {
        showToast(result.error || t.importInvalid);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const confirmImport = () => {
    if (!importModal || !importModal.artists) return;
    onRestoreData(importModal.artists, importModal.schema, importMode);
    setImportModal(null);
    showToast(t.importSuccess);
  };

  const getThemeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera':
        return <Camera className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Shield':
        return <Shield className="w-5 h-5" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5" />;
      case 'Feather':
        return <Feather className="w-5 h-5" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5" />;
      case 'Layers':
        return <Layers className="w-5 h-5" />;
      case 'Sliders':
        return <Sliders className="w-5 h-5" />;
      case 'Crown':
        return <Crown className="w-5 h-5" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'LayoutGrid':
      default:
        return <LayoutGrid className="w-5 h-5" />;
    }
  };

  const fontOptions: { id: AppFontFamily; label: string; sample: string }[] = [
    { id: 'Plus Jakarta Sans', label: 'Plus Jakarta', sample: 'Modern & Clean' },
    { id: 'Roboto', label: 'Roboto', sample: 'Structured' },
    { id: 'Open Sans', label: 'Open Sans', sample: 'Readability' },
    { id: 'Helvetica', label: 'Helvetica', sample: 'Classic Swiss' },
    { id: 'Inter', label: 'Inter', sample: 'High-Density' },
    { id: 'Lato', label: 'Lato', sample: 'Warm Neutral' },
  ];

  const fontSizeOptions: { id: AppFontSize; label: string; percent: string }[] = [
    { id: 'xsmall', label: '80%', percent: '80%' },
    { id: 'small', label: '90%', percent: '90%' },
    { id: 'normal', label: '100%', percent: '100%' },
    { id: 'medium', label: '110%', percent: '110%' },
    { id: 'large', label: '125%', percent: '125%' },
    { id: 'xlarge', label: '140%', percent: '140%' },
  ];

  const languageOptions: { id: AppLanguage; label: string; flag: string; short: string }[] = [
    { id: 'default', label: t.langDefault, flag: '🌐', short: 'Bawaan' },
    { id: 'id', label: t.langId, flag: '🇮🇩', short: 'Indonesia' },
    { id: 'en', label: t.langEn, flag: '🇬🇧', short: 'English' },
  ];

  const currentThemeMeta = getThemeDefinition(settings.cardTheme);

  return (
    <div className={`pb-32 max-w-full transition-colors duration-200 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sticky Icon-Only Tab Bar (Kategori Pengaturan) */}
      <StickyHeaderWrapper className="mb-6">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'app_theme' as const, icon: Palette, title: 'Tema Aplikasi (UI & Warna)' },
            { id: 'card_theme' as const, icon: Crown, title: t.cardThemeSection || 'Tema Card Artis' },
            { id: 'typography' as const, icon: Type, title: t.fontSection || 'Font & Ukuran Teks' },
            { id: 'language' as const, icon: Languages, title: t.languageSection || 'Bahasa Antarmuka' },
            { id: 'database' as const, icon: Database, title: t.dbEditorSection || 'Database Editor' },
            { id: 'backup' as const, icon: Download, title: 'Ekspor Cadangan Data' },
            { id: 'restore' as const, icon: Upload, title: t.importTitle || 'Pulihkan & Impor Data' },
          ].map((cat) => {
            const active = activeCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                id={`tab-btn-${cat.id}`}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all relative flex items-center justify-center shrink-0 cursor-pointer ${
                  active
                    ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/25 scale-105 ring-2 ring-primary/40'
                    : isDark
                    ? 'bg-stone-900/90 text-stone-400 border-stone-800 hover:text-stone-100 hover:border-stone-700 hover:bg-stone-800'
                    : 'bg-white text-stone-600 border-stone-200 hover:text-stone-950 hover:border-stone-300'
                }`}
                style={active ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)', borderColor: 'var(--color-primary)' } : undefined}
                title={cat.title}
                aria-label={cat.title}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </button>
            );
          })}
        </div>
      </StickyHeaderWrapper>

      {/* Main Settings Sections Stack */}
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 0: HALAMAN TEMA APLIKASI (UI & WARNA)                             */}
        {/* ========================================================================= */}
        {activeCategory === 'app_theme' && (
        <section
          id="app-theme-section"
          className={`p-4 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          {/* Section Header */}
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-stone-800/60 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">Tema Tampilan Aplikasi</h2>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Pilih konfigurasi skema palet 5-elemen warna sistem dan preset kustom Anda.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5" id="color-presets-list">
            {/* Sticky Mini Preview Stack */}
            <ThemeMiniPreviewStack
              colors={livePreviewColors}
              themeName={isCustomColorEditorOpen ? (customColorName || 'Kustom') : activeColorPreset?.name}
              isDark={isDark}
            />

              {/* Header Info & Tombol Buka Panel Kustomisasi */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-800/60">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-stone-200 flex items-center gap-2">
                    <Palette className="w-3.5 h-3.5 text-primary" style={{ color: 'var(--color-primary)' }} />
                    <span>Daftar Preset Warna ({allColorPresets.length})</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Pilih preset 5-warna cepat atau sesuaikan palet warna Anda sendiri di bawah.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustomColorEditorOpen(!isCustomColorEditorOpen)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCustomColorEditorOpen
                        ? 'bg-primary text-on-primary shadow-md'
                        : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40'
                    }`}
                    style={isCustomColorEditorOpen ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : { color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isCustomColorEditorOpen ? 'Tutup Editor' : 'Kustom / Buat Preset'}</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs: Semua, Preset Kustom */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <button
                  type="button"
                  onClick={() => setColorFilterTab('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                    colorFilterTab === 'all'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                  }`}
                  style={colorFilterTab === 'all' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
                >
                  Semua ({allColorPresets.length})
                </button>
                {(settings.customColorPresets || []).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setColorFilterTab('custom')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                      colorFilterTab === 'custom'
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                    style={colorFilterTab === 'custom' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Kustom ({(settings.customColorPresets || []).length})</span>
                  </button>
                )}
              </div>

              {/* SLIM PRESET LIST (Grid Ramping & Ringkas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-2.5">
                {filteredColorPresets.map((preset) => {
                  const isSelected = (settings.selectedColorTheme || 'midnight_gold') === preset.id;
                  const isCustom = (settings.customColorPresets || []).some(p => p.id === preset.id);
                  return (
                    <div
                      key={preset.id}
                      id={`color-preset-${preset.id}`}
                      onClick={() => handleApplyColorThemePreset(preset)}
                      className={`px-3 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2.5 group cursor-pointer ${
                        isSelected
                          ? 'border-primary/80 ring-1 ring-primary/60 shadow-xs'
                          : 'border-stone-800/80 hover:border-stone-700'
                      }`}
                      style={{
                        backgroundColor: preset.secondary || '#151c2c',
                        borderColor: isSelected ? preset.primary : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 6-Color Cluster Dots */}
                        <div
                          className="flex items-center -space-x-1 shrink-0"
                          title={`Primary: ${preset.primary}, Accent: ${preset.accent}, Secondary: ${preset.secondary}, Text: ${preset.text}, Bg: ${preset.background}, ButtonText: ${preset.buttonText || '#ffffff'}`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/50 shadow-xs z-50 shrink-0"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-black/50 shadow-xs z-40 shrink-0"
                            style={{ backgroundColor: preset.accent }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-black/50 shadow-xs z-30 shrink-0"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-xs z-20 shrink-0"
                            style={{ backgroundColor: preset.text }}
                          />
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/50 shadow-xs z-10 shrink-0"
                            style={{ backgroundColor: preset.background }}
                          />
                          <span
                            className="w-2 h-2 rounded-full border border-black/50 shadow-xs z-0 shrink-0"
                            style={{ backgroundColor: preset.buttonText || '#ffffff' }}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs font-bold tracking-tight truncate max-w-[110px] sm:max-w-[130px]"
                              style={{ color: preset.text }}
                            >
                              {preset.name}
                            </span>
                          </div>
                          <p className="text-[10px] truncate max-w-[130px]" style={{ color: preset.accent }}>
                            {preset.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected ? (
                          <span
                            className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${preset.primary}22`,
                              color: preset.primary,
                              borderColor: `${preset.primary}66`,
                            }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-medium text-stone-500 group-hover:text-stone-300">
                            Pilih
                          </span>
                        )}

                        {/* Tombol Salin ke Editor */}
                        <button
                          type="button"
                          onClick={(e) => handleLoadPresetIntoCustomizer(preset, e)}
                          className="p-1 rounded-md text-stone-500 hover:text-amber-400 hover:bg-stone-800/60 transition-colors"
                          title="Muat & Edit di Panel Kustomisasi"
                        >
                          <Sliders className="w-2.5 h-2.5" />
                        </button>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomColorPreset(preset.id, e)}
                            className="p-1 rounded-md text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                            title="Hapus preset kustom ini"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PANEL KUSTOMISASI 6 ELEMEN WARNA & PEMBUATAN PRESET BARU */}
              {isCustomColorEditorOpen && (
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/95 border border-amber-500/40 space-y-4 shadow-xl animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                          Kustomisasi Skema Warna Aplikasi
                        </h4>
                        <p className="text-[11px] text-stone-400">
                          Sesuaikan nilai HEX warna: Background, Secondary (Card), Primary (Tombol), Teks, Accent, & Teks Tombol.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomColorEditorOpen(false)}
                      className="text-stone-500 hover:text-white p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Inspirasi Cepat Template Palet */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                      Inspirasi Palet Cepat:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Midnight Gold', bg: '#0b0f19', secondary: '#151c2c', primary: '#d97706', text: '#f8fafc', accent: '#fbbf24', buttonText: '#ffffff' },
                        { name: 'Cyber Neon Blue', bg: '#090d16', secondary: '#111827', primary: '#2563eb', text: '#f3f4f6', accent: '#38bdf8', buttonText: '#ffffff' },
                        { name: 'Dark Emerald', bg: '#061412', secondary: '#0d2623', primary: '#059669', text: '#ecfdf5', accent: '#34d399', buttonText: '#ffffff' },
                        { name: 'Crimson Velvet', bg: '#14080e', secondary: '#26101c', primary: '#e11d48', text: '#fff1f2', accent: '#fb7185', buttonText: '#ffffff' },
                        { name: 'Deep Amethyst', bg: '#0f0a1c', secondary: '#1d1435', primary: '#7c3aed', text: '#f5f3ff', accent: '#a78bfa', buttonText: '#ffffff' },
                        { name: 'Obsidian Mono', bg: '#09090b', secondary: '#18181b', primary: '#3f3f46', text: '#fafafa', accent: '#a1a1aa', buttonText: '#ffffff' },
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCustomColors({
                              background: tpl.bg,
                              secondary: tpl.secondary,
                              primary: tpl.primary,
                              text: tpl.text,
                              accent: tpl.accent,
                              buttonText: tpl.buttonText,
                              isDark: true,
                            });
                            setCustomColorName(tpl.name);
                            setCustomColorDesc(`Skema warna ${tpl.name}`);
                          }}
                          className="px-2 py-1 rounded-lg bg-stone-900 border border-stone-800 hover:border-amber-500/60 text-[10px] text-stone-300 flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.primary }} />
                          <span>{tpl.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6-Color Controls Grid with Precise Sliders (HSL / RGB / HEX) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <ColorSliderPicker
                      label="1. Background (Layar Utama)"
                      colorHex={customColors.background}
                      onChange={(hex) => setCustomColors({ ...customColors, background: hex })}
                      isDark={true}
                    />
                    <ColorSliderPicker
                      label="2. Secondary (Card/Container)"
                      colorHex={customColors.secondary}
                      onChange={(hex) => setCustomColors({ ...customColors, secondary: hex })}
                      isDark={true}
                    />
                    <ColorSliderPicker
                      label="3. Primary (Tombol/Highlight)"
                      colorHex={customColors.primary}
                      onChange={(hex) => setCustomColors({ ...customColors, primary: hex })}
                      isDark={true}
                    />
                    <ColorSliderPicker
                      label="4. Teks (Teks Utama)"
                      colorHex={customColors.text}
                      onChange={(hex) => setCustomColors({ ...customColors, text: hex })}
                      isDark={true}
                    />
                    <ColorSliderPicker
                      label="5. Accent (Detail/Badge)"
                      colorHex={customColors.accent}
                      onChange={(hex) => setCustomColors({ ...customColors, accent: hex })}
                      isDark={true}
                    />
                    <ColorSliderPicker
                      label="6. Button Text (Teks Tombol)"
                      colorHex={customColors.buttonText || '#ffffff'}
                      onChange={(hex) => setCustomColors({ ...customColors, buttonText: hex })}
                      isDark={true}
                    />
                  </div>

                  {/* Preset Meta Name Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                        Nama Preset Baru
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Midnight Gold V2"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block mb-1">
                        Deskripsi Singkat (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Variasi aksen hangat dengan latar gelap pekat"
                        value={customColorDesc}
                        onChange={(e) => setCustomColorDesc(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Live Interactive Preview Box */}
                  <div
                    className="p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner"
                    style={{
                      backgroundColor: customColors.background,
                      borderColor: `${customColors.primary}44`,
                    }}
                  >
                    <div
                      className="p-3 rounded-xl border flex-1 space-y-1 min-w-0"
                      style={{
                        backgroundColor: customColors.secondary,
                        borderColor: `${customColors.primary}33`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: customColors.accent }}
                        />
                        <span className="text-sm font-black tracking-tight" style={{ color: customColors.text }}>
                          {customColorName || 'Pratinjau Card & Teks'}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: customColors.accent }}>
                        {customColorDesc || 'Warna aksen dan teks kontras di atas container secondary.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                        style={{
                          backgroundColor: customColors.primary,
                          color: customColors.buttonText || '#ffffff',
                        }}
                      >
                        Tombol Primary
                      </span>
                      <span
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold border"
                        style={{
                          color: customColors.accent,
                          borderColor: `${customColors.accent}66`,
                          backgroundColor: `${customColors.accent}22`,
                        }}
                      >
                        Badge Aksen
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomColors({
                          background: '#0b0f19',
                          secondary: '#151c2c',
                          primary: '#d97706',
                          text: '#f8fafc',
                          accent: '#fbbf24',
                          buttonText: '#ffffff',
                          isDark: true,
                        });
                        setCustomColorName('');
                        setCustomColorDesc('');
                      }}
                      className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold border border-stone-800 transition-colors"
                    >
                      Reset Nilai
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyLiveCustomColors}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Terapkan Langsung</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewCustomColorPreset}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Simpan Sebagai Preset Baru</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: TEMA VISUAL CARD (3-COLUMN GRID & LIVE CARD PREVIEW)           */}
        {/* ========================================================================= */}
        {activeCategory === 'card_theme' && (
        <section
          id="card-theme-section"
          className={`p-4 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/60 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black tracking-tight">{t.cardThemeSection}</h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    GLOBAL TEMA
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  {t.cardThemeDesc}
                </p>
              </div>
            </div>

            {/* Header Action Buttons: Card Theme Studio, Panduan Skema (.md) & Import (.json / .zip) */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 shrink-0">
              {/* Hidden Card Theme File Input (Supports JSON and ZIP) */}
              <input
                ref={cardThemeFileInputRef}
                type="file"
                accept=".json,.zip,application/json,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleCardThemeFileSelected(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-open-card-theme-studio"
                  onClick={() => {
                    const currentDef = getThemeDefinition(settings.cardTheme);
                    if (onOpenCardThemeStudio) {
                      onOpenCardThemeStudio(currentDef || null);
                    } else {
                      setEditingCardStudioTheme(currentDef || null);
                      setIsCardStudioOpen(true);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  title="Buka Card Theme Studio untuk mengkustomisasi sudut 0-100, opasitas, layering, dan posisi sudut kartu"
                >
                  <Palette className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Kustomisasi Card Sendiri</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="btn-download-card-theme-guide"
                  onClick={downloadCardThemeGuide}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/60'
                      : 'bg-stone-100 border-stone-300 text-stone-700 hover:text-amber-600'
                  }`}
                  title="Unduh file teks panduan skema JSON & ZIP Tema Card (.md)"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Panduan Skema (.md)</span>
                </button>

                <button
                  type="button"
                  id="btn-import-card-theme"
                  onClick={() => cardThemeFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 shadow-sm transition-all"
                  title="Impor tema card dari file JSON atau paket ZIP"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5] text-amber-400" />
                  <span>Impor (.json / .zip)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inline Card Theme Studio Panel when Open */}
          {isCardStudioOpen && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-200">
              <CardThemeStudio
                initialTheme={editingCardStudioTheme}
                sampleArtists={artists}
                settings={settings}
                onSaveTheme={(newTheme) => {
                  handleSaveStudioCardTheme(newTheme);
                  setIsCardStudioOpen(false);
                }}
                onApplyLive={(liveTheme) => {
                  handleApplyStudioCardTheme(liveTheme);
                }}
                onClose={() => setIsCardStudioOpen(false)}
                isDark={isDark}
              />
            </div>
          )}

          {/* Sticky Stage: Live Interactive Card Preview & Sticky Tab Bar */}
          <div
            id="card-theme-sticky-stage"
            className={`sticky top-[118px] sm:top-[124px] z-20 py-2.5 px-3 sm:px-4 rounded-2xl border shadow-xl mb-4 transition-all backdrop-blur-md flex flex-col items-center justify-center ${
              isDark
                ? 'bg-stone-950/95 border-amber-500/40 shadow-black/80'
                : 'bg-white/95 border-amber-500/50 shadow-stone-300/60'
            }`}
          >
            {/* Minimal Header with Switcher */}
            <div className="w-full flex items-center justify-between gap-2 pb-1.5 border-b border-stone-800/60 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="text-[11px] sm:text-xs font-bold tracking-tight uppercase truncate">
                  {t.cardThemePreviewTitle || 'Pratinjau Card'}:
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate">
                  {currentThemeMeta.name}
                </span>
              </div>

              {/* Sample Artist Switcher (Special / Standard) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewArtistIndex(0)}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold border transition-all ${
                    previewArtistIndex === 0
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-xs'
                      : isDark
                      ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      : 'bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  Special
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewArtistIndex(1 < artists.length ? 1 : 0)}
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono font-bold border transition-all ${
                    previewArtistIndex === 1
                      ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-xs'
                      : isDark
                      ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      : 'bg-stone-100 border-stone-300 text-stone-700'
                  }`}
                >
                  Standard
                </button>
              </div>
            </div>

            {/* Centered Rendered Artist Card Preview */}
            <div className="w-full max-w-[135px] sm:max-w-[150px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/20 transition-all hover:scale-102 my-0.5">
              <ArtistCard
                artist={sampleArtist}
                rank={1}
                showRankBadge={true}
                cardTheme={settings.cardTheme}
              />
            </div>

            {/* Sticky Catalog Tab Bar: Built-in Presets vs User Uploaded Themes vs Semua */}
            <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-800/60 flex-wrap">
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/90 border border-stone-800">
                <button
                  type="button"
                  id="tab-card-theme-builtin"
                  onClick={() => setCardThemeCatalogTab('builtin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardThemeCatalogTab === 'builtin'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : isDark
                      ? 'text-stone-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  style={cardThemeCatalogTab === 'builtin' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preset Bawaan</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    cardThemeCatalogTab === 'builtin' ? 'bg-black/20 text-inherit' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {allThemes.filter((t) => !t.isCustom).length}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-card-theme-custom"
                  onClick={() => setCardThemeCatalogTab('custom')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardThemeCatalogTab === 'custom'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : isDark
                      ? 'text-stone-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  style={cardThemeCatalogTab === 'custom' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggahan Pengguna</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    cardThemeCatalogTab === 'custom' ? 'bg-black/20 text-inherit' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {allThemes.filter((t) => t.isCustom).length}
                  </span>
                </button>

                <button
                  type="button"
                  id="tab-card-theme-all"
                  onClick={() => setCardThemeCatalogTab('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cardThemeCatalogTab === 'all'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : isDark
                      ? 'text-stone-400 hover:text-white'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                  style={cardThemeCatalogTab === 'all' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Semua</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    cardThemeCatalogTab === 'all' ? 'bg-black/20 text-inherit' : 'bg-stone-800 text-stone-300'
                  }`}>
                    {allThemes.length}
                  </span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-stone-400">
                {cardThemeCatalogTab === 'builtin' && 'Koleksi tema resmi sistem'}
                {cardThemeCatalogTab === 'custom' && 'Tema kustom & hasil impor Anda'}
                {cardThemeCatalogTab === 'all' && 'Katalog lengkap tema kartu'}
              </div>
            </div>
          </div>

          {/* List View of Card Themes: Only Name + 3-Dot Menu */}
          {(() => {
            const filteredThemes = allThemes.filter((t) => {
              if (cardThemeCatalogTab === 'builtin') return !t.isCustom;
              if (cardThemeCatalogTab === 'custom') return t.isCustom;
              return true;
            });

            if (filteredThemes.length === 0 && cardThemeCatalogTab === 'custom') {
              return (
                <div className="py-12 px-4 rounded-2xl border border-dashed border-stone-800 bg-stone-950/40 text-center flex flex-col items-center justify-center">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-200">Belum Ada Tema Unggahan</h3>
                  <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4">
                    Impor file tema kartu format .zip atau .json untuk menambahkan preset kustom baru ke katalog Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => cardThemeFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Impor Tema Sekarang</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="flex flex-col space-y-1.5 pt-1">
                {filteredThemes.map((cardTheme) => {
                  const active = settings.cardTheme === cardTheme.id;
                  const isCustom = cardTheme.isCustom;
                  const isMenuOpen = openCardThemeMenuId === cardTheme.id;

                  return (
                    <div
                      key={cardTheme.id}
                      id={`theme-card-option-${cardTheme.id}`}
                      onClick={() => handleCardThemeChange(cardTheme.id)}
                      className={`px-3.5 py-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group relative ${
                        active
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-bold shadow-sm'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 hover:bg-stone-900/80 text-stone-200 hover:border-stone-700'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 hover:border-stone-300'
                      }`}
                    >
                      {/* Left: Active Indicator + Name ONLY */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${
                            active ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/30' : 'bg-stone-700'
                          }`}
                        />
                        <span className="text-sm font-semibold truncate">
                          {cardTheme.name}
                        </span>
                      </div>

                      {/* Right: Three Dot Menu Button */}
                      <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          id={`btn-card-theme-menu-${cardTheme.id}`}
                          onClick={() => setOpenCardThemeMenuId(isMenuOpen ? null : cardTheme.id)}
                          className={`p-1.5 rounded-lg border transition-all ${
                            isMenuOpen
                              ? 'bg-amber-500 text-stone-950 border-amber-400'
                              : isDark
                              ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                              : 'bg-stone-200/70 border-stone-300 text-stone-600 hover:text-stone-950'
                          }`}
                          title="Opsi Tema"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                          <div
                            className={`absolute right-0 top-full mt-1.5 w-48 rounded-xl border shadow-2xl z-50 py-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 ${
                              isDark ? 'bg-stone-950/95 border-stone-800 text-stone-200' : 'bg-white/95 border-stone-200 text-stone-800 shadow-stone-400/30'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCardThemeMenuId(null);
                                if (onOpenCardThemeStudio) {
                                  onOpenCardThemeStudio(cardTheme);
                                } else {
                                  setEditingCardStudioTheme(cardTheme);
                                  setIsCardStudioOpen(true);
                                }
                              }}
                              className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/15 hover:text-amber-300 transition-colors text-left font-semibold text-amber-400"
                            >
                              <Palette className="w-3.5 h-3.5" />
                              <span>Kustomisasi di Studio</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCardThemeMenuId(null);
                                handleExportCardTheme(cardTheme.id, e);
                              }}
                              className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/15 hover:text-amber-300 transition-colors text-left font-medium"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>Simpan JSON</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenCardThemeMenuId(null);
                                handleExportCardThemeZIP(cardTheme.id, e);
                              }}
                              className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-amber-500/15 hover:text-amber-300 transition-colors text-left font-medium"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-500" />
                              <span>Simpan Zip</span>
                            </button>

                            {isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenCardThemeMenuId(null);
                                  handleDeleteCustomTheme(cardTheme.id, e);
                                }}
                                className="w-full px-3 py-2 text-xs flex items-center gap-2 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors text-left font-medium border-t border-stone-800/60 mt-1 pt-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus Tema</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
        )}



        {/* ========================================================================= */}
        {/* SECTION 3: FONT & UKURAN TEKS                                             */}
        {/* ========================================================================= */}
        {activeCategory === 'typography' && (
        <section
          id="setting-typography"
          className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-800/60">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight">{t.fontSection}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  TIPOGRAFI
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Pilihan tipografi font aplikasi dan pengaturan skala ukuran teks.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Font Family Selection */}
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Jenis Font
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {fontOptions.map(font => {
                  const active = settings.fontFamily === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => handleFontFamilyChange(font.id)}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        active
                          ? 'border-primary bg-primary/15 text-primary shadow-md ring-1 ring-primary/40'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700'
                          : 'border-stone-200 bg-stone-50 text-stone-800 hover:border-stone-300'
                      }`}
                      style={{
                        fontFamily: font.id,
                        borderColor: active ? 'var(--color-primary)' : undefined,
                        color: active ? 'var(--color-primary)' : undefined,
                      }}
                    >
                      <strong className="text-xs block">
                        {font.label}
                      </strong>
                      <span className="text-[10px] text-stone-400 block mt-0.5 truncate">
                        {font.sample}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size Selection */}
            <div className="pt-3 border-t border-stone-800/60">
              <div className="flex items-center justify-between mb-2">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Skala Ukuran Teks
                </label>
                <span className="text-xs font-mono font-bold text-primary" style={{ color: 'var(--color-primary)' }}>
                  {fontSizeOptions.find(o => o.id === settings.fontSize)?.percent || '100%'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {fontSizeOptions.map(size => {
                  const active = settings.fontSize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => handleFontSizeChange(size.id)}
                      className={`p-2.5 rounded-2xl border cursor-pointer text-center transition-all ${
                        active
                          ? 'border-primary bg-primary text-on-primary font-black shadow-md'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-300 hover:border-stone-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                      }`}
                      style={active ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)', borderColor: 'var(--color-primary)' } : undefined}
                    >
                      <strong className="text-xs block">
                        {size.label}
                      </strong>
                      <span className={`text-[10px] block mt-0.5 ${active ? 'text-inherit font-bold opacity-90' : 'text-stone-400'}`}>
                        {size.percent}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Font Aktif:</span>
            <span className="text-amber-400 font-bold">{settings.fontFamily} • {settings.fontSize.toUpperCase()}</span>
          </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: BAHASA ANTARMUKA                                               */}
        {/* ========================================================================= */}
        {activeCategory === 'language' && (
        <section
          id="setting-language"
          className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-800/60">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight">{t.languageSection}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LOKALISASI
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Pilih bahasa terjemahan antarmuka sistem dan navigasi menu.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {languageOptions.map(lang => {
              const active = settings.language === lang.id;
              return (
                <div
                  key={lang.id}
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    active
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                      : isDark
                      ? 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                      : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                  }`}
                  style={active ? { borderColor: 'var(--color-primary)' } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <div>
                      <strong className={`text-xs sm:text-sm block ${active ? 'text-primary font-black' : 'text-stone-200'}`} style={active ? { color: 'var(--color-primary)' } : undefined}>
                        {lang.short}
                      </strong>
                      <span className="text-[11px] text-stone-400 block">
                        {lang.label}
                      </span>
                    </div>
                  </div>
                  {active && (
                    <span
                      className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shrink-0 shadow"
                      style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-stone-800/60 flex items-center justify-between text-xs font-mono text-stone-400">
            <span>Bahasa Terpilih:</span>
            <span className="text-emerald-400 font-bold uppercase">{settings.language}</span>
          </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: DATABASE EDITOR                                                */}
        {/* ========================================================================= */}
        {activeCategory === 'database' && (
        <section
          id="setting-db-editor"
          className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-800/60">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight">{t.dbEditorSection}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  KEY-VALUE & LOKALISASI I18N
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Kamus teks antarmuka terpusat (zero downtime), pencarian global, ganti massal, dan taksonomi master.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
              Ubah seluruh teks UI (title, description, placeholder, label, tooltip, notifikasi) secara terpusat melalui Key-Value Editor dinamis dengan caching layer in-memory zero downtime.
            </p>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <strong className="text-xs sm:text-sm text-white block">Kamus Teks & Database Editor</strong>
                <span className="text-xs font-mono text-indigo-400 block mt-0.5">
                  Multi-Locale • Bulk Replace • In-Memory Cache • History Rollback
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenDbEditor}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-101 active:scale-95 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>Buka Database Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* ITEM: PENGATURAN SKEMA DINAMIS (DYNAMIC SCHEMA) */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 flex items-center justify-between flex-wrap gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm text-white block">Pengaturan Skema Dinamis</strong>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Halaman Mandiri • CSV Impor/Ekspor
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Kelola label & opsi APPEAL, ATTRIBUTES, SPECIALTY, APPEARANCE, dan IMPRESSION dalam halaman tersendiri dengan sinkronisasi global.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenDynamicSchema}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-101 active:scale-95 cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Buka Dynamic Schema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* ITEM: BUKA HALAMAN CUSTOM (Requirement 1) */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 flex items-center justify-between flex-wrap gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs sm:text-sm text-white block">Buka Halaman Custom</strong>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {customPagesCount} Entri
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Kelola entri halaman kustom tambahan, galeri visual mandiri, dan showcase artis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenCustomPages}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-101 active:scale-95 cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Buka Halaman Custom</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: EKSPOR CADANGAN DATA                                           */}
        {/* ========================================================================= */}
        {activeCategory === 'backup' && (
        <section
          id="setting-export-backup"
          className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-stone-800/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black tracking-tight">Ekspor Cadangan Data</h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    CADANGAN OFFLINE
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  Unduh arsip cadangan data offline dalam format JSON, HTML, atau Markdown.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 self-start sm:self-auto">
              {artists.length} Entri Artis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* JSON */}
            <button
              type="button"
              onClick={() => {
                exportDatabaseAsJSON(artists, schema);
                showToast('File JSON berhasil diunduh!');
              }}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-stone-950/80 border-stone-800 hover:border-amber-500 hover:bg-stone-900'
                  : 'bg-stone-50 border-stone-200 hover:border-amber-500 hover:bg-white'
              }`}
              title="Unduh format JSON untuk restore penuh"
            >
              <FileJson className="w-6 h-6 text-amber-400 mb-2" />
              <span className="text-sm font-bold text-white">JSON</span>
              <span className="text-xs text-stone-400 mt-0.5">Full Data Restore</span>
            </button>

            {/* HTML */}
            <button
              type="button"
              onClick={() => {
                exportDatabaseAsHTML(artists, schema);
                showToast('File HTML berhasil diunduh!');
              }}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-stone-950/80 border-stone-800 hover:border-cyan-500 hover:bg-stone-900'
                  : 'bg-stone-50 border-stone-200 hover:border-cyan-500 hover:bg-white'
              }`}
              title="Unduh format HTML mandiri"
            >
              <FileCode className="w-6 h-6 text-cyan-400 mb-2" />
              <span className="text-sm font-bold text-white">HTML Standalone</span>
              <span className="text-xs text-stone-400 mt-0.5">Bisa dibuka di browser</span>
            </button>

            {/* Markdown */}
            <button
              type="button"
              onClick={() => {
                exportDatabaseAsMarkdown(artists, schema);
                showToast('File Markdown berhasil diunduh!');
              }}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? 'bg-stone-950/80 border-stone-800 hover:border-emerald-500 hover:bg-stone-900'
                  : 'bg-stone-50 border-stone-200 hover:border-emerald-500 hover:bg-white'
              }`}
              title="Unduh format Markdown dokumentasi"
            >
              <FileText className="w-6 h-6 text-emerald-400 mb-2" />
              <span className="text-sm font-bold text-white">Markdown Table</span>
              <span className="text-xs text-stone-400 mt-0.5">Dokumentasi & Tabel</span>
            </button>
          </div>
        </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: PULIHKAN & IMPOR DATA                                          */}
        {/* ========================================================================= */}
        {activeCategory === 'restore' && (
        <section
          id="setting-import-backup"
          className={`p-5 sm:p-6 rounded-3xl border shadow-xl transition-all ${
            isDark ? 'bg-stone-900/70 border-stone-800/80' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-stone-800/60">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black tracking-tight">{t.importTitle}</h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  RESTORE DATABASE
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Impor & restore database entri artis dan schema dari file cadangan.
              </p>
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-101'
                : isDark
                ? 'border-stone-700 bg-stone-950/60 hover:border-stone-500 hover:bg-stone-950'
                : 'border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
              accept=".json,.html,.htm,.md,.markdown"
              className="hidden"
            />

            <Upload className="w-8 h-8 text-amber-400 mb-2" />
            <strong className="text-sm text-white block">
              Unggah File Cadangan (.json, .html, .md)
            </strong>
            <span className="text-xs text-stone-400 block mt-1">
              Klik atau seret file cadangan ke area ini untuk memulai pratinjau pemulihan
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800/60 text-xs font-mono text-stone-400">
            Dukungan pemulihan fleksibel dengan opsi timpa (overwrite) atau gabung (merge).
          </div>
        </section>
        )}
      </div>

      {/* Restore Confirmation Modal */}
      {importModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-white text-base">
                  Konfirmasi Pemulihan Database
                </h3>
                <p className="text-xs text-stone-400">
                  Ditemukan <strong className="text-amber-400 font-bold">{importModal.count}</strong> entri artis dalam file cadangan.
                </p>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-stone-300 block uppercase tracking-wider">
                PILIH METODE PEMULIHAN
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setImportMode('overwrite')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    importMode === 'overwrite'
                      ? 'border-amber-400 bg-amber-500/10'
                      : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                  }`}
                >
                  <strong className="text-xs text-white block">Timpa Semua (Overwrite)</strong>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Ganti seluruh database saat ini dengan isi file cadangan.
                  </p>
                </div>

                <div
                  onClick={() => setImportMode('merge')}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    importMode === 'merge'
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-stone-800 bg-stone-950/60 hover:border-stone-700'
                  }`}
                >
                  <strong className="text-xs text-white block">Gabungkan (Merge)</strong>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Tambahkan artis baru dan perbarui yang memiliki nama sama.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setImportModal(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Terapkan Pemulihan ({importModal.count} Artis)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Card Theme Import Modal */}
      {importedThemePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Konfirmasi Impor Tema Card
                  </h3>
                  <p className="text-xs text-stone-400">
                    File tema JSON valid berhasil diverifikasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportedThemePreview(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Details and Live Card Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Left Column: Live Rendered Card with Custom Layout */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="w-full max-w-[190px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/20">
                  <ArtistCard
                    artist={sampleArtist}
                    rank={1}
                    showRankBadge={true}
                    cardTheme={importedThemePreview.id}
                    cardThemeDefinition={importedThemePreview}
                  />
                </div>
              </div>

              {/* Right Column: Theme Metadata */}
              <div className="sm:col-span-7 space-y-3">
                <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: importedThemePreview.accentColor }}
                    />
                    <strong className="text-sm text-white font-bold truncate">
                      {importedThemePreview.name}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                    <span
                      className="px-2 py-0.5 rounded border"
                      style={{
                        borderColor: `${importedThemePreview.accentColor}60`,
                        color: importedThemePreview.accentColor,
                        backgroundColor: `${importedThemePreview.accentColor}15`,
                      }}
                    >
                      {importedThemePreview.badge}
                    </span>
                    <span className="text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                      {importedThemePreview.category}
                    </span>
                    <span className="text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                      v{importedThemePreview.version || '1.0'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {importedThemePreview.description}
                  </p>
                </div>

                <p className="text-[11px] text-stone-400 italic">
                  Tema ini akan ditambahkan ke daftar tema Anda dan langsung diaktifkan secara global.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setImportedThemePreview(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-import-card-theme"
                onClick={handleConfirmImportTheme}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                Impor & Terapkan Tema
              </button>
            </div>
          </div>
        </div>
      )}
      {/* UI Theme Import Modal */}
      {importedUIThemePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Layout className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">
                    Konfirmasi Impor Tema UI Aplikasi
                  </h3>
                  <p className="text-xs text-stone-400">
                    File tema antarmuka JSON valid berhasil diverifikasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImportedUIThemePreview(null)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Theme Details and Mini Mockup */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: importedUIThemePreview.accentColor }}
                    />
                    <strong className="text-sm text-white font-bold truncate">
                      {importedUIThemePreview.name}
                    </strong>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                    v{importedUIThemePreview.version || '1.0.0'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                  <span
                    className="px-2 py-0.5 rounded border font-bold"
                    style={{
                      borderColor: `${importedUIThemePreview.accentColor}60`,
                      color: importedUIThemePreview.accentColor,
                      backgroundColor: `${importedUIThemePreview.accentColor}15`,
                    }}
                  >
                    {importedUIThemePreview.badge || 'CUSTOM'}
                  </span>
                  <span className="text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                    {importedUIThemePreview.category || 'Dashboard'}
                  </span>
                  <span className="text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                    Radius: {importedUIThemePreview.global?.borderRadius || '2xl'}
                  </span>
                  <span className="text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded">
                    Tabs: {importedUIThemePreview.global?.tabStyle || 'pill'}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {importedUIThemePreview.description || 'Tema antarmuka kustom untuk aplikasi.'}
                </p>

                {/* Mini Visual Preview */}
                {renderUIMiniPreview(importedUIThemePreview)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block text-[9px]">Home</span>
                  <span className="text-stone-200 capitalize">{importedUIThemePreview.home?.layout || 'grid'}</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block text-[9px]">Artis</span>
                  <span className="text-stone-200 capitalize">{importedUIThemePreview.artistDetail?.layout || 'standard'}</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block text-[9px]">Ranking</span>
                  <span className="text-stone-200 capitalize">{importedUIThemePreview.ranking?.layout || 'standard'}</span>
                </div>
                <div className="p-2 rounded-xl bg-stone-950 border border-stone-800">
                  <span className="text-stone-400 block text-[9px]">Compare</span>
                  <span className="text-stone-200 capitalize">{importedUIThemePreview.compare?.layout || 'split'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800 flex-wrap">
              <button
                type="button"
                onClick={() => setImportedUIThemePreview(null)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-save-ui-theme"
                onClick={() => handleConfirmImportUITheme(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
              >
                Simpan ke Daftar Tema
              </button>
              <button
                type="button"
                id="btn-save-and-apply-ui-theme"
                onClick={() => handleConfirmImportUITheme(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
              >
                Simpan & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
