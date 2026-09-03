import JSZip from 'jszip';
import { CardThemeDefinition, CardThemeLayoutConfig, CardTheme, CARD_THEMES, CardThemeAssets } from '../types';

export interface CardThemeExportFile {
  type: 'talent_rating_card_theme';
  version: string;
  id: string;
  name: string;
  badge: string;
  description: string;
  category: string;
  accentColor: string;
  icon: string;
  aspectRatio?: string;
  assets?: CardThemeAssets;
  layoutOffsets?: CardThemeLayoutConfig['layoutOffsets'];
  typography?: CardThemeLayoutConfig['typography'];
  layoutConfig: CardThemeLayoutConfig;
  exportedAt: string;
  sourceApp?: string;
}

export interface ParseCardThemeResult {
  success: boolean;
  theme?: CardThemeDefinition;
  error?: string;
}

/**
 * Converts a Data URI or image Blob to a binary ArrayBuffer.
 */
function dataUriToUint8Array(dataUri: string): { data: Uint8Array; mime: string; ext: string } | null {
  try {
    const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    let ext = 'png';
    if (mime.includes('svg')) ext = 'svg';
    else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('gif')) ext = 'gif';
    return { data: bytes, mime, ext };
  } catch {
    return null;
  }
}

/**
 * Builds standard export payload from a theme definition.
 */
export function buildCardThemePayload(theme: CardThemeDefinition): CardThemeExportFile {
  const cfg = theme.layoutConfig || ({} as Partial<CardThemeLayoutConfig>);
  const mergedAssets = theme.assets || cfg.assets;
  const mergedOffsets = theme.layoutOffsets || cfg.layoutOffsets;
  const mergedTypography = theme.typography || cfg.typography;
  const mergedAspectRatio = theme.aspectRatio || cfg.aspectRatio || '3:4';

  return {
    type: 'talent_rating_card_theme',
    version: theme.version || '1.0.0',
    id: theme.id,
    name: theme.name,
    badge: theme.badge || 'CUSTOM',
    description: theme.description || 'Tema visual kartu kustom.',
    category: theme.category || 'Custom Layout',
    accentColor: theme.accentColor || '#FE9900',
    icon: theme.icon || 'Sparkles',
    aspectRatio: mergedAspectRatio,
    assets: mergedAssets,
    layoutOffsets: mergedOffsets,
    typography: mergedTypography,
    layoutConfig: {
      cardShape: cfg.cardShape || 'standard',
      thumbnailShape: cfg.thumbnailShape || 'full_bleed',
      thumbnailScale: cfg.thumbnailScale || 'cover',
      thumbnailPosition: cfg.thumbnailPosition || 'top',
      informationLayout: cfg.informationLayout || 'overlay',
      aspectRatio: mergedAspectRatio,
      assets: mergedAssets,
      layoutOffsets: mergedOffsets,
      typography: mergedTypography,
      ratingPosition: cfg.ratingPosition || cfg.headerPosition || 'top_right',
      namePosition: cfg.namePosition || cfg.footerPosition || 'bottom_center',
      bodyTypePosition: cfg.bodyTypePosition || 'top_left',
      countryPosition: cfg.countryPosition || 'top_right',
      measurementPosition: cfg.measurementPosition || 'bottom_center',
      ornamentPosition: cfg.ornamentPosition || 'none',
      sectionDivider: cfg.sectionDivider || 'none',
      headerPosition: cfg.headerPosition || 'split_top',
      footerPosition: cfg.footerPosition || 'bottom_center',
      scoreDisplay: cfg.scoreDisplay || 'prominent',
      nameAlignment: cfg.nameAlignment || 'center',
      nameStyle: cfg.nameStyle || 'stacked',
      showBwh: Boolean(cfg.showBwh),
      showAge: Boolean(cfg.showAge),
      showMaturity: Boolean(cfg.showMaturity),
      showRankBadge: cfg.showRankBadge !== false,
      showAppImpScore: cfg.showAppImpScore !== false,
      showHeight: cfg.showHeight !== false,
      showCupSize: cfg.showCupSize !== false,
      ornamentStyle: cfg.ornamentStyle || 'none',
      borderWidth: typeof cfg.borderWidth === 'number' ? cfg.borderWidth : 2,
      borderRadius: cfg.borderRadius !== undefined ? cfg.borderRadius : undefined,
      glassmorphism: cfg.glassmorphism !== false,
      themeColorMode: cfg.themeColorMode || 'custom',
      customBorderColor: cfg.customBorderColor || theme.accentColor,
      gradientOverlay: cfg.gradientOverlay || 'dark_top_bottom',
      ...cfg,
    },
    exportedAt: new Date().toISOString(),
    sourceApp: 'Talent Rating System',
  };
}

