import React from 'react';
import {
  UIThemeDefinition,
  UIThemeGlobalConfig,
  UIThemeHomeConfig,
  UIThemeArtistDetailConfig,
  UIThemeRankingConfig,
  UIThemeCompareConfig,
  UIThemeTokens,
  UIThemeShapeSystem,
  UIThemeDecorationSystem,
  LayoutScoreConfig,
  DEFAULT_LAYOUT_SCORE_CONFIG,
} from '../types';
import { AppColorThemePreset, BUILTIN_COLOR_THEMES } from '../data/themePresets';
import { DEFAULT_UI_THEMES } from '../data/defaultUIThemes';

export const FALLBACK_UI_THEME: UIThemeDefinition = DEFAULT_UI_THEMES[0];

export function toSafeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string' && val.trim().length > 0) return val;
  if (typeof val === 'number') return String(val);
  if (val && typeof val === 'object') {
    if (typeof val.type === 'string') return val.type;
    if (typeof val.id === 'string') return val.id;
    if (typeof val.name === 'string') return val.name;
    if (typeof val.style === 'string') return val.style;
    if (typeof val.layout === 'string') return val.layout;
    if (typeof val.mode === 'string') return val.mode;
    if (typeof val.variant === 'string') return val.variant;
  }
  return fallback;
}

/**
 * Universal Theme Normalizer:
 * Validates, normalizes, and injects default design tokens, compositions, and systems
 * into any raw or partial JSON theme definition.
 */
