import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  CardThemeDefinition,
  CardThemeLayoutConfig,
  CardElementPropertyConfig,
  CardCustomImageAsset,
  CardCustomTextAsset,
  UniversalCardElementId,
  Artist,
  AppSettings,
  CardTheme,
  CARD_THEMES as CARD_THEME_DEFINITIONS,
} from '../../types';
import { ArtistCard } from '../ArtistCard';
import { clearCardLayoutCache } from '../../utils/themeCache';
import { ThumbDragSlider } from './ThumbDragSlider';
import { UnifiedColorAlphaSlider } from './UnifiedColorAlphaSlider';
import {
  Sparkles,
  Layers,
  Sliders,
  Eye,
  EyeOff,
  Download,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Palette,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Move,
  Type,
  Maximize,
  FolderOpen,
  Image as ImageIcon,
  Tag,
  Hash,
  Flag,
  Award,
  Zap,
  Grid,
  Upload,
  Wand2,
  Square,
  Sparkle,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface CardThemeStudioProps {
  initialTheme?: CardThemeDefinition | null;
  sampleArtists: Artist[];
  settings: AppSettings;
  onSaveTheme: (newTheme: CardThemeDefinition) => void;
  onApplyLive: (themeDef: CardThemeDefinition) => void;
  onClose?: () => void;
  isDark?: boolean;
}

// Universal 12 Core Elements Definition (including distinct Status Artis and Maturity)
export interface UniversalElementMeta {
  id: UniversalCardElementId;
  name: string;
  category: 'Identity' | 'Scores' | 'Attributes' | 'Assets';
  icon: string;
  defaultPosition: CardElementPropertyConfig['position'];
  defaultVisible: boolean;
  hasFormatOptions?: boolean;
}

export const CORE_12_ELEMENTS: UniversalElementMeta[] = [
  { id: 'overallRating', name: 'Rating Total (★ 9.4)', category: 'Scores', icon: 'Award', defaultPosition: 'top_right', defaultVisible: false, hasFormatOptions: true },
  { id: 'country', name: 'Negara & Bendera', category: 'Attributes', icon: 'Flag', defaultPosition: 'top_left', defaultVisible: false, hasFormatOptions: true },
  { id: 'artistStatus', name: 'Status Artis (PRO / Debut)', category: 'Attributes', icon: 'Tag', defaultPosition: 'top_left', defaultVisible: false, hasFormatOptions: true },
  { id: 'maturity', name: 'Maturity (Teen/Young, MILF, Cougar)', category: 'Attributes', icon: 'Sparkles', defaultPosition: 'top_left', defaultVisible: false, hasFormatOptions: true },
  { id: 'bodyType', name: 'Tipe Tubuh (Body Type)', category: 'Attributes', icon: 'Hash', defaultPosition: 'top_left', defaultVisible: false, hasFormatOptions: true },
  { id: 'firstName', name: 'Nama Depan (First Name)', category: 'Identity', icon: 'Type', defaultPosition: 'bottom_center', defaultVisible: false },
  { id: 'lastName', name: 'Nama Belakang (Last Name)', category: 'Identity', icon: 'Type', defaultPosition: 'bottom_center', defaultVisible: false },
  { id: 'appearanceScore', name: 'Skor Appearance (APP)', category: 'Scores', icon: 'Zap', defaultPosition: 'bottom_left', defaultVisible: false, hasFormatOptions: true },
  { id: 'impressionScore', name: 'Skor Impression (IMP)', category: 'Scores', icon: 'Zap', defaultPosition: 'bottom_right', defaultVisible: false, hasFormatOptions: true },
  { id: 'measurementsBWH', name: 'Ukuran B / W / H', category: 'Attributes', icon: 'Sliders', defaultPosition: 'bottom_center', defaultVisible: false, hasFormatOptions: true },
  { id: 'cupSize', name: 'Ukuran Cup (CUP)', category: 'Attributes', icon: 'Tag', defaultPosition: 'bottom_center', defaultVisible: false, hasFormatOptions: true },
  { id: 'age', name: 'Usia (Age / Tahun)', category: 'Attributes', icon: 'Tag', defaultPosition: 'bottom_center', defaultVisible: false, hasFormatOptions: true },
];

const DEFAULT_LAYER_ORDER: string[] = [
  'overallRating',
  'country',
  'artistStatus',
  'maturity',
  'bodyType',
  'firstName',
  'lastName',
  'appearanceScore',
  'impressionScore',
  'measurementsBWH',
  'cupSize',
  'age',
];

const FILTER_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'drop_shadow', label: 'Drop Shadow' },
  { id: 'glow', label: 'Theme Glow' },
  { id: 'blur', label: 'Soft Blur' },
  { id: 'brightness', label: 'Brightness +' },
  { id: 'contrast', label: 'Contrast +' },
  { id: 'grayscale', label: 'Grayscale' },
  { id: 'invert', label: 'Invert' },
  { id: 'sepia', label: 'Sepia' },
] as const;

const PRESET_ANCHORS = [
  { id: 'top_left', label: 'Top Left' },
  { id: 'top_center', label: 'Top Center' },
  { id: 'top_right', label: 'Top Right' },
  { id: 'center_left', label: 'Center Left' },
  { id: 'center', label: 'Center' },
  { id: 'center_right', label: 'Center Right' },
  { id: 'bottom_left', label: 'Bottom Left' },
  { id: 'bottom_center', label: 'Bottom Center' },
  { id: 'bottom_right', label: 'Bottom Right' },
  { id: 'free_absolute', label: 'Free Offset' },
] as const;

const FONT_FAMILY_OPTIONS = [
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Outfit', value: 'Outfit' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Cinzel', value: 'Cinzel' },
  { label: 'Orbitron', value: 'Orbitron' },
  { label: 'Monospace (Roboto Mono)', value: 'ui-monospace, SFMono-Regular, monospace' },
];

