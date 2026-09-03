import React, { CSSProperties } from 'react';
import {
  CardThemeDefinition,
  CardThemeLayoutConfig,
  CardTheme,
  CardThemeAssets,
  CardThemeLayoutOffsets,
  CardThemeTypography,
  UniversalCardElementId,
  CardElementPropertyConfig,
  CardCustomImageAsset,
  CardCustomTextAsset,
  CARD_THEMES,
} from '../types';

/**
 * Resolved layout and visual styling configuration for ArtistCard.
 * Precomputed and cached to avoid redundant calculations during list scrolling.
 */
export interface ResolvedCardLayout {
  themeColor: string;
  cardShapeClass: string;
  chamferClipStyle: CSSProperties;
  thumbnailImgClass: string;
  dividerClass: string;
  panelBgClass: string;
  borderWidth: number;
  borderRadius?: number | string;
  cardBgOpacity?: number;
  cardBackdropBlur?: number;
  customBorderColor?: string;

  // Asset Handling & Masking
  assets: CardThemeAssets;
  aspectRatio?: string;
  frameMaskUrl?: string;
  maskShape?: string;

  // Advanced Layout Offsets (Coordinate Grid)
  layoutOffsets: CardThemeLayoutOffsets;

  // Custom Typography & Text Colors
  typography: CardThemeTypography;

  // Layer hierarchy, custom images & custom texts
  layerOrder?: string[];
  customImages?: CardCustomImageAsset[];
  customTexts?: CardCustomTextAsset[];

  // Universal Element Registry (Single Reactive Engine for Granular Objects)
  elements: Record<string, CardElementPropertyConfig>;

  // Visibility Flags
  canShowRank: boolean;
  canShowBwh: boolean;
  canShowAge: boolean;
  canShowMaturity: boolean;
  canShowAppImp: boolean;
  canShowHeight: boolean;
  canShowCupSize: boolean;

  // Structural & Placement Properties
  cardShape: string;
  thumbnailShape: string;
  infoLayout: string;
  scoreDisplay: string;
  ratingPos: string;
  namePos: string;
  bodyTypePos: string;
  countryPos: string;
  measurementPos: string;
  nameAlign: 'left' | 'right' | 'center';
  nameStyle: string;
  ornamentStyle: string;
  gradientOverlay: string;
  glassmorphism: boolean;
  headerPos: string;
  footerPos: string;
}

// Global in-memory cache for resolved card layouts
// Key format: `${themeDef.id}_${themeDef.version || '1'}_${density}_${isSpecial ? '1' : '0'}`
const layoutCache = new Map<string, ResolvedCardLayout>();

// Theme definitions lookup map cache
const themeDefCache = new Map<string, CardThemeDefinition>();

// Initialize built-in themes into cache
CARD_THEMES.forEach(t => {
  themeDefCache.set(t.id, t);
});

/**
 * Register or update theme definitions in the lookup cache.
 */
export function registerThemeDefinitions(themes: CardThemeDefinition[]): void {
  themes.forEach(t => {
    themeDefCache.set(t.id, t);
  });
}

/**
 * Fast O(1) theme definition retriever with fallback.
 */
export function getCachedThemeDefinition(
  themeId?: CardTheme,
  customThemes?: CardThemeDefinition[]
): CardThemeDefinition {
  const id = themeId || 'default';

  // Check custom themes first if provided
  if (customThemes && customThemes.length > 0) {
    const custom = customThemes.find(t => t.id === id);
    if (custom) return custom;
  }

  // Lookup in cache
  const cached = themeDefCache.get(id);
  if (cached) return cached;

  // Fallback to default theme
  return CARD_THEMES[0];
}

/**
 * Resolves all card layout, styling, and visibility flags with caching.
 * Guaranteed to return identical object reference if parameters have not changed.
 */