export function resolveUITheme(
  themeDef?: Partial<UIThemeDefinition> | null,
  isDark: boolean = true
): UIThemeDefinition {
  const base = FALLBACK_UI_THEME;
  if (!themeDef) return base;

  // 1. Resolve Tokens
  const rawTokens = themeDef.tokens || {};
  const tokens: UIThemeTokens = {
    colors: {
      primary: toSafeString(rawTokens.colors?.primary || themeDef.global?.primaryColor || base.global.primaryColor, '#FE9900'),
      primaryHover: toSafeString(rawTokens.colors?.primaryHover, '#E08600'),
      accent: toSafeString(rawTokens.colors?.accent || themeDef.global?.accentColor || base.global.accentColor, '#F59E0B'),
      background: toSafeString(rawTokens.colors?.background || themeDef.global?.backgroundColor, isDark ? '#0C0A09' : '#F5F5F4'),
      surface: toSafeString(rawTokens.colors?.surface || themeDef.global?.surfaceColor, isDark ? '#1C1917' : '#FFFFFF'),
      secondarySurface: toSafeString(rawTokens.colors?.secondarySurface || themeDef.global?.secondarySurfaceColor, isDark ? '#292524' : '#E7E5E4'),
      surfaceElevated: toSafeString(rawTokens.colors?.surfaceElevated, isDark ? '#292524' : '#FFFFFF'),
      primaryText: toSafeString(rawTokens.colors?.primaryText || themeDef.global?.primaryTextColor, isDark ? '#FAFAF9' : '#1C1917'),
      secondaryText: toSafeString(rawTokens.colors?.secondaryText || themeDef.global?.secondaryTextColor, isDark ? '#A8A29E' : '#78716C'),
      mutedText: toSafeString(rawTokens.colors?.mutedText, isDark ? '#78716C' : '#A8A29E'),
      border: toSafeString(rawTokens.colors?.border || themeDef.global?.borderColor, isDark ? '#44403C' : '#D6D3D1'),
      borderActive: toSafeString(rawTokens.colors?.borderActive || themeDef.global?.primaryColor, '#FE9900'),
      divider: toSafeString(rawTokens.colors?.divider || themeDef.global?.dividerColor, isDark ? '#292524' : '#E7E5E4'),
      glow: toSafeString(rawTokens.colors?.glow || themeDef.global?.primaryColor, 'rgba(254,153,0,0.4)'),
    },
    typography: {
      fontFamily: toSafeString(rawTokens.typography?.fontFamily, 'Plus Jakarta Sans'),
      displayFont: toSafeString(rawTokens.typography?.displayFont || rawTokens.typography?.fontFamily, 'Plus Jakarta Sans'),
      headingFont: toSafeString(rawTokens.typography?.headingFont || rawTokens.typography?.fontFamily, 'Plus Jakarta Sans'),
      fontScale: (toSafeString(rawTokens.typography?.fontScale, 'normal') as any),
      headingWeight: (toSafeString(rawTokens.typography?.headingWeight, 'bold') as any),
      bodyWeight: (toSafeString(rawTokens.typography?.bodyWeight, 'normal') as any),
      letterSpacing: (toSafeString(rawTokens.typography?.letterSpacing, 'normal') as any),
      uppercaseHeadings: rawTokens.typography?.uppercaseHeadings || false,
    },
    spacing: {
      pagePadding: (toSafeString(rawTokens.spacing?.pagePadding, 'normal') as any),
      sectionGap: (toSafeString(rawTokens.spacing?.sectionGap, 'normal') as any),
      cardGap: (toSafeString(rawTokens.spacing?.cardGap || (themeDef.home?.gridGap as any), 'normal') as any),
      itemPadding: (toSafeString(rawTokens.spacing?.itemPadding, 'normal') as any),
    },
    radius: {
      base: (toSafeString(rawTokens.radius?.base || themeDef.global?.borderRadius, '2xl') as any),
      card: (toSafeString(rawTokens.radius?.card || themeDef.global?.borderRadius, '2xl') as any),
      button: (toSafeString(rawTokens.radius?.button || (themeDef.global?.buttonStyle === 'pill' ? 'full' : themeDef.global?.borderRadius), '2xl') as any),
      badge: (toSafeString(rawTokens.radius?.badge, 'full') as any),
      inner: (toSafeString(rawTokens.radius?.inner, 'xl') as any),
    },
    borders: {
      width: typeof rawTokens.borders?.width === 'number' ? rawTokens.borders.width : 1,
      style: (toSafeString(rawTokens.borders?.style, 'solid') as any),
      color: toSafeString(rawTokens.borders?.color || themeDef.global?.borderColor, isDark ? '#44403C' : '#D6D3D1'),
      opacity: typeof rawTokens.borders?.opacity === 'number' ? rawTokens.borders.opacity : 1,
    },
    shadows: {
      elevation: (toSafeString(rawTokens.shadows?.elevation || themeDef.global?.elevation, 'medium') as any),
      glowSpread: typeof rawTokens.shadows?.glowSpread === 'number' ? rawTokens.shadows.glowSpread : 12,
      glowColor: toSafeString(rawTokens.shadows?.glowColor, 'rgba(254, 153, 0, 0.25)'),
    },
    opacity: {
      surface: typeof rawTokens.opacity?.surface === 'number' ? rawTokens.opacity.surface : 1,
      backdrop: typeof rawTokens.opacity?.backdrop === 'number' ? rawTokens.opacity.backdrop : 0.8,
      overlay: typeof rawTokens.opacity?.overlay === 'number' ? rawTokens.opacity.overlay : 0.6,
      muted: typeof rawTokens.opacity?.muted === 'number' ? rawTokens.opacity.muted : 0.5,
    },
    animation: {
      speed: (toSafeString(rawTokens.animation?.speed, 'normal') as any),
      hoverScale: rawTokens.animation?.hoverScale ?? true,
      pageTransitions: rawTokens.animation?.pageTransitions ?? true,
    },
    icons: {
      style: (toSafeString(rawTokens.icons?.style || themeDef.global?.iconStyle, 'solid') as any),
      strokeWidth: typeof rawTokens.icons?.strokeWidth === 'number' ? rawTokens.icons.strokeWidth : typeof themeDef.global?.iconStrokeWidth === 'number' ? themeDef.global.iconStrokeWidth : 2,
      glow: rawTokens.icons?.glow ?? false,
      shape: (toSafeString(rawTokens.icons?.shape, 'none') as any),
    },
    shape: (toSafeString(rawTokens.shape || (themeDef.global?.buttonStyle === 'chamfer' ? 'chamfer' : 'rounded'), 'rounded') as any),
    surface: (toSafeString(rawTokens.surface || (themeDef.global?.glassmorphism ? 'glass' : 'solid'), 'solid') as any),
    density: (toSafeString(rawTokens.density || themeDef.global?.uiDensity, 'normal') as any),
    backgroundTexture: (toSafeString(rawTokens.backgroundTexture, 'none') as any),
    ambientGlowEffect: (toSafeString(rawTokens.ambientGlowEffect, 'none') as any),
  };

  // 2. Resolve Shape System
  const shapeSystem: UIThemeShapeSystem = {
    containerStyle: (toSafeString(themeDef.shapeSystem?.containerStyle || (themeDef.global?.buttonStyle === 'chamfer' ? 'chamfer' : 'rounded'), 'rounded') as any),
    containerCutStyle: (toSafeString(themeDef.shapeSystem?.containerCutStyle || (themeDef.global?.buttonStyle === 'chamfer' ? 'chamfer' : 'rounded'), 'rounded') as any),
    badgeStyle: (toSafeString(themeDef.shapeSystem?.badgeStyle || (themeDef.global?.buttonStyle === 'chamfer' ? 'chamfer' : 'pill'), 'pill') as any),
    cardStyle: (toSafeString(themeDef.shapeSystem?.cardStyle || (themeDef.global?.glassmorphism ? 'glassmorphic' : 'elevated'), 'elevated') as any),
    elevationStyle: (toSafeString(themeDef.shapeSystem?.elevationStyle || (tokens.shadows?.elevation as any), 'medium') as any),
  };

  // 3. Resolve Decoration System
  const decorationSystem: UIThemeDecorationSystem = {
    showCornerBrackets: themeDef.decorationSystem?.showCornerBrackets ?? (themeDef.global?.navigationStyle === 'compact_hud' || themeDef.id?.includes('cyber') || themeDef.id?.includes('hud')),
    showGridBackground: themeDef.decorationSystem?.showGridBackground ?? (themeDef.id?.includes('cyber') || themeDef.id?.includes('hud')),
    showGeometricLines: themeDef.decorationSystem?.showGeometricLines ?? (themeDef.id?.includes('editorial') || themeDef.id?.includes('vogue') || themeDef.id?.includes('minimal') || themeDef.id?.includes('swiss')),
    showRadialGlows: themeDef.decorationSystem?.showRadialGlows ?? (themeDef.global?.elevation === 'glowing' || tokens.ambientGlowEffect !== 'none'),
    accentBarPosition: (toSafeString(themeDef.decorationSystem?.accentBarPosition, themeDef.id?.includes('hud') ? 'left' : 'none') as any),
    ornamentStyle: (toSafeString(themeDef.decorationSystem?.ornamentStyle, themeDef.id?.includes('cyber') ? 'crosshairs' : themeDef.id?.includes('editorial') ? 'magazine_stamp' : 'none') as any),
    headingDecorator: (toSafeString(themeDef.decorationSystem?.headingDecorator, themeDef.id?.includes('cyber') ? 'code_slash' : themeDef.id?.includes('swiss') ? 'bracketed' : themeDef.id?.includes('gold') ? 'gold_diamonds' : 'none') as any),
    sectionDividerStyle: (toSafeString(themeDef.decorationSystem?.sectionDividerStyle, 'hairline_solid') as any),
  };

  // 4. Resolve Global Config
  const global: UIThemeGlobalConfig = {
    ...base.global,
    ...(themeDef.global || {}),
    primaryColor: toSafeString(tokens.colors?.primary, '#FE9900'),
    accentColor: toSafeString(tokens.colors?.accent, '#F59E0B'),
    backgroundColor: tokens.colors?.background,
    surfaceColor: tokens.colors?.surface,
    secondarySurfaceColor: tokens.colors?.secondarySurface,
    primaryTextColor: tokens.colors?.primaryText,
    secondaryTextColor: tokens.colors?.secondaryText,
    borderColor: tokens.colors?.border,
    dividerColor: tokens.colors?.divider,
    borderRadius: (toSafeString(tokens.radius?.base, '2xl') as any),
    elevation: (toSafeString(tokens.shadows?.elevation || themeDef.global?.elevation, 'medium') as any),
    navigationStyle: (toSafeString(themeDef.global?.navigationStyle, 'floating_pill') as any),
  };

  // 5. Resolve Home Page Config & Compositions
  const rawHome = themeDef.home || {};
  const rawComp = (rawHome.composition as any) || {};
  const rawCollection = rawHome.collection || rawComp.collection || {};
  const rawItem = rawHome.item || rawComp.item || {};
  const rawResponsive = rawHome.responsiveCollection || rawComp.responsiveCollection || rawComp.responsive || {};
  const rawFieldPresentation = rawHome.fieldPresentation || rawComp.fieldPresentation || {};

  const homeLayout = toSafeString(
    rawHome.layout,
    toSafeString(
      rawComp.type,
      toSafeString(
        rawCollection.type,
        themeDef.id === 'editorial_vogue'
          ? 'featured_hero'
          : themeDef.id === 'technical_hud'
          ? 'compact_grid'
          : base.home.layout || 'dashboard'
      )
    )
  );
  
  // Normalize collection config
  const collectionType = toSafeString(
    rawCollection.type,
    toSafeString(
      rawComp.type,
      homeLayout === 'list'
        ? 'list'
        : homeLayout === 'compact_list'
        ? 'compact_list'
        : homeLayout === 'roster'
        ? 'roster'
        : homeLayout === 'table'
        ? 'table'
        : homeLayout === 'masonry'
        ? 'masonry'
        : homeLayout === 'asymmetric_grid'
        ? 'asymmetric_grid'
        : homeLayout === 'split'
        ? 'split'
        : 'grid'
    )
  );

  const isListVariant = collectionType === 'list' || collectionType === 'compact_list' || collectionType === 'roster' || collectionType === 'table';

  const collection = {
    type: collectionType,
    orientation: toSafeString(rawCollection.orientation || rawComp.direction, 'vertical'),
    columns: typeof rawCollection.columns === 'number' ? rawCollection.columns : (isListVariant ? 1 : 3),
    gap: toSafeString(rawCollection.gap || rawHome.gridGap, 'normal'),
    itemHeight: toSafeString(rawCollection.itemHeight, 'auto'),
    thumbnailPosition: toSafeString(rawCollection.thumbnailPosition, isListVariant ? 'left' : 'top'),
    thumbnailSize: toSafeString(rawCollection.thumbnailSize, collectionType === 'compact_list' ? 'tiny' : collectionType === 'list' ? 'small' : 'medium'),
    contentAlignment: toSafeString(rawCollection.contentAlignment, isListVariant ? 'left' : 'center'),
    ratingPosition: toSafeString(rawCollection.ratingPosition, isListVariant ? 'right' : 'overlay'),
    divider: rawCollection.divider ?? (collectionType === 'table' || collectionType === 'compact_list' || collectionType === 'list'),
    alternatingRows: rawCollection.alternatingRows ?? (collectionType === 'table'),
  };

  const responsiveCollection = {
    mobile: {
      columns: isListVariant ? 1 : 2,
      gap: 'compact',
      thumbnailPosition: collection.thumbnailPosition,
      ...(rawResponsive.mobile || {}),
    },
    tablet: {
      columns: isListVariant ? 1 : 3,
      gap: 'normal',
      thumbnailPosition: collection.thumbnailPosition,
      ...(rawResponsive.tablet || {}),
    },
    desktop: {
      columns: collection.columns || (isListVariant ? 1 : 4),
      gap: collection.gap || 'normal',
      thumbnailPosition: collection.thumbnailPosition,
      ...(rawResponsive.desktop || {}),
    },
  };

  const homeSections = {
    order: Array.isArray(rawHome.sections?.order)
      ? rawHome.sections!.order
      : Array.isArray(rawComp.sectionsOrder)
      ? rawComp.sectionsOrder
      : (
        homeLayout === 'featured_hero' || homeLayout === 'featured'
          ? ['hero', 'search_filter', 'grid']
          : homeLayout === 'split_dashboard' || homeLayout === 'split'
          ? ['hero', 'stats', 'search_filter', 'grid']
          : homeLayout === 'horizontal_shelf'
          ? ['shelves', 'search_filter', 'grid']
          : ['search_filter', 'grid']
      ),
    spacing: toSafeString(rawHome.sections?.spacing, 'normal'),
    dividers: rawHome.sections?.dividers ?? false,
  };

  const homeItem = {
    layout: toSafeString(rawItem.layout, collectionType === 'table' ? 'table_row' : collectionType === 'roster' ? 'roster_slot' : collectionType === 'list' ? 'horizontal' : 'vertical'),
    thumbnail: {
      position: toSafeString(rawItem.thumbnail?.position || collection.thumbnailPosition, isListVariant ? 'left' : 'top'),
      size: toSafeString(rawItem.thumbnail?.size || collection.thumbnailSize, 'medium'),
      shape: toSafeString(rawItem.thumbnail?.shape, shapeSystem.cardStyle === 'hud_panel' ? 'chamfer' : 'rounded'),
      aspectRatio: toSafeString(rawItem.thumbnail?.aspectRatio, collectionType === 'list' || collectionType === 'compact_list' ? 'square' : 'portrait'),
      fit: toSafeString(rawItem.thumbnail?.fit, 'cover'),
    },
    identity: {
      position: toSafeString(rawItem.identity?.position, isListVariant ? 'center' : 'left'),
      alignment: toSafeString(rawItem.identity?.alignment, 'left'),
    },
    metadata: {
      position: toSafeString(rawItem.metadata?.position, 'below_identity'),
      layout: toSafeString(rawItem.metadata?.layout, 'badges'),
    },
    rating: {
      position: toSafeString(rawItem.rating?.position || collection.ratingPosition, isListVariant ? 'right' : 'overlay'),
      style: toSafeString(rawItem.rating?.style, 'score_badge'),
    },
  };

  const homeFieldPresentation = {
    overall: { style: 'score_badge', position: 'right', ...(rawFieldPresentation.overall || {}) },
    appearance: { style: 'score_badge', ...(rawFieldPresentation.appearance || {}) },
    impression: { style: 'score_badge', ...(rawFieldPresentation.impression || {}) },
    bodyType: { style: 'compact_label', ...(rawFieldPresentation.bodyType || {}) },
    country: { style: 'flag_and_code', ...(rawFieldPresentation.country || {}) },
    measurements: { style: 'bwh_compact', ...(rawFieldPresentation.measurements || {}) },
    age: { style: 'number_years', ...(rawFieldPresentation.age || {}) },
    maturity: { style: 'pill_badge', ...(rawFieldPresentation.maturity || {}) },
    attributes: { style: 'colored_tags', ...(rawFieldPresentation.attributes || {}) },
  };

  const stickySearch = {
    enabled: rawHome.stickySearch?.enabled ?? true,
    position: toSafeString(rawHome.stickySearch?.position, 'top'),
    offset: typeof rawHome.stickySearch?.offset === 'number' ? rawHome.stickySearch.offset : 0,
    elevation: toSafeString(rawHome.stickySearch?.elevation, 'medium'),
  };

  const home: UIThemeHomeConfig = {
    ...base.home,
    ...rawHome,
    layout: (homeLayout as any),
    header: (toSafeString(rawHome.header, 'compact') as any),
    typeTabs: (toSafeString(rawHome.typeTabs, 'segmented') as any),
    gridGap: (toSafeString(rawHome.gridGap, 'normal') as any),
    cardDensityControl: (toSafeString(rawHome.cardDensityControl, 'segmented') as any),
    emptyStateStyle: (toSafeString(rawHome.emptyStateStyle, 'card_box') as any),
    collection,
    responsiveCollection,
    sections: homeSections as any,
    item: homeItem as any,
    fieldPresentation: homeFieldPresentation as any,
    stickySearch: stickySearch as any,
    composition: {
      direction: toSafeString(rawHome.composition?.direction, 'vertical') as any,
      heroSection: {
        enabled: rawHome.composition?.heroSection?.enabled ?? (homeLayout === 'featured_hero' || homeLayout === 'featured' || homeLayout === 'split_dashboard' || homeLayout === 'magazine_bento'),
        style: toSafeString(rawHome.composition?.heroSection?.style, homeLayout === 'split_dashboard' ? 'stat_split' : homeLayout === 'magazine_bento' ? 'magazine_cover' : 'spotlight_card') as any,
        showStats: rawHome.composition?.heroSection?.showStats ?? (homeLayout === 'split_dashboard'),
      },
      sectionsOrder: homeSections.order as any,
      shelves: {
        enabled: rawHome.composition?.shelves?.enabled ?? (homeLayout === 'horizontal_shelf'),
        categoryBased: rawHome.composition?.shelves?.categoryBased ?? true,
      },
      grid: {
        columns: typeof rawHome.composition?.grid?.columns === 'number' ? rawHome.composition.grid.columns : (collection.columns || 3),
        gap: toSafeString(rawHome.composition?.grid?.gap || rawHome.gridGap, 'normal') as any,
        asymmetric: rawHome.composition?.grid?.asymmetric ?? (homeLayout === 'magazine_bento' || homeLayout === 'asymmetric_grid' || homeLayout === 'masonry'),
      },
    },
  };

  // 6. Resolve Artist Detail Config & Compositions
  const rawArtist = themeDef.artistDetail || {};
  const artistLayout = toSafeString(
    rawArtist.layout,
    themeDef.id === 'editorial_vogue'
      ? 'banner_hero'
      : themeDef.id === 'technical_hud'
      ? 'hud_cockpit'
      : base.artistDetail.layout || 'split_hero'
  );
  
  const detailSections = {
    order: Array.isArray(rawArtist.sections?.order) ? rawArtist.sections!.order : ['hero', 'biodata', 'scoring', 'attributes', 'specialty', 'links', 'similar'],
    spacing: toSafeString(rawArtist.sections?.spacing, 'normal'),
    dividers: rawArtist.sections?.dividers ?? false,
  };

  const detailProfile = {
    position: toSafeString(rawArtist.profile?.position, 
      artistLayout === 'reverse_split' ? 'right' :
      artistLayout === 'centered_profile' || artistLayout === 'profile' ? 'center' :
      artistLayout === 'banner_hero' || artistLayout === 'banner' ? 'top' : 'left'
    ),
    alignment: toSafeString(rawArtist.profile?.alignment, artistLayout === 'centered_profile' ? 'center' : 'left'),
  };

  const detailBiodata = {
    layout: toSafeString(rawArtist.biodata?.layout || rawArtist.composition?.biodataLayout, 
      artistLayout === 'hud_cockpit' || artistLayout === 'hud' ? 'table' :
      artistLayout === 'centered_profile' ? 'two_column' : 'grid'
    ),
  };

  const detailScoring = {
    layout: toSafeString(rawArtist.scoring?.layout || (rawArtist.scoringDisplay as any), 'progress_bars'),
  };

  const detailSticky = {
    enabled: rawArtist.stickyProfile?.enabled ?? (rawArtist.stickyProfileBar ?? true),
    position: toSafeString(rawArtist.stickyProfile?.position, 'top'),
    offset: typeof rawArtist.stickyProfile?.offset === 'number' ? rawArtist.stickyProfile.offset : 0,
    elevation: toSafeString(rawArtist.stickyProfile?.elevation, 'medium'),
  };

  const artistDetail: UIThemeArtistDetailConfig = {
    ...base.artistDetail,
    ...rawArtist,
    layout: (artistLayout as any),
    avatarStyle: (toSafeString(rawArtist.avatarStyle, 'full_portrait') as any),
    scoringDisplay: (toSafeString(rawArtist.scoringDisplay, 'progress_bars') as any),
    profile: detailProfile as any,
    biodata: detailBiodata as any,
    scoring: detailScoring as any,
    sections: detailSections as any,
    stickyProfile: detailSticky as any,
    composition: {
      heroDirection: toSafeString(rawArtist.composition?.heroDirection, 
        artistLayout === 'reverse_split'
          ? 'row_reverse'
          : artistLayout === 'banner_hero' || artistLayout === 'banner' || artistLayout === 'profile_hero' || artistLayout === 'profile'
          ? 'column'
          : artistLayout === 'overlay_profile'
          ? 'stacked_overlay'
          : 'row'
      ) as any,
      ratio: Array.isArray(rawArtist.composition?.ratio) ? rawArtist.composition!.ratio : (artistLayout === 'split_hero' || artistLayout === 'reverse_split' || artistLayout === 'split' ? [45, 55] : [50, 50]),
      avatarPosition: toSafeString(rawArtist.composition?.avatarPosition, detailProfile.position as any) as any,
      telemetryRails: rawArtist.composition?.telemetryRails ?? (artistLayout === 'hud_cockpit' || artistLayout === 'hud' || decorationSystem.showCornerBrackets),
      biodataLayout: detailBiodata.layout as any,
    },
  };

  // 7. Resolve Ranking Config & Compositions
  const rawRanking = themeDef.ranking || {};
  const rankingLayout = toSafeString(
    rawRanking.layout,
    themeDef.id === 'editorial_vogue'
      ? 'winner_hero'
      : themeDef.id === 'technical_hud'
      ? 'compact_table'
      : base.ranking.layout || 'podium_focus'
  );
  
  const rankingPodium = {
    layout: toSafeString(rawRanking.podium?.layout || rawRanking.composition?.podiumType, 
      rankingLayout === 'winner_hero' || rankingLayout === 'winner_spotlight' ? 'winner_spotlight' :
      rankingLayout === 'step_podium' ? 'step_horizontal' :
      rankingLayout === 'vertical_podium' ? 'vertical_stack' :
      rankingLayout === 'league_table' || rankingLayout === 'compact_table' ? 'none' : 'centered_olympic'
    ),
    arrangement: toSafeString(rawRanking.podium?.arrangement || rawRanking.podiumArrangement, '1st_center'),
    height: toSafeString(rawRanking.podium?.height, 'normal'),
  };

  const rankingList = {
    rankPosition: toSafeString(rawRanking.list?.rankPosition, 'left'),
    artistIdentity: toSafeString(rawRanking.list?.artistIdentity, 'name_and_country'),
    thumbnail: toSafeString(rawRanking.list?.thumbnail, 'left'),
    score: toSafeString(rawRanking.list?.score, 'large'),
    badge: toSafeString(rawRanking.list?.badge || (rawRanking.positionBadgeStyle as any), 'trophy_crown'),
    rowHeight: toSafeString(rawRanking.list?.rowHeight, rankingLayout === 'compact_table' ? 'compact' : 'normal'),
    spacing: toSafeString(rawRanking.list?.spacing, 'normal'),
    winnerStyling: toSafeString(rawRanking.list?.winnerStyling, 'gold_glow'),
    alternatingRows: rawRanking.list?.alternatingRows ?? (rankingLayout === 'compact_table' || rankingLayout === 'league_table'),
  };

  const rankingSticky = {
    enabled: rawRanking.stickyPodium?.enabled ?? true,
    position: toSafeString(rawRanking.stickyPodium?.position, 'top'),
    offset: typeof rawRanking.stickyPodium?.offset === 'number' ? rawRanking.stickyPodium.offset : 0,
    elevation: toSafeString(rawRanking.stickyPodium?.elevation, 'medium'),
  };

  const ranking: UIThemeRankingConfig = {
    ...base.ranking,
    ...rawRanking,
    layout: (rankingLayout as any),
    podiumStyle: (toSafeString(rawRanking.podiumStyle, 'step_podium') as any),
    podiumArrangement: (toSafeString(rawRanking.podiumArrangement, '1st_center') as any),
    listItemStyle: (toSafeString(rawRanking.listItemStyle, 'numbered_card') as any),
    podium: rankingPodium as any,
    list: rankingList as any,
    stickyPodium: rankingSticky as any,
    composition: {
      podiumType: rankingPodium.layout as any,
      listType: toSafeString(rawRanking.composition?.listType, 
        rankingLayout === 'compact_table'
          ? 'compact_table'
          : rankingLayout === 'league_table'
          ? 'league_table'
          : rankingLayout === 'leaderboard_stream'
          ? 'alternating_rows'
          : 'cards'
      ) as any,
      showLiveTelemetry: rawRanking.composition?.showLiveTelemetry ?? (rankingLayout === 'compact_table' || decorationSystem.showCornerBrackets),
    },
  };

  // 8. Resolve Compare Config & Compositions
  const rawCompare = themeDef.compare || {};
  const compareLayout = toSafeString(
    rawCompare.layout,
    themeDef.id === 'editorial_vogue'
      ? 'center_vs'
      : themeDef.id === 'technical_hud'
      ? 'comparison_matrix'
      : base.compare.layout || 'side_by_side_cards'
  );
  
  const compareFields = {
    layout: toSafeString(rawCompare.fields?.layout, compareLayout === 'comparison_matrix' || compareLayout === 'matrix' || compareLayout === 'diff_table' || compareLayout === 'table' ? 'table' : 'rows'),
    labelPosition: toSafeString(rawCompare.fields?.labelPosition, compareLayout === 'center_vs' ? 'center' : 'sides'),
    valuePosition: toSafeString(rawCompare.fields?.valuePosition, compareLayout === 'comparison_matrix' || compareLayout === 'matrix' ? 'matrix' : 'sides'),
  };

  const compareWinner = {
    enabled: rawCompare.winnerIndicator?.enabled ?? true,
    position: toSafeString(rawCompare.winnerIndicator?.position, 'card'),
    style: toSafeString(rawCompare.winnerIndicator?.style || (rawCompare.winnerHighlight as any), 'glow_border'),
  };

  const compareSticky = {
    enabled: rawCompare.stickyHeaderConfig?.enabled ?? (rawCompare.stickyHeader ?? true),
    position: toSafeString(rawCompare.stickyHeaderConfig?.position, 'top'),
    offset: typeof rawCompare.stickyHeaderConfig?.offset === 'number' ? rawCompare.stickyHeaderConfig.offset : 0,
    elevation: toSafeString(rawCompare.stickyHeaderConfig?.elevation, 'medium'),
  };

  const compare: UIThemeCompareConfig = {
    ...base.compare,
    ...rawCompare,
    layout: (compareLayout as any),
    headerStyle: (toSafeString(rawCompare.headerStyle, 'duel_vs_banner') as any),
    pickerStyle: (toSafeString(rawCompare.pickerStyle, 'horizontal_shelf') as any),
    winnerHighlight: (toSafeString(rawCompare.winnerHighlight, 'glow_border') as any),
    fields: compareFields as any,
    winnerIndicator: compareWinner as any,
    stickyHeaderConfig: compareSticky as any,
    composition: {
      duelOrientation: toSafeString(rawCompare.composition?.duelOrientation, compareLayout === 'vertical_duel' ? 'vertical' : 'horizontal') as any,
      vsBadgePosition: toSafeString(rawCompare.composition?.vsBadgePosition, 
        compareLayout === 'center_vs'
          ? 'center_floating'
          : compareLayout === 'comparison_matrix' || compareLayout === 'matrix'
          ? 'embedded_matrix'
          : 'between_cards'
      ) as any,
      statLayout: toSafeString(rawCompare.composition?.statLayout, 
        compareLayout === 'comparison_matrix' || compareLayout === 'matrix'
          ? 'matrix_rows'
          : compareLayout === 'split_duel' || compareLayout === 'split'
          ? 'split_bars'
          : 'dual_cards'
      ) as any,
    },
  };

  // 9. Resolve Navigation Config
  const navStyle = toSafeString(themeDef.navigation?.style || themeDef.global?.navigationStyle, 'floating_pill');
  const navigation = {
    style: navStyle as any,
    orientation: toSafeString(themeDef.navigation?.orientation, navStyle === 'side_rail' || navStyle === 'editorial_rail' ? 'vertical' : 'horizontal') as any,
    position: toSafeString(themeDef.navigation?.position, navStyle === 'top_navigation' ? 'top' : navStyle === 'side_rail' ? 'side_left' : 'bottom') as any,
    spacing: toSafeString(themeDef.navigation?.spacing, 'normal') as any,
    iconPosition: toSafeString(themeDef.navigation?.iconPosition, navStyle === 'minimal_icons' ? 'icon_only' : 'top') as any,
    labelVisibility: toSafeString(themeDef.navigation?.labelVisibility, navStyle === 'minimal_icons' ? 'hidden' : 'always') as any,
    activeIndicator: toSafeString(themeDef.navigation?.activeIndicator, 'pill_glow') as any,
    shape: toSafeString(themeDef.navigation?.shape, navStyle === 'floating_pill' ? 'pill' : navStyle === 'compact_hud' ? 'chamfer' : 'rounded') as any,
  };

  return {
    type: 'talent_rating_ui_theme',
    version: toSafeString(themeDef.version, '3.0.0'),
    id: toSafeString(themeDef.id, 'custom_ui_theme'),
    name: toSafeString(themeDef.name, 'Custom Layout Theme'),
    badge: toSafeString(themeDef.badge, 'CUSTOM'),
    description: toSafeString(themeDef.description, 'Tema antarmuka kustom berbasis tata letak visual.'),
    category: toSafeString(themeDef.category, 'Custom'),
    accentColor: toSafeString(tokens.colors?.primary, '#FE9900'),
    icon: toSafeString(themeDef.icon, 'Sparkles'),
    tokens,
    shapeSystem,
    decorationSystem,
    navigation,
    global,
    home,
    artistDetail,
    ranking,
    compare,
    sectionsConfig: themeDef.sectionsConfig,
    fieldsConfig: themeDef.fieldsConfig,
    scoreSpecDefaults: themeDef.scoreSpecDefaults,
    isCustom: themeDef.isCustom,
    createdAt: themeDef.createdAt,
  };
}

