import React from 'react';
import { Artist, UIThemeCollectionConfig, UIThemeListItemConfig, UIThemeFieldPresentation, UIThemeResponsiveCollection } from '../types';
import { getCountryFlag, getTypeInfo } from '../utils/calculations';
import { Star, ChevronRight, Edit3, Trash2, Shield, Sparkles, Trophy, Award, Check } from 'lucide-react';
import { HUDCornerBrackets } from '../utils/uiThemeEngine';
import { ArtistCard } from './ArtistCard';
import { SearchHighlight, getArtistSearchMatchPreview } from './SearchHighlight';

export interface ArtistScoreData {
  appScore: number;
  impScore: number;
  overallRating: number;
  proportionalRating: number;
  age: number;
}

export interface ArtistCollectionRendererProps {
  artists: Artist[];
  scoresMap: Map<string, ArtistScoreData>;
  collection: UIThemeCollectionConfig;
  itemConfig: UIThemeListItemConfig;
  fieldPresentation: UIThemeFieldPresentation;
  responsiveCollection?: UIThemeResponsiveCollection;
  onSelectArtist: (artist: Artist) => void;
  onEdit?: (artist: Artist) => void;
  onDelete?: (id: string) => void;
  cardDensity: 2 | 3 | 4;
  isDark: boolean;
  radius: string;
  innerRadius: string;
  elevation: string;
  primaryColor: string;
  decorations?: any;
  gridGap: string;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  topPadding?: number;
  bottomPadding?: number;
  isSelectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  searchQuery?: string;
}

// ============================================================================
// MAIN COLLECTION ROUTER (SINGLE SOURCE OF TRUTH)
// ============================================================================
export const ArtistCollectionRenderer: React.FC<ArtistCollectionRendererProps> = (props) => {
  const collectionType = props.collection.type || 'grid';

  switch (collectionType) {
    case 'list':
      return <ListCollectionRenderer {...props} />;
    case 'compact_list':
      return <CompactListCollectionRenderer {...props} />;
    case 'roster':
      return <RosterCollectionRenderer {...props} />;
    case 'table':
      return <TableCollectionRenderer {...props} />;
    case 'masonry':
      return <MasonryCollectionRenderer {...props} />;
    case 'asymmetric_grid':
      return <AsymmetricGridCollectionRenderer {...props} />;
    case 'split':
      return <SplitCollectionRenderer {...props} />;
    case 'grid':
    default:
      return <GridCollectionRenderer {...props} />;
  }
};

// ============================================================================
// FIELD PRESENTATION HELPERS (UNIVERSAL ACROSS ALL RENDERERS)
// ============================================================================

export const renderCountryBadge = (artist: Artist, config?: { style?: string; position?: string }) => {
  const style = config?.style || 'flag_and_code';
  if (style === 'hidden') return null;

  const flag = getCountryFlag(artist.countryCode, artist.country);

  if (style === 'flag_only') {
    return <span className="text-sm select-none" title={artist.country}>{flag}</span>;
  }
  if (style === 'full_name') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-stone-300">
        <span className="text-sm select-none">{flag}</span>
        <span>{artist.country}</span>
      </span>
    );
  }
  if (style === 'badge') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
        <span className="select-none">{flag}</span>
        <span>{artist.countryCode || artist.country}</span>
      </span>
    );
  }

  // Default: flag_and_code
  return (
    <span className="inline-flex items-center gap-1 text-xs text-stone-300">
      <span className="text-sm select-none">{flag}</span>
      <span className="font-medium text-stone-400">{artist.countryCode || artist.country}</span>
    </span>
  );
};

export const renderBodyTypeBadge = (artist: Artist, config?: { style?: string }) => {
  const style = config?.style || 'compact_label';
  if (style === 'hidden') return null;

  const typeInfo = getTypeInfo(artist.typeCode);
  const label = typeInfo.indonesia || artist.typeCode;

  if (style === 'code_only') {
    return (
      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
        {artist.typeCode}
      </span>
    );
  }
  if (style === 'pill_badge') {
    return (
      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider">
        {label}
      </span>
    );
  }
  if (style === 'full_label') {
    return (
      <span className="text-[11px] text-rose-300 font-medium">
        Tipe {label} ({artist.typeCode})
      </span>
    );
  }

  // Default: compact_label
  return (
    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
      {label}
    </span>
  );
};