export function getResolvedCardLayout(
  themeDef: CardThemeDefinition,
  density: 2 | 3 | 4 = 2,
  isSpecial: boolean = false
): ResolvedCardLayout {
  const themeId = themeDef?.id || 'default';
  const themeVersion = themeDef?.version || '1.0.0';
  const isCustomTheme = Boolean(
    themeDef?.isCustom ||
    themeId.startsWith('custom_') ||
    themeId === 'custom_studio_preview' ||
    themeDef?.layoutConfig ||
    themeDef?.layout
  );
  const cacheKey = `${themeId}__${themeVersion}__${density}__${isSpecial ? '1' : '0'}`;

  if (!isCustomTheme) {
    const existing = layoutCache.get(cacheKey);
    if (existing) {
      return existing;
    }
  }

  const config: CardThemeLayoutConfig = {
    ...(themeDef?.layout || {}),
    ...(themeDef?.layoutConfig || {}),
  };

  // Theme color resolving
  const baseThemeColor = isSpecial ? '#00BCD5' : '#FECDD2';
  const themeColor =
    config.themeColorMode === 'custom' && (config.customBorderColor || themeDef?.accentColor)
      ? config.customBorderColor || themeDef.accentColor
      : config.customBorderColor || themeDef?.accentColor || baseThemeColor;

  // Density flags
  const isCompact = density >= 3;
  const isUltraCompact = density >= 4;

  // Assets & Media resolving
  const assets: CardThemeAssets = {
    ...(themeDef?.assets || {}),
    ...(config.assets || {}),
  };

  const aspectRatio = config.aspectRatio || 'auto';
  const frameMaskUrl = assets.frameMaskUrl || config.frameMaskUrl;
  const maskShape = config.maskShape || 'none';

  // Layout Offsets & Coordinate adjustments
  const layoutOffsets: CardThemeLayoutOffsets = config.layoutOffsets || {};

  // Typography & Custom Colors
  const typography: CardThemeTypography = {
    nameFontSize: config.typography?.nameFontSize,
    nameFontWeight: config.typography?.nameFontWeight,
    primaryTextColor: config.typography?.primaryTextColor,
    secondaryTextColor: config.typography?.secondaryTextColor,
    scoreTextColor: config.typography?.scoreTextColor,
    fontFamily: config.typography?.fontFamily,
    ...(config.typography || {}),
  };

  // Layout resolution & Fallbacks
  const cardShape = config.cardShape || 'standard';
  const thumbnailShape = config.thumbnailShape || 'full_bleed';
  const thumbnailScale = config.thumbnailScale || 'cover';
  const thumbnailPosition = config.thumbnailPosition || 'top';
  const infoLayout = config.informationLayout || 'overlay';

  const headerPos = config.headerPosition || 'top_right';
  const footerPos = config.footerPosition || 'bottom_center';
  const scoreDisplay = config.scoreDisplay || 'prominent';

  // Specific position resolving with intelligent fallbacks
  const ratingPos =
    config.ratingPosition ||
    (headerPos === 'split_top' || headerPos === 'floating_pills' ? 'top_right' : headerPos);
  const namePos =
    config.namePosition ||
    (footerPos === 'bottom_left'
      ? 'bottom_left'
      : footerPos === 'bottom_right'
      ? 'bottom_right'
      : 'bottom_center');
  const bodyTypePos =
    config.bodyTypePosition ||
    (headerPos === 'split_top' || headerPos === 'floating_pills'
      ? 'top_left'
      : ratingPos === 'top_left'
      ? 'top_right'
      : 'top_right');
  const countryPos =
    config.countryPosition ||
    (headerPos === 'split_top' || headerPos === 'floating_pills'
      ? 'top_left'
      : ratingPos === 'top_left'
      ? 'top_right'
      : 'top_right');
  const measurementPos =
    config.measurementPosition ||
    (scoreDisplay === 'hud_rail' ? 'side_rail' : 'bottom_center');

  let nameAlign: 'left' | 'right' | 'center' = 'center';
  if (config.nameAlignment === 'left') {
    nameAlign = 'left';
  } else if (config.nameAlignment === 'right') {
    nameAlign = 'right';
  } else if (config.nameAlignment === 'center') {
    nameAlign = 'center';
  } else if (namePos === 'bottom_left' || namePos === 'top_left') {
    nameAlign = 'left';
  } else if (namePos === 'bottom_right' || namePos === 'top_right') {
    nameAlign = 'right';
  }

  const nameStyle = config.nameStyle || 'stacked';
  const dividerStyle = config.sectionDivider || 'none';
  const ornamentStyle = config.ornamentStyle || 'none';
  const gradientOverlay = config.gradientOverlay || 'dark_top_bottom';
  const glassmorphism = config.glassmorphism !== false;
  const borderWidth = typeof config.borderWidth === 'number' ? config.borderWidth : 2;

  // Visibility Flags
  const canShowRank = config.showRankBadge !== false;
  const canShowBwh = Boolean(config.showBwh) && !isUltraCompact;
  const canShowAge = Boolean(config.showAge) && !isUltraCompact;
  const canShowMaturity = Boolean(config.showMaturity) && !isCompact;
  const canShowAppImp = config.showAppImpScore !== false && !isUltraCompact;
  const canShowHeight = config.showHeight !== false;
  const canShowCupSize = config.showCupSize !== false;

  // High-performance card panel background (avoids GPU-heavy backdrop-blur on moving cards during scroll)
  const panelBgClass = glassmorphism
    ? 'bg-black/85 border shadow-lg'
    : 'bg-stone-950/95 border shadow-xl';

  // Card Shape styling classes
  let cardShapeClass = 'rounded-2xl';
  switch (cardShape) {
    case 'rounded':
      cardShapeClass = 'rounded-3xl';
      break;
    case 'square':
      cardShapeClass = 'rounded-none';
      break;
    case 'pill':
      cardShapeClass = 'rounded-[32px] sm:rounded-[38px]';
      break;
    case 'asymmetric':
      cardShapeClass = 'rounded-tl-sm rounded-br-sm rounded-tr-3xl rounded-bl-3xl';
      break;
    case 'arch':
      cardShapeClass = 'rounded-t-[36px] sm:rounded-t-[44px] rounded-b-md';
      break;
    case 'chamfer':
      cardShapeClass = 'rounded-none';
      break;
    case 'standard':
    default:
      cardShapeClass = 'rounded-2xl';
      break;
  }

  const chamferClipStyle: CSSProperties =
    cardShape === 'chamfer'
      ? {
          clipPath:
            'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
        }
      : {};

  // Thumbnail Container & Image shape styling
  let scaleClass = 'object-cover';
  if (thumbnailScale === 'contain') scaleClass = 'object-contain';
  else if (thumbnailScale === 'zoom') scaleClass = 'object-cover scale-110 group-hover:scale-115';
  else if (thumbnailScale === 'fit') scaleClass = 'object-fill';
  else scaleClass = 'object-cover group-hover:scale-105';

  let posClass = 'object-top';
  if (thumbnailPosition === 'center') posClass = 'object-center';
  else if (thumbnailPosition === 'bottom') posClass = 'object-bottom';

  const thumbnailImgClass = `w-full h-full ${scaleClass} ${posClass} transition-transform duration-500`;

  // Section divider border style
  let dividerClass = 'mt-1';
  switch (dividerStyle) {
    case 'subtle_line':
      dividerClass = 'border-t border-white/20 my-1 pt-1';
      break;
    case 'glowing':
      dividerClass = 'border-t my-1.5 pt-1.5 shadow-[0_-1px_6px_rgba(254,153,0,0.4)]';
      break;
    case 'dashed':
      dividerClass = 'border-t border-dashed border-white/30 my-1 pt-1';
      break;
    case 'pill_border':
      dividerClass = 'border-t border-amber-400/40 my-1 pt-1';
      break;
    case 'none':
    default:
      dividerClass = 'mt-1';
      break;
  }

  // 4-Corner Radius & Border resolution
  let computedBorderRadius: string | number | undefined = config.borderRadius;
  if (config.cornerRadii) {
    const tl = config.cornerRadii.topLeft ?? 0;
    const tr = config.cornerRadii.topRight ?? 0;
    const br = config.cornerRadii.bottomRight ?? 0;
    const bl = config.cornerRadii.bottomLeft ?? 0;
    computedBorderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  }

  // Build Universal Element Registry with fallback to macro settings
  const rawElements = config.elements || config.elementRegistry || {};

  const getRawElem = (...keys: string[]): CardElementPropertyConfig | undefined => {
    for (const k of keys) {
      if (rawElements[k]) return rawElements[k];
    }
    return undefined;
  };

  const rawOverall = getRawElem('overallRating', 'rating');
  const rawFirstName = getRawElem('firstName', 'first_name');
  const rawLastName = getRawElem('lastName', 'last_name');
  const rawThumbnail = getRawElem('thumbnail', 'photo', 'image');
  const rawAppScore = getRawElem('appearanceScore', 'appScore', 'appearance');
  const rawImpScore = getRawElem('impressionScore', 'impScore', 'impression');
  const rawStatus = getRawElem('artistStatus', 'status');
  const rawBodyType = getRawElem('bodyType', 'bodyTypeCode');
  const rawCountry = getRawElem('country', 'countryFlag');
  const rawCup = getRawElem('cupSize', 'cup');
  const rawBwh = getRawElem('measurementsBWH', 'bwh', 'measurements');
  const rawAge = getRawElem('age', 'ageHeight');
  const rawMaturity = getRawElem('maturity');
  const rawCustomBadge = getRawElem('customLogoBadge', 'badge', 'logo');

  const resolvedElements: Record<string, CardElementPropertyConfig> = {
    thumbnail: {
      visible: rawThumbnail?.visible !== undefined ? rawThumbnail.visible : true,
      position: rawThumbnail?.position || 'center',
      offsetX: rawThumbnail?.offsetX ?? 0,
      offsetY: rawThumbnail?.offsetY ?? 0,
      scale: rawThumbnail?.scale ?? 1.0,
      zIndex: rawThumbnail?.zIndex ?? 5,
      opacity: rawThumbnail?.opacity ?? 100,
      rotation: rawThumbnail?.rotation ?? 0,
      filter: rawThumbnail?.filter || 'none',
      ...(rawThumbnail || {}),
    },
    firstName: {
      visible: rawFirstName?.visible !== undefined ? rawFirstName.visible : true,
      position: rawFirstName?.position || namePos || 'bottom_left',
      fontSize: rawFirstName?.fontSize || typography.nameFontSize || 'md',
      fontWeight: (rawFirstName?.fontWeight || typography.nameFontWeight || 'bold') as any,
      color: rawFirstName?.color || typography.primaryTextColor,
      offsetX: rawFirstName?.offsetX ?? layoutOffsets.nameOffset?.x ?? 0,
      offsetY: rawFirstName?.offsetY ?? layoutOffsets.nameOffset?.y ?? 0,
      scale: rawFirstName?.scale ?? 1.0,
      zIndex: rawFirstName?.zIndex ?? 10,
      padding: rawFirstName?.padding ?? 0,
      ...(rawFirstName || {}),
    },
    lastName: {
      visible: rawLastName?.visible !== undefined ? rawLastName.visible : true,
      position: rawLastName?.position || namePos || 'bottom_left',
      fontSize: rawLastName?.fontSize || typography.nameFontSize || 'md',
      fontWeight: (rawLastName?.fontWeight || 'normal') as any,
      color: rawLastName?.color || typography.secondaryTextColor,
      offsetX: rawLastName?.offsetX ?? layoutOffsets.nameOffset?.x ?? 0,
      offsetY: rawLastName?.offsetY ?? layoutOffsets.nameOffset?.y ?? 0,
      scale: rawLastName?.scale ?? 1.0,
      zIndex: rawLastName?.zIndex ?? 10,
      padding: rawLastName?.padding ?? 0,
      ...(rawLastName || {}),
    },
    overallRating: {
      visible: rawOverall?.visible !== undefined ? rawOverall.visible : ratingPos !== 'hidden',
      position: rawOverall?.position || ratingPos || 'top_right',
      color: rawOverall?.color || typography.scoreTextColor || themeColor,
      offsetX: rawOverall?.offsetX ?? layoutOffsets.ratingOffset?.x ?? 0,
      offsetY: rawOverall?.offsetY ?? layoutOffsets.ratingOffset?.y ?? 0,
      scale: rawOverall?.scale ?? 1.0,
      zIndex: rawOverall?.zIndex ?? 20,
      fontSize: rawOverall?.fontSize || 'sm',
      padding: rawOverall?.padding ?? 0,
      ...(rawOverall || {}),
    },
    appearanceScore: {
      visible: rawAppScore?.visible !== undefined ? rawAppScore.visible : canShowAppImp,
      position: rawAppScore?.position || 'with_score',
      color: rawAppScore?.color || typography.scoreTextColor,
      offsetX: rawAppScore?.offsetX ?? 0,
      offsetY: rawAppScore?.offsetY ?? 0,
      scale: rawAppScore?.scale ?? 1.0,
      zIndex: rawAppScore?.zIndex ?? 10,
      fontSize: rawAppScore?.fontSize || 'xs',
      ...(rawAppScore || {}),
    },
    impressionScore: {
      visible: rawImpScore?.visible !== undefined ? rawImpScore.visible : canShowAppImp,
      position: rawImpScore?.position || 'with_score',
      color: rawImpScore?.color || typography.scoreTextColor,
      offsetX: rawImpScore?.offsetX ?? 0,
      offsetY: rawImpScore?.offsetY ?? 0,
      scale: rawImpScore?.scale ?? 1.0,
      zIndex: rawImpScore?.zIndex ?? 10,
      fontSize: rawImpScore?.fontSize || 'xs',
      ...(rawImpScore || {}),
    },
    artistStatus: {
      visible: rawStatus?.visible !== undefined ? rawStatus.visible : canShowMaturity,
      position: rawStatus?.position || 'with_name',
      offsetX: rawStatus?.offsetX ?? 0,
      offsetY: rawStatus?.offsetY ?? 0,
      scale: rawStatus?.scale ?? 1.0,
      zIndex: rawStatus?.zIndex ?? 10,
      fontSize: rawStatus?.fontSize || 'xs',
      ...(rawStatus || {}),
    },
    bodyType: {
      visible: rawBodyType?.visible !== undefined ? rawBodyType.visible : bodyTypePos !== 'hidden',
      position: rawBodyType?.position || bodyTypePos || 'top_left',
      offsetX: rawBodyType?.offsetX ?? layoutOffsets.badgeOffset?.x ?? 0,
      offsetY: rawBodyType?.offsetY ?? layoutOffsets.badgeOffset?.y ?? 0,
      scale: rawBodyType?.scale ?? 1.0,
      zIndex: rawBodyType?.zIndex ?? 10,
      fontSize: rawBodyType?.fontSize || 'xs',
      ...(rawBodyType || {}),
    },
    bodyTypeCode: {
      visible: rawBodyType?.visible !== undefined ? rawBodyType.visible : bodyTypePos !== 'hidden',
      position: rawBodyType?.position || bodyTypePos || 'top_left',
      offsetX: rawBodyType?.offsetX ?? layoutOffsets.badgeOffset?.x ?? 0,
      offsetY: rawBodyType?.offsetY ?? layoutOffsets.badgeOffset?.y ?? 0,
      scale: rawBodyType?.scale ?? 1.0,
      zIndex: rawBodyType?.zIndex ?? 10,
      fontSize: rawBodyType?.fontSize || 'xs',
      ...(rawBodyType || {}),
    },
    country: {
      visible: rawCountry?.visible !== undefined ? rawCountry.visible : countryPos !== 'hidden',
      position: rawCountry?.position || countryPos || 'top_left',
      offsetX: rawCountry?.offsetX ?? 0,
      offsetY: rawCountry?.offsetY ?? 0,
      scale: rawCountry?.scale ?? 1.0,
      zIndex: rawCountry?.zIndex ?? 10,
      iconSize: rawCountry?.iconSize ?? 16,
      ...(rawCountry || {}),
    },
    countryFlag: {
      visible: rawCountry?.visible !== undefined ? rawCountry.visible : countryPos !== 'hidden',
      position: rawCountry?.position || countryPos || 'top_left',
      offsetX: rawCountry?.offsetX ?? 0,
      offsetY: rawCountry?.offsetY ?? 0,
      scale: rawCountry?.scale ?? 1.0,
      zIndex: rawCountry?.zIndex ?? 10,
      iconSize: rawCountry?.iconSize ?? 16,
      ...(rawCountry || {}),
    },
    cupSize: {
      visible: rawCup?.visible !== undefined ? rawCup.visible : canShowCupSize,
      position: rawCup?.position || measurementPos || 'bottom_left',
      offsetX: rawCup?.offsetX ?? 0,
      offsetY: rawCup?.offsetY ?? 0,
      scale: rawCup?.scale ?? 1.0,
      zIndex: rawCup?.zIndex ?? 10,
      fontSize: rawCup?.fontSize || 'xs',
      ...(rawCup || {}),
    },
    measurementsBWH: {
      visible: rawBwh?.visible !== undefined ? rawBwh.visible : canShowBwh,
      position: rawBwh?.position || measurementPos || 'bottom_left',
      offsetX: rawBwh?.offsetX ?? layoutOffsets.specsOffset?.x ?? 0,
      offsetY: rawBwh?.offsetY ?? layoutOffsets.specsOffset?.y ?? 0,
      scale: rawBwh?.scale ?? 1.0,
      zIndex: rawBwh?.zIndex ?? 10,
      fontSize: rawBwh?.fontSize || 'xs',
      ...(rawBwh || {}),
    },
    bwh: {
      visible: rawBwh?.visible !== undefined ? rawBwh.visible : canShowBwh,
      position: rawBwh?.position || measurementPos || 'bottom_left',
      offsetX: rawBwh?.offsetX ?? layoutOffsets.specsOffset?.x ?? 0,
      offsetY: rawBwh?.offsetY ?? layoutOffsets.specsOffset?.y ?? 0,
      scale: rawBwh?.scale ?? 1.0,
      zIndex: rawBwh?.zIndex ?? 10,
      fontSize: rawBwh?.fontSize || 'xs',
      ...(rawBwh || {}),
    },
    age: {
      visible: rawAge?.visible !== undefined ? rawAge.visible : (canShowAge || canShowHeight),
      position: rawAge?.position || measurementPos || 'bottom_left',
      offsetX: rawAge?.offsetX ?? 0,
      offsetY: rawAge?.offsetY ?? 0,
      scale: rawAge?.scale ?? 1.0,
      zIndex: rawAge?.zIndex ?? 10,
      fontSize: rawAge?.fontSize || 'xs',
      ...(rawAge || {}),
    },
    ageHeight: {
      visible: rawAge?.visible !== undefined ? rawAge.visible : (canShowAge || canShowHeight),
      position: rawAge?.position || measurementPos || 'bottom_left',
      offsetX: rawAge?.offsetX ?? 0,
      offsetY: rawAge?.offsetY ?? 0,
      scale: rawAge?.scale ?? 1.0,
      zIndex: rawAge?.zIndex ?? 10,
      fontSize: rawAge?.fontSize || 'xs',
      ...(rawAge || {}),
    },
    maturity: {
      visible: rawMaturity?.visible !== undefined ? rawMaturity.visible : canShowMaturity,
      position: rawMaturity?.position || 'with_name',
      offsetX: rawMaturity?.offsetX ?? 0,
      offsetY: rawMaturity?.offsetY ?? 0,
      scale: rawMaturity?.scale ?? 1.0,
      zIndex: rawMaturity?.zIndex ?? 10,
      fontSize: rawMaturity?.fontSize || 'xs',
      ...(rawMaturity || {}),
    },
    customLogoBadge: {
      visible: rawCustomBadge?.visible !== undefined ? rawCustomBadge.visible : (!!assets.customBadgeUrl || !!assets.watermarkLogoUrl),
      position: rawCustomBadge?.position || 'top_right',
      offsetX: rawCustomBadge?.offsetX ?? 0,
      offsetY: rawCustomBadge?.offsetY ?? 0,
      scale: rawCustomBadge?.scale ?? 1.0,
      zIndex: rawCustomBadge?.zIndex ?? 30,
      customAssetUrl: rawCustomBadge?.customAssetUrl || assets.customBadgeUrl || assets.watermarkLogoUrl,
      customBadgeText: rawCustomBadge?.customBadgeText,
      iconSize: rawCustomBadge?.iconSize ?? 24,
      ...(rawCustomBadge || {}),
    },
  };

  // Merge any dynamic custom elements from config.elements or config.elementRegistry
  if (rawElements) {
    Object.keys(rawElements).forEach((key) => {
      if (!resolvedElements[key]) {
        resolvedElements[key] = {
          visible: rawElements[key]?.visible ?? true,
          position: rawElements[key]?.position || 'center',
          offsetX: rawElements[key]?.offsetX ?? 0,
          offsetY: rawElements[key]?.offsetY ?? 0,
          scale: rawElements[key]?.scale ?? 1.0,
          zIndex: rawElements[key]?.zIndex ?? 15,
          opacity: rawElements[key]?.opacity ?? 100,
          rotation: rawElements[key]?.rotation ?? 0,
          filter: rawElements[key]?.filter || 'none',
          color: rawElements[key]?.color,
          ...(rawElements[key] || {}),
        };
      }
    });
  }

  const resolved: ResolvedCardLayout = {
    themeColor,
    cardShapeClass,
    chamferClipStyle,
    thumbnailImgClass,
    dividerClass,
    panelBgClass,
    borderWidth,
    borderRadius: computedBorderRadius,
    cardBgOpacity: config.cardBgOpacity,
    cardBackdropBlur: config.cardBackdropBlur,
    customBorderColor: config.customBorderColor,
    assets,
    aspectRatio,
    frameMaskUrl,
    maskShape,
    layoutOffsets,
    typography,
    layerOrder: config.layerOrder,
    customImages: config.customImages,
    customTexts: config.customTexts,
    elements: resolvedElements,
    canShowRank,
    canShowBwh,
    canShowAge,
    canShowMaturity,
    canShowAppImp,
    canShowHeight,
    canShowCupSize,
    cardShape,
    thumbnailShape,
    infoLayout,
    scoreDisplay,
    ratingPos,
    namePos,
    bodyTypePos,
    countryPos,
    measurementPos,
    nameAlign,
    nameStyle,
    ornamentStyle,
    gradientOverlay,
    glassmorphism,
    headerPos,
    footerPos,
  };

  if (!isCustomTheme) {
    layoutCache.set(cacheKey, resolved);
  }
  return resolved;
}

/**
 * Clear the layout cache if user edits custom themes or resets theme configs.
 */
export function clearCardLayoutCache(): void {
  layoutCache.clear();
}