/**
 * Calculates the effective LayoutScoreConfig:
 * If userConfig.useThemeDefaults === true (default is true),
 * it combines the active UIThemeDefinition's `scoreSpecDefaults`
 * onto the base default layoutScoreConfig, synchronizing visual styles,
 * layouts, and theme-matched colors.
 * If useThemeDefaults is false, it returns the user's manual layoutScoreConfig.
 */
export function getEffectiveLayoutScoreConfig(
  userConfig: LayoutScoreConfig | undefined,
  activeTheme?: UIThemeDefinition | null
): LayoutScoreConfig {
  const base = DEFAULT_LAYOUT_SCORE_CONFIG;
  const current = userConfig || base;

  // If user explicitly disabled "Gunakan Bawaan Tema", use their manual customization
  if (current.useThemeDefaults === false) {
    return {
      useThemeDefaults: false,
      spek: { ...base.spek, ...(current.spek || {}) },
      score: { ...base.score, ...(current.score || {}) },
    };
  }

  // Otherwise (useThemeDefaults is true or undefined), inherit from the active UI theme
  const themeSpec = activeTheme?.scoreSpecDefaults?.spek || {};
  const themeScore = activeTheme?.scoreSpecDefaults?.score || {};
  const themePrimary = activeTheme?.tokens?.colors?.primary || activeTheme?.global?.primaryColor;
  const themeAccent = activeTheme?.tokens?.colors?.accent || activeTheme?.global?.accentColor;

  return {
    useThemeDefaults: true,
    spek: {
      ...base.spek,
      ...themeSpec,
      ...(themePrimary && !themeSpec.attributesColor ? { attributesColor: themePrimary } : {}),
      ...(themeAccent && !themeSpec.appealColor ? { appealColor: themeAccent } : {}),
    },
    score: {
      ...base.score,
      ...themeScore,
      ...(themePrimary && !themeScore.overallColor ? { overallColor: themePrimary } : {}),
    },
  };
}

