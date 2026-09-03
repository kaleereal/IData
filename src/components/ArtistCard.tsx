import React, { memo, useMemo } from 'react';
import { Artist, CardTheme, CardThemeDefinition, CardThemeLayoutConfig, ARTIST_TYPES, CardCustomTextAsset } from '../types';
import {
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  getCountryFlag,
  calculateAge,
} from '../utils/calculations';
import { useCardThemeContext } from '../context/CardThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { getResolvedCardLayout } from '../utils/themeCache';
import { Crown, Sliders, Shield, Star, Check, Search as SearchIcon } from 'lucide-react';
import { SearchHighlight, getArtistSearchMatchPreview } from './SearchHighlight';

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
  onEdit?: (artist: Artist) => void;
  onDelete?: (id: string) => void;
  rank?: number;
  showRankBadge?: boolean;
  className?: string;
  isDownloadableRef?: React.RefObject<HTMLDivElement | null>;
  cardTheme?: CardTheme; // Optional override; defaults to global useCardTheme()
  cardThemeDefinition?: CardThemeDefinition; // Optional direct definition override
  customLayout?: CardThemeLayoutConfig; // Optional real-time layout override from studio
  density?: 2 | 3 | 4;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  searchQuery?: string;
}

const ArtistCardComponent: React.FC<ArtistCardProps> = ({
  artist,
  onClick,
  rank,
  showRankBadge: propShowRankBadge = false,
  className = '',
  isDownloadableRef,
  cardTheme: propTheme,
  cardThemeDefinition: propThemeDef,
  customLayout,
  density = 2,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  searchQuery = '',
}) => {
  const { cardTheme: globalTheme, getThemeDefinition } = useCardThemeContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  const theme = propTheme || globalTheme || 'default';
  const baseDef: CardThemeDefinition = propThemeDef || getThemeDefinition(theme);
  const themeDef: CardThemeDefinition = customLayout
    ? {
        ...baseDef,
        isCustom: true,
        id: (propThemeDef?.id || 'custom_studio_preview') as CardTheme,
        layoutConfig: {
          ...(baseDef.layoutConfig || baseDef.layout || {}),
          ...customLayout,
        },
        layout: {
          ...(baseDef.layoutConfig || baseDef.layout || {}),
          ...customLayout,
        },
      }
    : propThemeDef
    ? {
        ...propThemeDef,
        layoutConfig: propThemeDef.layoutConfig || propThemeDef.layout || {},
        layout: propThemeDef.layout || propThemeDef.layoutConfig || {},
      }
    : baseDef;
  const isFav = isFavorite(artist.id);

  const isSpecial = (artist.attributes?.length || 0) > 0;
  const safeDensity: 2 | 3 | 4 = density === 3 ? 3 : density === 4 ? 4 : 2;
  const layout = useMemo(
    () => getResolvedCardLayout(themeDef, safeDensity, isSpecial),
    [themeDef, safeDensity, isSpecial]
  );

  // Memoize score calculations at card level to prevent recalculating during scroll
  const { appScore, impScore, overallRating, flag, age, bwh, maturity } = useMemo(() => {
    const app = calculateAppearanceScore(artist.appearanceScores);
    const imp = calculateImpressionScore(artist.impressionScores);
    const overall = calculateOverallRating(app, imp);
    const f = getCountryFlag(artist.countryCode, artist.country);
    const a = calculateAge(artist.bornDate);
    const b = `${artist.measurements?.bustCm || '-'}/${artist.measurements?.waistCm || '-'}/${artist.measurements?.hipCm || '-'}`;
    const mat = artist.appeal?.maturity || '';
    return {
      appScore: app,
      impScore: imp,
      overallRating: overall,
      flag: f,
      age: a,
      bwh: b,
      maturity: mat,
    };
  }, [
    artist.id,
    artist.appearanceScores,
    artist.impressionScores,
    artist.countryCode,
    artist.country,
    artist.bornDate,
    artist.measurements,
    artist.appeal?.maturity,
  ]);

  const themeColor = layout.themeColor;
  const panelBgClass = layout.panelBgClass;

  // Visibility Flags with prop overrides
  const canShowRank = (propShowRankBadge || layout.canShowRank) && rank !== undefined;
  const canShowBwh = layout.canShowBwh;
  const canShowAge = layout.canShowAge && age > 0;
  const canShowMaturity = layout.canShowMaturity && Boolean(maturity);
  const canShowAppImp = layout.canShowAppImp;
  const canShowHeight = layout.canShowHeight;
  const canShowCupSize = layout.canShowCupSize;

  // Custom typography styles & colors
  const primaryTextColor = layout.typography?.primaryTextColor || '#FFFFFF';
  const secondaryTextColor = layout.typography?.secondaryTextColor || '#CBD5E1';
  const scoreTextColor = layout.typography?.scoreTextColor || themeColor;
  const customFontFamily = layout.typography?.fontFamily || undefined;

  // Layout offsets with safe bounding clamp
  const offsets = layout.layoutOffsets || {};
  const getOffsetStyle = (coord?: { x?: number; y?: number }): React.CSSProperties => {
    if (!coord || (coord.x === undefined && coord.y === undefined)) return {};
    // Safely clamp offsets within [-16, 16] to prevent cutting off or ejecting outside card boundary
    const x = Math.max(-16, Math.min(16, coord.x || 0));
    const y = Math.max(-16, Math.min(16, coord.y || 0));
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  // Masking style for thumbnail or frame (supports native vector clipPath and safe DataURI masking)
  const getMaskStyle = (): React.CSSProperties => {
    // 1. Built-in vector clip shapes
    if (layout.maskShape && layout.maskShape !== 'none' && layout.maskShape !== 'custom') {
      switch (layout.maskShape) {
        case 'shield':
          return { clipPath: 'polygon(50% 0%, 100% 12%, 100% 75%, 50% 100%, 0% 75%, 0% 12%)' };
        case 'diamond':
          return { clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' };
        case 'hexagon':
          return { clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' };
        case 'circle':
          return { clipPath: 'circle(50% at 50% 50%)' };
        case 'arch':
          return { borderRadius: '9999px 9999px 8px 8px' };
        case 'squircle':
          return { borderRadius: '26px' };
        case 'chamfer':
          return {
            clipPath:
              'polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)',
          };
      }
    }

    // 2. Data URI or custom frame mask (only applied safely if valid data uri)
    if (layout.frameMaskUrl && layout.frameMaskUrl.startsWith('data:image/')) {
      return {
        WebkitMaskImage: `url("${layout.frameMaskUrl}")`,
        maskImage: `url("${layout.frameMaskUrl}")`,
        WebkitMaskSize: 'cover',
        maskSize: 'cover',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      };
    }
    return {};
  };

  // Check if theme uses custom studio element registry / layer ordering
  const isCustomStudioTheme = useMemo(() => {
    return Boolean(
      themeDef.isCustom ||
      themeDef.id?.startsWith('custom_') ||
      themeDef.id === 'custom_studio_preview' ||
      layout.layerOrder?.length ||
      (layout.customImages && layout.customImages.length > 0)
    );
  }, [themeDef, layout]);

  // Helper to resolve element container styles (Background, Border, Radius, Padding)
  const getElementContainerStyle = (
    el: any,
    defaultBg: string = 'transparent',
    defaultBorder: string = 'transparent'
  ): React.CSSProperties => {
    const hasBg = el?.showBackground !== undefined ? Boolean(el.showBackground) : defaultBg !== 'transparent';
    const hasBorder = el?.showBorder !== undefined ? Boolean(el.showBorder) : (defaultBorder !== 'transparent' && Boolean(defaultBorder));
    const bgColor = hasBg ? (el?.backgroundColor || defaultBg) : 'transparent';
    const borderColor = hasBorder ? (el?.borderColor || defaultBorder) : 'transparent';
    const borderWidth = hasBorder ? (el?.borderWidth !== undefined ? el.borderWidth : 1) : 0;

    // Support granular corner radii per corner or uniform borderRadius
    let borderRadius: string | undefined = undefined;
    if (el?.cornerRadii) {
      const tl = el.cornerRadii.topLeft ?? 0;
      const tr = el.cornerRadii.topRight ?? 0;
      const br = el.cornerRadii.bottomRight ?? 0;
      const bl = el.cornerRadii.bottomLeft ?? 0;
      borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
    } else if (el?.borderRadius !== undefined) {
      borderRadius = `${el.borderRadius}px`;
    }

    // Default internal padding: strictly 0px if not configured, avoiding unwanted sizing distortion
    const padding = el?.padding !== undefined ? `${el.padding}px` : (hasBg || hasBorder ? '0px' : '0px');

    return {
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: `${borderWidth}px`,
      borderStyle: borderWidth > 0 ? 'solid' : 'none',
      borderRadius: borderRadius,
      padding: padding,
      boxSizing: 'border-box',
    };
  };

  // Universal Element Style Generator with free coordinates, scale, opacity, rotation, and filters
  const getUniversalElementStyle = (
    elemConfig?: any,
    defaultPos: string = 'center'
  ): React.CSSProperties => {
    if (!elemConfig) return {};

    const pos = elemConfig.position || defaultPos;
    const offsetX = elemConfig.offsetX ?? 0;
    const offsetY = elemConfig.offsetY ?? 0;
    const rawScale = elemConfig.scale !== undefined ? elemConfig.scale : 1.0;
    // Map scale: if > 10 treat as percentage (100% -> 1.0, 50% -> 0.5), else use raw
    const scale = rawScale > 10 ? rawScale / 100 : Math.max(0.05, Math.min(3.0, rawScale));
    const rotation = elemConfig.rotation || 0;
    const rawOpacity = elemConfig.opacity !== undefined ? elemConfig.opacity : 100;
    const opacity = rawOpacity > 1 ? rawOpacity / 100 : Math.max(0, Math.min(1, rawOpacity));

    // Filter effect mapping
    let filter: string | undefined = undefined;
    if (elemConfig.filter && elemConfig.filter !== 'none') {
      switch (elemConfig.filter) {
        case 'drop_shadow':
          filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.85))';
          break;
        case 'glow':
          filter = `drop-shadow(0 0 8px ${elemConfig.color || themeColor || '#FE9900'}) drop-shadow(0 0 14px ${elemConfig.color || themeColor || '#FE9900'}90)`;
          break;
        case 'blur':
          filter = `blur(${elemConfig.filterValue || 4}px)`;
          break;
        case 'grayscale':
          filter = 'grayscale(100%)';
          break;
        case 'brightness':
          filter = `brightness(${elemConfig.filterValue !== undefined ? elemConfig.filterValue / 100 : 1.4})`;
          break;
        case 'contrast':
          filter = `contrast(${elemConfig.filterValue !== undefined ? elemConfig.filterValue / 100 : 1.4})`;
          break;
        case 'invert':
          filter = 'invert(100%)';
          break;
        case 'sepia':
          filter = 'sepia(100%)';
          break;
      }
    }

    let posStyle: React.CSSProperties = {};
    switch (pos) {
      case 'top_left':
        posStyle = {
          top: '6px',
          left: '6px',
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'top left',
        };
        break;
      case 'top_center':
        posStyle = {
          top: '6px',
          left: '50%',
          transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'top center',
        };
        break;
      case 'top_right':
        posStyle = {
          top: '6px',
          right: '6px',
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'top right',
        };
        break;
      case 'center_left':
        posStyle = {
          top: '50%',
          left: '6px',
          transform: `translate(${offsetX}px, calc(-50% + ${offsetY}px)) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center left',
        };
        break;
      case 'center':
        posStyle = {
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center center',
        };
        break;
      case 'center_right':
        posStyle = {
          top: '50%',
          right: '6px',
          transform: `translate(${offsetX}px, calc(-50% + ${offsetY}px)) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center right',
        };
        break;
      case 'bottom_left':
        posStyle = {
          bottom: '6px',
          left: '6px',
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'bottom left',
        };
        break;
      case 'bottom_center':
        posStyle = {
          bottom: '6px',
          left: '50%',
          transform: `translate(calc(-50% + ${offsetX}px), ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'bottom center',
        };
        break;
      case 'bottom_right':
        posStyle = {
          bottom: '6px',
          right: '6px',
          transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'bottom right',
        };
        break;
      case 'free_absolute':
      default:
        posStyle = {
          top: `calc(50% + ${offsetY}px)`,
          left: `calc(50% + ${offsetX}px)`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: 'center center',
        };
        break;
    }

    // Compute dynamic Z-Index based on layer order
    let computedZIndex = elemConfig.zIndex || 20;
    if (layout.layerOrder && layout.layerOrder.length > 0 && elemConfig.__id) {
      const idx = layout.layerOrder.indexOf(elemConfig.__id);
      if (idx !== -1) {
        // Elements higher in the list get higher z-index
        computedZIndex = (layout.layerOrder.length - idx) * 5 + 10;
      }
    }

    return {
      position: 'absolute',
      ...posStyle,
      opacity,
      filter,
      zIndex: computedZIndex,
      pointerEvents: 'none',
    };
  };

  // Universal Single-Element Component Renderers (11 Unique Items + Maturity + Custom Texts)
  const renderUniversalElement = (elemId: string) => {
    const el = layout.elements?.[elemId] || (layout as any)[elemId];
    if (!el || el.visible === false) return null;

    const elConfigWithId = { ...el, __id: elemId };

    switch (elemId) {
      case 'overallRating': {
        const fmt = el.displayFormat || 'star_decimal';
        let ratingValStr = Math.round(overallRating).toString();
        if (fmt === 'integer') {
          ratingValStr = Math.round(overallRating).toString();
        }

        let contentNode: React.ReactNode = (
          <>
            <span className="text-amber-400">★</span>
            <span>{ratingValStr}</span>
          </>
        );

        if (fmt === 'star_decimal' || fmt === 'without_ovr') {
          contentNode = (
            <>
              <span className="text-amber-400">★</span>
              <span>{ratingValStr}</span>
            </>
          );
        } else if (fmt === 'decimal' || fmt === 'number_only') {
          contentNode = <span>{ratingValStr}</span>;
        } else if (fmt === 'integer') {
          contentNode = <span>{Math.round(overallRating)}</span>;
        } else if (fmt === 'ovr' || fmt === 'with_ovr') {
          const ovrScore = Math.round(overallRating >= 10 ? overallRating : overallRating * 10);
          contentNode = (
            <>
              <span className="text-[0.75em] text-stone-300 font-mono tracking-tighter opacity-80">OVR</span>
              <span>{ovrScore}</span>
            </>
          );
        }

        const containerStyle = getElementContainerStyle(
          el,
          'rgba(0,0,0,0.65)',
          el.color ? `${el.color}90` : `${themeColor}90`
        );

        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_right')}>
            <div
              className="flex items-center gap-1 font-black px-2 py-0.5 rounded-lg shadow-lg backdrop-blur-md whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || themeColor,
                fontSize: 'clamp(8px, 4.4cqw, 18px)',
              }}
            >
              {contentNode}
            </div>
          </div>
        );
      }

      case 'firstName': {
        const containerStyle = getElementContainerStyle(el, 'transparent', 'transparent');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_center')}>
            <span
              className="font-black tracking-wide drop-shadow-md whitespace-nowrap leading-tight inline-block"
              style={{
                ...containerStyle,
                color: el.color || primaryTextColor,
                fontSize: 'clamp(9px, 5.2cqw, 22px)',
                fontFamily: customFontFamily,
              }}
            >
              {artist.firstName}
            </span>
          </div>
        );
      }

      case 'lastName': {
        const containerStyle = getElementContainerStyle(el, 'transparent', 'transparent');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_center')}>
            <span
              className="font-bold tracking-wide drop-shadow-md whitespace-nowrap leading-tight inline-block"
              style={{
                ...containerStyle,
                color: el.color || secondaryTextColor,
                fontSize: 'clamp(8px, 4.2cqw, 18px)',
                fontFamily: customFontFamily,
              }}
            >
              {artist.lastName || ''}
            </span>
          </div>
        );
      }

      case 'appearanceScore': {
        const fmt = el.displayFormat || 'label_value';
        const showLabel = el.showLabel !== false;
        let valNode: React.ReactNode = null;
        if (fmt === 'percent') {
          valNode = <span>{Math.round(appScore >= 10 ? appScore : appScore * 10)}%</span>;
        } else if (fmt === 'value_only') {
          valNode = <span>{appScore.toFixed(1)}</span>;
        } else {
          valNode = (
            <>
              {showLabel && <span className="text-stone-400 text-[0.8em]">APP</span>}
              <span>{appScore.toFixed(1)}</span>
            </>
          );
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.2)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_left')}>
            <div
              className="flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#FCD34D',
                fontSize: 'clamp(6.5px, 3.2cqw, 13px)',
              }}
            >
              {valNode}
            </div>
          </div>
        );
      }

      case 'impressionScore': {
        const fmt = el.displayFormat || 'label_value';
        const showLabel = el.showLabel !== false;
        let valNode: React.ReactNode = null;
        if (fmt === 'percent') {
          valNode = <span>{Math.round(impScore >= 10 ? impScore : impScore * 10)}%</span>;
        } else if (fmt === 'value_only') {
          valNode = <span>{impScore.toFixed(1)}</span>;
        } else {
          valNode = (
            <>
              {showLabel && <span className="text-stone-400 text-[0.8em]">IMP</span>}
              <span>{impScore.toFixed(1)}</span>
            </>
          );
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.2)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_right')}>
            <div
              className="flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#38BDF8',
                fontSize: 'clamp(6.5px, 3.2cqw, 13px)',
              }}
            >
              {valNode}
            </div>
          </div>
        );
      }

      case 'measurementsBWH':
      case 'bwh': {
        const m = artist.measurements || { bustCm: 88, waistCm: 58, hipCm: 86 };
        const b = m.bustCm || 88;
        const w = m.waistCm || 58;
        const h = m.hipCm || 86;
        const fmt = el.displayFormat || 'standard';

        let textBwh = `B${b} W${w} H${h}`;
        if (fmt === 'compact' || fmt === 'num_no_cm') {
          textBwh = `${b}-${w}-${h}`;
        } else if (fmt === 'slash') {
          textBwh = `${b} / ${w} / ${h}`;
        } else if (fmt === 'detailed' || fmt === 'num_with_cm') {
          textBwh = `${b}-${w}-${h} cm`;
        } else if (fmt === 'prefix_with_cm') {
          textBwh = `B:${b}cm W:${w}cm H:${h}cm`;
        } else if (fmt === 'standard' || fmt === 'prefix_no_cm') {
          textBwh = `B${b} W${w} H${h}`;
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.15)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_center')}>
            <div
              className="font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#F1F5F9',
                fontSize: 'clamp(6px, 3cqw, 12px)',
              }}
            >
              {textBwh}
            </div>
          </div>
        );
      }

      case 'cupSize': {
        const cupVal = artist.measurements?.cupSize || 'E';
        const fmt = el.displayFormat || 'letter';
        let cVal = `${cupVal} Cup`;
        if (fmt === 'letter_only') {
          cVal = `${cupVal}`;
        } else if (fmt === 'cup_prefix') {
          cVal = `CUP ${cupVal}`;
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(245,158,11,0.2)', 'rgba(245,158,11,0.5)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_center')}>
            <div
              className="font-mono font-black px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#FBBF24',
                fontSize: 'clamp(6px, 3cqw, 12px)',
              }}
            >
              {cVal}
            </div>
          </div>
        );
      }

      case 'age':
      case 'ageHeight': {
        const fmt = el.displayFormat || 'years';
        let ageText = '-';
        const safeAge = age > 0 ? age : 24;
        if (fmt === 'yo') {
          ageText = `${safeAge} yo`;
        } else if (fmt === 'number_only' || fmt === 'num_only') {
          ageText = `${safeAge}`;
        } else if (fmt === 'age_prefix') {
          ageText = `Age: ${safeAge}`;
        } else {
          ageText = `${safeAge} Thn`;
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.15)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'bottom_center')}>
            <div
              className="font-mono font-bold px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#E2E8F0',
                fontSize: 'clamp(6px, 3cqw, 12px)',
              }}
            >
              {ageText}
            </div>
          </div>
        );
      }

      case 'artistStatus': {
        // Dedicated to Artist Professional Status (Amatir / Profesional)
        const isPro = artist.artistStatus === 'Profesional' || artist.typeCode === 'Pro' || (artist.specialty || []).includes('Pro');
        const fmt = el.displayFormat || 'badge';
        let statusVal = isPro ? 'PRO' : 'AMATIR';
        if (fmt === 'code') {
          statusVal = isPro ? 'PRO' : 'AMT';
        } else if (fmt === 'text') {
          statusVal = isPro ? 'Profesional' : 'Amatir';
        }

        const containerStyle = getElementContainerStyle(
          el,
          'rgba(0,0,0,0.65)',
          el.color ? `${el.color}80` : `${themeColor}80`
        );
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_left')}>
            <div
              className="font-mono font-black uppercase px-1.5 py-0.5 rounded leading-tight whitespace-nowrap backdrop-blur-sm"
              style={{
                ...containerStyle,
                color: el.color || themeColor,
                fontSize: 'clamp(6px, 2.8cqw, 11px)',
              }}
            >
              {statusVal}
            </div>
          </div>
        );
      }

      case 'maturity': {
        // Dedicated to Appeal > Maturity (Teen / Young, MILF / Mature, Cougar)
        const matVal = artist.appeal?.maturity || maturity || 'Teen / Young';
        const fmt = el.displayFormat || 'full';
        let displayMat = matVal;
        if (fmt === 'short') {
          displayMat = matVal.includes('Teen') ? 'TEEN' : matVal.includes('MILF') ? 'MILF' : 'COUGAR';
        } else if (fmt === 'badge') {
          displayMat = matVal.includes('Teen') ? 'TY' : matVal.includes('MILF') ? 'MF' : 'CG';
        }

        const containerStyle = getElementContainerStyle(
          el,
          'rgba(0,0,0,0.65)',
          el.color ? `${el.color}80` : 'rgba(168,85,247,0.6)'
        );
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_left')}>
            <div
              className="font-mono font-black uppercase px-1.5 py-0.5 rounded leading-tight whitespace-nowrap backdrop-blur-sm"
              style={{
                ...containerStyle,
                color: el.color || '#C084FC',
                fontSize: 'clamp(6px, 2.8cqw, 11px)',
              }}
            >
              {displayMat}
            </div>
          </div>
        );
      }

      case 'bodyTypeCode':
      case 'bodyType': {
        const fmt = el.displayFormat || 'code';
        let bodyTypeStr = artist.typeCode || 'AK';
        if (fmt === 'full_name') {
          const typeObj = ARTIST_TYPES.find((t) => t.code === artist.typeCode);
          bodyTypeStr = typeObj ? `${typeObj.indonesia}` : bodyTypeStr;
        }

        const containerStyle = getElementContainerStyle(
          el,
          'rgba(0,0,0,0.65)',
          el.color ? `${el.color}80` : isSpecial ? 'rgba(0,188,213,0.6)' : 'rgba(254,153,0,0.6)'
        );
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_left')}>
            <div
              className="font-mono font-black uppercase px-1.5 py-0.5 rounded leading-tight whitespace-nowrap backdrop-blur-sm"
              style={{
                ...containerStyle,
                color: el.color || (isSpecial ? '#00BCD5' : '#FE9900'),
                fontSize: 'clamp(6px, 2.8cqw, 11px)',
              }}
            >
              {bodyTypeStr}
            </div>
          </div>
        );
      }

      case 'countryFlag':
      case 'country': {
        const fmt = el.displayFormat || 'flag_name';
        let contentNode: React.ReactNode = (
          <>
            <span>{flag}</span>
            <span className="font-mono text-[0.85em] font-black">{artist.countryCode || ''}</span>
          </>
        );

        if (fmt === 'flag_only') {
          contentNode = <span>{flag}</span>;
        } else if (fmt === 'name_only' || fmt === 'full_name') {
          contentNode = <span className="font-sans text-[0.9em] font-bold">{artist.country || 'Japan'}</span>;
        } else if (fmt === 'code_only') {
          contentNode = <span className="font-mono text-[0.9em] font-black">{artist.countryCode || 'JP'}</span>;
        } else if (fmt === 'flag_name' || fmt === 'flag_full_name') {
          contentNode = (
            <>
              <span>{flag}</span>
              <span className="font-sans text-[0.85em] font-bold">{artist.country || 'Japan'}</span>
            </>
          );
        } else if (fmt === 'flag_code') {
          contentNode = (
            <>
              <span>{flag}</span>
              <span className="font-mono text-[0.85em] font-black">{artist.countryCode || 'JP'}</span>
            </>
          );
        }

        const containerStyle = getElementContainerStyle(el, 'rgba(0,0,0,0.6)', 'rgba(255,255,255,0.2)');
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_left')}>
            <div
              className="flex items-center gap-1 font-bold px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap"
              style={{
                ...containerStyle,
                color: el.color || '#F8FAFC',
                fontSize: 'clamp(6.5px, 3.2cqw, 13px)',
              }}
              title={artist.country || ''}
            >
              {contentNode}
            </div>
          </div>
        );
      }

      case 'customLogoBadge':
        if (!el.customAssetUrl && !layout.assets?.customBadgeUrl && !layout.assets?.watermarkLogoUrl) return null;
        return (
          <div key={elemId} style={getUniversalElementStyle(elConfigWithId, 'top_right')}>
            <img
              src={el.customAssetUrl || layout.assets?.customBadgeUrl || layout.assets?.watermarkLogoUrl}
              alt="Custom Badge"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
              style={{
                width: 'clamp(12px, 8cqw, 36px)',
                height: 'clamp(12px, 8cqw, 36px)',
              }}
              className="object-contain shrink-0 drop-shadow-md"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Render all active custom layers (Standard elements + Custom images + Custom texts)
  const renderUniversalLayers = () => {
    const activeLayers: React.ReactNode[] = [];

    // If layer order is defined, render in stack order
    if (layout.layerOrder && layout.layerOrder.length > 0) {
      layout.layerOrder.forEach((layerId) => {
        if (layerId.startsWith('custom_img_') || layerId.startsWith('img_')) {
          const imgItem = layout.customImages?.find((img) => img.id === layerId);
          if (imgItem && imgItem.visible !== false && imgItem.url) {
            activeLayers.push(
              <div key={imgItem.id} style={getUniversalElementStyle({ ...imgItem, __id: imgItem.id }, 'center')}>
                <img
                  src={imgItem.url}
                  alt={imgItem.name || 'Custom Image'}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                  className="max-w-[240px] max-h-[240px] object-contain drop-shadow-md pointer-events-none select-none"
                />
              </div>
            );
          }
        } else if (layerId.startsWith('custom_text_') || layerId.startsWith('txt_')) {
          const txtItem = layout.customTexts?.find((t) => t.id === layerId);
          if (txtItem && txtItem.visible !== false && txtItem.text) {
            const containerStyle = getElementContainerStyle(
              txtItem,
              txtItem.backgroundColor || 'rgba(0,0,0,0.65)',
              txtItem.borderColor || 'rgba(254,153,0,0.6)'
            );
            activeLayers.push(
              <div key={txtItem.id} style={getUniversalElementStyle({ ...txtItem, __id: txtItem.id }, 'center')}>
                <div
                  className="whitespace-nowrap select-none backdrop-blur-xs font-bold leading-tight inline-flex items-center justify-center"
                  style={{
                    ...containerStyle,
                    color: txtItem.color || primaryTextColor,
                    fontFamily: txtItem.fontFamily || customFontFamily,
                    fontWeight: (txtItem.fontWeight || 'bold') as any,
                    fontSize: txtItem.fontSize ? (typeof txtItem.fontSize === 'number' ? `${txtItem.fontSize}px` : txtItem.fontSize) : 'clamp(10px, 4cqw, 16px)',
                  }}
                >
                  {txtItem.text}
                </div>
              </div>
            );
          }
        } else {
          const rendered = renderUniversalElement(layerId);
          if (rendered) activeLayers.push(rendered);
        }
      });

      // Also render any customTexts not explicitly in layerOrder
      if (layout.customTexts) {
        layout.customTexts.forEach((txtItem) => {
          if (!layout.layerOrder?.includes(txtItem.id) && txtItem.visible !== false && txtItem.text) {
            const containerStyle = getElementContainerStyle(
              txtItem,
              txtItem.backgroundColor || 'rgba(0,0,0,0.65)',
              txtItem.borderColor || 'rgba(254,153,0,0.6)'
            );
            activeLayers.push(
              <div key={txtItem.id} style={getUniversalElementStyle({ ...txtItem, __id: txtItem.id }, 'center')}>
                <div
                  className="whitespace-nowrap select-none backdrop-blur-xs font-bold leading-tight inline-flex items-center justify-center"
                  style={{
                    ...containerStyle,
                    color: txtItem.color || primaryTextColor,
                    fontFamily: txtItem.fontFamily || customFontFamily,
                    fontWeight: (txtItem.fontWeight || 'bold') as any,
                    fontSize: txtItem.fontSize ? (typeof txtItem.fontSize === 'number' ? `${txtItem.fontSize}px` : txtItem.fontSize) : 'clamp(10px, 4cqw, 16px)',
                  }}
                >
                  {txtItem.text}
                </div>
              </div>
            );
          }
        });
      }
    } else {
      // Fallback: render any active element, custom images, and custom texts
      const standardKeys = [
        'countryFlag',
        'country',
        'artistStatus',
        'maturity',
        'bodyTypeCode',
        'bodyType',
        'overallRating',
        'appearanceScore',
        'impressionScore',
        'firstName',
        'lastName',
        'measurementsBWH',
        'bwh',
        'cupSize',
        'ageHeight',
        'age',
        'customLogoBadge',
      ];

      standardKeys.forEach((k) => {
        const rendered = renderUniversalElement(k);
        if (rendered) activeLayers.push(rendered);
      });

      if (layout.customImages) {
        layout.customImages.forEach((imgItem) => {
          if (imgItem.visible !== false && imgItem.url) {
            activeLayers.push(
              <div key={imgItem.id} style={getUniversalElementStyle({ ...imgItem, __id: imgItem.id }, 'center')}>
                <img
                  src={imgItem.url}
                  alt={imgItem.name || 'Custom Image'}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                  className="max-w-[240px] max-h-[240px] object-contain drop-shadow-md pointer-events-none select-none"
                />
              </div>
            );
          }
        });
      }

      if (layout.customTexts) {
        layout.customTexts.forEach((txtItem) => {
          if (txtItem.visible !== false && txtItem.text) {
            const containerStyle = getElementContainerStyle(
              txtItem,
              txtItem.backgroundColor || 'rgba(0,0,0,0.6)',
              txtItem.borderColor || 'rgba(255,255,255,0.2)'
            );
            activeLayers.push(
              <div key={txtItem.id} style={getUniversalElementStyle({ ...txtItem, __id: txtItem.id }, 'center')}>
                <div
                  className="whitespace-nowrap select-none backdrop-blur-xs font-bold leading-tight"
                  style={{
                    ...containerStyle,
                    color: txtItem.color || primaryTextColor,
                    fontFamily: txtItem.fontFamily || customFontFamily,
                    fontWeight: (txtItem.fontWeight || 'bold') as any,
                    fontSize: txtItem.fontSize ? (typeof txtItem.fontSize === 'number' ? `${txtItem.fontSize}px` : txtItem.fontSize) : 'clamp(8px, 4cqw, 16px)',
                  }}
                >
                  {txtItem.text}
                </div>
              </div>
            );
          }
        });
      }
    }

    return activeLayers;
  };

  // Dynamic aspect ratio calculation
  const computedAspectRatio = useMemo(() => {
    if (!layout.aspectRatio || layout.aspectRatio === 'auto') return '2/3';
    return layout.aspectRatio.includes(':')
      ? layout.aspectRatio.replace(':', '/')
      : layout.aspectRatio;
  }, [layout.aspectRatio]);

  // =========================================================================
  // DENSITY SCALING HELPERS (Density 2 -> Spacious, 3 -> Medium, 4 -> Compact)
  // Ensures attributes scale down as density increases so they never cover thumbnails.
  // =========================================================================
  const isDense = safeDensity >= 3;
  const isUltraDense = safeDensity >= 4;

  // =========================================================================
  // MODULAR SUB-ELEMENT RENDERERS (With Dynamic Container Query Proportional Scaling)
  // Ensures all attributes scale 1:1 in exact proportion to card thumbnail width
  // =========================================================================

  // 1. Country Flag
  const renderCountryFlag = () => {
    if (layout.countryPos === 'hidden') return null;

    return (
      <span
        className="leading-none drop-shadow select-none shrink-0"
        style={{ fontSize: 'clamp(4px, 4.8cqw, 20px)' }}
        title={artist.country || ''}
      >
        {flag}
      </span>
    );
  };

  // 2. Rank Badge
  const renderRankBadge = () => {
    if (!canShowRank && !layout.assets?.customBadgeIconUrl) return null;

    return (
      <div
        className="flex items-center gap-0.5 shrink-0"
        style={getOffsetStyle(offsets.badgeOffset)}
      >
        {layout.assets?.customBadgeIconUrl && (
          <img
            src={layout.assets.customBadgeIconUrl}
            alt="Custom Badge"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            style={{
              width: 'clamp(4px, 4cqw, 16px)',
              height: 'clamp(4px, 4cqw, 16px)',
            }}
            className="object-contain shrink-0"
          />
        )}
        {canShowRank && (
          <span
            className="font-mono font-black shrink-0 border rounded leading-tight whitespace-nowrap"
            style={{
              backgroundColor: `${themeColor}25`,
              color: themeColor,
              borderColor: `${themeColor}60`,
              fontSize: 'clamp(2px, 3.4cqw, 11px)',
              padding: 'clamp(0.2px, 0.2cqw, 2.5px) clamp(1px, 1cqw, 6px)',
            }}
          >
            #{rank}
          </span>
        )}
      </div>
    );
  };

  // 3. Body Type Badge
  const renderBodyTypeBadge = () => {
    if (layout.bodyTypePos === 'hidden') return null;

    return (
      <span
        className="font-mono font-black tracking-wider uppercase whitespace-nowrap shrink-0 rounded leading-tight"
        style={{
          backgroundColor: isSpecial ? 'rgba(0,188,213,0.25)' : 'rgba(254,153,0,0.25)',
          color: isSpecial ? '#00BCD5' : '#FE9900',
          border: `1px solid ${isSpecial ? 'rgba(0,188,213,0.5)' : 'rgba(254,153,0,0.5)'}`,
          fontSize: 'clamp(2px, 3.2cqw, 11px)',
          padding: 'clamp(0.2px, 0.2cqw, 2.5px) clamp(1px, 1cqw, 6px)',
          ...getOffsetStyle(offsets.badgeOffset),
        }}
      >
        {artist.typeCode}
      </span>
    );
  };

  // 4. Rating Block (Supports prominent, compact, crest, pill, hud_rail, badge, minimal)
  const renderRatingBlock = () => {
    if (layout.ratingPos === 'hidden' || layout.scoreDisplay === 'hidden') return null;

    const ratingOffsetStyle = getOffsetStyle(offsets.ratingOffset);

    if (layout.scoreDisplay === 'compact') {
      return (
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 whitespace-nowrap" style={ratingOffsetStyle}>
          {canShowAppImp && (
            <span
              className="font-bold font-mono leading-none"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 2.8cqw, 10px)',
              }}
            >
              {Math.round(appScore)}/{Math.round(impScore)}
            </span>
          )}
          <span
            className="font-black font-mono border shadow rounded leading-tight"
            style={{
              backgroundColor: `${themeColor}35`,
              borderColor: themeColor,
              color: scoreTextColor,
              fontSize: 'clamp(3.5px, 5.2cqw, 15px)',
              padding: 'clamp(0.2px, 0.3cqw, 3px) clamp(1.5px, 1cqw, 8px)',
            }}
          >
            {overallRating}
          </span>
        </div>
      );
    }

    if (layout.scoreDisplay === 'pill') {
      return (
        <div
          className="flex items-center gap-0.5 sm:gap-1 rounded-full border shadow-md font-mono shrink-0 whitespace-nowrap leading-tight"
          style={{
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: themeColor,
            padding: 'clamp(0.5px, 0.4cqw, 4px) clamp(2px, 1.5cqw, 10px)',
            ...ratingOffsetStyle,
          }}
        >
          {canShowAppImp && (
            <span
              className="font-bold leading-none"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 2.8cqw, 10px)',
              }}
            >
              {Math.round(appScore)}/{Math.round(impScore)}
            </span>
          )}
          <span
            className="font-black leading-none"
            style={{
              color: scoreTextColor,
              fontSize: 'clamp(3.5px, 5.2cqw, 15px)',
            }}
          >
            {overallRating}
          </span>
        </div>
      );
    }

    if (layout.scoreDisplay === 'crest') {
      return (
        <div
          className="flex flex-col items-center justify-center rounded-xl bg-black/85 border shadow-xl shrink-0"
          style={{
            borderColor: themeColor,
            padding: 'clamp(1px, 0.6cqw, 6px)',
            ...ratingOffsetStyle,
          }}
        >
          <Crown
            style={{
              color: themeColor,
              width: 'clamp(4px, 4cqw, 18px)',
              height: 'clamp(4px, 4cqw, 18px)',
            }}
          />
          <span
            className="font-black font-mono leading-none"
            style={{
              color: scoreTextColor,
              fontSize: 'clamp(4px, 5.8cqw, 18px)',
            }}
          >
            {overallRating}
          </span>
          {canShowAppImp && (
            <span
              className="font-mono mt-0.5 leading-none"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 2.6cqw, 9.5px)',
              }}
            >
              {Math.round(appScore)}/{Math.round(impScore)}
            </span>
          )}
        </div>
      );
    }

    if (layout.scoreDisplay === 'hud_rail') {
      return (
        <div
          className="rounded-lg bg-black/85 border flex flex-col items-center gap-0.5 shadow-lg shrink-0"
          style={{
            borderColor: `${themeColor}70`,
            padding: 'clamp(1px, 0.6cqw, 6px)',
            ...ratingOffsetStyle,
          }}
        >
          <div
            className="flex items-center gap-0.5 font-mono font-bold text-white/80 leading-none"
            style={{ fontSize: 'clamp(2.5px, 2.8cqw, 10px)' }}
          >
            <Sliders
              style={{
                color: themeColor,
                width: 'clamp(4px, 3.5cqw, 14px)',
                height: 'clamp(4px, 3.5cqw, 14px)',
              }}
            />
            <span>HUD</span>
          </div>
          <span
            className="font-black font-mono leading-none"
            style={{
              color: scoreTextColor,
              fontSize: 'clamp(4px, 5.8cqw, 18px)',
            }}
          >
            {overallRating}
          </span>
          {canShowAppImp && (
            <div
              className="font-mono leading-none"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 2.6cqw, 9.5px)',
              }}
            >
              {Math.round(appScore)}/{Math.round(impScore)}
            </div>
          )}
        </div>
      );
    }

    // Default: Prominent (Adaptive font size based on density and cqw scale)
    return (
      <div
        className="flex flex-col items-end drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] shrink-0"
        style={ratingOffsetStyle}
      >
        {canShowAppImp && (
          <div
            className="font-semibold tracking-wide font-mono bg-black/70 rounded leading-none"
            style={{
              color: secondaryTextColor,
              fontSize: 'clamp(2px, 2.8cqw, 10px)',
              padding: 'clamp(0.2px, 0.2cqw, 2px) clamp(1px, 0.6cqw, 5px)',
            }}
          >
            {Math.round(appScore)}/{Math.round(impScore)}
          </div>
        )}
        <div
          className="font-black leading-none tracking-tight my-0.5 font-sans"
          style={{
            color: scoreTextColor,
            fontSize: 'clamp(5px, 9.5cqw, 32px)',
          }}
        >
          {overallRating}
        </div>
      </div>
    );
  };

  // 5. Name Block (Stacked, Inline, Hero, Badge)
  const renderNameBlock = () => {
    const alignClass =
      layout.nameAlign === 'left' ? 'items-start text-left' : layout.nameAlign === 'right' ? 'items-end text-right' : 'items-center text-center';

    const customWeight = layout.typography?.nameFontWeight
      ? `font-${layout.typography.nameFontWeight}`
      : 'font-black';

    const nameOffsetStyle: React.CSSProperties = {
      ...getOffsetStyle(offsets.nameOffset),
      fontFamily: customFontFamily,
      color: primaryTextColor,
    };

    if (layout.nameStyle === 'inline') {
      return (
        <div className={`flex flex-col ${alignClass} w-full min-w-0 max-w-full px-0.5`} style={nameOffsetStyle}>
          <span
            className={`${customWeight} tracking-wide uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight max-w-full break-words`}
            style={{ fontSize: 'clamp(2.5px, 5.2cqw, 20px)' }}
          >
            <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
            {artist.lastName ? <SearchHighlight text={artist.lastName} query={searchQuery} /> : ''}
          </span>
        </div>
      );
    }

    if (layout.nameStyle === 'hero') {
      return (
        <div className={`flex flex-col ${alignClass} w-full min-w-0 max-w-full px-0.5`} style={nameOffsetStyle}>
          {artist.lastName && (
            <span
              className="font-semibold tracking-widest uppercase leading-tight max-w-full break-words"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 3.4cqw, 13px)',
              }}
            >
              <SearchHighlight text={artist.firstName} query={searchQuery} />
            </span>
          )}
          <span
            className={`${customWeight} tracking-wider uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] leading-tight max-w-full break-words`}
            style={{ fontSize: 'clamp(3px, 6.5cqw, 24px)' }}
          >
            <SearchHighlight text={artist.lastName || artist.firstName} query={searchQuery} />
          </span>
        </div>
      );
    }

    // Default: Stacked
    return (
      <div className={`flex flex-col ${alignClass} w-full min-w-0 max-w-full px-0.5`} style={nameOffsetStyle}>
        {artist.lastName ? (
          <>
            <span
              className="font-semibold tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-tight max-w-full break-words"
              style={{
                color: secondaryTextColor,
                fontSize: 'clamp(2px, 3.4cqw, 13px)',
              }}
            >
              <SearchHighlight text={artist.firstName} query={searchQuery} />
            </span>
            <span
              className={`${customWeight} tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight max-w-full break-words`}
              style={{ fontSize: 'clamp(2.5px, 5.2cqw, 20px)' }}
            >
              <SearchHighlight text={artist.lastName} query={searchQuery} />
            </span>
          </>
        ) : (
          <span
            className={`${customWeight} tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight max-w-full break-words`}
            style={{ fontSize: 'clamp(2.5px, 5.2cqw, 20px)' }}
          >
            <SearchHighlight text={artist.firstName} query={searchQuery} />
          </span>
        )}
      </div>
    );
  };

  // 6. Specs and Measurements Block
  const renderSpecsBlock = () => {
    const items: React.ReactNode[] = [];

    if (canShowCupSize && artist.measurements?.cupSize) {
      items.push(<span key="cup">{artist.measurements.cupSize} Cup</span>);
    }
    if (canShowHeight && artist.heightCm) {
      items.push(<span key="height">{artist.heightCm}cm</span>);
    }
    if (canShowAge && age > 0) {
      items.push(<span key="age" className="text-amber-300">{age} th</span>);
    }
    if (canShowBwh) {
      items.push(<span key="bwh">{bwh}</span>);
    }
    if (canShowMaturity && maturity) {
      items.push(<span key="mat" className="text-pink-300 uppercase">{maturity}</span>);
    }

    if (items.length === 0) return null;

    return (
      <div
        className={`flex items-center flex-wrap font-mono font-medium opacity-95 leading-tight max-w-full ${
          layout.nameAlign === 'left' ? 'justify-start' : layout.nameAlign === 'right' ? 'justify-end' : 'justify-center'
        }`}
        style={{
          color: secondaryTextColor,
          fontFamily: customFontFamily,
          fontSize: 'clamp(2px, 3.1cqw, 11px)',
          gap: 'clamp(0.5px, 0.6cqw, 5px)',
          ...getOffsetStyle(offsets.specsOffset),
        }}
      >
        {items.map((it, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-white/40 leading-none select-none">•</span>}
            <span
              className="rounded bg-black/60 whitespace-nowrap leading-tight"
              style={{ padding: 'clamp(0.2px, 0.2cqw, 2px) clamp(1px, 0.8cqw, 5px)' }}
            >
              {it}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  // 7. Ornaments Rendering
  const renderOrnaments = () => {
    const ornamentOffsetStyle = getOffsetStyle(offsets.ornamentOffset);
    if (layout.ornamentStyle === 'none' && !layout.assets?.watermarkUrl) return null;

    return (
      <div className="absolute inset-0 pointer-events-none z-30" style={ornamentOffsetStyle}>
        {/* Custom Watermark Asset */}
        {layout.assets?.watermarkUrl && (
          <img
            src={layout.assets.watermarkUrl}
            alt="Watermark"
            referrerPolicy="no-referrer"
            className="absolute bottom-2 right-2 max-w-[40px] max-h-[40px] object-contain opacity-40 select-none"
          />
        )}

        {layout.ornamentStyle === 'geometric_corners' && (
          <>
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: themeColor }} />
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 pointer-events-none" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 pointer-events-none" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: themeColor }} />
          </>
        )}

        {layout.ornamentStyle === 'laser_hud' && (
          <>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-12 flex flex-col justify-between py-1 pointer-events-none">
              <span className="w-1 h-0.5" style={{ backgroundColor: themeColor }} />
              <span className="w-1 h-0.5" style={{ backgroundColor: themeColor }} />
              <span className="w-1 h-0.5" style={{ backgroundColor: themeColor }} />
            </div>
            <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: themeColor }} />
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: themeColor }} />
          </>
        )}

        {layout.ornamentStyle === 'crest_shield' && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 pointer-events-none opacity-80">
            <Shield className="w-4 h-4" style={{ color: themeColor }} />
          </div>
        )}

        {layout.ornamentStyle === 'ambient_glow' && (
          <div
            className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-30"
            style={{ backgroundColor: themeColor }}
          />
        )}

        {layout.ornamentStyle === 'cyberpunk_bracket' && (
          <>
            <div className="absolute top-2 left-2 pointer-events-none text-[8px] font-mono font-bold" style={{ color: themeColor }}>
              [01]
            </div>
            <div className="absolute top-2 right-2 pointer-events-none text-[8px] font-mono font-bold" style={{ color: themeColor }}>
              SYS_OK
            </div>
          </>
        )}
      </div>
    );
  };

  // 8. Gradient Overlay Generator
  const renderGradientOverlay = () => {
    switch (layout.gradientOverlay) {
      case 'bottom_only':
        return <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent pointer-events-none z-10" />;
      case 'radial_subtle':
        return <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/25 to-black/85 pointer-events-none z-10" />;
      case 'vignette':
        return <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.85)] pointer-events-none z-10" />;
      case 'top_only':
        return <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-transparent pointer-events-none z-10" />;
      case 'none':
        return null;
      case 'dark_top_bottom':
      default:
        return <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/50 pointer-events-none z-10" />;
    }
  };

  // =========================================================================
  // INFORMATION LAYOUT DISPATCHER
  // =========================================================================

  // Dynamic panel padding classes for density-aware layouts
  const splitTopPadding = isUltraDense ? 'px-1 py-0.5 rounded-md' : isDense ? 'px-1.5 py-0.5 rounded-lg' : 'px-2 py-1 rounded-xl';
  const splitBottomPadding = isUltraDense ? 'p-1 rounded-md' : isDense ? 'p-1.5 rounded-lg' : 'p-2 sm:p-2.5 rounded-xl';
  const floatingPadding = isUltraDense ? 'px-1.5 py-0.5 rounded-lg' : isDense ? 'px-2 py-1 rounded-xl' : 'px-2.5 py-1.5 rounded-2xl';
  const sideRailPadding = isUltraDense ? 'p-1 rounded-md' : isDense ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl';
  const bottomSheetPadding = isUltraDense ? 'p-1.5 rounded-t-lg' : isDense ? 'p-2 rounded-t-xl' : 'p-2.5 sm:p-3 rounded-t-2xl sm:rounded-t-3xl';
  const matrixBottomPadding = isUltraDense ? 'p-1 rounded-md' : isDense ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl';

  // Safe Inset Calculations based on Card Shape (Chamfer / Arch / Pill / Asymmetric)
  // Ensures elements are kept safely inside bounds and never sliced by corner cuts
  const isChamfer = layout.cardShape === 'chamfer';
  const isArch = layout.cardShape === 'arch';
  const isPill = layout.cardShape === 'pill';
  const isAsymmetric = layout.cardShape === 'asymmetric';

  const safeTopClass = isArch
    ? 'top-3.5 sm:top-4'
    : isChamfer
    ? 'top-2.5 sm:top-3'
    : isPill
    ? 'top-3 sm:top-3.5'
    : isAsymmetric
    ? 'top-2.5 sm:top-3'
    : isUltraDense
    ? 'top-1'
    : isDense
    ? 'top-1.5'
    : 'top-2 sm:top-2.5';

  const safeBottomClass = isChamfer
    ? 'bottom-2.5 sm:bottom-3'
    : isPill
    ? 'bottom-3 sm:bottom-3.5'
    : isAsymmetric
    ? 'bottom-2.5 sm:bottom-3'
    : isUltraDense
    ? 'bottom-1'
    : isDense
    ? 'bottom-1.5'
    : 'bottom-2 sm:bottom-2.5';

  const safeInsetXClass = isChamfer
    ? 'inset-x-2.5 sm:inset-x-3'
    : isPill
    ? 'inset-x-3 sm:inset-x-3.5'
    : isAsymmetric
    ? 'inset-x-2.5 sm:inset-x-3'
    : isUltraDense
    ? 'inset-x-1'
    : isDense
    ? 'inset-x-1.5'
    : 'inset-x-2 sm:inset-x-2.5';

  const safeLeftClass = isChamfer
    ? 'left-2.5 sm:left-3'
    : isPill
    ? 'left-3 sm:left-3.5'
    : isAsymmetric
    ? 'left-2.5 sm:left-3'
    : isUltraDense
    ? 'left-1'
    : isDense
    ? 'left-1.5'
    : 'left-2 sm:left-2.5';

  const safeRightClass = isChamfer
    ? 'right-2.5 sm:right-3'
    : isPill
    ? 'right-3 sm:right-3.5'
    : isAsymmetric
    ? 'right-2.5 sm:right-3'
    : isUltraDense
    ? 'right-1'
    : isDense
    ? 'right-1.5'
    : 'right-2 sm:right-2.5';

  // A. Split Layout (Dual Section: Top Header Bar + Full Bottom Solid Panel)
  const renderSplitLayout = () => {
    return (
      <>
        {/* Top Split Header Bar */}
        <div className={`absolute ${safeTopClass} ${safeInsetXClass} z-20`}>
          <div className={`${splitTopPadding} ${panelBgClass} flex items-center justify-between gap-1 shadow-lg`} style={{ borderColor: `${themeColor}70` }}>
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
              {renderCountryFlag()}
              {renderRankBadge()}
              {renderBodyTypeBadge()}
            </div>
            {renderRatingBlock()}
          </div>
        </div>

        {/* Bottom Full Solid Panel */}
        <div className={`absolute ${safeBottomClass} ${safeInsetXClass} z-20`}>
          <div className={`${splitBottomPadding} ${panelBgClass} shadow-xl`} style={{ borderColor: `${themeColor}70` }}>
            {renderNameBlock()}
            <div className={layout.dividerClass}>
              {renderSpecsBlock()}
            </div>
          </div>
        </div>
      </>
    );
  };

  // B. Floating Pills Layout (Floating badges in corners & centered pill plate)
  const renderFloatingLayout = () => {
    return (
      <>
        {/* Top Left Pill */}
        <div className={`absolute ${safeTopClass} ${safeLeftClass} z-20 flex items-center gap-0.5 sm:gap-1`}>
          <div className={`flex items-center gap-0.5 sm:gap-1 ${isUltraDense ? 'px-1 py-0' : 'px-1.5 sm:px-2 py-0.5'} rounded-full ${panelBgClass} shadow-md`} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            {renderCountryFlag()}
            {renderBodyTypeBadge()}
            {renderRankBadge()}
          </div>
        </div>

        {/* Top Right Pill (Rating) */}
        <div className={`absolute ${safeTopClass} ${safeRightClass} z-20`}>
          {renderRatingBlock()}
        </div>

        {/* Bottom Centered Floating Pill Plate */}
        <div className={`absolute ${safeBottomClass} ${safeInsetXClass} z-20 flex flex-col items-center`}>
          <div className={`w-full ${floatingPadding} ${panelBgClass} shadow-xl`} style={{ borderColor: `${themeColor}70` }}>
            {renderNameBlock()}
            <div className={layout.dividerClass}>
              {renderSpecsBlock()}
            </div>
          </div>
        </div>
      </>
    );
  };

  // C. Side by Side / Side Rail Layout (Vertical HUD on side, aligned names)
  const renderSideRailLayout = () => {
    return (
      <>
        {/* Top Left Rank or Body Type */}
        <div className={`absolute ${safeTopClass} ${safeLeftClass} z-20 flex items-center gap-0.5 sm:gap-1`}>
          {renderRankBadge()}
          {renderBodyTypeBadge()}
        </div>

        {/* Top Right Rating HUD Rail */}
        <div className={`absolute ${safeTopClass} ${safeRightClass} z-20 flex flex-col items-end gap-0.5 sm:gap-1`}>
          {renderRatingBlock()}
          {renderCountryFlag()}
        </div>

        {/* Side Specs Rail */}
        {layout.measurementPos === 'side_rail' && (
          <div className={`absolute ${isUltraDense ? 'top-8 left-1' : 'top-10 sm:top-12 ' + safeLeftClass} z-20 flex flex-col gap-0.5 sm:gap-1`}>
            <div
              className={`${isUltraDense ? 'px-1 py-0.5' : 'px-1.5 py-1'} rounded-md ${panelBgClass} flex flex-col gap-0.5 text-[7px] sm:text-[8px] md:text-[9px] font-mono font-bold text-stone-300 shadow-md`}
              style={{ borderColor: `${themeColor}50` }}
            >
              {canShowCupSize && artist.measurements?.cupSize && (
                <span className="text-amber-300">{artist.measurements.cupSize} CUP</span>
              )}
              {canShowHeight && artist.heightCm && (
                <span>{artist.heightCm} CM</span>
              )}
              {canShowAge && age > 0 && (
                <span className="text-stone-400">{age} TH</span>
              )}
            </div>
          </div>
        )}

        {/* Bottom Info Plate */}
        <div className={`absolute ${safeBottomClass} ${safeInsetXClass} z-20`}>
          <div className={`${sideRailPadding} ${panelBgClass} shadow-xl`} style={{ borderColor: `${themeColor}60` }}>
            {renderNameBlock()}
            {layout.measurementPos !== 'side_rail' && (
              <div className={layout.dividerClass}>
                {renderSpecsBlock()}
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  // D. Bottom Sheet Layout (Solid sliding bottom sheet over photo)
  const renderBottomSheetLayout = () => {
    return (
      <>
        {/* Top Bar for Rank & Country */}
        <div className={`absolute ${safeTopClass} ${safeInsetXClass} z-20 flex items-center justify-between`}>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {renderCountryFlag()}
            {renderRankBadge()}
          </div>
          {renderBodyTypeBadge()}
        </div>

        {/* Bottom Sheet Container */}
        <div className="absolute bottom-0 inset-x-0 z-20">
          <div className={`${bottomSheetPadding} ${panelBgClass} border-b-0 shadow-2xl`} style={{ borderColor: `${themeColor}80` }}>
            <div className="flex items-center justify-between gap-1.5 mb-0.5 sm:mb-1">
              <div className="min-w-0 flex-1">
                {renderNameBlock()}
              </div>
              <div className="shrink-0">
                {renderRatingBlock()}
              </div>
            </div>
            <div className={layout.dividerClass}>
              {renderSpecsBlock()}
            </div>
          </div>
        </div>
      </>
    );
  };

  // E. Dynamic Matrix Layout (Position-by-Position Universal Engine)
  const renderDynamicMatrixLayout = () => {
    const isTopRightRating = layout.ratingPos === 'top_right';
    const isTopLeftRating = layout.ratingPos === 'top_left';
    const isTopCenterRating = layout.ratingPos === 'top_center';
    const isBottomRightRating = layout.ratingPos === 'bottom_right';
    const isBottomLeftRating = layout.ratingPos === 'bottom_left';
    const isCenterRating = layout.ratingPos === 'center';

    const isTopLeftName = layout.namePos === 'top_left';
    const isTopRightName = layout.namePos === 'top_right';
    const isTopCenterName = layout.namePos === 'top_center';
    const isBottomLeftName = layout.namePos === 'bottom_left';
    const isBottomRightName = layout.namePos === 'bottom_right';
    const isBottomCenterName = layout.namePos === 'bottom_center' || layout.namePos === 'footer';

    return (
      <>
        {/* TOP-LEFT REGION */}
        <div className={`absolute ${safeTopClass} ${safeLeftClass} z-20 flex flex-col items-start gap-0.5 sm:gap-1 max-w-[48%]`}>
          {renderRankBadge()}
          {isTopLeftRating && renderRatingBlock()}
          {layout.countryPos === 'top_left' && renderCountryFlag()}
          {layout.bodyTypePos === 'top_left' && renderBodyTypeBadge()}
          {isTopLeftName && (
            <div className="mt-0.5">
              {renderNameBlock()}
            </div>
          )}
        </div>

        {/* TOP-CENTER REGION */}
        <div className={`absolute ${safeTopClass} left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 sm:gap-1 max-w-[60%] text-center`}>
          {isTopCenterRating && renderRatingBlock()}
          {layout.countryPos === 'top_center' && renderCountryFlag()}
          {layout.bodyTypePos === 'top_center' && renderBodyTypeBadge()}
          {isTopCenterName && renderNameBlock()}
        </div>

        {/* TOP-RIGHT REGION */}
        <div className={`absolute ${safeTopClass} ${safeRightClass} z-20 flex flex-col items-end gap-0.5 sm:gap-1 max-w-[48%] text-right`}>
          {isTopRightRating && renderRatingBlock()}
          {layout.bodyTypePos === 'top_right' && renderBodyTypeBadge()}
          {layout.countryPos === 'top_right' && renderCountryFlag()}
          {isTopRightName && (
            <div className="mt-0.5">
              {renderNameBlock()}
            </div>
          )}
        </div>

        {/* CENTER REGION */}
        {isCenterRating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            {renderRatingBlock()}
          </div>
        )}

        {/* BOTTOM-LEFT REGION */}
        {isBottomLeftRating && (
          <div className={`absolute ${isUltraDense ? 'bottom-8 left-1' : 'bottom-10 sm:bottom-12 ' + safeLeftClass} z-20`}>
            {renderRatingBlock()}
          </div>
        )}

        {/* BOTTOM-RIGHT REGION */}
        {isBottomRightRating && (
          <div className={`absolute ${isUltraDense ? 'bottom-8 right-1' : 'bottom-10 sm:bottom-12 ' + safeRightClass} z-20`}>
            {renderRatingBlock()}
          </div>
        )}

        {/* BOTTOM SECTION (NAMES & SPECS) */}
        <div
          className={`absolute ${safeBottomClass} ${safeInsetXClass} z-20 flex flex-col ${
            isBottomLeftName
              ? 'items-start text-left'
              : isBottomRightName
              ? 'items-end text-right'
              : 'items-center text-center'
          } px-0.5`}
        >
          {layout.footerPos === 'bottom_full' ? (
            <div className={`w-full ${matrixBottomPadding} ${panelBgClass} shadow-xl`} style={{ borderColor: `${themeColor}70` }}>
              {renderNameBlock()}
              <div className={layout.dividerClass}>
                {renderSpecsBlock()}
              </div>
            </div>
          ) : layout.footerPos === 'pill_center' ? (
            <div className={`w-full px-2.5 py-1.5 rounded-2xl ${panelBgClass} shadow-xl`} style={{ borderColor: `${themeColor}70` }}>
              {renderNameBlock()}
              <div className={layout.dividerClass}>
                {renderSpecsBlock()}
              </div>
            </div>
          ) : (
            <>
              {isBottomCenterName || isBottomLeftName || isBottomRightName ? renderNameBlock() : null}
              <div className={layout.dividerClass}>
                {renderSpecsBlock()}
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  // Main layout router
  const renderLayoutContent = () => {
    if (isCustomStudioTheme) {
      return renderUniversalLayers();
    }

    switch (layout.infoLayout) {
      case 'split':
        return renderSplitLayout();
      case 'floating':
        return renderFloatingLayout();
      case 'side_by_side':
        return renderSideRailLayout();
      case 'bottom_sheet':
        return renderBottomSheetLayout();
      case 'overlay':
      default:
        return renderDynamicMatrixLayout();
    }
  };

  // Custom thumbnail shape rendering wrapper
  const renderThumbnailContent = () => {
    const thumbOffsetStyle = getOffsetStyle(offsets.thumbnailOffset);
    const maskStyle = getMaskStyle();

    const thumbElem = layout.elements?.thumbnail;
    const thumbScaleRaw = thumbElem?.scale !== undefined ? thumbElem.scale : 1.0;
    const thumbScale = thumbScaleRaw > 10 ? thumbScaleRaw / 100 : Math.max(0.1, Math.min(3.0, thumbScaleRaw));
    const thumbOpacityRaw = thumbElem?.opacity !== undefined ? thumbElem.opacity : 100;
    const thumbOpacity = thumbOpacityRaw > 1 ? thumbOpacityRaw / 100 : Math.max(0, Math.min(1, thumbOpacityRaw));
    const thumbOffsetX = thumbElem?.offsetX ?? 0;
    const thumbOffsetY = thumbElem?.offsetY ?? 0;

    let thumbFilter: string | undefined = undefined;
    if (thumbElem?.filter && thumbElem.filter !== 'none') {
      switch (thumbElem.filter) {
        case 'drop_shadow':
          thumbFilter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.85))';
          break;
        case 'glow':
          thumbFilter = `drop-shadow(0 0 10px ${themeColor || '#FE9900'})`;
          break;
        case 'blur':
          thumbFilter = `blur(${thumbElem.filterValue || 4}px)`;
          break;
        case 'grayscale':
          thumbFilter = 'grayscale(100%)';
          break;
        case 'brightness':
          thumbFilter = `brightness(${thumbElem.filterValue !== undefined ? thumbElem.filterValue / 100 : 1.4})`;
          break;
        case 'contrast':
          thumbFilter = `contrast(${thumbElem.filterValue !== undefined ? thumbElem.filterValue / 100 : 1.4})`;
          break;
        case 'invert':
          thumbFilter = 'invert(100%)';
          break;
        case 'sepia':
          thumbFilter = 'sepia(100%)';
          break;
      }
    }

    // Safe Avatar Image Loader with graceful fallback
    const renderAvatarImg = () => (
      <img
        src={artist.avatarUrl}
        alt={`${artist.firstName} ${artist.lastName || ''}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (!target.dataset.triedFallback) {
            target.dataset.triedFallback = 'true';
            target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              artist.firstName
            )}&backgroundColor=1c1917,292524&textColor=fbbf24`;
          }
        }}
        className={layout.thumbnailImgClass}
        style={{
          ...thumbOffsetStyle,
          transform: `translate(${thumbOffsetX}px, ${thumbOffsetY}px) scale(${thumbScale})`,
          opacity: thumbOpacity,
          filter: thumbFilter,
          transformOrigin: 'center center',
        }}
      />
    );

    // 1. Texture / Pattern Overlay Layer
    const renderTextureLayer = () => {
      const textureUrl = layout.assets?.textureUrl || layout.assets?.overlayPatternUrl;
      if (!textureUrl) return null;
      const cfg = layout.assets?.textureConfig;
      const opacity = cfg?.opacity !== undefined ? Math.max(0, Math.min(1, cfg.opacity)) : 0.3;
      const blendMode = (cfg?.blendMode as any) || 'overlay';

      return (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `url("${textureUrl}")`,
            backgroundRepeat: cfg?.position === 'repeat' || !cfg?.position ? 'repeat' : 'no-repeat',
            backgroundPosition: cfg?.position === 'repeat' ? 'center' : (cfg?.position || 'center'),
            backgroundSize: cfg?.scale ? `${cfg.scale * 100}%` : 'auto',
            opacity,
            mixBlendMode: blendMode,
          }}
        />
      );
    };

    // 2. Background Image Layer
    const renderBackgroundLayer = () => {
      if (!layout.assets?.backgroundImageUrl) return null;
      return (
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none z-0 opacity-40"
          style={{ backgroundImage: `url("${layout.assets.backgroundImageUrl}")` }}
        />
      );
    };

    // 3. Graphic Symbol / Crest Layer
    const renderSymbolLayer = () => {
      const symbolUrl = layout.assets?.symbolUrl || layout.assets?.watermarkUrl;
      if (!symbolUrl) return null;
      const cfg = layout.assets?.symbolConfig;
      const scale = cfg?.scale !== undefined ? Math.max(0.2, Math.min(2.5, cfg.scale)) : 1.0;
      const opacity = cfg?.opacity !== undefined ? Math.max(0, Math.min(1, cfg.opacity)) : 0.75;
      const rotation = cfg?.rotation || 0;
      const offsetX = Math.max(-30, Math.min(30, cfg?.offsetX || 0));
      const offsetY = Math.max(-30, Math.min(30, cfg?.offsetY || 0));

      const getPosClasses = (pos?: string) => {
        switch (pos) {
          case 'top_left':
            return 'top-2.5 left-2.5';
          case 'top_right':
            return 'top-2.5 right-2.5';
          case 'top_center':
            return 'top-3 left-1/2 -translate-x-1/2';
          case 'bottom_left':
            return 'bottom-2.5 left-2.5';
          case 'bottom_right':
            return 'bottom-2.5 right-2.5';
          case 'bottom_center':
            return 'bottom-3 left-1/2 -translate-x-1/2';
          case 'center':
          default:
            return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        }
      };

      return (
        <div
          className={`absolute pointer-events-none z-20 transition-opacity ${getPosClasses(cfg?.position)}`}
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`,
            transformOrigin: 'center center',
            opacity,
          }}
        >
          <img
            src={symbolUrl}
            alt="Symbol"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="max-w-[54px] max-h-[54px] object-contain drop-shadow-md"
          />
        </div>
      );
    };

    // 4. Secondary Emblem / Seal Layer
    const renderEmblemLayer = () => {
      const emblemUrl = layout.assets?.emblemUrl || layout.assets?.customBadgeIconUrl;
      if (!emblemUrl) return null;
      const cfg = layout.assets?.emblemConfig;
      const scale = cfg?.scale !== undefined ? Math.max(0.2, Math.min(2.0, cfg.scale)) : 0.8;
      const opacity = cfg?.opacity !== undefined ? Math.max(0, Math.min(1, cfg.opacity)) : 0.85;

      return (
        <div
          className="absolute top-2 left-2 pointer-events-none z-20"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            opacity,
          }}
        >
          <img
            src={emblemUrl}
            alt="Emblem"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="w-7 h-7 object-contain drop-shadow"
          />
        </div>
      );
    };

    // 5. Decorative Border Frame Layer
    const renderBorderFrameLayer = () => {
      if (!layout.assets?.borderFrameUrl) return null;
      const cfg = layout.assets?.borderFrameConfig;
      const opacity = cfg?.opacity !== undefined ? Math.max(0, Math.min(1, cfg.opacity)) : 0.9;
      const inset = cfg?.inset !== undefined ? Math.max(0, Math.min(16, cfg.inset)) : 0;

      return (
        <div
          className="absolute pointer-events-none z-30 overflow-hidden"
          style={{
            top: `${inset}px`,
            left: `${inset}px`,
            right: `${inset}px`,
            bottom: `${inset}px`,
            opacity,
          }}
        >
          <img
            src={layout.assets.borderFrameUrl}
            alt="Border Frame"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="w-full h-full object-fill pointer-events-none"
          />
        </div>
      );
    };

    // 6. Header / Ribbon Banner Layer
    const renderBannerLayer = () => {
      if (!layout.assets?.bannerUrl) return null;
      const cfg = layout.assets?.bannerConfig;
      const pos = cfg?.position || 'top';
      const opacity = cfg?.opacity !== undefined ? Math.max(0, Math.min(1, cfg.opacity)) : 0.95;

      return (
        <div
          className={`absolute left-0 right-0 pointer-events-none z-20 flex justify-center ${
            pos === 'bottom' ? 'bottom-0' : 'top-0'
          }`}
          style={{ opacity }}
        >
          <img
            src={layout.assets.bannerUrl}
            alt="Banner"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
            className="w-full max-h-12 object-contain drop-shadow-lg"
          />
        </div>
      );
    };

    if (layout.thumbnailShape === 'inset') {
      return (
        <div className="relative w-full h-full p-2 bg-stone-950 flex flex-col">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          <div
            className="relative w-full h-full overflow-hidden rounded-xl border border-white/10 shadow-inner"
            style={maskStyle}
          >
            {renderAvatarImg()}
            {renderGradientOverlay()}
            {renderOrnaments()}
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    if (layout.thumbnailShape === 'circular') {
      return (
        <div className="relative w-full h-full bg-stone-950 flex flex-col justify-between p-2 sm:p-2.5">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          {renderGradientOverlay()}
          {renderOrnaments()}

          {/* Centered Circular Portrait (Responsive with cqw scale) */}
          <div
            className="relative z-10 w-[52%] max-w-[140px] aspect-square rounded-full mx-auto mt-2 overflow-hidden border-2 shadow-2xl shrink-0"
            style={{ borderColor: themeColor, ...maskStyle }}
          >
            {renderAvatarImg()}
          </div>

          <div className="relative z-20 w-full mt-auto">
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    if (layout.thumbnailShape === 'arch') {
      return (
        <div className="relative w-full h-full p-1.5 sm:p-2 bg-stone-950 flex flex-col">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          <div
            className="relative w-full h-full overflow-hidden rounded-t-full rounded-b-xl border border-white/10 shadow-inner"
            style={maskStyle}
          >
            {renderAvatarImg()}
            {renderGradientOverlay()}
            {renderOrnaments()}
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    if (layout.thumbnailShape === 'squircle') {
      return (
        <div className="relative w-full h-full p-1.5 sm:p-2 bg-stone-950 flex flex-col">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          <div
            className="relative w-full h-full overflow-hidden rounded-[22px] border border-white/15 shadow-inner"
            style={maskStyle}
          >
            {renderAvatarImg()}
            {renderGradientOverlay()}
            {renderOrnaments()}
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    if (layout.thumbnailShape === 'diamond') {
      return (
        <div className="relative w-full h-full bg-stone-950 flex flex-col justify-between p-2 sm:p-2.5">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          {renderGradientOverlay()}
          {renderOrnaments()}

          {/* Centered Diamond Portrait (Responsive with cqw scale) */}
          <div
            className="relative z-10 w-[52%] max-w-[140px] aspect-square mx-auto mt-2 overflow-hidden border-2 shadow-2xl shrink-0 flex items-center justify-center"
            style={{
              borderColor: themeColor,
              clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
              backgroundColor: 'rgba(0,0,0,0.6)',
              ...maskStyle,
            }}
          >
            {renderAvatarImg()}
          </div>

          <div className="relative z-20 w-full mt-auto">
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    if (layout.thumbnailShape === 'polaroid') {
      return (
        <div className="relative w-full h-full p-2 bg-stone-900 text-stone-100 flex flex-col shadow-2xl">
          {renderBackgroundLayer()}
          {renderTextureLayer()}
          {renderBannerLayer()}
          {renderSymbolLayer()}
          {renderEmblemLayer()}
          <div
            className="relative w-full h-[58%] overflow-hidden rounded-lg border border-white/10"
            style={maskStyle}
          >
            {renderAvatarImg()}
            {renderGradientOverlay()}
            {renderOrnaments()}
          </div>
          <div className="relative flex-1 flex flex-col justify-center px-0.5 pt-1.5 z-20 min-w-0">
            {renderLayoutContent()}
          </div>
          {renderBorderFrameLayer()}
        </div>
      );
    }

    // Default: Full Bleed (100% full background)
    return (
      <div className="relative flex-1 w-full h-full overflow-hidden bg-stone-950">
        {renderBackgroundLayer()}
        {renderTextureLayer()}
        <div className="absolute inset-0 w-full h-full" style={maskStyle}>
          {renderAvatarImg()}
        </div>
        {renderGradientOverlay()}
        {renderBannerLayer()}
        {renderSymbolLayer()}
        {renderEmblemLayer()}
        {renderOrnaments()}
        {renderLayoutContent()}
        {renderBorderFrameLayer()}
      </div>
    );
  };

  const handleCardClick = () => {
    if (isSelectionMode) {
      if (onToggleSelect) {
        onToggleSelect(artist.id);
      }
    } else {
      onClick?.();
    }
  };

  const searchMatchPreview = useMemo(() => {
    return searchQuery ? getArtistSearchMatchPreview(artist, searchQuery) : null;
  }, [artist, searchQuery]);

  return (
    <div
      ref={isDownloadableRef}
      id={`artist-card-${artist.id}`}
      onClick={handleCardClick}
      className={`card-virtual-item group relative flex flex-col cursor-pointer overflow-hidden bg-stone-900 transition-transform duration-200 hover:scale-[1.02] transition-shadow hover:shadow-2xl select-none ${layout.cardShapeClass} ${className} ${
        isSelected ? 'ring-2 ring-rose-500 shadow-rose-500/30' : ''
      }`}
      style={{
        borderColor: isSelected ? '#F43F5E' : themeColor,
        borderWidth: `${layout.borderWidth}px`,
        borderStyle: layout.borderWidth > 0 ? 'solid' : 'none',
        aspectRatio: computedAspectRatio,
        borderRadius: layout.borderRadius !== undefined ? layout.borderRadius : undefined,
        backgroundColor: layout.cardBgOpacity !== undefined ? `rgba(18, 16, 24, ${layout.cardBgOpacity / 100})` : undefined,
        backdropFilter: layout.cardBackdropBlur !== undefined ? `blur(${layout.cardBackdropBlur}px)` : undefined,
        WebkitBackdropFilter: layout.cardBackdropBlur !== undefined ? `blur(${layout.cardBackdropBlur}px)` : undefined,
        containerType: 'inline-size' as any,
        ...layout.chamferClipStyle,
      }}
    >
      {renderThumbnailContent()}

      {/* Search Match Context Snippet Overlay */}
      {searchMatchPreview && searchMatchPreview.matchedField !== 'name' && (
        <div className="absolute bottom-1 inset-x-1 z-40 px-2 py-1 rounded-md bg-stone-950/95 border border-amber-500/80 text-[10px] text-stone-200 shadow-2xl backdrop-blur-md flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-1">
          <div className="flex items-center gap-1 text-[9px] font-mono uppercase font-bold text-amber-400">
            <SearchIcon className="w-2.5 h-2.5" />
            <span>Match: {searchMatchPreview.label}</span>
          </div>
          <p className="line-clamp-2 text-[10px] font-sans font-medium text-stone-100 leading-snug">
            <SearchHighlight text={searchMatchPreview.snippet} query={searchQuery} />
          </p>
        </div>
      )}

      {/* Multi-Select Mode Checkbox Overlay */}
      {isSelectionMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(artist.id);
          }}
          className={`absolute top-2 left-2 z-40 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 shadow-lg border cursor-pointer ${
            isSelected
              ? 'bg-rose-500 text-white border-rose-300 scale-110'
              : 'bg-black/75 text-transparent border-stone-500 hover:border-white'
          }`}
          title={isSelected ? 'Batalkan pilihan' : 'Pilih kartu ini'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      {/* Interactive Quick Favorite Button Overlay (Only when not in selection mode) */}
      {!isSelectionMode && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(artist.id);
          }}
          className={`absolute top-2 right-2 z-40 p-1.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-md ${
            isFav
              ? 'bg-amber-500 text-stone-950 scale-105 opacity-100'
              : 'bg-black/50 text-white/70 hover:text-amber-300 hover:bg-black/80 opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100'
          }`}
          title={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
          aria-label={isFav ? 'Hapus dari favorit' : 'Simpan ke favorit'}
        >
          <Star className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  );
};

export const ArtistCard = memo(ArtistCardComponent, (prev, next) => {
  return (
    prev.artist === next.artist &&
    prev.rank === next.rank &&
    prev.showRankBadge === next.showRankBadge &&
    prev.className === next.className &&
    prev.cardTheme === next.cardTheme &&
    prev.cardThemeDefinition === next.cardThemeDefinition &&
    prev.density === next.density &&
    prev.isSelectionMode === next.isSelectionMode &&
    prev.isSelected === next.isSelected &&
    prev.searchQuery === next.searchQuery
  );
});