export const renderMeasurementsBadge = (artist: Artist, config?: { style?: string }) => {
  const style = config?.style || 'bwh_compact';
  if (style === 'hidden') return null;

  const cup = artist.measurements?.cupSize ? `${artist.measurements.cupSize} Cup` : null;
  const bwh = `${artist.measurements?.bustCm || '-'}/${artist.measurements?.waistCm || '-'}/${artist.measurements?.hipCm || '-'}`;

  if (style === 'cup_only') {
    return cup ? <span className="font-semibold text-stone-300 text-xs">{cup}</span> : null;
  }
  if (style === 'detailed') {
    return (
      <span className="text-xs text-stone-300 font-mono">
        {artist.heightCm ? `${artist.heightCm}cm • ` : ''}{cup ? `${cup} ` : ''}({bwh})
      </span>
    );
  }

  // Default: bwh_compact
  return (
    <span className="text-xs text-stone-300 font-mono">
      {cup ? <span className="font-semibold mr-1.5">{cup}</span> : null}
      <span className="text-stone-400">({bwh})</span>
    </span>
  );
};

export const renderAgeBadge = (age: number | undefined, config?: { style?: string }) => {
  const style = config?.style || 'number_years';
  if (style === 'hidden' || !age || age <= 0) return null;

  if (style === 'compact_pill') {
    return (
      <span className="px-1.5 py-0.5 rounded bg-stone-800 text-[10px] font-mono text-stone-300">
        {age} th
      </span>
    );
  }

  return <span className="text-xs text-stone-400">{age} thn</span>;
};

export const renderMaturityBadge = (maturity: string | undefined, config?: { style?: string }) => {
  const style = config?.style || 'pill_badge';
  if (style === 'hidden' || !maturity) return null;

  if (style === 'text_only') {
    return <span className="text-xs text-stone-400">{maturity}</span>;
  }

  return (
    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono border border-stone-700">
      {maturity}
    </span>
  );
};

export const renderAttributesBadges = (attributes: string[] | undefined, config?: { style?: string }) => {
  const style = config?.style || 'colored_tags';
  if (style === 'hidden' || !attributes || attributes.length === 0) return null;

  if (style === 'compact_dots') {
    return (
      <div className="flex items-center gap-1" title={attributes.join(', ')}>
        {attributes.map(attr => (
          <span key={attr} className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        ))}
      </div>
    );
  }

  if (style === 'glowing_pills') {
    return (
      <div className="flex flex-wrap gap-1.5">
        {attributes.slice(0, 3).map(attr => (
          <span
            key={attr}
            className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[10px] font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]"
          >
            {attr}
          </span>
        ))}
      </div>
    );
  }

  // Default: colored_tags
  return (
    <div className="flex flex-wrap gap-1">
      {attributes.slice(0, 2).map(attr => (
        <span
          key={attr}
          className="px-1.5 py-0.5 rounded-sm bg-cyan-950/80 text-[10px] text-cyan-300 border border-cyan-500/30"
        >
          {attr}
        </span>
      ))}
    </div>
  );
};