/**
 * Export a single card theme definition as a downloadable JSON file.
 */
export function exportCardThemeAsJSON(theme: CardThemeDefinition): void {
  const safeSlug = (theme.name || 'custom-theme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const exportPayload = buildCardThemePayload(theme);
  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `card-theme-${safeSlug}-${Date.now()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Export a card theme as a complete, bundled ZIP archive containing theme.json and asset images.
 */
export async function exportCardThemeAsZIP(theme: CardThemeDefinition): Promise<void> {
  const safeSlug = (theme.name || 'custom-theme')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');
  const payload = buildCardThemePayload(theme);
  const zipAssets = { ...(payload.assets || {}) };

  // Helper to extract Data URI into a standalone file inside the zip
  const processAsset = (key: keyof CardThemeAssets, filenamePrefix: string) => {
    const val = zipAssets[key];
    if (val && typeof val === 'string' && val.startsWith('data:image/')) {
      const parsed = dataUriToUint8Array(val);
      if (parsed && assetsFolder) {
        const assetFilename = `${filenamePrefix}.${parsed.ext}`;
        assetsFolder.file(assetFilename, parsed.data);
        zipAssets[key] = `./assets/${assetFilename}`;
      }
    }
  };

  processAsset('textureUrl', 'texture');
  processAsset('symbolUrl', 'symbol');
  processAsset('bannerUrl', 'banner');
  processAsset('emblemUrl', 'emblem');
  processAsset('borderFrameUrl', 'border-frame');
  processAsset('backgroundImageUrl', 'background');
  processAsset('overlayPatternUrl', 'overlay-pattern');
  processAsset('customBadgeIconUrl', 'badge-icon');
  processAsset('watermarkUrl', 'watermark');
  processAsset('frameMaskUrl', 'frame-mask');

  const zipPayload = {
    ...payload,
    assets: zipAssets,
    layoutConfig: {
      ...payload.layoutConfig,
      assets: zipAssets,
    },
  };

  zip.file('theme.json', JSON.stringify(zipPayload, null, 2));

  // Add a helpful README.md
  zip.file(
    'README.md',
    `# Paket Tema Card: ${theme.name}
**ID:** \`${theme.id}\`
**Versi:** \`${theme.version || '1.0.0'}\`
**Kategori:** ${theme.category || 'Custom Theme'}

## Struktur Folder:
- \`theme.json\` : Berisi definisi konfigurasi tata letak, warna, tipografi, dan referensi aset kartu.
- \`assets/\` : Folder gambar latar belakang, ikon lencana kustom, pola overlay, dan watermark.

## Cara Mengedit & Mengimpor:
1. Anda dapat mengganti gambar di dalam folder \`assets/\` (gunakan format PNG, SVG, JPG, atau WebP).
2. Sesuaikan konfigurasi di \`theme.json\`.
3. Kompres kembali menjadi file \`.zip\` atau impor langsung melalui menu **Pengaturan > Tema Card > Impor Tema (.zip / .json)** di aplikasi!
`
  );

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `card-theme-${safeSlug}-bundle.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Parses and validates a card theme JSON string.
 */
export function parseCardThemeJSON(jsonString: string): ParseCardThemeResult {
  if (!jsonString || typeof jsonString !== 'string' || !jsonString.trim()) {
    return {
      success: false,
      error: 'File JSON kosong atau tidak valid.',
    };
  }

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      success: false,
      error: `Format JSON tidak valid: ${err.message || 'Syntax error'}`,
    };
  }

  // Type verification
  if (data.type !== 'talent_rating_card_theme') {
    return {
      success: false,
      error:
        'Tipe file JSON tidak dikenali. File harus memiliki atribut "type": "talent_rating_card_theme".',
    };
  }

  // Version verification
  if (!data.version || typeof data.version !== 'string') {
    return {
      success: false,
      error: 'Versi file tema tidak ditemukan. Format tema membutuhkan atribut "version".',
    };
  }

  // Name validation
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return {
      success: false,
      error: 'Tema harus memiliki "name" yang valid.',
    };
  }

  // Layout config extraction & robust normalization with intelligent fallbacks
  const rawConfig = data.layoutConfig || {};
  const fallbackHeader = rawConfig.headerPosition || 'split_top';
  const fallbackFooter = rawConfig.footerPosition || 'bottom_center';

  const extractedAssets: CardThemeAssets = {
    ...(data.assets || {}),
    ...(rawConfig.assets || {}),
  };
  const extractedOffsets = data.layoutOffsets || rawConfig.layoutOffsets || {};
  const extractedTypography = data.typography || rawConfig.typography || {};
  const extractedAspectRatio = data.aspectRatio || rawConfig.aspectRatio || '3:4';

  const cleanLayoutConfig: CardThemeLayoutConfig = {
    ...rawConfig,
    cardShape: rawConfig.cardShape || 'standard',
    thumbnailShape: rawConfig.thumbnailShape || 'full_bleed',
    thumbnailScale: rawConfig.thumbnailScale || 'cover',
    thumbnailPosition: rawConfig.thumbnailPosition || 'top',
    aspectRatio: extractedAspectRatio,
    informationLayout:
      rawConfig.informationLayout ||
      (fallbackFooter === 'bottom_full'
        ? 'split'
        : fallbackHeader === 'floating_pills'
        ? 'floating'
        : rawConfig.scoreDisplay === 'hud_rail'
        ? 'side_by_side'
        : 'overlay'),
    assets: extractedAssets,
    layoutOffsets: extractedOffsets,
    typography: extractedTypography,
    ratingPosition: rawConfig.ratingPosition || 'top_right',
    namePosition: rawConfig.namePosition || 'bottom_center',
    bodyTypePosition: rawConfig.bodyTypePosition || 'top_left',
    countryPosition: rawConfig.countryPosition || 'top_right',
    measurementPosition: rawConfig.measurementPosition || 'bottom_center',
    ornamentPosition: rawConfig.ornamentPosition || 'none',
    sectionDivider: rawConfig.sectionDivider || 'none',
    headerPosition: fallbackHeader,
    footerPosition: fallbackFooter,
    scoreDisplay: rawConfig.scoreDisplay || 'prominent',
    nameAlignment: rawConfig.nameAlignment || 'center',
    nameStyle: rawConfig.nameStyle || 'stacked',
    showBwh: Boolean(rawConfig.showBwh),
    showAge: Boolean(rawConfig.showAge),
    showMaturity: Boolean(rawConfig.showMaturity),
    showRankBadge: rawConfig.showRankBadge !== false,
    showAppImpScore: rawConfig.showAppImpScore !== false,
    showHeight: rawConfig.showHeight !== false,
    showCupSize: rawConfig.showCupSize !== false,
    ornamentStyle: rawConfig.ornamentStyle || 'none',
    borderWidth: typeof rawConfig.borderWidth === 'number' ? rawConfig.borderWidth : 2,
    borderRadius: rawConfig.borderRadius,
    glassmorphism: rawConfig.glassmorphism !== false,
    themeColorMode: rawConfig.themeColorMode === 'type_based' ? 'type_based' : 'custom',
    customBorderColor: typeof rawConfig.customBorderColor === 'string' ? rawConfig.customBorderColor : data.accentColor,
    gradientOverlay: rawConfig.gradientOverlay || 'dark_top_bottom',
  };

  const rawId = typeof data.id === 'string' && data.id.trim() ? data.id.trim() : '';
  const isBuiltIn = CARD_THEMES.some((t) => t.id === rawId);
  const themeId = isBuiltIn || !rawId ? `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` : rawId;

  const validTheme: CardThemeDefinition = {
    type: 'talent_rating_card_theme',
    version: data.version,
    id: themeId,
    name: data.name.trim(),
    badge: (data.badge || 'IMPORTED').trim().toUpperCase(),
    description: (data.description || 'Tema card hasil impor.').trim(),
    category: (data.category || 'Imported Theme').trim(),
    accentColor: /^#[0-9A-Fa-f]{6}$/.test(data.accentColor) ? data.accentColor.toUpperCase() : '#FE9900',
    icon: typeof data.icon === 'string' && data.icon.trim() ? data.icon.trim() : 'Sparkles',
    aspectRatio: extractedAspectRatio,
    assets: extractedAssets,
    layoutOffsets: extractedOffsets,
    typography: extractedTypography,
    layoutConfig: cleanLayoutConfig,
    isCustom: true,
    createdAt: data.exportedAt || new Date().toISOString(),
  };

  return {
    success: true,
    theme: validTheme,
  };
}

/**
 * Extracts and parses a .zip theme package, resolving internal asset files into Data URIs.
 */
export async function parseCardThemeFromZIP(zipFile: File | Blob): Promise<ParseCardThemeResult> {
  try {
    const zip = await JSZip.loadAsync(zipFile);

    // 1. Locate theme.json or any *.json in root or subdirectory
    let themeJsonFile: JSZip.JSZipObject | null = zip.file('theme.json');
    if (!themeJsonFile) {
      const jsonEntries = Object.keys(zip.files).filter(
        (path) => path.toLowerCase().endsWith('.json') && !path.includes('__MACOSX')
      );
      if (jsonEntries.length > 0) {
        themeJsonFile = zip.file(jsonEntries[0]);
      }
    }

    if (!themeJsonFile) {
      return {
        success: false,
        error: 'File tema "theme.json" tidak ditemukan di dalam arsip ZIP.',
      };
    }

    const jsonText = await themeJsonFile.async('text');
    const parseResult = parseCardThemeJSON(jsonText);
    if (!parseResult.success || !parseResult.theme) {
      return parseResult;
    }

    const theme = parseResult.theme;
    const assets = { ...(theme.assets || {}) };

    // Helper to resolve relative asset paths into base64 Data URIs from the zip
    const resolveAssetFile = async (val?: string): Promise<string | undefined> => {
      if (!val || typeof val !== 'string') return undefined;
      // If already Data URI or full HTTPS URL, return as is
      if (val.startsWith('data:image/') || val.startsWith('https://') || val.startsWith('http://')) {
        return val;
      }

      // Clean relative path (e.g. "./assets/badge.png" -> "assets/badge.png")
      const cleanPath = val.replace(/^\.?\//, '');
      let fileEntry = zip.file(cleanPath);

      if (!fileEntry) {
        // Try searching inside assets/ folder or by filename
        const filename = cleanPath.split('/').pop() || cleanPath;
        const matchingPath = Object.keys(zip.files).find(
          (p) => p.endsWith(filename) && !p.includes('__MACOSX')
        );
        if (matchingPath) {
          fileEntry = zip.file(matchingPath);
        }
      }

      if (fileEntry) {
        const lower = fileEntry.name.toLowerCase();
        let mime = 'image/png';
        if (lower.endsWith('.svg')) mime = 'image/svg+xml';
        else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mime = 'image/jpeg';
        else if (lower.endsWith('.webp')) mime = 'image/webp';
        else if (lower.endsWith('.gif')) mime = 'image/gif';

        const base64Data = await fileEntry.async('base64');
        return `data:${mime};base64,${base64Data}`;
      }

      return val;
    };

    // Auto-discover common asset names in zip if not explicitly set
    const findAssetByKeywords = async (keywords: string[]): Promise<string | undefined> => {
      const match = Object.keys(zip.files).find((p) => {
        const lower = p.toLowerCase();
        return (
          !p.includes('__MACOSX') &&
          keywords.some((kw) => lower.includes(kw)) &&
          (lower.endsWith('.png') || lower.endsWith('.svg') || lower.endsWith('.jpg') || lower.endsWith('.webp'))
        );
      });
      if (match) {
        return resolveAssetFile(match);
      }
      return undefined;
    };

    assets.textureUrl =
      (await resolveAssetFile(assets.textureUrl)) ||
      (await findAssetByKeywords(['texture', 'pola', 'mesh']));
    assets.symbolUrl =
      (await resolveAssetFile(assets.symbolUrl)) ||
      (await findAssetByKeywords(['symbol', 'crest', 'seal', 'logo-symbol']));
    assets.bannerUrl =
      (await resolveAssetFile(assets.bannerUrl)) ||
      (await findAssetByKeywords(['banner', 'ribbon', 'header-ribbon']));
    assets.emblemUrl =
      (await resolveAssetFile(assets.emblemUrl)) ||
      (await findAssetByKeywords(['emblem', 'medal', 'insignia']));
    assets.borderFrameUrl =
      (await resolveAssetFile(assets.borderFrameUrl)) ||
      (await findAssetByKeywords(['border', 'frame', 'border-frame', 'bingkai']));
    assets.backgroundImageUrl =
      (await resolveAssetFile(assets.backgroundImageUrl)) ||
      (await findAssetByKeywords(['background', 'bg']));
    assets.overlayPatternUrl =
      (await resolveAssetFile(assets.overlayPatternUrl)) ||
      (await findAssetByKeywords(['pattern', 'overlay']));
    assets.customBadgeIconUrl =
      (await resolveAssetFile(assets.customBadgeIconUrl)) ||
      (await findAssetByKeywords(['badge', 'icon', 'vip', 'star', 'crown']));
    assets.watermarkUrl =
      (await resolveAssetFile(assets.watermarkUrl)) ||
      (await findAssetByKeywords(['watermark']));
    assets.frameMaskUrl =
      (await resolveAssetFile(assets.frameMaskUrl)) ||
      (await findAssetByKeywords(['mask', 'frame-mask']));

    theme.assets = assets;
    if (theme.layoutConfig) {
      theme.layoutConfig.assets = assets;
    }

    return {
      success: true,
      theme,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Gagal membaca file ZIP: ${err.message || 'Format arsip rusak atau tidak didukung.'}`,
    };
  }
}

/**
 * Universal file importer: automatically detects .zip or .json format and imports the theme.
 */
export async function importCardThemeFromFile(file: File): Promise<ParseCardThemeResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.zip')) {
    return parseCardThemeFromZIP(file);
  }
  if (name.endsWith('.json')) {
    const text = await file.text();
    return parseCardThemeJSON(text);
  }
  return {
    success: false,
    error: 'Format file tidak didukung. Harap pilih file paket .zip atau file konfigurasi .json.',
  };
}

/**
 * Finds a theme definition by ID across built-ins and custom themes.
 */
export function getThemeDefinitionById(
  themeId: CardTheme,
  customThemes: CardThemeDefinition[] = []
): CardThemeDefinition {
  const custom = customThemes.find((t) => t.id === themeId);
  if (custom) return custom;

  const builtin = CARD_THEMES.find((t) => t.id === themeId);
  if (builtin) return builtin;

  return CARD_THEMES[0];
}