/**
 * Helper to map border radius setting to Tailwind classes
 */
export function getBorderRadiusClass(radius?: UIThemeGlobalConfig['borderRadius']): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-md';
    case 'md':
      return 'rounded-lg';
    case 'lg':
      return 'rounded-xl';
    case 'xl':
      return 'rounded-2xl';
    case '2xl':
      return 'rounded-3xl';
    case '3xl':
      return 'rounded-[2rem]';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-2xl';
  }
}

/**
 * Helper for card inner radius (Nested radius mathematical rule: Outer - Padding)
 */
export function getInnerRadiusClass(radius?: UIThemeGlobalConfig['borderRadius']): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-xs';
    case 'md':
      return 'rounded-sm';
    case 'lg':
      return 'rounded-md';
    case 'xl':
      return 'rounded-xl';
    case '2xl':
      return 'rounded-2xl';
    case '3xl':
      return 'rounded-2xl';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-xl';
  }
}

/**
 * Helper for elevation shadows
 */
export function getElevationClass(
  elevation?: UIThemeGlobalConfig['elevation'] | UIThemeTokens['shadows']['elevation'] | string
): string {
  switch (elevation) {
    case 'none':
      return 'shadow-none';
    case 'subtle':
      return 'shadow-xs';
    case 'medium':
      return 'shadow-md';
    case 'high':
      return 'shadow-xl shadow-black/40';
    case 'glowing':
      return 'shadow-lg shadow-primary/20 ring-1 ring-primary/20';
    case 'hard_offset':
      return 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
    case 'neon_laser':
      return 'shadow-[0_0_20px_rgba(0,240,255,0.45)] ring-1 ring-cyan-400/50';
    default:
      return 'shadow-md';
  }
}