export const renderOverallRatingBadge = (
  overall: number,
  config?: { style?: string; position?: string },
  itemRatingConfig?: { style?: string; position?: string },
  primaryColor?: string
) => {
  const style = config?.style || itemRatingConfig?.style || 'score_badge';

  if (style === 'giant_number') {
    return (
      <div className="flex items-baseline gap-1 font-mono">
        <span className="text-2xl sm:text-3xl font-black text-amber-400 leading-none">
          {overall.toFixed(1)}
        </span>
        <span className="text-xs text-stone-500 font-bold">/100</span>
      </div>
    );
  }

  if (style === 'stars') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-950/90 border border-amber-500/30 text-amber-400 font-mono">
        <div className="flex text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.round(overall / 20) ? 'fill-current' : 'opacity-30'}`}
            />
          ))}
        </div>
        <span className="text-xs font-bold font-mono ml-1">{overall.toFixed(1)}</span>
      </div>
    );
  }

  if (style === 'progress_bar') {
    return (
      <div className="w-24 space-y-1 font-mono">
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>SCORE</span>
          <span className="text-amber-400 font-bold">{overall.toFixed(1)}</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400"
            style={{ width: `${Math.min(100, Math.max(0, overall))}%` }}
          />
        </div>
      </div>
    );
  }

  if (style === 'compact' || style === 'compact_tag') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30">
        ★ {overall.toFixed(1)}
      </span>
    );
  }

  if (style === 'crest') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-b from-amber-500/20 to-stone-950 border border-amber-400/50 text-amber-300 font-mono shadow-md">
        <Award className="w-4 h-4 text-amber-400" />
        <span className="text-base font-black tracking-tight">{overall.toFixed(1)}</span>
      </div>
    );
  }

  // Default: score_badge
  return (
    <div
      style={{ borderColor: primaryColor }}
      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border bg-stone-950/90 shadow-md ${
        overall >= 90
          ? 'border-amber-400 text-amber-400'
          : overall >= 80
          ? 'border-cyan-400 text-cyan-400'
          : 'border-stone-700 text-stone-300'
      }`}
    >
      <Star className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-current" />
      <span className="text-base sm:text-lg font-black font-mono tracking-tight leading-none">
        {overall.toFixed(1)}
      </span>
    </div>
  );
};

export const renderSubScores = (
  app: number,
  imp: number,
  appConfig?: { style?: string },
  impConfig?: { style?: string }
) => {
  if (appConfig?.style === 'hidden' && impConfig?.style === 'hidden') return null;

  return (
    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 text-right font-mono">
      {appConfig?.style !== 'hidden' && (
        <div className="text-[11px] text-cyan-400 flex items-center gap-1">
          <span className="text-[9px] text-stone-500 uppercase">APP</span>
          <span className="font-bold">{app.toFixed(1)}</span>
        </div>
      )}
      {impConfig?.style !== 'hidden' && (
        <div className="text-[11px] text-rose-400 flex items-center gap-1">
          <span className="text-[9px] text-stone-500 uppercase">IMP</span>
          <span className="font-bold">{imp.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UNIVERSAL THUMBNAIL COMPONENT (100% RELIABLE DATA & SHAPE BINDING)
// ============================================================================
interface UniversalThumbnailProps {
  artist: Artist;
  config?: UIThemeListItemConfig['thumbnail'];
  isSpecial: boolean;
  innerRadius: string;
  isDark: boolean;
  className?: string;
}

export const UniversalThumbnail: React.FC<UniversalThumbnailProps> = ({
  artist,
  config,
  isSpecial,
  innerRadius,
  isDark,
  className = '',
}) => {
  const size = config?.size || 'small';
  const shape = config?.shape || 'rounded';
  const aspect = config?.aspectRatio || 'portrait';
  const fit = config?.fit || 'cover';

  // Dimension mapping
  const getDimensionClass = () => {
    if (size === 'tiny') {
      return aspect === 'portrait' ? 'w-10 h-14' : aspect === 'wide' ? 'w-14 h-9' : 'w-10 h-10';
    }
    if (size === 'small') {
      return aspect === 'portrait' ? 'w-14 sm:w-16 h-18 sm:h-22' : aspect === 'wide' ? 'w-18 sm:w-22 h-12 sm:h-14' : 'w-14 sm:w-16 h-14 sm:h-16';
    }
    if (size === 'large') {
      return aspect === 'portrait' ? 'w-24 sm:w-28 h-32 sm:h-36' : aspect === 'wide' ? 'w-28 sm:w-36 h-20 sm:h-24' : 'w-24 sm:w-28 h-24 sm:h-28';
    }
    // Default: medium
    return aspect === 'portrait' ? 'w-16 sm:w-20 h-22 sm:h-26' : aspect === 'wide' ? 'w-22 sm:w-26 h-15 sm:h-18' : 'w-16 sm:w-20 h-16 sm:h-20';
  };

  // Shape mapping
  const getShapeClass = () => {
    if (shape === 'circle') return 'rounded-full';
    if (shape === 'square') return 'rounded-none';
    if (shape === 'chamfer') return 'rounded-xs';
    if (shape === 'arch') return 'rounded-t-full rounded-b-md';
    return innerRadius || 'rounded-xl';
  };

  return (
    <div
      className={`${getDimensionClass()} ${getShapeClass()} overflow-hidden bg-stone-950 shrink-0 relative shadow-md border ${
        isDark ? 'border-stone-800' : 'border-stone-200'
      } ${className}`}
    >
      <img
        src={artist.avatarUrl}
        alt={`${artist.firstName} ${artist.lastName}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className={`w-full h-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} group-hover:scale-105 transition-transform duration-300`}
      />
      {isSpecial && (
        <div className="absolute top-1 left-1 px-1 py-0.5 rounded-sm bg-cyan-500 text-stone-950 font-bold text-[8px] leading-none uppercase tracking-tighter shadow">
          SP
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 1. GRID COLLECTION RENDERER (Restores Native ArtistCard & Card Theme Pipeline)
// ============================================================================
const GridCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  onSelectArtist,
  onEdit,
  onDelete,
  cardDensity,
  gridGap,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className={`grid ${gridGap} pt-1 w-full`}
      style={{
        gridTemplateColumns: `repeat(${cardDensity}, minmax(0, 1fr))`,
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist) => (
        <ArtistCard
          key={artist.id}
          artist={artist}
          onClick={() => onSelectArtist(artist)}
          onEdit={onEdit}
          onDelete={onDelete}
          density={cardDensity}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds?.has(artist.id)}
          onToggleSelect={onToggleSelect}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
};

// ============================================================================
// 2. LIST COLLECTION RENDERER (Dedicated 1-Column List: [THUMB] [DATA] [OVERALL])
// ============================================================================
const ListCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  collection,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onEdit,
  onDelete,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  decorations,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  const showDivider = collection.divider ?? true;
  const isAlternating = collection.alternatingRows ?? false;

  return (
    <div
      ref={gridRef}
      className={`w-full flex flex-col ${showDivider ? 'divide-y divide-stone-800/60' : 'space-y-2.5'} pt-1`}
      style={{
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist, idx) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const app = score?.appScore ?? 0;
        const imp = score?.impScore ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;
        const alternatingBg = isAlternating && idx % 2 === 1
          ? isDark ? 'bg-stone-900/60' : 'bg-stone-50'
          : isDark ? 'bg-stone-900/90' : 'bg-white';

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full group cursor-pointer p-3 sm:p-3.5 border transition-all duration-150 hover:scale-[1.004] ${radius} ${elevation} ${
              isSelected
                ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500'
                : alternatingBg
            } ${
              !isSelected && (isDark
                ? isSpecial ? 'border-cyan-500/40 hover:border-cyan-400' : 'border-stone-800/90 hover:border-stone-700'
                : isSpecial ? 'border-cyan-300 hover:border-cyan-400 shadow-xs' : 'border-stone-200 hover:border-stone-300 shadow-xs')
            } flex flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden`}
          >
            {decorations?.showCornerBrackets && (
              <HUDCornerBrackets color={isSpecial ? '#00BCD5' : primaryColor} size={10} />
            )}

            {/* Selection Checkbox */}
            {isSelectionMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSelect?.(artist.id);
                }}
                className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  isSelected
                    ? 'bg-rose-600 border-rose-500 text-white'
                    : 'bg-stone-800/80 border-stone-600 hover:border-rose-400 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {/* 1. THUMBNAIL (LEFT) */}
            <UniversalThumbnail
              artist={artist}
              config={itemConfig.thumbnail}
              isSpecial={isSpecial}
              innerRadius={innerRadius}
              isDark={isDark}
            />

            {/* 2. ARTIST DATA (CENTER - FLUID & SAFE FOR MOBILE) */}
            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
              {/* Row 1: Artist Name */}
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                  <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                  <SearchHighlight text={artist.lastName} query={searchQuery} />
                </h3>
                {isSpecial && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-xs bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                    SPECIAL
                  </span>
                )}
              </div>

              {/* Row 2: Body Type • Country • Height */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-stone-400 flex-wrap">
                {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                <span className="text-stone-600 text-xs">•</span>
                {renderCountryBadge(artist, fieldPresentation.country)}
                {artist.heightCm && (
                  <>
                    <span className="text-stone-600 text-xs">•</span>
                    <span className="text-stone-300 font-mono">{artist.heightCm} cm</span>
                  </>
                )}
              </div>

              {/* Row 3: B/W/H • Age • Maturity + Attributes */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-stone-400 flex-wrap">
                {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                {score?.age && score.age > 0 && (
                  <>
                    <span className="text-stone-600 text-xs">•</span>
                    {renderAgeBadge(score.age, fieldPresentation.age)}
                  </>
                )}
                {artist.appeal?.maturity && (
                  <>
                    <span className="text-stone-600 text-xs">•</span>
                    {renderMaturityBadge(artist.appeal.maturity, fieldPresentation.maturity)}
                  </>
                )}
                {renderAttributesBadges(artist.attributes, fieldPresentation.attributes)}
              </div>

              {/* Contextual Search Match Snippet Row */}
              {searchQuery && (() => {
                const preview = getArtistSearchMatchPreview(artist, searchQuery);
                if (!preview || preview.matchedField === 'name') return null;
                return (
                  <div className="text-[11px] text-amber-300/95 font-mono pt-0.5 truncate flex items-center gap-1.5">
                    <span className="text-[9px] uppercase font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      {preview.label}
                    </span>
                    <span className="truncate">
                      <SearchHighlight text={preview.snippet} query={searchQuery} />
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* 3. OVERALL RATING & ACTIONS (RIGHT) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {renderSubScores(app, imp, fieldPresentation.appearance, fieldPresentation.impression)}
              {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}

              {/* Action Buttons (Edit / Delete / Chevron) */}
              <div className="hidden sm:flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(artist);
                    }}
                    className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                    title="Edit Artis"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(artist.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-950/60 text-stone-400 hover:text-rose-400 transition-colors"
                    title="Hapus Artis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 3. COMPACT LIST COLLECTION RENDERER (Dense Row List)
// ============================================================================
const CompactListCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className={`w-full flex flex-col divide-y ${isDark ? 'divide-stone-800/80' : 'divide-stone-200'} border ${radius} overflow-hidden ${elevation} ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
      }`}
      style={{
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist, idx) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 cursor-pointer group transition-colors ${
              isSelected
                ? 'bg-rose-950/20 ring-1 ring-inset ring-rose-500'
                : isDark ? 'hover:bg-stone-800/60' : 'hover:bg-stone-50'
            }`}
          >
            {/* Left: Checkbox/Index + Mini Avatar + Name */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(artist.id);
                  }}
                  className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-stone-800/80 border-stone-600 hover:border-rose-400 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
              ) : (
                <span className="font-mono text-xs text-stone-500 w-6 text-right shrink-0">
                  {(idx + 1).toString().padStart(2, '0')}
                </span>
              )}

              <div className={`w-9 h-9 ${innerRadius || 'rounded-lg'} overflow-hidden bg-stone-950 shrink-0 border ${
                isDark ? 'border-stone-800' : 'border-stone-300'
              }`}>
                <img
                  src={artist.avatarUrl}
                  alt={`${artist.firstName} ${artist.lastName}`}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {renderCountryBadge(artist, fieldPresentation.country)}
                  <h4 className="text-xs sm:text-sm font-bold truncate text-stone-100 group-hover:text-amber-400 transition-colors">
                    <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                    <SearchHighlight text={artist.lastName} query={searchQuery} />
                  </h4>
                  {isSpecial && (
                    <span className="px-1.5 py-0.2 rounded-xs bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono">
                      SPEC
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                  <span>•</span>
                  {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                </div>
                {searchQuery && (() => {
                  const preview = getArtistSearchMatchPreview(artist, searchQuery);
                  if (!preview || preview.matchedField === 'name') return null;
                  return (
                    <div className="text-[10px] text-amber-300/95 font-mono truncate flex items-center gap-1 pt-0.5">
                      <span className="text-[8px] uppercase font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                        {preview.label}
                      </span>
                      <span className="truncate">
                        <SearchHighlight text={preview.snippet} query={searchQuery} />
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right: Score + Delete / Arrow */}
            <div className="flex items-center gap-2.5 shrink-0">
              {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}
              {onDelete && !isSelectionMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(artist.id);
                  }}
                  className="p-1 rounded-md hover:bg-rose-950/60 text-stone-500 hover:text-rose-400 transition-colors"
                  title="Hapus Artis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 4. ROSTER COLLECTION RENDERER (Team / Slot Style)
// ============================================================================
const RosterCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className="w-full space-y-2.5 pt-1"
      style={{
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist, idx) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const app = score?.appScore ?? 0;
        const imp = score?.impScore ?? 0;
        const prop = score?.proportionalRating ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full p-3 sm:p-4 border ${radius} ${elevation} cursor-pointer group transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
              isSelected
                ? 'bg-rose-950/20 border-rose-500 ring-1 ring-rose-500'
                : isDark ? 'bg-stone-900/90 border-stone-800 hover:border-amber-500/40' : 'bg-white border-stone-200 hover:border-amber-500/40 shadow-sm'
            }`}
          >
            {/* Left: Slot Number + Thumbnail + Info */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(artist.id);
                  }}
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-stone-950 border-stone-800 text-transparent'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center font-mono font-bold text-xs text-amber-400 shrink-0">
                  #{String(idx + 1).padStart(2, '0')}
                </div>
              )}

              <UniversalThumbnail
                artist={artist}
                config={itemConfig.thumbnail}
                isSpecial={isSpecial}
                innerRadius={innerRadius}
                isDark={isDark}
              />

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {renderCountryBadge(artist, fieldPresentation.country)}
                  <span className="text-stone-600">•</span>
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                </div>
                <h3 className="text-base font-bold truncate text-stone-100 group-hover:text-amber-400 transition-colors">
                  <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                  <SearchHighlight text={artist.lastName} query={searchQuery} />
                </h3>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                  {renderMaturityBadge(artist.appeal?.maturity, fieldPresentation.maturity)}
                </div>
              </div>
            </div>

            {/* Right: Stat Matrix */}
            <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800">
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-1.5 px-2 rounded-lg bg-stone-950/80 border border-stone-800">
                  <span className="text-[9px] text-stone-400 block">APP</span>
                  <span className="text-xs font-bold text-cyan-400">{app.toFixed(1)}</span>
                </div>
                <div className="p-1.5 px-2 rounded-lg bg-stone-950/80 border border-stone-800">
                  <span className="text-[9px] text-stone-400 block">IMP</span>
                  <span className="text-xs font-bold text-rose-400">{imp.toFixed(1)}</span>
                </div>
                <div className="p-1.5 px-2 rounded-lg bg-stone-950/80 border border-stone-800">
                  <span className="text-[9px] text-stone-400 block">PROP</span>
                  <span className="text-xs font-bold text-emerald-400">{prop.toFixed(1)}</span>
                </div>
              </div>

              {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}

              {onDelete && !isSelectionMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(artist.id);
                  }}
                  className="p-2 rounded-lg hover:bg-rose-950/60 text-stone-500 hover:text-rose-400 transition-colors"
                  title="Hapus Artis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 5. TABLE COLLECTION RENDERER (Tabular Data View)
// ============================================================================
const TableCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className={`w-full overflow-x-auto border ${radius} ${elevation} ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
      }`}
      style={{
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className={`border-b font-mono uppercase tracking-wider text-[10px] ${
            isDark ? 'border-stone-800 bg-stone-950/80 text-stone-400' : 'border-stone-200 bg-stone-100 text-stone-600'
          }`}>
            {isSelectionMode && <th className="py-3 px-3 w-10 text-center">Pilih</th>}
            <th className="py-3 px-4">Artis</th>
            <th className="py-3 px-3">Negara & Tipe</th>
            <th className="py-3 px-3">Profil / Ukuran</th>
            <th className="py-3 px-3 text-center">Appearance</th>
            <th className="py-3 px-3 text-center">Impression</th>
            <th className="py-3 px-4 text-right">Overall Rating</th>
            {onDelete && <th className="py-3 px-3 text-center w-12">Aksi</th>}
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-stone-800/60' : 'divide-stone-200'}`}>
          {artists.map((artist) => {
            const score = scoresMap.get(artist.id);
            const overall = score?.overallRating ?? 0;
            const app = score?.appScore ?? 0;
            const imp = score?.impScore ?? 0;
            const isSelected = selectedIds ? selectedIds.has(artist.id) : false;

            return (
              <tr
                key={artist.id}
                id={`artist-card-${artist.id}`}
                onClick={() => {
                  if (isSelectionMode && onToggleSelect) {
                    onToggleSelect(artist.id);
                  } else {
                    onSelectArtist(artist);
                  }
                }}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-rose-950/25'
                    : isDark ? 'hover:bg-stone-800/50' : 'hover:bg-stone-50'
                }`}
              >
                {isSelectionMode && (
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect?.(artist.id);
                      }}
                      className={`w-4 h-4 mx-auto rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white'
                          : 'bg-stone-800 border-stone-600 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </button>
                  </td>
                )}
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={artist.avatarUrl}
                      alt={`${artist.firstName} ${artist.lastName}`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-10 h-10 rounded-lg object-cover bg-stone-950 border border-stone-800"
                    />
                    <div>
                      <div className="font-bold text-sm text-stone-100 hover:text-amber-400 transition-colors">
                        <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                        <SearchHighlight text={artist.lastName} query={searchQuery} />
                      </div>
                      <div className="text-[10px] text-stone-400">{artist.appeal?.vibe || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    {renderCountryBadge(artist, fieldPresentation.country)}
                  </div>
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                </td>
                <td className="py-2.5 px-3 font-mono text-stone-300">
                  {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-cyan-400">
                  {app.toFixed(1)}
                </td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-400">
                  {imp.toFixed(1)}
                </td>
                <td className="py-2.5 px-4 text-right">
                  {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}
                </td>
                {onDelete && (
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(artist.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-rose-950/60 text-stone-400 hover:text-rose-400 transition-colors"
                      title="Hapus Artis"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// 6. MASONRY COLLECTION RENDERER (Dynamic Vertical Rhythm)
// ============================================================================
const MasonryCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  cardDensity,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  gridGap,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className={`grid ${gridGap} pt-1 w-full`}
      style={{
        gridTemplateColumns: `repeat(${cardDensity}, minmax(0, 1fr))`,
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist, idx) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const app = score?.appScore ?? 0;
        const imp = score?.impScore ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;
        // Alternate aspect ratios for masonry feel
        const isTall = idx % 3 === 0;

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full group cursor-pointer border transition-all duration-200 hover:scale-[1.01] ${radius} ${elevation} ${
              isSelected
                ? 'bg-rose-950/20 border-rose-500 ring-2 ring-rose-500'
                : isDark ? 'bg-stone-900/90 border-stone-800 hover:border-amber-400/50' : 'bg-white border-stone-200 hover:border-amber-400/50 shadow-sm'
            } relative overflow-hidden flex flex-col`}
          >
            <div className={`w-full overflow-hidden bg-stone-950 relative ${isTall ? 'aspect-[3/5]' : 'aspect-[3/4]'}`}>
              <img
                src={artist.avatarUrl}
                alt={`${artist.firstName} ${artist.lastName}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}
              </div>

              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(artist.id);
                  }}
                  className={`absolute top-2 left-2 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-black/60 backdrop-blur-md border-white/40 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              ) : onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(artist.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-950/70 backdrop-blur-md border border-rose-500/30 text-rose-400 hover:bg-rose-900/90 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Hapus Artis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  {renderCountryBadge(artist, fieldPresentation.country)}
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                </div>
                <h3 className="font-bold text-stone-100 group-hover:text-amber-400 transition-colors pt-1 truncate">
                  <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                  <SearchHighlight text={artist.lastName} query={searchQuery} />
                </h3>
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                {renderSubScores(app, imp, fieldPresentation.appearance, fieldPresentation.impression)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 7. ASYMMETRIC GRID COLLECTION RENDERER (Featured Large Cards + Compact)
// ============================================================================
const AsymmetricGridCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  cardDensity,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  gridGap,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  return (
    <div
      ref={gridRef}
      className={`grid ${gridGap} pt-1 w-full`}
      style={{
        gridTemplateColumns: `repeat(${cardDensity}, minmax(0, 1fr))`,
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist, idx) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const app = score?.appScore ?? 0;
        const imp = score?.impScore ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isFeatured = idx % 5 === 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full group cursor-pointer border transition-all duration-200 hover:scale-[1.01] ${radius} ${elevation} ${
              isFeatured && cardDensity > 2 ? 'sm:col-span-2' : ''
            } ${
              isSelected
                ? 'bg-rose-950/20 border-rose-500 ring-2 ring-rose-500'
                : isDark ? 'bg-stone-900/90 border-stone-800 hover:border-amber-400/50' : 'bg-white border-stone-200 hover:border-amber-400/50 shadow-sm'
            } relative overflow-hidden flex ${isFeatured ? 'flex-col sm:flex-row' : 'flex-col'}`}
          >
            <div className={`overflow-hidden bg-stone-950 relative ${
              isFeatured ? 'w-full sm:w-1/2 aspect-[4/3] sm:aspect-auto' : 'w-full aspect-[3/4]'
            }`}>
              <img
                src={artist.avatarUrl}
                alt={`${artist.firstName} ${artist.lastName}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2">
                {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}
              </div>

              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(artist.id);
                  }}
                  className={`absolute top-2 left-2 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-black/60 backdrop-blur-md border-white/40 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              ) : onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(artist.id);
                  }}
                  className="absolute top-2 left-2 p-1.5 rounded-lg bg-stone-950/70 backdrop-blur-md border border-rose-500/30 text-rose-400 hover:bg-rose-900/90 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Hapus Artis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  {renderCountryBadge(artist, fieldPresentation.country)}
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                </div>
                <h3 className={`font-bold text-stone-100 group-hover:text-amber-400 transition-colors pt-1 truncate ${
                  isFeatured ? 'text-lg sm:text-xl' : 'text-base'
                }`}>
                  <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                  <SearchHighlight text={artist.lastName} query={searchQuery} />
                </h3>
                <div className="pt-1">
                  {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                </div>
                {isFeatured && renderAttributesBadges(artist.attributes, fieldPresentation.attributes)}
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                {renderAgeBadge(score?.age, fieldPresentation.age)}
                {renderSubScores(app, imp, fieldPresentation.appearance, fieldPresentation.impression)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// 8. SPLIT COLLECTION RENDERER (50/50 Media & Info Split Grid)
// ============================================================================
const SplitCollectionRenderer: React.FC<ArtistCollectionRendererProps> = ({
  artists,
  scoresMap,
  collection,
  itemConfig,
  fieldPresentation,
  onSelectArtist,
  onDelete,
  isDark,
  radius,
  innerRadius,
  elevation,
  primaryColor,
  decorations,
  gridGap,
  gridRef,
  topPadding = 0,
  bottomPadding = 0,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  searchQuery,
}) => {
  const thumbPos = itemConfig.thumbnail?.position || collection.thumbnailPosition || 'left';
  const isRightThumb = thumbPos === 'right';

  return (
    <div
      ref={gridRef}
      className={`grid ${gridGap} grid-cols-1 md:grid-cols-2 pt-1 w-full`}
      style={{
        paddingTop: topPadding > 0 ? `${topPadding}px` : undefined,
        paddingBottom: bottomPadding > 0 ? `${bottomPadding}px` : undefined,
      }}
    >
      {artists.map((artist) => {
        const score = scoresMap.get(artist.id);
        const overall = score?.overallRating ?? 0;
        const app = score?.appScore ?? 0;
        const imp = score?.impScore ?? 0;
        const prop = score?.proportionalRating ?? 0;
        const isSpecial = (artist.attributes?.length || 0) > 0;
        const isSelected = selectedIds ? selectedIds.has(artist.id) : false;

        return (
          <div
            key={artist.id}
            id={`artist-card-${artist.id}`}
            onClick={() => {
              if (isSelectionMode && onToggleSelect) {
                onToggleSelect(artist.id);
              } else {
                onSelectArtist(artist);
              }
            }}
            className={`w-full group cursor-pointer border transition-all duration-200 hover:scale-[1.01] ${radius} ${elevation} ${
              isSelected
                ? 'bg-rose-950/20 border-rose-500 ring-2 ring-rose-500'
                : isDark
                ? isSpecial ? 'bg-stone-900/90 border-cyan-500/40 hover:border-cyan-400' : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                : isSpecial ? 'bg-white border-cyan-300 hover:border-cyan-400 shadow-sm' : 'bg-white border-stone-200 hover:border-stone-300 shadow-sm'
            } relative overflow-hidden flex ${isRightThumb ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {decorations?.showCornerBrackets && (
              <HUDCornerBrackets color={isSpecial ? '#00BCD5' : primaryColor} size={10} />
            )}

            {/* Half-card media */}
            <div className="w-2/5 sm:w-1/2 overflow-hidden bg-stone-950 relative shrink-0">
              <img
                src={artist.avatarUrl}
                alt={`${artist.firstName} ${artist.lastName}`}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 min-h-[160px]"
              />
              {isSpecial && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm bg-cyan-500 text-stone-950 font-bold text-[9px] uppercase tracking-wider shadow">
                  SP
                </div>
              )}

              {isSelectionMode ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect?.(artist.id);
                  }}
                  className={`absolute bottom-2 left-2 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-black/60 backdrop-blur-md border-white/40 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              ) : onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(artist.id);
                  }}
                  className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-stone-950/70 backdrop-blur-md border border-rose-500/30 text-rose-400 hover:bg-rose-900/90 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  title="Hapus Artis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Half-card stats & identity */}
            <div className="w-3/5 sm:w-1/2 p-3 sm:p-4 space-y-2 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  {renderCountryBadge(artist, fieldPresentation.country)}
                  {renderBodyTypeBadge(artist, fieldPresentation.bodyType)}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors pt-1 truncate">
                  <SearchHighlight text={artist.firstName} query={searchQuery} />{' '}
                  <SearchHighlight text={artist.lastName} query={searchQuery} />
                </h3>

                <div className="pt-1">
                  {renderMeasurementsBadge(artist, fieldPresentation.measurements)}
                </div>
                {renderAttributesBadges(artist.attributes, fieldPresentation.attributes)}
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                {renderSubScores(app, imp, fieldPresentation.appearance, fieldPresentation.impression)}
                {renderOverallRatingBadge(overall, fieldPresentation.overall, itemConfig.rating, primaryColor)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