export const CardThemeStudio: React.FC<CardThemeStudioProps> = ({
  initialTheme,
  sampleArtists,
  settings,
  onSaveTheme,
  onApplyLive,
  onClose,
  isDark = true,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'layers' | 'inspector' | 'geometry' | 'presets'>('layers');

  // Currently selected layer id (can be standard element id, custom_img_ id, or custom_text_ id)
  const [selectedLayerId, setSelectedLayerId] = useState<string>('overallRating');

  // Custom Image Modal state
  const [showAddImageModal, setShowAddImageModal] = useState<boolean>(false);
  const [newImageName, setNewImageName] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const customImageFileInputRef = useRef<HTMLInputElement>(null);

  // Custom Text Modal state
  const [showAddTextModal, setShowAddTextModal] = useState<boolean>(false);
  const [newTextContent, setNewTextContent] = useState<string>('VIP ARTIST');
  const [newTextName, setNewTextName] = useState<string>('Teks Kustom');

  // Preview controls
  const [previewArtistIdx, setPreviewArtistIdx] = useState<number>(0);
  const [previewDensity, setPreviewDensity] = useState<2 | 3 | 4>(2);
  const [canvasScale, setCanvasScale] = useState<number>(100);
  const [canvasFrameSize, setCanvasFrameSize] = useState<'compact' | 'normal' | 'expanded'>('normal');
  const [showGridGuides, setShowGridGuides] = useState<boolean>(true);
  const [isMobilePreviewCollapsed, setIsMobilePreviewCollapsed] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);

  // Link 4 corners toggle (Card Level & Element Level)
  const [linkCorners, setLinkCorners] = useState<boolean>(true);
  const [linkElementCorners, setLinkElementCorners] = useState<boolean>(true);

  // Theme Meta information
  const [themeName, setThemeName] = useState<string>(initialTheme?.name || 'Tema Kartu Kustom Saya');
  const [themeDesc, setThemeDesc] = useState<string>(
    initialTheme?.description || 'Desain kartu kustom dengan Universal Layers & Element Registry.'
  );
  const [themeVersion, setThemeVersion] = useState<string>(initialTheme?.version || '2.0.0');

  // JSON Import/Export File Input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Layout Draft
  const [layoutDraft, setLayoutDraft] = useState<CardThemeLayoutConfig>(() => {
    const raw = initialTheme?.layout || initialTheme?.layoutConfig || {};

    // Initial default elements with default positions
    const initialElements: Record<string, CardElementPropertyConfig> = {};
    CORE_12_ELEMENTS.forEach((el) => {
      if (raw.elements?.[el.id]) {
        initialElements[el.id] = { ...raw.elements[el.id] };
      } else {
        initialElements[el.id] = {
          visible: false, // Starts POLOS by default if fresh
          position: el.defaultPosition,
          offsetX: 0,
          offsetY: 0,
          scale: 100,
          zIndex: 20,
          opacity: 100,
          rotation: 0,
          filter: 'none',
        };
      }
    });

    return {
      cardShape: raw.cardShape || 'rounded',
      thumbnailShape: raw.thumbnailShape || 'full_bleed',
      thumbnailScale: raw.thumbnailScale || 'cover',
      thumbnailPosition: raw.thumbnailPosition || 'center',
      informationLayout: raw.informationLayout || 'overlay',
      aspectRatio: raw.aspectRatio || '2:3',
      maskShape: raw.maskShape || 'none',
      borderWidth: raw.borderWidth ?? 1,
      borderRadius: raw.borderRadius ?? 16,
      cornerRadii: raw.cornerRadii || {
        topLeft: 16,
        topRight: 16,
        bottomLeft: 16,
        bottomRight: 16,
        linked: true,
      },
      cardBgOpacity: raw.cardBgOpacity ?? 85,
      cardBackdropBlur: raw.cardBackdropBlur ?? 12,
      glassmorphism: raw.glassmorphism ?? true,
      customBorderColor: raw.customBorderColor || '#FE9900',
      gradientOverlay: raw.gradientOverlay || 'dark_bottom_only',
      ornamentStyle: raw.ornamentStyle || 'none',
      showBwh: raw.showBwh ?? true,
      showAge: raw.showAge ?? true,
      showMaturity: raw.showMaturity ?? true,
      showRankBadge: raw.showRankBadge ?? true,
      showAppImpScore: raw.showAppImpScore ?? true,
      showHeight: raw.showHeight ?? true,
      showCupSize: raw.showCupSize ?? true,
      layerOrder: raw.layerOrder || DEFAULT_LAYER_ORDER,
      customImages: raw.customImages || [],
      customTexts: raw.customTexts || [],
      elements: initialElements,
      typography: raw.typography || {
        fontFamily: 'Plus Jakarta Sans',
        primaryTextColor: '#FFFFFF',
        secondaryTextColor: '#CBD5E1',
        scoreTextColor: '#FE9900',
      },
    };
  });

  // Current active sample artist
  const currentArtist = sampleArtists[previewArtistIdx] || sampleArtists[0] || {
    id: 'sample-1',
    firstName: 'Aoi',
    lastName: 'Tsukasa',
    country: 'Japan',
    countryCode: 'JP',
    typeCode: 'Pro',
    bornDate: '1995-08-15',
    measurements: { bustCm: 88, waistCm: 58, hipCm: 86, cupSize: 'E', heightCm: 165 },
    appearanceScores: { face: 9.2, body: 9.4, skin: 9.0 },
    impressionScores: { charisma: 9.5, elegance: 9.1, energy: 8.8 },
    appeal: { maturity: 'Teen / Young' },
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60',
  };

  // Helper to get element or custom asset config
  const getSelectedLayerConfig = useCallback((): {
    type: 'element' | 'custom_image' | 'custom_text';
    config: any;
    metaName: string;
  } => {
    if (selectedLayerId.startsWith('custom_img_') || selectedLayerId.startsWith('img_')) {
      const img = layoutDraft.customImages?.find((i) => i.id === selectedLayerId);
      return {
        type: 'custom_image',
        config: img || {
          id: selectedLayerId,
          name: 'Custom Image',
          url: '',
          position: 'center',
          offsetX: 0,
          offsetY: 0,
          scale: 100,
          opacity: 100,
          rotation: 0,
          filter: 'none',
          visible: true,
          zIndex: 25,
        },
        metaName: img?.name || 'Custom Image Asset',
      };
    }

    if (selectedLayerId.startsWith('custom_text_') || selectedLayerId.startsWith('txt_')) {
      const txt = layoutDraft.customTexts?.find((t) => t.id === selectedLayerId);
      return {
        type: 'custom_text',
        config: txt || {
          id: selectedLayerId,
          name: 'Teks Kustom',
          text: 'VIP ARTIST',
          position: 'center',
          offsetX: 0,
          offsetY: 0,
          scale: 100,
          opacity: 100,
          rotation: 0,
          filter: 'none',
          visible: true,
          zIndex: 25,
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 'bold',
        },
        metaName: txt?.name || 'Teks Kustom',
      };
    }

    const elemMeta = CORE_12_ELEMENTS.find((e) => e.id === selectedLayerId);
    const elemConfig = layoutDraft.elements?.[selectedLayerId] || {
      visible: false,
      position: elemMeta?.defaultPosition || 'center',
      offsetX: 0,
      offsetY: 0,
      scale: 100,
      zIndex: 20,
      opacity: 100,
      rotation: 0,
      filter: 'none',
    };

    return {
      type: 'element',
      config: elemConfig,
      metaName: elemMeta?.name || selectedLayerId,
    };
  }, [selectedLayerId, layoutDraft]);

  // Update properties of currently selected layer
  const handleUpdateSelectedLayerProp = useCallback((patch: Record<string, any>) => {
    setLayoutDraft((prev) => {
      if (selectedLayerId.startsWith('custom_img_') || selectedLayerId.startsWith('img_')) {
        const updatedCustomImages = (prev.customImages || []).map((img) => {
          if (img.id === selectedLayerId) {
            return { ...img, ...patch };
          }
          return img;
        });
        return {
          ...prev,
          customImages: updatedCustomImages,
        };
      }

      if (selectedLayerId.startsWith('custom_text_') || selectedLayerId.startsWith('txt_')) {
        const updatedCustomTexts = (prev.customTexts || []).map((txt) => {
          if (txt.id === selectedLayerId) {
            return { ...txt, ...patch };
          }
          return txt;
        });
        return {
          ...prev,
          customTexts: updatedCustomTexts,
        };
      }

      const currentElem = prev.elements?.[selectedLayerId] || {
        visible: true,
        position: 'center',
        offsetX: 0,
        offsetY: 0,
        scale: 100,
        zIndex: 20,
        opacity: 100,
        rotation: 0,
      };

      return {
        ...prev,
        elements: {
          ...(prev.elements || {}),
          [selectedLayerId]: {
            ...currentElem,
            ...patch,
          },
        },
      };
    });
  }, [selectedLayerId]);

  // Toggle Visibility of any Layer
  const handleToggleLayerVisibility = useCallback((layerId: string) => {
    setLayoutDraft((prev) => {
      if (layerId.startsWith('custom_img_') || layerId.startsWith('img_')) {
        const updatedCustomImages = (prev.customImages || []).map((img) => {
          if (img.id === layerId) {
            return { ...img, visible: img.visible === false ? true : false };
          }
          return img;
        });
        return {
          ...prev,
          customImages: updatedCustomImages,
        };
      }

      if (layerId.startsWith('custom_text_') || layerId.startsWith('txt_')) {
        const updatedCustomTexts = (prev.customTexts || []).map((txt) => {
          if (txt.id === layerId) {
            return { ...txt, visible: txt.visible === false ? true : false };
          }
          return txt;
        });
        return {
          ...prev,
          customTexts: updatedCustomTexts,
        };
      }

      const currentElem = prev.elements?.[layerId] || { visible: false, position: 'center' };
      return {
        ...prev,
        elements: {
          ...(prev.elements || {}),
          [layerId]: {
            ...currentElem,
            visible: !currentElem.visible,
          },
        },
      };
    });
  }, []);

  // Reorder Layers (Move Layer Up or Down)
  const handleMoveLayer = useCallback((layerId: string, direction: 'up' | 'down') => {
    setLayoutDraft((prev) => {
      const currentOrder = [...(prev.layerOrder || DEFAULT_LAYER_ORDER)];
      const index = currentOrder.indexOf(layerId);
      if (index === -1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= currentOrder.length) return prev;

      const item = currentOrder.splice(index, 1)[0];
      currentOrder.splice(targetIndex, 0, item);

      return {
        ...prev,
        layerOrder: currentOrder,
      };
    });
  }, []);

  // Add Custom Image Asset
  const handleAddCustomImage = (url: string, name?: string) => {
    if (!url) return;
    const newId = `custom_img_${Date.now()}`;
    const newAsset: CardCustomImageAsset = {
      id: newId,
      name: name || newImageName || `Gambar Kustom ${(layoutDraft.customImages || []).length + 1}`,
      url,
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      scale: 100,
      opacity: 100,
      rotation: 0,
      filter: 'none',
      visible: true,
      zIndex: 25,
    };

    setLayoutDraft((prev) => ({
      ...prev,
      customImages: [...(prev.customImages || []), newAsset],
      layerOrder: [newId, ...(prev.layerOrder || DEFAULT_LAYER_ORDER)],
    }));

    setSelectedLayerId(newId);
    setActiveTab('inspector');
    setShowAddImageModal(false);
    setNewImageUrl('');
    setNewImageName('');
    setSaveSuccessToast('Aset gambar berhasil ditambahkan ke lapisan!');
    setTimeout(() => setSaveSuccessToast(null), 2500);
  };

  // Add Custom Text Asset
  const handleAddCustomText = (text: string, name?: string) => {
    if (!text.trim()) return;
    const newId = `custom_text_${Date.now()}`;
    const newTextAsset: CardCustomTextAsset = {
      id: newId,
      name: name || newTextName || `Teks ${(layoutDraft.customTexts || []).length + 1}`,
      text: text.trim(),
      position: 'center',
      offsetX: 0,
      offsetY: 0,
      scale: 100,
      opacity: 100,
      rotation: 0,
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'Plus Jakarta Sans',
      color: '#FFFFFF',
      showBackground: true,
      backgroundColor: 'rgba(0,0,0,0.65)',
      showBorder: true,
      borderColor: 'rgba(254,153,0,0.6)',
      borderWidth: 1,
      borderRadius: 6,
      padding: 4,
      filter: 'none',
      visible: true,
      zIndex: 25,
    };

    setLayoutDraft((prev) => ({
      ...prev,
      customTexts: [...(prev.customTexts || []), newTextAsset],
      layerOrder: [newId, ...(prev.layerOrder || DEFAULT_LAYER_ORDER)],
    }));

    setSelectedLayerId(newId);
    setActiveTab('inspector');
    setShowAddTextModal(false);
    setNewTextContent('');
    setNewTextName('');
    setSaveSuccessToast('Elemen teks kustom berhasil ditambahkan!');
    setTimeout(() => setSaveSuccessToast(null), 2500);
  };

  // Handle Local File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        handleAddCustomImage(base64Url, file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Delete Custom Image Asset
  const handleDeleteCustomImage = (imgId: string) => {
    setLayoutDraft((prev) => ({
      ...prev,
      customImages: (prev.customImages || []).filter((img) => img.id !== imgId),
      layerOrder: (prev.layerOrder || DEFAULT_LAYER_ORDER).filter((id) => id !== imgId),
    }));

    if (selectedLayerId === imgId) {
      setSelectedLayerId('overallRating');
    }
  };

  // Delete Custom Text Asset
  const handleDeleteCustomText = (txtId: string) => {
    setLayoutDraft((prev) => ({
      ...prev,
      customTexts: (prev.customTexts || []).filter((txt) => txt.id !== txtId),
      layerOrder: (prev.layerOrder || DEFAULT_LAYER_ORDER).filter((id) => id !== txtId),
    }));

    if (selectedLayerId === txtId) {
      setSelectedLayerId('overallRating');
    }
  };

  // Reset to Clean Polos
  const handleResetToPolos = () => {
    if (window.confirm('Reset kanvas ke mode Polos (Hanya foto dasar, semua elemen nonaktif)?')) {
      const cleanElements: Record<string, CardElementPropertyConfig> = {};
      CORE_12_ELEMENTS.forEach((el) => {
        cleanElements[el.id] = {
          visible: false,
          position: el.defaultPosition,
          offsetX: 0,
          offsetY: 0,
          scale: 100,
          zIndex: 20,
          opacity: 100,
          rotation: 0,
          filter: 'none',
        };
      });

      setLayoutDraft((prev) => ({
        ...prev,
        thumbnailShape: 'full_bleed',
        cardShape: 'rounded',
        aspectRatio: '2:3',
        borderWidth: 1,
        borderRadius: 16,
        cardBgOpacity: 90,
        cardBackdropBlur: 10,
        gradientOverlay: 'none',
        maskShape: 'none',
        customImages: [],
        customTexts: [],
        elements: cleanElements,
        layerOrder: DEFAULT_LAYER_ORDER,
      }));

      setSaveSuccessToast('Kanvas di-reset ke Polos.');
      setTimeout(() => setSaveSuccessToast(null), 2500);
    }
  };

  // Corner radii handler
  const handleCornerChange = (
    corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'all',
    value: number
  ) => {
    if (corner === 'all' || linkCorners) {
      setLayoutDraft((prev) => ({
        ...prev,
        borderRadius: value,
        cornerRadii: {
          topLeft: value,
          topRight: value,
          bottomLeft: value,
          bottomRight: value,
          linked: true,
        },
      }));
    } else {
      const current = layoutDraft.cornerRadii || {
        topLeft: 16,
        topRight: 16,
        bottomLeft: 16,
        bottomRight: 16,
        linked: false,
      };
      const next = {
        ...current,
        [corner]: value,
        linked: false,
      };
      setLayoutDraft((prev) => ({
        ...prev,
        borderRadius: `${next.topLeft}px ${next.topRight}px ${next.bottomRight}px ${next.bottomLeft}px`,
        cornerRadii: next,
      }));
    }
  };

  // Element-level independent corner radii handler
  const handleElementCornerChange = (
    corner: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'all',
    value: number
  ) => {
    if (corner === 'all' || linkElementCorners) {
      handleUpdateSelectedLayerProp({
        borderRadius: value,
        cornerRadii: {
          topLeft: value,
          topRight: value,
          bottomLeft: value,
          bottomRight: value,
        },
      });
    } else {
      const currentRadii = currentConfig.cornerRadii || {
        topLeft: currentConfig.borderRadius ?? 6,
        topRight: currentConfig.borderRadius ?? 6,
        bottomLeft: currentConfig.borderRadius ?? 6,
        bottomRight: currentConfig.borderRadius ?? 6,
      };
      handleUpdateSelectedLayerProp({
        cornerRadii: {
          ...currentRadii,
          [corner]: value,
        },
      });
    }
  };

  // Live Virtual Card Theme Definition
  const livePreviewThemeDef: CardThemeDefinition = useMemo(() => {
    return {
      type: 'talent_rating_card_theme',
      version: themeVersion,
      id: (initialTheme?.id || 'custom_studio_preview') as CardTheme,
      name: themeName || 'Pratinjau Kustom',
      description: themeDesc,
      isCustom: true,
      layout: layoutDraft,
      layoutConfig: layoutDraft,
    };
  }, [themeVersion, initialTheme?.id, themeName, themeDesc, layoutDraft]);

  // Handle Save
  const handleSave = () => {
    clearCardLayoutCache();
    const finalTheme: CardThemeDefinition = {
      ...livePreviewThemeDef,
      id: (initialTheme?.id || `custom_theme_${Date.now()}`) as CardTheme,
      name: themeName.trim() || 'Tema Kartu Kustom',
      description: themeDesc.trim() || 'Tema hasil kustomisasi Universal Studio',
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };
    onSaveTheme(finalTheme);
    setSaveSuccessToast('Tema kartu kustom berhasil disimpan!');
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  // Handle Apply Live
  const handleApplyLiveTheme = () => {
    clearCardLayoutCache();
    onApplyLive(livePreviewThemeDef);
    setSaveSuccessToast('Tema berhasil diterapkan ke seluruh aplikasi!');
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  // Export Theme JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(livePreviewThemeDef, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(themeName || 'custom_card_theme').toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Theme JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.layout || parsed.layoutConfig) {
          const importedLayout = parsed.layout || parsed.layoutConfig;
          setLayoutDraft(importedLayout);
          if (parsed.name) setThemeName(parsed.name);
          if (parsed.description) setThemeDesc(parsed.description);
          setSaveSuccessToast('Konfigurasi tema JSON berhasil diimpor!');
          setTimeout(() => setSaveSuccessToast(null), 3000);
        }
      } catch {
        alert('Gagal mengimpor file JSON: Format tidak valid.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load Preset Template
  const handleLoadPreset = (presetTheme: CardThemeDefinition) => {
    const pLayout = presetTheme.layout || presetTheme.layoutConfig || {};
    setLayoutDraft(pLayout);
    setThemeName(`${presetTheme.name} (Kustom)`);
    setThemeDesc(presetTheme.description);
    setSaveSuccessToast(`Template "${presetTheme.name}" dimuat!`);
    setTimeout(() => setSaveSuccessToast(null), 2500);
  };

  const selectedLayerInfo = getSelectedLayerConfig();
  const currentConfig = selectedLayerInfo.config;

  // Normalized scale for range input (maps 0-300%)
  const normalizedScale = useMemo(() => {
    const raw = currentConfig.scale ?? 100;
    return raw > 10 ? raw : Math.round(raw * 100);
  }, [currentConfig.scale]);

  // Normalized opacity for range input (maps 0-100%)
  const normalizedOpacity = useMemo(() => {
    const raw = currentConfig.opacity ?? 100;
    return raw > 1 ? raw : Math.round(raw * 100);
  }, [currentConfig.opacity]);

  return (
    <div
      id="card-theme-studio-fullpage"
      className={`min-h-screen w-full flex flex-col ${
        isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-50 text-stone-900'
      }`}
    >
      {/* Toast Notification */}
      {saveSuccessToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xl animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* Hidden File Input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />

      {/* Hidden File Input for Custom Image Upload */}
      <input
        ref={customImageFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileUpload}
        className="hidden"
      />

      {/* ========================================================================= */}
      {/* TOP HEADER TOOLBAR                                                        */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 px-4 sm:px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl ${
          isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-white/90 border-stone-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                isDark
                  ? 'border-stone-800 hover:bg-stone-900 text-stone-300 hover:text-white'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-700 hover:text-stone-950'
              }`}
              title="Kembali ke Pengaturan"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <Palette className="w-5 h-5 text-primary" />
                <span>Card Theme Studio</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/20 text-primary border border-primary/40">
                PRO ENGINE
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden md:block">
              Universal Layers • 12 Elemen Bawaan + Gambar Bebas + Teks Kustom & Inspektor Presisi
            </p>
          </div>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleResetToPolos}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isDark
                ? 'border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300'
                : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
            }`}
            title="Reset kanvas ke mode Polos (Hanya foto dasar)"
          >
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Mulai dari Polos</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isDark
                ? 'border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300'
                : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
            }`}
            title="Impor Desain dari JSON"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Impor JSON</span>
          </button>

          <button
            onClick={handleExportJSON}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isDark
                ? 'border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300'
                : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
            }`}
            title="Ekspor Desain ke File JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor JSON</span>
          </button>

          <button
            onClick={handleApplyLiveTheme}
            className="px-3.5 py-1.5 rounded-xl border border-primary/40 bg-primary/20 hover:bg-primary/30 text-primary font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
            title="Terapkan langsung ke seluruh aplikasi"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Terapkan Live</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Tema</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN TWO-COLUMN STUDIO WORKSPACE                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================================= */}
        {/* LEFT COLUMN: INTERACTIVE LIVE PREVIEW STAGE (5 / 12 COLS)               */}
        {/* Sticky on desktop at lg:top-20 and sticky on mobile at top-14           */}
        {/* ======================================================================= */}
        <div className="lg:col-span-5 flex flex-col gap-3 sticky top-14 sm:top-16 lg:top-20 z-30 self-start">
          <div
            className={`p-3 sm:p-4 rounded-2xl border shadow-xl flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md transition-all ${
              isDark ? 'bg-stone-900/95 border-stone-800' : 'bg-white/95 border-stone-200 shadow-lg'
            }`}
          >
            {/* Preview Toolbar */}
            <div className="w-full flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-800/60 text-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-bold">Pratinjau Card</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Viewport Box Resizing (Canvas Frame Size) */}
                <div
                  className="flex items-center gap-0.5 bg-stone-950/70 p-0.5 rounded-lg border border-stone-800"
                  title="Ukuran Box Kanvas Pratinjau (S: Ringkas, M: Standar, L: Luas)"
                >
                  <span className="text-[9px] font-mono text-stone-400 px-1 font-bold">Box:</span>
                  {(['compact', 'normal', 'expanded'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setCanvasFrameSize(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        canvasFrameSize === s
                          ? 'bg-primary text-on-primary shadow-xs font-black'
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title={`Ukuran Kotak Frame: ${s === 'compact' ? 'Ringkas (Hemat Ruang)' : s === 'normal' ? 'Standar' : 'Luas'}`}
                    >
                      {s === 'compact' ? 'S' : s === 'normal' ? 'M' : 'L'}
                    </button>
                  ))}
                </div>

                {/* Density Switcher */}
                <div className="flex items-center gap-0.5 bg-stone-950/70 p-0.5 rounded-lg border border-stone-800">
                  {([2, 3, 4] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setPreviewDensity(d)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                        previewDensity === d
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'text-stone-400 hover:text-white'
                      }`}
                      title={`Simulasi Kepadatan ${d} Kolom`}
                    >
                      {d}×
                    </button>
                  ))}
                </div>

                {/* Canvas Zoom / Scale Control */}
                <div className="flex items-center gap-1 bg-stone-950/70 px-2 py-0.5 rounded-lg border border-stone-800 text-stone-300">
                  <ZoomOut className="w-3 h-3 text-stone-400" />
                  <input
                    type="range"
                    min={50}
                    max={150}
                    step={5}
                    value={canvasScale}
                    onChange={(e) => setCanvasScale(Number(e.target.value))}
                    className="w-12 sm:w-14 h-1 accent-primary bg-stone-800 rounded cursor-pointer"
                    title={`Zoom Kanvas: ${canvasScale}%`}
                  />
                  <ZoomIn className="w-3 h-3 text-stone-400" />
                  <button
                    onClick={() => setCanvasScale(100)}
                    className="font-mono text-[9px] font-bold text-stone-400 hover:text-primary transition-colors ml-0.5"
                    title="Reset Skala 100%"
                  >
                    {canvasScale}%
                  </button>
                </div>

                {/* Grid Guide Overlay Toggle */}
                <button
                  onClick={() => setShowGridGuides(!showGridGuides)}
                  className={`p-1 rounded-lg border transition-all cursor-pointer ${
                    showGridGuides
                      ? 'border-primary/50 text-primary bg-primary/10'
                      : 'border-stone-800 text-stone-500'
                  }`}
                  title="Toggle Garis Pandu Alignment"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>

                {/* Mobile Collapsible Toggle */}
                <button
                  onClick={() => setIsMobilePreviewCollapsed(!isMobilePreviewCollapsed)}
                  className="p-1 rounded-lg border border-stone-800 text-stone-400 hover:text-white lg:hidden cursor-pointer"
                  title={isMobilePreviewCollapsed ? 'Tampilkan Pratinjau Penuh' : 'Kecilkan Pratinjau'}
                >
                  {isMobilePreviewCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Stage Canvas for Card with Viewport Frame Box Resizing */}
            {!isMobilePreviewCollapsed && (
              <div
                className={`w-full flex items-center justify-center relative overflow-hidden transition-all duration-200 ${
                  canvasFrameSize === 'compact'
                    ? 'min-h-[190px] sm:min-h-[220px] max-h-[260px] p-2'
                    : canvasFrameSize === 'expanded'
                    ? 'min-h-[440px] sm:min-h-[520px] max-h-[600px] p-4 sm:p-6'
                    : 'min-h-[300px] sm:min-h-[360px] max-h-[420px] p-3 sm:p-4'
                }`}
              >
                {/* Grid Guide Lines */}
                {showGridGuides && (
                  <div className="absolute inset-2 pointer-events-none border border-dashed border-primary/20 rounded-2xl flex flex-col justify-between">
                    <div className="w-full border-b border-dashed border-primary/15" />
                    <div className="w-full border-b border-dashed border-primary/15" />
                    <div className="absolute inset-0 flex justify-between">
                      <div className="h-full border-r border-dashed border-primary/15" />
                      <div className="h-full border-r border-dashed border-primary/15" />
                    </div>
                  </div>
                )}

                {/* Real-time Rendered Card with Custom Layout Draft and Canvas Scale */}
                <div
                  className="transition-all duration-150 relative origin-center"
                  style={{
                    width: previewDensity === 2 ? '240px' : previewDensity === 3 ? '200px' : '170px',
                    transform: `scale(${canvasScale / 100})`,
                  }}
                >
                  <ArtistCard
                    artist={currentArtist}
                    customLayout={layoutDraft}
                    cardThemeDefinition={livePreviewThemeDef}
                    density={previewDensity}
                    rank={1}
                    showRankBadge={layoutDraft.showRankBadge ?? true}
                  />
                </div>
              </div>
            )}

            {/* Sample Artist Switcher */}
            <div className="w-full pt-2 mt-2 border-t border-stone-800/60 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">Sampel:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[240px] no-scrollbar">
                {sampleArtists.slice(0, 5).map((a, idx) => (
                  <button
                    key={a.id}
                    onClick={() => setPreviewArtistIdx(idx)}
                    className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border transition-all truncate cursor-pointer ${
                      previewArtistIdx === idx
                        ? 'bg-primary text-on-primary border-primary'
                        : isDark
                        ? 'border-stone-800 bg-stone-950 text-stone-400 hover:text-white'
                        : 'border-stone-200 bg-stone-100 text-stone-700'
                    }`}
                  >
                    {a.firstName}
                  </button>
                ))}
              </div>
            </div>

            {/* Unified 2x2 Navigation Tabs directly inside Preview Card Area */}
            <div className="w-full pt-2.5 mt-2.5 border-t border-stone-800/60">
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('layers')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    activeTab === 'layers'
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-101 font-black'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-800/60'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Lapisan & Elemen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('inspector')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    activeTab === 'inspector'
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-101 font-black'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-800/60'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Inspektor Properti</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('geometry')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    activeTab === 'geometry'
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-101 font-black'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-800/60'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Bentuk & Frame</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                    activeTab === 'presets'
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-101 font-black'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-800/60'
                      : 'bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-200/70'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: INSPECTOR & CONTROLS STUDIO (7 / 12 COLS)                 */}
        {/* ======================================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* ===================================================================== */}
          {/* TAB 1: LAYERS & ELEMENT REGISTRY LIST (DRAG & DROP / REORDER)         */}
          {/* ===================================================================== */}
          {activeTab === 'layers' && (
            <div className="space-y-4">
              {/* Header with Quick Actions: Add Custom Text, Add Custom Image */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 flex-wrap ${
                  isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
                }`}
              >
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                    Daftar Lapisan Kartu (Z-Order)
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Lapisan di bagian atas berada di posisi layer terdepan.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tambah Teks Button */}
                  <button
                    onClick={() => setShowAddTextModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Tambah Elemen Teks Kustom Bebas"
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Tambah Teks</span>
                  </button>

                  <button
                    onClick={() => customImageFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Unggah Gambar dari Perangkat"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah Gambar</span>
                  </button>

                  <button
                    onClick={() => setShowAddImageModal(true)}
                    className="px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-950 hover:bg-stone-900 text-stone-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Tambah Aset Gambar via URL"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Gambar URL</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Text Modal */}
              {showAddTextModal && (
                <div className="p-4 rounded-2xl border border-sky-500/40 bg-sky-500/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Type className="w-4 h-4" /> Tambah Elemen Teks Kustom
                    </span>
                    <button
                      onClick={() => setShowAddTextModal(false)}
                      className="text-stone-400 hover:text-white text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Label Teks (e.g. VIP / EXCLUSIVE / PRO)"
                      value={newTextContent}
                      onChange={(e) => setNewTextContent(e.target.value)}
                      className={`p-2 rounded-xl border text-xs font-bold ${
                        isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-white border-stone-200'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Nama Layer (e.g. Badge Status VIP)"
                      value={newTextName}
                      onChange={(e) => setNewTextName(e.target.value)}
                      className={`p-2 rounded-xl border text-xs ${
                        isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-white border-stone-200'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => handleAddCustomText(newTextContent, newTextName)}
                    disabled={!newTextContent.trim()}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Tambahkan Teks ke Lapisan
                  </button>
                </div>
              )}

              {/* Add Image URL Modal */}
              {showAddImageModal && (
                <div className="p-4 rounded-2xl border border-primary/40 bg-primary/5 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4" /> Tambah Gambar Kustom (URL)
                    </span>
                    <button
                      onClick={() => setShowAddImageModal(false)}
                      className="text-stone-400 hover:text-white text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nama Gambar (e.g. Logo / Border / Watermark)"
                      value={newImageName}
                      onChange={(e) => setNewImageName(e.target.value)}
                      className={`p-2 rounded-xl border text-xs ${
                        isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-white border-stone-200'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="URL Gambar (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className={`p-2 rounded-xl border text-xs font-mono ${
                        isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-white border-stone-200'
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => handleAddCustomImage(newImageUrl, newImageName)}
                    disabled={!newImageUrl}
                    className="w-full py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Tambahkan Gambar ke Lapisan
                  </button>
                </div>
              )}

              {/* Stack of Layers */}
              <div className="space-y-2">
                {(layoutDraft.layerOrder || DEFAULT_LAYER_ORDER).map((layerId, idx) => {
                  const isCustomImg = layerId.startsWith('custom_img_') || layerId.startsWith('img_');
                  const isCustomTxt = layerId.startsWith('custom_text_') || layerId.startsWith('txt_');

                  const customImgAsset = isCustomImg
                    ? layoutDraft.customImages?.find((i) => i.id === layerId)
                    : null;
                  const customTxtAsset = isCustomTxt
                    ? layoutDraft.customTexts?.find((t) => t.id === layerId)
                    : null;
                  const coreElemMeta = !isCustomImg && !isCustomTxt
                    ? CORE_12_ELEMENTS.find((e) => e.id === layerId)
                    : null;

                  const isSelected = selectedLayerId === layerId;
                  const isVisible = isCustomImg
                    ? customImgAsset?.visible !== false
                    : isCustomTxt
                    ? customTxtAsset?.visible !== false
                    : layoutDraft.elements?.[layerId]?.visible !== false;

                  const label = isCustomImg
                    ? customImgAsset?.name || 'Custom Image'
                    : isCustomTxt
                    ? customTxtAsset?.name || customTxtAsset?.text || 'Teks Kustom'
                    : coreElemMeta?.name || layerId;

                  return (
                    <div
                      key={layerId}
                      onClick={() => {
                        setSelectedLayerId(layerId);
                        setActiveTab('inspector');
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/40'
                          : isDark
                          ? 'border-stone-800/80 bg-stone-900/60 hover:bg-stone-900 hover:border-stone-700'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Layer order indicator */}
                        <span className="font-mono text-[10px] text-stone-500 w-5">
                          #{idx + 1}
                        </span>

                        {/* Icon */}
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            isCustomImg
                              ? 'bg-amber-500/20 text-amber-400'
                              : isCustomTxt
                              ? 'bg-sky-500/20 text-sky-400'
                              : 'bg-primary/20 text-primary'
                          }`}
                        >
                          {isCustomImg ? (
                            <ImageIcon className="w-3.5 h-3.5" />
                          ) : isCustomTxt ? (
                            <Type className="w-3.5 h-3.5" />
                          ) : (
                            <Tag className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Name & status */}
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span className={isVisible ? '' : 'line-through opacity-50'}>
                              {label}
                            </span>
                            {isCustomImg && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                                GAMBAR
                              </span>
                            )}
                            {isCustomTxt && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-500/20 text-sky-300">
                                TEKS
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2">
                            <span>
                              Pos:{' '}
                              {layoutDraft.elements?.[layerId]?.position ||
                                customImgAsset?.position ||
                                customTxtAsset?.position ||
                                'Center'}
                            </span>
                            <span>•</span>
                            <span>
                              Scale:{' '}
                              {layoutDraft.elements?.[layerId]?.scale ||
                                customImgAsset?.scale ||
                                customTxtAsset?.scale ||
                                100}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Move Up, Move Down, Toggle Eye, Delete) */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleMoveLayer(layerId, 'up')}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                          title="Geser Lapisan ke Atas (Maju)"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMoveLayer(layerId, 'down')}
                          disabled={idx === (layoutDraft.layerOrder?.length || 0) - 1}
                          className="p-1.5 rounded-lg border border-stone-800 text-stone-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                          title="Geser Lapisan ke Bawah (Mundur)"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleLayerVisibility(layerId)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isVisible
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                              : 'border-stone-800 bg-stone-950 text-stone-500'
                          }`}
                          title={isVisible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>

                        {isCustomImg && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomImage(layerId)}
                            className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                            title="Hapus Gambar Kustom"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}

                        {isCustomTxt && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomText(layerId)}
                            className="p-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                            title="Hapus Teks Kustom"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: INSPECTOR PANEL (FINE CONTROL FOR SELECTED LAYER)              */}
          {/* ===================================================================== */}
          {activeTab === 'inspector' && (
            <div
              className={`p-5 rounded-2xl border space-y-5 ${
                isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              {/* Quick Layer Switcher Bar */}
              <div className="space-y-1.5 pb-2 border-b border-stone-800/60">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-bold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-primary" /> Pilih Lapisan untuk Diedit:
                  </span>
                  <span className="font-mono text-[10px] text-amber-400">
                    {layoutDraft.layerOrder?.length || 0} Lapisan
                  </span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {(layoutDraft.layerOrder || DEFAULT_LAYER_ORDER).map((layerId) => {
                    const isCustomImg = layerId.startsWith('custom_img_') || layerId.startsWith('img_');
                    const isCustomTxt = layerId.startsWith('custom_text_') || layerId.startsWith('txt_');
                    let name = layerId;
                    if (isCustomImg) {
                      name = layoutDraft.customImages?.find((i) => i.id === layerId)?.name || 'Gambar';
                    } else if (isCustomTxt) {
                      name = layoutDraft.customTexts?.find((t) => t.id === layerId)?.name || 'Teks';
                    } else {
                      name = CORE_12_ELEMENTS.find((e) => e.id === layerId)?.name || layerId;
                    }

                    const isSelected = selectedLayerId === layerId;

                    return (
                      <button
                        key={layerId}
                        type="button"
                        onClick={() => setSelectedLayerId(layerId)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-primary text-on-primary border-primary shadow-sm scale-102'
                            : isDark
                            ? 'bg-stone-950 border-stone-800 text-stone-400 hover:text-white hover:border-stone-700'
                            : 'bg-stone-100 border-stone-200 text-stone-700 hover:text-stone-950'
                        }`}
                      >
                        {isCustomTxt ? (
                          <Type className="w-3 h-3 text-sky-400" />
                        ) : isCustomImg ? (
                          <ImageIcon className="w-3 h-3 text-amber-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Layer Header */}
              <div className="flex items-center justify-between border-b border-stone-800/60 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold flex items-center gap-1.5">
                      <span>{selectedLayerInfo.metaName}</span>
                      {selectedLayerInfo.type === 'custom_image' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ASET GAMBAR
                        </span>
                      )}
                      {selectedLayerInfo.type === 'custom_text' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                          TEKS KUSTOM
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono">ID: {selectedLayerId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleLayerVisibility(selectedLayerId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      currentConfig.visible !== false
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                        : 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {currentConfig.visible !== false ? (
                      <>
                        <Eye className="w-3.5 h-3.5" /> <span>Aktif (Muncul)</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> <span>Nonaktif (Tersembunyi)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SPECIAL: Custom Text Content Editor */}
              {selectedLayerInfo.type === 'custom_text' && (
                <div className="space-y-3 p-3.5 rounded-xl bg-stone-950/60 border border-sky-500/30">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5" /> Isi Teks Kustom
                    </label>
                  </div>
                  <input
                    type="text"
                    value={currentConfig.text || ''}
                    onChange={(e) => handleUpdateSelectedLayerProp({ text: e.target.value })}
                    className={`w-full p-2.5 rounded-xl border text-sm font-bold ${
                      isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                    }`}
                    placeholder="Ketik teks di sini..."
                  />

                  {/* Font Family & Font Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-stone-400 block mb-1">Font Family</label>
                      <select
                        value={currentConfig.fontFamily || 'Plus Jakarta Sans'}
                        onChange={(e) => handleUpdateSelectedLayerProp({ fontFamily: e.target.value })}
                        className={`w-full p-2 rounded-xl border text-xs font-bold ${
                          isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                        }`}
                      >
                        {FONT_FAMILY_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-400 block mb-1">Ketebalan (Weight)</label>
                      <select
                        value={currentConfig.fontWeight || 'bold'}
                        onChange={(e) => handleUpdateSelectedLayerProp({ fontWeight: e.target.value })}
                        className={`w-full p-2 rounded-xl border text-xs font-bold ${
                          isDark ? 'bg-stone-900 border-stone-800 text-white' : 'bg-white border-stone-200'
                        }`}
                      >
                        <option value="normal">Normal (400)</option>
                        <option value="medium">Medium (500)</option>
                        <option value="semibold">Semibold (600)</option>
                        <option value="bold">Bold (700)</option>
                        <option value="black">Black (900)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMAT TAMPILAN (For Core Elements) */}
              {selectedLayerInfo.type === 'element' && (
                <div className="space-y-3 pt-1">
                  {/* Rating Format */}
                  {selectedLayerId === 'overallRating' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Tampilan Rating</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'star_decimal'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'star_decimal', label: '★ Bintang + 9.4' },
                          { id: 'decimal', label: 'Desimal (9.4)' },
                          { id: 'integer', label: 'Bulat (9)' },
                          { id: 'ovr', label: 'Badge OVR 94' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'star_decimal') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Country Format */}
                  {selectedLayerId === 'country' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Negara & Bendera</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'flag_name'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                        {[
                          { id: 'flag_name', label: '🇯🇵 Japan' },
                          { id: 'flag_only', label: '🇯🇵 Saja' },
                          { id: 'name_only', label: 'Nama (Japan)' },
                          { id: 'code_only', label: 'Kode (JP)' },
                          { id: 'flag_code', label: '🇯🇵 JP' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'flag_name') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Maturity Format */}
                  {selectedLayerId === 'maturity' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Maturity (Appeal &gt; Maturity)</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'full'}
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'full', label: 'Lengkap (Teen / Young)' },
                          { id: 'short', label: 'Singkat (TEEN / MILF)' },
                          { id: 'badge', label: 'Badge (TY / MF)' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'full') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artist Status Format */}
                  {selectedLayerId === 'artistStatus' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Status Artis</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'badge'}
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'badge', label: 'Badge (PRO / DEBUT)' },
                          { id: 'code', label: 'Kode (PRO)' },
                          { id: 'text', label: 'Teks Lengkap' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'badge') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body Type Format */}
                  {selectedLayerId === 'bodyType' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Tipe Tubuh</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'code'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'code', label: 'Kode Singkat (AK / SL / BB)' },
                          { id: 'full_name', label: 'Nama Tipe Lengkap' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'code') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BWH Measurements Format */}
                  {selectedLayerId === 'measurementsBWH' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format B / W / H</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'standard'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'standard', label: 'B88 W58 H86' },
                          { id: 'compact', label: '88-58-86' },
                          { id: 'slash', label: '88 / 58 / 86' },
                          { id: 'detailed', label: 'Detail (cm)' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'standard') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cup Size Format */}
                  {selectedLayerId === 'cupSize' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Cup Size</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'letter'}
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'letter', label: 'E Cup' },
                          { id: 'letter_only', label: 'Hanya E' },
                          { id: 'cup_prefix', label: 'CUP E' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'letter') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Age Format */}
                  {selectedLayerId === 'age' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Usia</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'years'}
                        </span>
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {[
                          { id: 'years', label: '28 Thn' },
                          { id: 'yo', label: '28 yo' },
                          { id: 'number_only', label: 'Angka (28)' },
                          { id: 'age_prefix', label: 'Age: 28' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'years') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Score Format (Appearance / Impression) */}
                  {(selectedLayerId === 'appearanceScore' || selectedLayerId === 'impressionScore') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold flex items-center justify-between">
                        <span>Format Skor</span>
                        <span className="font-mono text-primary text-[11px]">
                          {currentConfig.displayFormat || 'label_value'}
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'label_value', label: 'Label + Skor (APP 9.2)' },
                          { id: 'value_only', label: 'Hanya Skor (9.2)' },
                          { id: 'percent', label: 'Persen (92%)' },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            type="button"
                            onClick={() => handleUpdateSelectedLayerProp({ displayFormat: fmt.id })}
                            className={`p-2 rounded-xl border text-[10px] font-bold transition-all text-center cursor-pointer ${
                              (currentConfig.displayFormat || 'label_value') === fmt.id
                                ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                                : isDark
                                ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                                : 'border-stone-200 bg-stone-50 text-stone-700'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BACKGROUND & BORDER CONTAINER CONTROLS (For Elements & Custom Texts) */}
              {selectedLayerInfo.type !== 'custom_image' && (
                <div className="space-y-3 pt-2 border-t border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-primary" /> Background & Border Kontainer
                    </span>
                  </div>

                  {/* Background Toggle & Controls */}
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.showBackground ?? false}
                          onChange={(e) => handleUpdateSelectedLayerProp({ showBackground: e.target.checked })}
                          className="w-4 h-4 rounded text-primary accent-primary"
                        />
                        <span>Aktifkan Background Kotak</span>
                      </label>
                      <span className="text-[10px] font-mono text-stone-400">
                        {currentConfig.showBackground ? 'Aktif' : 'Transparan'}
                      </span>
                    </div>

                    {currentConfig.showBackground && (
                      <div className="pt-2 border-t border-stone-800/60 space-y-3">
                        <UnifiedColorAlphaSlider
                          label="Warna Background Elemen"
                          value={currentConfig.backgroundColor || 'rgba(0, 0, 0, 0.65)'}
                          onChange={(newColor) => handleUpdateSelectedLayerProp({ backgroundColor: newColor })}
                          isDark={isDark}
                        />

                        {/* Padding Slider - Default 0px */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">Padding Ruang Dalam</span>
                            <span className="font-mono text-primary font-bold">{currentConfig.padding ?? 0}px</span>
                          </div>
                          <ThumbDragSlider
                            min={0}
                            max={24}
                            step={1}
                            value={currentConfig.padding ?? 0}
                            onChange={(val) => handleUpdateSelectedLayerProp({ padding: val })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Border Toggle & Controls */}
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.showBorder ?? false}
                          onChange={(e) => handleUpdateSelectedLayerProp({ showBorder: e.target.checked })}
                          className="w-4 h-4 rounded text-primary accent-primary"
                        />
                        <span>Aktifkan Garis Border</span>
                      </label>
                      <span className="text-[10px] font-mono text-stone-400">
                        {currentConfig.showBorder ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>

                    {currentConfig.showBorder && (
                      <div className="pt-2 border-t border-stone-800/60 space-y-3">
                        <UnifiedColorAlphaSlider
                          label="Warna Garis Border"
                          value={currentConfig.borderColor || '#FE9900'}
                          onChange={(newColor) => handleUpdateSelectedLayerProp({ borderColor: newColor })}
                          isDark={isDark}
                        />

                        {/* Border Width */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">Ketebalan Border</span>
                            <span className="font-mono text-primary font-bold">{currentConfig.borderWidth ?? 1}px</span>
                          </div>
                          <ThumbDragSlider
                            min={1}
                            max={8}
                            step={1}
                            value={currentConfig.borderWidth ?? 1}
                            onChange={(val) => handleUpdateSelectedLayerProp({ borderWidth: val })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4-Corner Radius Controls for Element */}
                  {(currentConfig.showBackground || currentConfig.showBorder) && (
                    <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                          <Maximize className="w-3.5 h-3.5 text-primary" /> Sudut Lengkung (Radius) Elemen
                        </span>
                        <button
                          type="button"
                          onClick={() => setLinkElementCorners(!linkElementCorners)}
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            linkElementCorners
                              ? 'border-primary/50 bg-primary/20 text-primary'
                              : 'border-stone-800 text-stone-400 hover:text-white'
                          }`}
                          title={linkElementCorners ? 'Kunci 4 Sudut Bersamaan' : 'Atur Sudut Masing-Masing Bebas'}
                        >
                          {linkElementCorners ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          <span>{linkElementCorners ? 'Terkunci' : 'Bebas (4 Sudut)'}</span>
                        </button>
                      </div>

                      {linkElementCorners ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-stone-400">Radius Seragam</span>
                            <span className="font-mono text-primary font-bold">{currentConfig.borderRadius ?? 6}px</span>
                          </div>
                          <ThumbDragSlider
                            min={0}
                            max={36}
                            step={1}
                            value={currentConfig.borderRadius ?? 6}
                            onChange={(val) => handleElementCornerChange('all', val)}
                          />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-stone-400">Kiri Atas (TL)</span>
                              <span className="font-mono text-primary">
                                {currentConfig.cornerRadii?.topLeft ?? currentConfig.borderRadius ?? 6}px
                              </span>
                            </div>
                            <ThumbDragSlider
                              min={0}
                              max={36}
                              step={1}
                              value={currentConfig.cornerRadii?.topLeft ?? currentConfig.borderRadius ?? 6}
                              onChange={(val) => handleElementCornerChange('topLeft', val)}
                            />
                          </div>

                          <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-stone-400">Kanan Atas (TR)</span>
                              <span className="font-mono text-primary">
                                {currentConfig.cornerRadii?.topRight ?? currentConfig.borderRadius ?? 6}px
                              </span>
                            </div>
                            <ThumbDragSlider
                              min={0}
                              max={36}
                              step={1}
                              value={currentConfig.cornerRadii?.topRight ?? currentConfig.borderRadius ?? 6}
                              onChange={(val) => handleElementCornerChange('topRight', val)}
                            />
                          </div>

                          <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-stone-400">Kiri Bawah (BL)</span>
                              <span className="font-mono text-primary">
                                {currentConfig.cornerRadii?.bottomLeft ?? currentConfig.borderRadius ?? 6}px
                              </span>
                            </div>
                            <ThumbDragSlider
                              min={0}
                              max={36}
                              step={1}
                              value={currentConfig.cornerRadii?.bottomLeft ?? currentConfig.borderRadius ?? 6}
                              onChange={(val) => handleElementCornerChange('bottomLeft', val)}
                            />
                          </div>

                          <div className="p-2 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-stone-400">Kanan Bawah (BR)</span>
                              <span className="font-mono text-primary">
                                {currentConfig.cornerRadii?.bottomRight ?? currentConfig.borderRadius ?? 6}px
                              </span>
                            </div>
                            <ThumbDragSlider
                              min={0}
                              max={36}
                              step={1}
                              value={currentConfig.cornerRadii?.bottomRight ?? currentConfig.borderRadius ?? 6}
                              onChange={(val) => handleElementCornerChange('bottomRight', val)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 1. Quick Alignment Preset Grid */}
              <div className="space-y-2 pt-2 border-t border-stone-800/60">
                <label className="text-xs font-bold flex items-center justify-between">
                  <span>Posisi Alignment Preset (Grid 3×3)</span>
                  <span className="font-mono text-primary text-[11px]">
                    {currentConfig.position || 'center'}
                  </span>
                </label>
                <div className="grid grid-cols-5 gap-1.5 text-xs">
                  {PRESET_ANCHORS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => handleUpdateSelectedLayerProp({ position: pos.id })}
                      className={`p-2 rounded-xl border text-[10px] font-bold transition-all truncate text-center cursor-pointer ${
                        currentConfig.position === pos.id
                          ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                          : isDark
                          ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Free Offset Coordinate Drag Sliders (X & Y) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-primary" /> Offset Horizontal (X)
                    </span>
                    <span className="font-mono text-primary font-bold">
                      {currentConfig.offsetX ?? 0}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbDragSlider
                      min={-200}
                      max={200}
                      step={1}
                      value={currentConfig.offsetX ?? 0}
                      onChange={(val) => handleUpdateSelectedLayerProp({ offsetX: val })}
                    />
                    <button
                      onClick={() => handleUpdateSelectedLayerProp({ offsetX: 0 })}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono bg-stone-800 text-stone-300 hover:text-white cursor-pointer shrink-0"
                      title="Reset X ke 0"
                    >
                      0
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-primary" /> Offset Vertikal (Y)
                    </span>
                    <span className="font-mono text-primary font-bold">
                      {currentConfig.offsetY ?? 0}px
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbDragSlider
                      min={-250}
                      max={250}
                      step={1}
                      value={currentConfig.offsetY ?? 0}
                      onChange={(val) => handleUpdateSelectedLayerProp({ offsetY: val })}
                    />
                    <button
                      onClick={() => handleUpdateSelectedLayerProp({ offsetY: 0 })}
                      className="px-2 py-1 rounded-lg text-[10px] font-mono bg-stone-800 text-stone-300 hover:text-white cursor-pointer shrink-0"
                      title="Reset Y ke 0"
                    >
                      0
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Scale, Opacity & Rotation Drag Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Scale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">Skala / Ukuran</span>
                    <span className="font-mono text-primary font-bold">{normalizedScale}%</span>
                  </div>
                  <ThumbDragSlider
                    min={10}
                    max={300}
                    step={5}
                    value={normalizedScale}
                    onChange={(val) => handleUpdateSelectedLayerProp({ scale: val })}
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">Opasitas</span>
                    <span className="font-mono text-primary font-bold">{normalizedOpacity}%</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={100}
                    step={5}
                    value={normalizedOpacity}
                    onChange={(val) => handleUpdateSelectedLayerProp({ opacity: val })}
                  />
                </div>

                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">Rotasi Derajat</span>
                    <span className="font-mono text-primary font-bold">{currentConfig.rotation ?? 0}°</span>
                  </div>
                  <ThumbDragSlider
                    min={-180}
                    max={180}
                    step={5}
                    value={currentConfig.rotation ?? 0}
                    onChange={(val) => handleUpdateSelectedLayerProp({ rotation: val })}
                  />
                </div>
              </div>

              {/* 4. Visual Filters (Drop Shadow, Glow, Blur, etc.) */}
              <div className="space-y-2 pt-2 border-t border-stone-800/60">
                <label className="text-xs font-bold flex items-center justify-between">
                  <span>Filter & Efek Visual</span>
                  <span className="font-mono text-primary text-[11px]">
                    {currentConfig.filter || 'none'}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {FILTER_PRESETS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleUpdateSelectedLayerProp({ filter: f.id })}
                      className={`p-2 rounded-xl border text-[10px] font-bold text-center transition-all truncate cursor-pointer ${
                        (currentConfig.filter || 'none') === f.id
                          ? 'bg-primary text-on-primary border-primary shadow-xs font-black'
                          : isDark
                          ? 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Custom Color Picker (For text elements or borders) */}
              {selectedLayerInfo.type !== 'custom_image' && (
                <div className="space-y-2 pt-2 border-t border-stone-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Warna Teks / Ikon Elemen</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateSelectedLayerProp({ color: undefined })}
                      className="px-2 py-0.5 rounded-lg border border-stone-800 text-[10px] font-bold text-stone-400 hover:text-white cursor-pointer"
                      title="Gunakan skema warna otomatis dari tema"
                    >
                      Reset Otomatis
                    </button>
                  </div>
                  <UnifiedColorAlphaSlider
                    label="Warna Teks"
                    value={currentConfig.color || '#FFFFFF'}
                    onChange={(newColor) => handleUpdateSelectedLayerProp({ color: newColor })}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: GEOMETRY, SHAPE & BLUR                                         */}
          {/* ===================================================================== */}
          {activeTab === 'geometry' && (
            <div
              className={`p-5 rounded-2xl border space-y-5 ${
                isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Geometri & Bentuk Kartu</h3>
                </div>
                <button
                  onClick={() => setLinkCorners(!linkCorners)}
                  className={`px-3 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    linkCorners
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-stone-800 text-stone-400'
                  }`}
                >
                  {linkCorners ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{linkCorners ? 'Sudut Terkunci' : 'Sudut Bebas'}</span>
                </button>
              </div>

              {/* 4 Corners Matrix with Drag Sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Sudut Kiri Atas</span>
                    <span className="font-mono text-primary">{layoutDraft.cornerRadii?.topLeft ?? 16}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={48}
                    step={1}
                    value={layoutDraft.cornerRadii?.topLeft ?? 16}
                    onChange={(val) => handleCornerChange('topLeft', val)}
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Sudut Kanan Atas</span>
                    <span className="font-mono text-primary">{layoutDraft.cornerRadii?.topRight ?? 16}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={48}
                    step={1}
                    value={layoutDraft.cornerRadii?.topRight ?? 16}
                    onChange={(val) => handleCornerChange('topRight', val)}
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Sudut Kiri Bawah</span>
                    <span className="font-mono text-primary">{layoutDraft.cornerRadii?.bottomLeft ?? 16}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={48}
                    step={1}
                    value={layoutDraft.cornerRadii?.bottomLeft ?? 16}
                    onChange={(val) => handleCornerChange('bottomLeft', val)}
                  />
                </div>

                <div className="space-y-1.5 p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Sudut Kanan Bawah</span>
                    <span className="font-mono text-primary">{layoutDraft.cornerRadii?.bottomRight ?? 16}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={48}
                    step={1}
                    value={layoutDraft.cornerRadii?.bottomRight ?? 16}
                    onChange={(val) => handleCornerChange('bottomRight', val)}
                  />
                </div>
              </div>

              {/* Aspect Ratio, Border Width & Background Blur */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">Rasio Aspek Kartu</label>
                  <select
                    value={layoutDraft.aspectRatio || '2:3'}
                    onChange={(e) => setLayoutDraft((prev) => ({ ...prev, aspectRatio: e.target.value as any }))}
                    className={`w-full p-2.5 rounded-xl border text-xs font-bold ${
                      isDark ? 'bg-stone-950 border-stone-800 text-white' : 'bg-white border-stone-200'
                    }`}
                  >
                    <option value="2:3">2:3 (Standar Portrait)</option>
                    <option value="3:4">3:4 (Populer / Proporsional)</option>
                    <option value="1:1">1:1 (Persegi Square)</option>
                    <option value="9:16">9:16 (Vertikal Sinematik)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Ketebalan Border</span>
                    <span className="font-mono text-primary">{layoutDraft.borderWidth ?? 1}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={6}
                    step={1}
                    value={layoutDraft.borderWidth ?? 1}
                    onChange={(val) => setLayoutDraft((prev) => ({ ...prev, borderWidth: val }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Backdrop Blur</span>
                    <span className="font-mono text-primary">{layoutDraft.cardBackdropBlur ?? 12}px</span>
                  </div>
                  <ThumbDragSlider
                    min={0}
                    max={32}
                    step={1}
                    value={layoutDraft.cardBackdropBlur ?? 12}
                    onChange={(val) => setLayoutDraft((prev) => ({ ...prev, cardBackdropBlur: val }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: PRESETS & TEMPLATES                                            */}
          {/* ===================================================================== */}
          {activeTab === 'presets' && (
            <div
              className={`p-5 rounded-2xl border space-y-5 ${
                isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold">Pilihan Template & Preset Bawaan</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CARD_THEME_DEFINITIONS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.01] cursor-pointer ${
                      isDark
                        ? 'border-stone-800 bg-stone-950/60 hover:border-primary/50 text-stone-300'
                        : 'border-stone-200 bg-stone-50 hover:border-primary/50 text-stone-800'
                    }`}
                  >
                    <div className="font-bold text-xs truncate flex items-center justify-between">
                      <span>{preset.name}</span>
                      <span className="text-[10px] font-mono font-bold text-primary">Muat</span>
                    </div>
                    <div className="text-[10px] text-stone-400 line-clamp-2 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