/**
 * Helper for grid gap
 */
export function getGridGapClass(gap?: UIThemeHomeConfig['gridGap']): string {
  switch (gap) {
    case 'tight':
      return 'gap-2 sm:gap-3';
    case 'relaxed':
      return 'gap-4 sm:gap-5';
    case 'spacious':
      return 'gap-5 sm:gap-6';
    case 'normal':
    default:
      return 'gap-3 sm:gap-4';
  }
}

/**
 * Helper for section dividers
 */
export function getDividerClass(divider?: string, isDark: boolean = true): string {
  switch (divider) {
    case 'dashed':
      return isDark ? 'border-dashed border-stone-800' : 'border-dashed border-stone-200';
    case 'glowing':
      return isDark ? 'border-primary/40 shadow-[0_0_10px_rgba(var(--ui-primary-rgb),0.3)]' : 'border-primary/50';
    case 'none':
      return 'border-transparent';
    case 'line':
    case 'subtle':
    default:
      return isDark ? 'border-stone-800/80' : 'border-stone-200';
  }
}

/**
 * Helper for button styling
 */
export function getButtonClasses(
  theme: UIThemeDefinition,
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary',
  isDark: boolean = true
): string {
  const radius = getBorderRadiusClass(theme.global.borderRadius);
  const style = theme.global.buttonStyle || 'filled';

  if (variant === 'primary') {
    switch (style) {
      case 'pill':
        return `rounded-full bg-primary hover:bg-primary-hover text-stone-950 font-bold px-4 py-2 shadow-lg transition-all active:scale-95`;
      case 'chamfer':
        return `rounded-none border border-primary bg-primary/20 hover:bg-primary/30 text-primary-light font-mono font-bold px-4 py-2 transition-all active:scale-95 shadow-md shadow-primary/10`;
      case 'ghost':
        return `${radius} border border-primary/40 hover:bg-primary/10 text-primary font-bold px-4 py-2 transition-all active:scale-95`;
      case 'glow_outline':
        return `${radius} border-2 border-primary bg-primary/15 hover:bg-primary/25 text-white font-bold px-4 py-2 shadow-lg shadow-primary/25 transition-all active:scale-95 backdrop-blur-sm`;
      case 'magazine_flat':
        return `rounded-none bg-stone-900 text-stone-100 hover:bg-black uppercase tracking-widest font-serif font-bold text-xs px-5 py-2.5 border border-stone-700 transition-all active:scale-95`;
      case 'filled':
      default:
        return `${radius} bg-primary hover:bg-primary-hover text-stone-950 font-bold px-4 py-2 shadow-md transition-all active:scale-95`;
    }
  }

  if (variant === 'secondary') {
    if (style === 'magazine_flat') {
      return `rounded-none uppercase tracking-wider text-xs font-serif ${
        isDark ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white' : 'bg-stone-100 border-stone-300 text-stone-800'
      } border px-4 py-2 transition-all active:scale-95`;
    }
    return `${radius} ${
      isDark
        ? 'bg-surface hover:bg-surface-2 border border-border text-stone-200 hover:text-white'
        : 'bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-stone-950'
    } px-4 py-2 text-xs font-semibold transition-all active:scale-95`;
  }

  if (variant === 'danger') {
    return `${radius} bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 shadow-md transition-all active:scale-95`;
  }

  return `${radius} hover:bg-surface-2 text-stone-400 hover:text-white px-3 py-1.5 transition-colors`;
}

/**
 * Writes dynamic CSS variables to the document root based on the resolved UI Theme
 */
export function applyUIThemeCSSVariables(theme: UIThemeDefinition, isDark: boolean = true): void {
  const root = document.documentElement;
  const t = theme.tokens;
  const g = theme.global;

  const primary = t?.colors?.primary || g.primaryColor || '#FE9900';
  const accent = t?.colors?.accent || g.accentColor || '#F59E0B';

  // In dark mode: use theme colors; in light mode: calculate legible light pairs
  const bg = isDark ? (t?.colors?.background || g.backgroundColor || '#0C0A09') : '#F5F5F4';
  const surface = isDark ? (t?.colors?.surface || g.surfaceColor || '#1C1917') : '#FFFFFF';
  const surface2 = isDark ? (t?.colors?.secondarySurface || g.secondarySurfaceColor || '#292524') : '#E7E5E4';
  const textPrimary = isDark ? (t?.colors?.primaryText || g.primaryTextColor || '#FAFAF9') : '#1C1917';
  const textSecondary = isDark ? (t?.colors?.secondaryText || g.secondaryTextColor || '#A8A29E') : '#78716C';
  const border = isDark ? (t?.colors?.border || g.borderColor || '#44403C') : '#D6D3D1';
  const divider = isDark ? (t?.colors?.divider || g.dividerColor || '#292524') : '#E7E5E4';

  const onPrimary = getContrastTextColor(primary);
  const onSecondary = getContrastTextColor(textSecondary);

  // Official Global Design Tokens
  root.style.setProperty('--color-bg-app', bg);
  root.style.setProperty('--color-surface', surface);
  root.style.setProperty('--color-surface-sub', surface2);
  root.style.setProperty('--color-text-main', textPrimary);
  root.style.setProperty('--color-text-muted', textSecondary);
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', t?.colors?.primaryHover || primary);
  root.style.setProperty('--color-primary-light', `${primary}26`);
  root.style.setProperty('--color-primary-border', `${primary}4d`);
  root.style.setProperty('--color-text-on-primary', onPrimary);
  root.style.setProperty('--color-secondary', textSecondary);
  root.style.setProperty('--color-text-on-secondary', onSecondary);
  root.style.setProperty('--color-border', border);
  root.style.setProperty('--color-border-subtle', border);

  root.style.setProperty('--ui-primary', primary);
  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--ui-accent', accent);
  root.style.setProperty('--accent-color', accent);
  root.style.setProperty('--ui-bg', bg);
  root.style.setProperty('--bg-primary', bg);
  root.style.setProperty('--app-bg', bg);
  root.style.setProperty('--ui-surface', surface);
  root.style.setProperty('--bg-surface', surface);
  root.style.setProperty('--app-surface', surface);
  root.style.setProperty('--app-card', surface);
  root.style.setProperty('--bg-card', surface);
  root.style.setProperty('--ui-surface-2', surface2);
  root.style.setProperty('--ui-text', textPrimary);
  root.style.setProperty('--app-text', textPrimary);
  root.style.setProperty('--app-text-primary', textPrimary);
  root.style.setProperty('--text-color', textPrimary);
  root.style.setProperty('--text-primary', textPrimary);
  root.style.setProperty('--ui-text-2', textSecondary);
  root.style.setProperty('--app-secondary', textSecondary);
  root.style.setProperty('--app-text-secondary', textSecondary);
  root.style.setProperty('--text-secondary', textSecondary);
  root.style.setProperty('--ui-border', border);
  root.style.setProperty('--app-border', border);
  root.style.setProperty('--border-color', border);
  root.style.setProperty('--ui-divider', divider);
  root.style.setProperty('--sticky-bg', bg);

  // Synchronize App Primary Color variables so existing cards & badges adapt
  root.style.setProperty('--app-primary', primary);
  root.style.setProperty('--app-primary-hover', t?.colors?.primaryHover || primary);
  root.style.setProperty('--app-primary-light', `${primary}26`);
  root.style.setProperty('--app-primary-border', `${primary}4d`);

  // Typography Expansion
  const fontFamily = t?.typography?.fontFamily || g.fontFamily || 'Plus Jakarta Sans';
  const displayFont = t?.typography?.displayFont || fontFamily;
  const headingFont = t?.typography?.headingFont || fontFamily;
  const headingWeight = t?.typography?.headingWeight || 'bold';
  const letterSpacing =
    t?.typography?.letterSpacing === 'wide'
      ? '0.04em'
      : t?.typography?.letterSpacing === 'widest'
      ? '0.08em'
      : t?.typography?.letterSpacing === 'tight'
      ? '-0.02em'
      : 'normal';

  root.style.setProperty('--ui-font-family', `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
  root.style.setProperty('--ui-display-font', `'${displayFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
  root.style.setProperty('--ui-heading-font', `'${headingFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
  root.style.setProperty('--app-font-family', `'${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`);
  root.style.setProperty('--ui-heading-weight', headingWeight);
  root.style.setProperty('--ui-letter-spacing', letterSpacing);

  // Icon Style & Stroke Width
  const iconStyle = t?.icons?.style || g.iconStyle || 'solid';
  const iconStroke =
    typeof t?.icons?.strokeWidth === 'number'
      ? t.icons.strokeWidth
      : typeof g.iconStrokeWidth === 'number'
      ? g.iconStrokeWidth
      : iconStyle === 'thin_line'
      ? 1.25
      : iconStyle === 'neon_glow'
      ? 2.25
      : iconStyle === 'compact_functional' || iconStyle === 'premium_detail'
      ? 1.75
      : 2;

  root.style.setProperty('--ui-icon-stroke-width', String(iconStroke));
  root.style.setProperty('--ui-icon-style', iconStyle);

  // HTML Data Attributes for CSS selectors
  root.setAttribute('data-ui-theme', theme.id);
  root.setAttribute('data-ui-icon-style', iconStyle);

  // If a color preset is active in settings, preserve and reapply it
  try {
    const raw = localStorage.getItem('talent_rating_app_settings_v1') || localStorage.getItem('talent_rating_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.selectedColorTheme && parsed.selectedColorTheme !== 'default') {
        const customPresets = parsed.customColorPresets || [];
        const allPresets = [...BUILTIN_COLOR_THEMES, ...customPresets];
        const match = allPresets.find((p: any) => p.id === parsed.selectedColorTheme);
        if (match) {
          applyAppColorThemePreset(match);
        }
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  root.setAttribute('data-ui-font', fontFamily);

  // Radius values
  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '28px',
    full: '9999px',
  };
  const cardRadiusVal = radiusMap[t?.radius?.card || g.cardRadius || '2xl'] || '20px';
  const btnRadiusVal = radiusMap[t?.radius?.button || g.buttonRadius || '2xl'] || '20px';
  const badgeRadiusVal = radiusMap[t?.radius?.badge || g.badgeRadius || 'full'] || '9999px';
  const innerRadiusVal = radiusMap[t?.radius?.inner || g.thumbnailRadius || 'xl'] || '16px';

  root.style.setProperty('--ui-radius-card', cardRadiusVal);
  root.style.setProperty('--ui-radius-btn', btnRadiusVal);
  root.style.setProperty('--ui-radius-badge', badgeRadiusVal);
  root.style.setProperty('--ui-radius-inner', innerRadiusVal);

  // Elevation & Shadows
  const elev = t?.shadows?.elevation || g.elevation || 'medium';
  root.style.setProperty('--ui-elevation', elev);
}

/**
 * Calculates accessible high-contrast text color (#ffffff or #060507) for a background color
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return '#ffffff';
  let hex = hexColor.replace('#', '').trim();
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    const parts = hex.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10) || 0;
      const g = parseInt(parts[1], 10) || 0;
      const b = parseInt(parts[2], 10) || 0;
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 135 ? '#060507' : '#ffffff';
    }
  }
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length >= 6) {
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 135 ? '#060507' : '#ffffff';
  }
  return '#ffffff';
}

/**
 * Writes dynamic CSS variables to the document root based on a 5-color theme preset
 * (Text, Secondary, Primary, Accent, Background) plus surface, card, and border colors.
 */
export function applyAppColorThemePreset(preset: AppColorThemePreset): void {
  const root = document.documentElement;
  const buttonTextColor = preset.buttonText || getContrastTextColor(preset.primary) || '#ffffff';

  // 0. Official Design Tokens (Strict System-Wide Standard)
  root.style.setProperty('--color-bg-app', preset.background);
  root.style.setProperty('--color-surface', preset.secondary);
  root.style.setProperty('--color-surface-sub', preset.secondary);
  root.style.setProperty('--color-text-main', preset.text);
  root.style.setProperty('--color-text-muted', preset.accent);
  root.style.setProperty('--color-primary', preset.primary);
  root.style.setProperty('--color-primary-hover', preset.primary);
  root.style.setProperty('--color-primary-light', `${preset.primary}26`);
  root.style.setProperty('--color-primary-border', `${preset.primary}66`);
  root.style.setProperty('--color-text-on-primary', buttonTextColor);
  root.style.setProperty('--color-button-text', buttonTextColor);
  root.style.setProperty('--color-secondary', preset.secondary);
  root.style.setProperty('--color-text-on-secondary', buttonTextColor);
  root.style.setProperty('--color-accent', preset.accent);
  root.style.setProperty('--color-border', preset.border || `${preset.primary}40`);
  root.style.setProperty('--color-border-subtle', preset.border || `${preset.primary}20`);

  // 1. Text color (warna text)
  root.style.setProperty('--app-text', preset.text);
  root.style.setProperty('--app-text-primary', preset.text);
  root.style.setProperty('--text-color', preset.text);
  root.style.setProperty('--text-primary', preset.text);
  root.style.setProperty('--ui-text', preset.text);

  // 2. Secondary color (warna secondary)
  root.style.setProperty('--app-secondary', preset.secondary);
  root.style.setProperty('--app-text-secondary', preset.accent);
  root.style.setProperty('--text-secondary', preset.accent);
  root.style.setProperty('--ui-text-2', preset.secondary);
  root.style.setProperty('--text-on-secondary', buttonTextColor);

  // 3. Primary color (warna primary)
  root.style.setProperty('--app-primary', preset.primary);
  root.style.setProperty('--primary-color', preset.primary);
  root.style.setProperty('--app-primary-hover', preset.primary);
  root.style.setProperty('--app-primary-light', `${preset.primary}26`);
  root.style.setProperty('--app-primary-border', `${preset.primary}66`);
  root.style.setProperty('--ui-primary', preset.primary);
  root.style.setProperty('--text-on-primary', buttonTextColor);
  root.style.setProperty('--button-text', buttonTextColor);

  // 4. Accent color (warna accent)
  root.style.setProperty('--app-accent', preset.accent);
  root.style.setProperty('--accent-color', preset.accent);
  root.style.setProperty('--app-text-muted', preset.accent);
  root.style.setProperty('--ui-accent', preset.accent);

  // 5. Background color (warna background) & Surfaces
  root.style.setProperty('--app-bg', preset.background);
  root.style.setProperty('--bg-primary', preset.background);
  root.style.setProperty('--ui-bg', preset.background);
  root.style.setProperty('--app-card', preset.secondary);
  root.style.setProperty('--bg-card', preset.secondary);
  root.style.setProperty('--app-surface', preset.secondary);
  root.style.setProperty('--bg-surface', preset.secondary);
  root.style.setProperty('--ui-surface', preset.secondary);
  root.style.setProperty('--ui-surface-2', preset.secondary);
  root.style.setProperty('--app-border', preset.border || `${preset.primary}40`);
  root.style.setProperty('--border-color', preset.border || `${preset.primary}40`);
  root.style.setProperty('--ui-border', preset.border || `${preset.primary}40`);
  root.style.setProperty('--sticky-bg', preset.background);

  // Directly set body background & text color to prevent any white/dark mismatch or letterboxing
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.backgroundColor = preset.background;
    document.body.style.color = preset.text;
  }

  // Class standard: enforce dark theme standard
  root.classList.add('dark');
  root.classList.remove('light');
}

/**
 * Returns icon attributes (strokeWidth, glow classes, etc.) adapted to the active UI Theme
 */
export function getUIIconProps(theme?: UIThemeDefinition | null): {
  strokeWidth: number;
  className: string;
  style?: React.CSSProperties;
} {
  const t = theme?.tokens;
  const style = t?.icons?.style || theme?.global?.iconStyle || 'solid';
  const strokeWidth =
    typeof t?.icons?.strokeWidth === 'number'
      ? t.icons.strokeWidth
      : typeof theme?.global?.iconStrokeWidth === 'number'
      ? theme.global.iconStrokeWidth
      : style === 'thin_line'
      ? 1.25
      : style === 'neon_glow'
      ? 2.25
      : style === 'compact_functional' || style === 'premium_detail'
      ? 1.75
      : 2;

  let className = '';
  if (style === 'neon_glow') {
    className = 'filter drop-shadow-[0_0_5px_rgba(6,182,212,0.6)]';
  } else if (style === 'premium_detail') {
    className = 'filter drop-shadow-[0_0_3px_rgba(245,158,11,0.5)]';
  } else if (style === 'duotone') {
    className = 'filter drop-shadow-[0_0_4px_rgba(139,92,246,0.4)]';
  }

  return {
    strokeWidth,
    className,
  };
}


/**
 * UI Decoration Component: Corner Brackets (for Sci-Fi/HUD / Technical themes)
 */
export const HUDCornerBrackets: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ className = '', size = 10, color = 'var(--ui-primary)' }) => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement('div', {
      className: `absolute top-0 left-0 pointer-events-none border-t-2 border-l-2 ${className}`,
      style: { width: size, height: size, borderColor: color },
    }),
    React.createElement('div', {
      className: `absolute top-0 right-0 pointer-events-none border-t-2 border-r-2 ${className}`,
      style: { width: size, height: size, borderColor: color },
    }),
    React.createElement('div', {
      className: `absolute bottom-0 left-0 pointer-events-none border-b-2 border-l-2 ${className}`,
      style: { width: size, height: size, borderColor: color },
    }),
    React.createElement('div', {
      className: `absolute bottom-0 right-0 pointer-events-none border-b-2 border-r-2 ${className}`,
      style: { width: size, height: size, borderColor: color },
    })
  );
};

/**
 * UI Decoration Component: Technical Grid Background Texture
 */
export const HUDGridTexture: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  return React.createElement('div', {
    className: 'absolute inset-0 pointer-events-none z-0',
    style: {
      opacity,
      backgroundImage:
        'linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    },
  });
};
