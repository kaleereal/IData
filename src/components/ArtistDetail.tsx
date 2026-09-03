import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { SearchHighlight } from './SearchHighlight';
import {
  Artist,
  DatabaseSchema,
  RankingFilterDimension,
  CustomPageEntry,
  LayoutScoreConfig,
  DEFAULT_LAYOUT_SCORE_CONFIG,
} from '../types';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
  getElevationClass,
  getEffectiveLayoutScoreConfig,
  HUDCornerBrackets,
  HUDGridTexture,
} from '../utils/uiThemeEngine';
import {
  calculateAge,
  calculateAgeAtDebut,
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  getCountryFlag,
  getTypeInfo,
  getSimilarArtists,
  formatMonthYear,
} from '../utils/calculations';
import {
  HelpCircle,
  Sparkles,
  ChevronRight,
  Award,
  BarChart3,
  ExternalLink,
  Link as LinkIcon,
  Activity,
  Terminal,
  Layers,
  Star,
  ArrowLeft,
  Copy,
  Check,
  Scale,
  Edit3,
  Trash2,
  Download,
} from 'lucide-react';
import { CardPreviewModal } from './CardPreviewModal';
import { FieldInfoModal } from './FieldInfoModal';
import { CompareModal } from './CompareModal';
import { ArtistExportModal } from './ArtistExportModal';
import { SpekRenderer, ScoreRenderer } from './score-layout/ScoreSpekRenderers';
import { useFavorites } from '../context/FavoritesContext';
import { generateArtistTextSummary } from '../utils/textSummary';

interface ArtistDetailProps {
  artist: Artist;
  allArtists: Artist[];
  schema: DatabaseSchema;
  layoutScoreConfig?: LayoutScoreConfig;
  onBackToHome: () => void;
  onEdit: (artist: Artist) => void;
  onDelete: (id: string) => void;
  onNavigateToRanking: (
    tab?: 'overall' | 'appearance' | 'impression' | 'proportional',
    dimension?: RankingFilterDimension,
    subFilter?: string,
    highlightArtistId?: string
  ) => void;
  onFilterByAttribute?: (filterType: string, value: string) => void;
  onSelectArtist: (artist: Artist) => void;
  onOpenCompare?: (artist: Artist) => void;
  customPages?: CustomPageEntry[];
  onOpenCustomPageView?: (pageId: string) => void;
  onOpenExportStudio?: (artist: Artist) => void;
  searchHighlightField?: string;
  searchQuery?: string;
}

type SimilarFilterCategory =
  | 'by all'
  | 'by status'
  | 'by age'
  | 'by maturity'
  | 'by appeal'
  | 'by attributes'
  | 'by specialty'
  | 'by country'
  | 'by type artist'
  | 'by class';

export const ArtistDetail: React.FC<ArtistDetailProps> = ({
  artist,
  allArtists,
  schema,
  layoutScoreConfig,
  onBackToHome,
  onEdit,
  onDelete,
  onNavigateToRanking,
  onFilterByAttribute,
  onSelectArtist,
  onOpenCompare,
  customPages = [],
  onOpenCustomPageView,
  onOpenExportStudio,
  searchHighlightField,
  searchQuery = '',
}) => {
  const uiTheme = useUITheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'similar'>('profile');
  const [similarFilter, setSimilarFilter] = useState<SimilarFilterCategory>('by all');

  // Search Highlight text query with temporary 3-second duration
  const [activeSearchQuery, setActiveSearchQuery] = useState(searchQuery);
  const scrollTriggeredRef = useRef(false);

  useEffect(() => {
    setActiveSearchQuery(searchQuery);
    if (!searchHighlightField || !searchQuery) return;
    if (scrollTriggeredRef.current) return;
    scrollTriggeredRef.current = true;

    let targetId = 'artist-detail-spek';
    if (searchHighlightField === 'notes') targetId = 'artist-detail-notes';
    else if (searchHighlightField === 'measurements') targetId = 'artist-detail-measurements';
    else if (searchHighlightField === 'links') targetId = 'artist-detail-links';
    else if (searchHighlightField === 'height') targetId = 'artist-detail-height';
    else if (searchHighlightField === 'bornDate' || searchHighlightField === 'debutDate') targetId = 'artist-detail-specs';
    else if (searchHighlightField.startsWith('appeal') || searchHighlightField === 'specialty' || searchHighlightField === 'attributes') targetId = 'artist-detail-spek';
    else if (searchHighlightField.startsWith('appearance') || searchHighlightField.startsWith('impression')) targetId = 'artist-detail-score';

    const scrollTimer = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('search-target-pulse');
        void (el as HTMLElement).offsetWidth;
        el.classList.add('search-target-pulse');
        setTimeout(() => el.classList.remove('search-target-pulse'), 3000);
      }
    }, 150);

    // After 3 seconds, clear activeSearchQuery so text highlight disappears smoothly without re-scrolling
    const fadeTimer = setTimeout(() => {
      setActiveSearchQuery('');
    }, 3000);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(fadeTimer);
    };
  }, [searchHighlightField, searchQuery, artist.id]);
  const [activeSpekDetailTab, setActiveSpekDetailTab] = useState<'attributes' | 'appeal' | 'specialty'>('attributes');
  const [activeScoreDetailTab, setActiveScoreDetailTab] = useState<'appearance' | 'impression'>('appearance');

  const effectiveLayoutScoreConfig = useMemo(() => {
    return getEffectiveLayoutScoreConfig(layoutScoreConfig, uiTheme);
  }, [layoutScoreConfig, uiTheme]);

  const spekConfig = effectiveLayoutScoreConfig.spek;
  const scoreConfig = effectiveLayoutScoreConfig.score;

  // Modals
  const [showCardModal, setShowCardModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFieldInfo, setSelectedFieldInfo] = useState<string | null>(null);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Favorites Hook
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite(artist.id);

  // Swipe navigation between Profile and Similar Artists
  const handleSwipeLeft = useCallback(() => {
    if (showCardModal || showCompareModal || showExportModal || showDeleteModal) return;
    if (activeTab === 'profile') {
      setActiveTab('similar');
    }
  }, [activeTab, showCardModal, showCompareModal, showExportModal, showDeleteModal]);

  const handleSwipeRight = useCallback(() => {
    if (showCardModal || showCompareModal || showExportModal || showDeleteModal) return;
    if (activeTab === 'similar') {
      setActiveTab('profile');
    }
  }, [activeTab, showCardModal, showCompareModal, showExportModal, showDeleteModal]);

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 50,
  });

  const handleCopySummary = async () => {
    const text = generateArtistTextSummary(artist);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  // Memoized stats calculation
  const {
    appScore,
    impScore,
    overallRating,
    propRating,
    age,
    ageAtDebut,
    typeInfo,
    flag,
    isSpecial,
    currentRank,
    statusLabel,
    statusColor,
  } = useMemo(() => {
    const app = calculateAppearanceScore(artist.appearanceScores);
    const imp = calculateImpressionScore(artist.impressionScores);
    const overall = calculateOverallRating(app, imp);
    const prop = calculateProportionalRating(artist.measurements);
    const calculatedAge = calculateAge(artist.bornDate);
    const calculatedDebutAge = calculateAgeAtDebut(artist.bornDate, artist.debutDate);
    const tInfo = getTypeInfo(artist.typeCode);
    const cFlag = getCountryFlag(artist.countryCode, artist.country);
    const special = (artist.attributes?.length || 0) > 0;

    // Calculate rank overall among all artists
    let rank = 1;
    for (const a of allArtists) {
      if (a.id === artist.id) continue;
      const otherOverall = calculateOverallRating(
        calculateAppearanceScore(a.appearanceScores),
        calculateImpressionScore(a.impressionScores)
      );
      if (otherOverall > overall) {
        rank++;
      }
    }

    // Artist Status (Amatir / Profesional)
    const rawStatus = (artist.artistStatus || 'Amatir').trim();
    const isPro = rawStatus.toLowerCase() === 'profesional';
    const sLabel = rawStatus.toUpperCase();
    const sColor = isPro
      ? 'text-cyan-300 border-cyan-400/50 bg-cyan-950/40'
      : 'text-amber-300 border-amber-400/50 bg-amber-950/40';

    return {
      appScore: app,
      impScore: imp,
      overallRating: overall,
      propRating: prop,
      age: calculatedAge,
      ageAtDebut: calculatedDebutAge,
      typeInfo: tInfo,
      flag: cFlag,
      isSpecial: special,
      currentRank: rank,
      statusLabel: sLabel,
      statusColor: sColor,
    };
  }, [artist, allArtists]);

  // Find linked Custom Page (Requirement 21)
  const linkedCustomPage = useMemo(() => {
    return customPages.find(p => p.linkedArtistId === artist.id) || null;
  }, [customPages, artist.id]);

  // Filter similar artists
  const similarList = useMemo(() => {
    const filterKeyMap: Record<
      SimilarFilterCategory,
      'all' | 'status' | 'age' | 'maturity' | 'appeal' | 'attributes' | 'specialty' | 'country' | 'type artist' | 'class'
    > = {
      'by all': 'all',
      'by status': 'status',
      'by age': 'age',
      'by maturity': 'maturity',
      'by appeal': 'appeal',
      'by attributes': 'attributes',
      'by specialty': 'specialty',
      'by country': 'country',
      'by type artist': 'type artist',
      'by class': 'class',
    };
    return getSimilarArtists(artist, allArtists, filterKeyMap[similarFilter]);
  }, [artist, allArtists, similarFilter]);

  const getAttrCategoryValue = (catKey: string, catIndex: number) => {
    if (artist.attributes && artist.attributes.length > catIndex) {
      return artist.attributes[catIndex];
    }
    return artist.attributes?.[0] || '-';
  };

  const getSpecCategoryValue = (catKey: string, catIndex: number) => {
    if (artist.specialty && artist.specialty.length > catIndex) {
      return artist.specialty[catIndex];
    }
    return artist.specialty?.[0] || '-';
  };

  // Dynamic category extraction from DatabaseSchema
  const attrCats = schema.attributeCategories
    ? (Array.isArray(schema.attributeCategories)
        ? (schema.attributeCategories as any[])
        : Object.entries(schema.attributeCategories).map(([key, cat]) => ({
            id: key,
            name: ((cat as any).title || key).toUpperCase(),
            icon: (cat as any).icon || '✨',
            description: (cat as any).shortDescription || '',
            options: (cat as any).options?.map((o: any) => o.name) || [],
          })))
    : [];

  const specCats = schema.specialtyCategories
    ? (Array.isArray(schema.specialtyCategories)
        ? (schema.specialtyCategories as any[])
        : Object.entries(schema.specialtyCategories).map(([key, cat]) => ({
            id: key,
            name: ((cat as any).title || key).toUpperCase(),
            icon: (cat as any).icon || '🏆',
            description: (cat as any).shortDescription || '',
            options: (cat as any).options?.map((o: any) => o.name) || [],
          })))
    : [];

  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);
  const primaryColor = uiTheme.tokens?.colors?.primary || uiTheme.global.primaryColor || '#FE9900';
  const avatarStyle = uiTheme.artistDetail.avatarStyle || 'full_portrait';
  const detailLayout = uiTheme.artistDetail.layout || 'split_hero';
  const scoringDisplay = uiTheme.artistDetail.scoringDisplay || 'progress_bars';
  const decorations = uiTheme.decorationSystem;

  const getAvatarRadius = () => {
    switch (avatarStyle) {
      case 'circle':
        return 'rounded-full';
      case 'rounded_square':
        return 'rounded-3xl';
      case 'chamfer':
        return 'rounded-none';
      case 'full_portrait':
      default:
        return radius;
    }
  };

  // Render Thumbnail Component
  const renderThumbnail = (customClass = '') => (
    <div
      onClick={() => setShowCardModal(true)}
      className={`group relative ${getAvatarRadius()} overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] select-none shadow-lg flex flex-col justify-end ${customClass}`}
      style={{
        borderColor: isSpecial ? '#00BCD5' : '#FECDD2',
        aspectRatio: '2/3',
        minHeight: '140px',
      }}
      title="Klik untuk membuka Card Preview"
    >
      <img
        src={artist.avatarUrl}
        alt={`${artist.firstName} ${artist.lastName}`}
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

      {/* Rank Badge on thumbnail top-left corner */}
      <div className="absolute top-1.5 left-1.5 flex items-center justify-center min-w-[20px] h-4.5 px-1 rounded bg-black/90 border border-amber-500/40 text-amber-400 font-black text-[9px] shadow-lg z-10">
        <span className="text-[7px] mr-0.5">#</span>
        {currentRank}
      </div>

      {/* Card Type Tag (STANDARD, SPECIAL) at bottom center alignment on thumbnail */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div
          className={`text-[7px] sm:text-[7.5px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md backdrop-blur-xs whitespace-nowrap ${
            isSpecial
              ? 'bg-[#00BCD5]/90 text-white border border-cyan-300/40'
              : 'bg-[#FECDD2]/95 text-stone-900 border border-rose-300/40'
          }`}
        >
          {isSpecial ? 'Special' : 'Standard'}
        </div>
      </div>

      {/* Hover overlay hint */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold">
        <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
        Lihat Card
      </div>
    </div>
  );

  // Render Scoring Traits with Dynamic Style
  const renderScoringTraits = (
    traits: typeof schema.scoringTraits.appearance,
    scores: Record<string, number>,
    accentColor: string,
    accentBorder: string
  ) => {
    if (scoringDisplay === 'score_cards') {
      return (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs py-1">
          {traits.map(t => {
            const val = scores[t.key] || 75;
            return (
              <div
                key={t.key}
                onClick={() => setSelectedFieldInfo(t.key)}
                className={`p-3 ${innerRadius} bg-stone-950/80 border ${accentBorder} flex flex-col justify-between cursor-pointer hover:bg-stone-900 hover:border-cyan-400/50 transition-all group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] sm:text-[11px] text-stone-300 font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors truncate">
                    {t.label}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded shrink-0 border border-stone-800">
                    {t.weightLabel}
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className={`text-lg sm:text-xl font-black font-mono ${accentColor}`}>
                    {val}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500">/99</span>
                </div>
                {/* Mini telemetry fill bar */}
                <div className="w-full h-1 rounded-full bg-stone-800/80 overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      accentColor.includes('cyan')
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                        : 'bg-gradient-to-r from-pink-600 to-pink-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (scoringDisplay === 'circular_gauges') {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 py-1">
          {traits.map(t => {
            const val = scores[t.key] || 75;
            const r = 20;
            const circumference = 2 * Math.PI * r;
            const strokeDashoffset = circumference - (Math.min(100, Math.max(0, val)) / 100) * circumference;

            return (
              <div
                key={t.key}
                onClick={() => setSelectedFieldInfo(t.key)}
                className={`p-2.5 sm:p-3 ${innerRadius} bg-stone-950/80 border ${accentBorder} flex flex-col items-center justify-between text-center cursor-pointer hover:bg-stone-900 hover:border-cyan-400/60 transition-all group relative overflow-hidden`}
              >
                {/* Gauge with proper SVG viewBox so it never gets clipped */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center my-0.5">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 48 48">
                    {/* Background Track */}
                    <circle
                      cx="24"
                      cy="24"
                      r={r}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      className="text-stone-800/80"
                      fill="none"
                    />
                    {/* Progress Indicator Arc */}
                    <circle
                      cx="24"
                      cy="24"
                      r={r}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`${accentColor} transition-all duration-700`}
                      fill="none"
                    />
                  </svg>
                  {/* Center Score */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="font-mono font-black text-xs sm:text-sm text-white group-hover:scale-105 transition-transform">
                      {val}
                    </span>
                  </div>
                </div>

                {/* Trait Label and Weight - Full visibility without clipping */}
                <div className="w-full mt-1.5 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] sm:text-[11px] text-stone-200 font-bold uppercase tracking-wider group-hover:text-cyan-300 transition-colors line-clamp-1">
                    {t.label}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400 bg-stone-900/90 px-1.5 py-0.2 rounded border border-stone-800">
                    {t.weightLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (scoringDisplay === 'minimal_numbers') {
      return (
        <div className="divide-y divide-stone-800/80 py-1">
          {traits.map(t => {
            const val = scores[t.key] || 75;
            return (
              <div
                key={t.key}
                onClick={() => setSelectedFieldInfo(t.key)}
                className="py-2.5 px-1 flex items-center justify-between gap-2 hover:bg-stone-900/60 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-600 group-hover:bg-cyan-400 transition-colors shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-stone-300 group-hover:text-white uppercase tracking-wider truncate">
                    {t.label}
                  </span>
                  <span className="text-[9px] font-mono text-stone-500 shrink-0">
                    ({t.weightLabel})
                  </span>
                </div>
                <span className={`text-base sm:text-lg font-black font-mono ${accentColor} shrink-0`}>
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    if (scoringDisplay === 'radar_matrix') {
      return (
        <div className="space-y-2 py-1">
          {traits.map(t => {
            const val = scores[t.key] || 75;
            return (
              <div
                key={t.key}
                onClick={() => setSelectedFieldInfo(t.key)}
                className={`p-2.5 ${innerRadius} bg-stone-950/90 border ${accentBorder} flex items-center justify-between gap-3 cursor-pointer hover:bg-stone-900 transition-colors`}
              >
                <div className="w-28 sm:w-36 shrink-0 min-w-0">
                  <div className="text-[10px] sm:text-xs font-bold text-stone-200 uppercase truncate">
                    {t.label}
                  </div>
                  <div className="text-[9px] font-mono text-stone-500">
                    BOBOT: {t.weightLabel}
                  </div>
                </div>
                {/* Meter gauge bar */}
                <div className="flex-1 h-2 rounded bg-stone-900 border border-stone-800 overflow-hidden relative">
                  <div
                    className={`h-full ${
                      accentColor.includes('cyan')
                        ? 'bg-gradient-to-r from-cyan-600 to-cyan-400'
                        : 'bg-gradient-to-r from-pink-600 to-pink-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                  />
                </div>
                <div className="shrink-0 font-mono font-black text-xs sm:text-sm text-white min-w-[36px] text-right">
                  {val}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Default: Progress bars
    return (
      <div className="space-y-2 sm:space-y-3 text-[9px] sm:text-xs py-1">
        {traits.map(trait => {
          const val = scores[trait.key] || 75;
          return (
            <div
              key={trait.key}
              onClick={() => setSelectedFieldInfo(trait.key)}
              className="space-y-0.5 sm:space-y-1 group cursor-pointer p-1.5 -mx-1 rounded-lg hover:bg-stone-900/80 transition-all"
              title={`Klik untuk melihat penjelasan penilaian: ${trait.label}`}
            >
              <div className="flex justify-between items-center text-stone-300 gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="font-bold text-[9px] sm:text-[11px] uppercase tracking-wider group-hover:text-cyan-300 transition-colors truncate flex items-center gap-1">
                    {trait.label}
                    <HelpCircle className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 text-cyan-400 shrink-0" />
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-stone-400 font-mono shrink-0 hidden sm:inline">
                    ({trait.weightLabel})
                  </span>
                </div>
                <span className="font-black font-mono text-stone-100 group-hover:text-cyan-300 transition-colors shrink-0 text-[9px] sm:text-xs">
                  {val}
                </span>
              </div>
              <div className="w-full h-1.5 sm:h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    accentColor.includes('cyan')
                      ? 'from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300'
                      : 'from-pink-600 to-pink-400 group-hover:from-pink-500 group-hover:to-pink-300'
                  } transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-28 space-y-4 sm:space-y-5 text-stone-100 animate-in fade-in duration-300 relative">
      {/* Decorative Texture for Technical HUD themes */}
      {decorations?.showGridBackground && <HUDGridTexture opacity={0.06} />}

      {/* TOP NAVIGATION & ACTION TOOLBAR */}
      <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 ${radius} bg-stone-900/90 border border-stone-800 ${elevation} backdrop-blur-md relative z-20`}>
        {/* Left: Back button & Star */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className={`px-3 py-1.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-700`}
            title="Kembali ke Daftar Artis"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(artist.id)}
            className={`px-3 py-1.5 ${innerRadius} text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isFav
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-amber-300 hover:bg-stone-800'
            }`}
            title={isFav ? 'Hapus dari Favorit' : 'Tambahkan ke Favorit'}
          >
            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span className="hidden xs:inline">{isFav ? 'Favorit' : 'Sukai'}</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1.5 flex-wrap ml-auto">
          {/* Copy Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className={`px-3 py-1.5 ${innerRadius} text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              copiedSummary
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
            }`}
            title="Salin ringkasan data profil artis ke clipboard"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedSummary ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenCompare) {
                onOpenCompare(artist);
              } else {
                setShowCompareModal(true);
              }
            }}
            className={`px-3 py-1.5 ${innerRadius} bg-stone-800/80 border border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-cyan-300 text-xs font-semibold transition-all flex items-center gap-1.5`}
            title="Bandingkan statistik dengan artis lain"
          >
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Komparasi</span>
          </button>

          {/* Card Preview Modal */}
          <button
            type="button"
            onClick={() => setShowCardModal(true)}
            className={`px-3 py-1.5 ${innerRadius} bg-stone-800/80 border border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5`}
            title="Buka tampilan kartu koleksi"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Kartu</span>
          </button>

          {/* Custom Page Link (if any) */}
          {linkedCustomPage && onOpenCustomPageView && (
            <button
              type="button"
              onClick={() => onOpenCustomPageView(linkedCustomPage.id)}
              className={`px-3 py-1.5 ${innerRadius} bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 text-xs font-semibold transition-all flex items-center gap-1.5`}
              title="Buka Halaman Kustom Terkait"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Halaman</span>
            </button>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEdit(artist)}
            className={`px-3 py-1.5 ${innerRadius} bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5`}
            title="Edit Profil Artis"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={`p-1.5 ${innerRadius} bg-rose-950/40 border border-rose-500/30 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 text-xs transition-all flex items-center justify-center`}
            title="Hapus Artis"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Bar: Profile vs Similar */}
      <div className={`flex border-b border-stone-800 bg-stone-900/60 ${radius} p-1.5 gap-2 ${elevation} relative z-10`}>
        <button
          onClick={() => setActiveTab('profile')}
          style={activeTab === 'profile' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
          className={`flex-1 py-2.5 px-4 ${innerRadius} font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'shadow-md font-black'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>STATISTIK PROFIL</span>
        </button>
        <button
          onClick={() => setActiveTab('similar')}
          style={activeTab === 'similar' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
          className={`flex-1 py-2.5 px-4 ${innerRadius} font-bold text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
            activeTab === 'similar'
              ? 'shadow-md font-black'
              : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>SIMILAR ARTISTS</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              activeTab === 'similar' ? 'bg-stone-950/30 text-stone-950 font-black' : 'bg-stone-800 text-stone-300'
            }`}
          >
            {similarList.length}
          </span>
        </button>
      </div>

      {activeTab === 'profile' ? (
        <>
          {/* SECTION 1A: HERO & BIODATA CORE (Dynamic Layout composition - Sticky Fixed) */}
          {detailLayout === 'banner_hero' ? (
            /* Banner Hero Layout */
            <div className={`sticky top-14 sm:top-16 z-30 overflow-hidden ${radius} border border-stone-800 ${elevation} bg-stone-950/95 space-y-4 backdrop-blur-md shadow-2xl`}>
              {/* Banner top */}
              <div className="relative h-48 sm:h-64 overflow-hidden bg-stone-900">
                <img
                  src={artist.avatarUrl}
                  alt={artist.firstName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top filter blur-sm scale-105 opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 sm:w-28 aspect-3/4 rounded-xl overflow-hidden border-2 border-amber-500 shadow-2xl shrink-0">
                      <img src={artist.avatarUrl} alt={artist.firstName} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-bold text-amber-400 font-mono">
                          {flag} {artist.country}
                        </span>
                        <span className="text-xs text-stone-500">•</span>
                        <span className="text-xs font-mono text-stone-400">{typeInfo.indonesia || typeInfo.code}</span>
                      </div>
                      <h1 className="text-2xl sm:text-4xl font-serif font-black text-white tracking-tight">
                        {artist.firstName} {artist.lastName}
                      </h1>
                      {/* STATUS ARTIS ALWAYS UNDER NAME */}
                      <div className="mt-2 flex items-center flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onNavigateToRanking('overall', 'STATUS', artist.artistStatus || 'Amatir')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 ${innerRadius} border text-[11px] font-black uppercase tracking-wider font-mono transition-all hover:scale-105 shadow-md cursor-pointer ${statusColor}`}
                          title={`Lihat Ranking Artis Status: ${statusLabel}`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{statusLabel}</span>
                          <ChevronRight className="w-3 h-3 opacity-70" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFieldInfo('artistStatus');
                            setSelectedItemName(null);
                          }}
                          className="opacity-70 hover:opacity-100 transition-opacity p-0.5 text-stone-300 hover:text-white"
                          title="Informasi Status Artis"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 ${innerRadius} bg-stone-900/90 hover:bg-stone-800 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-[11px] font-mono font-bold transition-all shadow-sm cursor-pointer`}
                          title="Buka Ranking Overall dan Highlight Artis Ini"
                        >
                          <span>RANK #{currentRank}</span>
                          <ChevronRight className="w-3 h-3 text-stone-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                    className="text-right hidden sm:block cursor-pointer group"
                    title="Buka Ranking Overall dan Highlight Artis Ini"
                  >
                    <div className="text-2xl font-black text-amber-400 font-mono group-hover:scale-105 transition-transform">★ {Math.round(overallRating)}</div>
                    <span className="text-[10px] text-stone-400 group-hover:text-amber-300 uppercase tracking-widest font-mono flex items-center justify-end gap-1">
                      <span>Overall Rating</span>
                      <ChevronRight className="w-3 h-3 text-amber-400 opacity-70" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : detailLayout === 'centered_profile' ? (
            /* Centered Profile Layout */
            <div className={`sticky top-14 sm:top-16 z-30 p-6 ${radius} border border-stone-800 ${elevation} bg-stone-900/95 backdrop-blur-md text-center space-y-4 shadow-2xl`}>
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-amber-500/50 shadow-2xl relative">
                <img src={artist.avatarUrl} alt={artist.firstName} loading="lazy" decoding="async" className="w-full h-full object-cover object-top" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-xs text-amber-400 font-bold uppercase">
                  <span>{flag} {artist.country}</span>
                  <span>•</span>
                  <span
                    onClick={() => onNavigateToRanking('overall', 'BODY_TYPE', artist.typeCode)}
                    className="cursor-pointer hover:text-amber-300 transition-colors underline-offset-2 hover:underline"
                    title="Buka Ranking Artis berdasarkan Body Type (Type Code)"
                  >
                    {typeInfo.indonesia || typeInfo.code}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {artist.firstName} {artist.lastName}
                </h1>
                {/* STATUS ARTIS ALWAYS UNDER NAME */}
                <div className="mt-2.5 flex items-center justify-center flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateToRanking('overall', 'STATUS', artist.artistStatus || 'Amatir')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1 ${innerRadius} border text-[11px] font-black uppercase tracking-wider font-mono transition-all hover:scale-105 shadow-md cursor-pointer ${statusColor}`}
                    title={`Lihat Ranking Artis Status: ${statusLabel}`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>{statusLabel}</span>
                    <ChevronRight className="w-3 h-3 opacity-70" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFieldInfo('artistStatus');
                      setSelectedItemName(null);
                    }}
                    className="opacity-70 hover:opacity-100 transition-opacity p-0.5 text-stone-300 hover:text-white"
                    title="Informasi Status Artis"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 ${innerRadius} bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-[11px] font-mono font-bold transition-all shadow-sm cursor-pointer`}
                    title="Buka Ranking Overall dan Highlight Artis Ini"
                  >
                    <span>RANK #{currentRank}</span>
                    <ChevronRight className="w-3 h-3 text-stone-400" />
                  </button>
                </div>
                <button
                  onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                  className="inline-flex items-center gap-2 mt-2.5 px-4 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-sm transition-all cursor-pointer shadow-md group"
                  title="Buka Ranking Overall dan Highlight Artis Ini"
                >
                  <span className="group-hover:scale-105 transition-transform">★ Overall {Math.round(overallRating)}</span>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            /* Split Hero Layout (Standard & HUD Cockpit) */
            <div className={`sticky top-14 sm:top-16 z-30 bg-stone-900/95 border border-stone-800/90 ${radius} p-4 sm:p-5 backdrop-blur-md space-y-4 ${elevation} relative shadow-2xl`}>
              {decorations?.showCornerBrackets && <HUDCornerBrackets color={primaryColor} size={12} />}

              {/* Header Title with Info & Export Button */}
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                    {schema.sectionTitles.biodata || 'BIODATA & SPESIFIKASI'}
                  </h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenExportStudio) {
                        onOpenExportStudio(artist);
                      } else {
                        setShowExportModal(true);
                      }
                    }}
                    className={`px-2.5 py-1.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-emerald-400 border border-stone-700/80 hover:border-emerald-500/40 transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-xs cursor-pointer`}
                    title="Buka Export Studio untuk Kustomisasi & Simpan Format Gambar PNG / PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFieldInfo('name')}
                    className={`p-1.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-amber-400 border border-stone-700/80 transition-colors`}
                    title="Informasi Kategori Biodata"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Top Row: Thumbnail at top-left, Beside thumbnail: Overall Rating, Body Type, Maturity */}
              <div className={`flex ${detailLayout === 'reverse_split' ? 'flex-row-reverse' : 'flex-row'} gap-3 sm:gap-4 items-stretch`}>
                {/* Thumbnail */}
                <div className="shrink-0 w-24 sm:w-32 md:w-36">
                  {renderThumbnail('w-full h-full')}
                </div>

                {/* Beside Thumbnail: OVERALL RATING, BODY TYPE, MATURITY */}
                <div className="flex-1 flex flex-col justify-between gap-1.5 sm:gap-2 min-w-0">
                  {/* 1. OVERALL RATING - Clickable directly to navigate to Ranking & highlight artist */}
                  <div
                    onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                    className={`p-2 sm:p-2.5 ${innerRadius} bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 flex items-center justify-between relative group cursor-pointer transition-all shadow-md`}
                    title="Klik untuk membuka Halaman Ranking Overall dan sorot posisi artis ini"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider truncate">
                          OVERALL RATING
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFieldInfo('overallRating');
                          }}
                          className="text-stone-400 hover:text-amber-400 p-0.5 transition-colors"
                          title="Informasi Overall Rating"
                        >
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono flex items-baseline gap-1 group-hover:scale-105 transition-transform origin-left">
                        <span>{Math.round(overallRating)}</span>
                        <span className="text-[10px] sm:text-xs font-normal text-stone-400">/99</span>
                      </div>
                    </div>

                    <div className="text-amber-400 p-1 group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* 2. BODY SHAPES */}
                  <div className={`p-2 sm:p-2.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex items-center justify-between`}>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        BODY SHAPES
                      </span>
                      <div
                        onClick={() => onNavigateToRanking('overall', 'BODY_SHAPES', artist.appeal.bodyShape)}
                        className="text-xs sm:text-sm font-black text-stone-100 hover:text-amber-400 cursor-pointer truncate mt-0.5"
                        title="Lihat Ranking Artis dengan Body Shapes ini"
                      >
                        {artist.appeal.bodyShape || '-'}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFieldInfo('bodyShape')}
                      className="text-stone-500 hover:text-stone-300 p-0.5 shrink-0"
                      title="Informasi Body Shapes"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 3. MATURITY */}
                  <div className={`p-2 sm:p-2.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex items-center justify-between`}>
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                        MATURITY
                      </span>
                      <div
                        onClick={() => onNavigateToRanking('overall', 'MATURITY', artist.appeal.maturity)}
                        className="text-xs sm:text-sm font-black text-amber-300 hover:underline cursor-pointer truncate mt-0.5"
                        title="Lihat Ranking Artis dengan Maturity ini"
                      >
                        {artist.appeal.maturity || '-'}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFieldInfo('maturity')}
                      className="text-stone-500 hover:text-stone-300 p-0.5 shrink-0"
                      title="Informasi Maturity"
                    >
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Full Name, Country, Type Code, Tier */}
              <div className={`p-3 ${innerRadius} bg-stone-950/60 border border-stone-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs">{flag}</span>
                    <span
                      onClick={() => onNavigateToRanking('overall', 'COUNTRY', artist.country)}
                      className="text-xs font-bold text-stone-400 hover:text-white cursor-pointer uppercase tracking-wider"
                      title="Lihat Ranking Artis dari Negara ini"
                    >
                      {artist.country} ({artist.countryCode})
                    </span>
                    <span className="text-stone-600">•</span>
                    <span
                      onClick={() => onNavigateToRanking('overall', 'BODY_TYPE', artist.typeCode)}
                      className="text-xs font-bold text-stone-400 hover:text-amber-300 cursor-pointer uppercase transition-colors"
                      title="Lihat Ranking Artis dengan Body Type (TypeCode) ini"
                    >
                      {typeInfo.indonesia || typeInfo.code}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight truncate uppercase">
                    {artist.firstName} {artist.lastName}
                  </h1>
                  {/* STATUS ARTIS ALWAYS UNDER NAME + RANK BESIDE STATUS */}
                  <div className="mt-1.5 flex items-center flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateToRanking('overall', 'STATUS', artist.artistStatus || 'Amatir')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 ${innerRadius} border text-[11px] font-black uppercase tracking-wider font-mono transition-all hover:scale-105 shadow-md cursor-pointer ${statusColor}`}
                      title={`Lihat Ranking Artis Status: ${statusLabel}`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{statusLabel}</span>
                      <ChevronRight className="w-3 h-3 opacity-70" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldInfo('artistStatus');
                        setSelectedItemName(null);
                      }}
                      className="opacity-70 hover:opacity-100 transition-opacity p-0.5 text-stone-300 hover:text-white"
                      title="Informasi Status Artis"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToRanking('overall', undefined, undefined, artist.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 ${innerRadius} bg-stone-900 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-400 text-[10px] font-bold text-stone-300 hover:text-amber-300 font-mono transition-all shadow-xs cursor-pointer`}
                      title="Lihat Peringkat Keseluruhan Artis Ini di Halaman Ranking"
                    >
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>RANK #{currentRank}</span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1B: DETAILED SPECIFICATIONS (BORN, HEIGHT, AGE, DEBUT) */}
          <div id="artist-detail-specs" className={`bg-stone-900 border border-stone-800 ${radius} p-4 sm:p-5 space-y-3 ${elevation}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              {/* BORN */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">BORN</span>
                  <button onClick={() => setSelectedFieldInfo('bornDate')} className="text-stone-500 hover:text-stone-300 p-0.5">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm sm:text-base font-black text-stone-100 font-mono">
                  <SearchHighlight text={formatMonthYear(artist.bornDate)} query={activeSearchQuery} />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5">Tanggal Lahir</span>
              </div>

              {/* HEIGHT */}
              <div id="artist-detail-height" className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">HEIGHT</span>
                  <button onClick={() => setSelectedFieldInfo('heightCm')} className="text-stone-500 hover:text-stone-300 p-0.5">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div
                  onClick={() => {
                    const h = artist.heightCm || 0;
                    const heightRange = h < 158 ? '<158' : h <= 165 ? '158-165' : '>165';
                    onNavigateToRanking('overall', 'HEIGHT', heightRange);
                  }}
                  className="text-sm sm:text-base font-black text-stone-100 font-mono cursor-pointer hover:text-amber-300"
                  title="Lihat Ranking Artis dengan Tinggi Badan ini"
                >
                  <SearchHighlight text={artist.heightCm ? `${artist.heightCm} cm` : '-'} query={activeSearchQuery} />
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5">Tinggi Badan</span>
              </div>

              {/* AGE */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">AGE</span>
                  <button onClick={() => setSelectedFieldInfo('bornDate')} className="text-stone-500 hover:text-stone-300 p-0.5">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div
                  onClick={() => {
                    const a = age || 0;
                    const ageRange = a < 22 ? '<22' : a <= 27 ? '22-27' : a <= 35 ? '28-35' : '>35';
                    onNavigateToRanking('overall', 'AGE', ageRange);
                  }}
                  className="text-sm sm:text-base font-black text-stone-100 font-mono cursor-pointer hover:text-amber-300"
                  title="Lihat Ranking Artis dengan Usia ini"
                >
                  {age ? `${age} th` : '-'}
                </div>
                <span className="text-[10px] text-stone-400 mt-0.5">Usia Saat Ini</span>
              </div>

              {/* DEBUT */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 flex flex-col justify-between`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">DEBUT</span>
                  <button onClick={() => setSelectedFieldInfo('debutDate')} className="text-stone-500 hover:text-stone-300 p-0.5">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm sm:text-base font-black text-stone-100 font-mono">
                  <SearchHighlight text={formatMonthYear(artist.debutDate)} query={activeSearchQuery} />
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                  {ageAtDebut ? `${ageAtDebut} th saat debut` : '-'}
                </span>
              </div>
            </div>

            {/* Optional Curator Notes */}
            {artist.notes && (
              <div id="artist-detail-notes" className={`p-3.5 ${innerRadius} bg-stone-950/50 border border-stone-800 text-xs text-stone-300 leading-relaxed`}>
                <span className="font-bold text-amber-400 uppercase mr-2 tracking-wider">NOTES:</span>
                <SearchHighlight text={artist.notes} query={activeSearchQuery} />
              </div>
            )}
          </div>

          {/* SECTION 1C: LINK / TAUTAN PROFIL ARTIS */}
          {((artist.links && artist.links.length > 0) || artist.externalUrl) && (
            <div id="artist-detail-links" className={`bg-stone-900 border border-stone-800 ${radius} p-4 sm:p-5 space-y-2.5 ${elevation}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>TAUTAN & PROFIL RESMI</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {artist.links?.length || (artist.externalUrl ? 1 : 0)} Link
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                {artist.links && artist.links.length > 0 ? (
                  artist.links.map((linkItem, idx) => {
                    const rawUrl = linkItem.url || '';
                    const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
                    return (
                      <a
                        key={linkItem.id || idx}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group flex items-center gap-2 px-3.5 py-2 ${innerRadius} bg-stone-800/90 hover:bg-stone-700 border border-stone-700 hover:border-amber-500/50 text-stone-200 hover:text-white transition-all text-xs font-semibold whitespace-nowrap shrink-0 shadow-md active:scale-95`}
                        title={`Buka ${linkItem.name || 'Tautan'}: ${href}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="truncate max-w-[200px]">
                          <SearchHighlight text={linkItem.name || `Link #${idx + 1}`} query={activeSearchQuery} />
                        </span>
                      </a>
                    );
                  })
                ) : artist.externalUrl ? (
                  <a
                    href={artist.externalUrl.startsWith('http') ? artist.externalUrl : `https://${artist.externalUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-2 px-3.5 py-2 ${innerRadius} bg-stone-800/90 hover:bg-stone-700 border border-stone-700 hover:border-amber-500/50 text-stone-200 hover:text-white transition-all text-xs font-semibold whitespace-nowrap shrink-0 shadow-md active:scale-95`}
                    title={`Buka Tautan: ${artist.externalUrl}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                    <span>Profil Web / Link</span>
                  </a>
                ) : null}
              </div>
            </div>
          )}

          {/* SECTION 1D: GALLERY (Requirement 21) */}
          {/* Hanya ditampilkan jika artis memiliki Entri Custom yang tertaut */}
          {linkedCustomPage && (
            <div className={`bg-stone-900 border border-amber-500/30 ${radius} p-4 sm:p-5 space-y-3 ${elevation}`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>GALLERY</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Halaman Custom
                </span>
              </div>

              {/* Gallery Item Card - Klik untuk buka Halaman Custom dari artis ini */}
              <div
                onClick={() => onOpenCustomPageView?.(linkedCustomPage.id)}
                className={`p-3.5 sm:p-4 ${innerRadius} bg-stone-950/80 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/50 flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-md`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-colors">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                      {linkedCustomPage.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      Buka galeri visual & entri kustom ({linkedCustomPage.blocks.length} blok konten)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs shrink-0 group-hover:bg-amber-400 transition-colors shadow">
                  <span>Buka Galeri</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: MEASUREMENTS */}
          <div id="artist-detail-measurements" className={`bg-stone-900 border border-stone-800 ${radius} p-5 sm:p-6 space-y-4 ${elevation}`}>
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                  {schema.sectionTitles.measurements || 'MEASUREMENTS'}
                </h2>
              </div>

              {/* Proportional Rating + Info */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToRanking('proportional')}
                  className={`flex items-center gap-2.5 px-3.5 py-1.5 ${innerRadius} bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 transition-all text-left`}
                  title="Buka Ranking Proportional"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                      PROPORTIONAL RATING
                    </div>
                    <div className="text-lg font-black text-pink-400 leading-none">
                      {propRating} <span className="text-xs font-normal text-stone-400 font-mono">PTS</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pink-400" />
                </button>

                <button
                  onClick={() => setSelectedFieldInfo('proportionalRating')}
                  className={`p-1.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-pink-400 transition-colors`}
                  title="Informasi Formula Proportional Rating"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clickable Measurements Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* CUP SIZE */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 text-left transition-all relative group`}>
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => onNavigateToRanking('overall', 'CUP_SIZE', artist.measurements?.cupSize || '')}
                    className="cursor-pointer flex-1"
                    title="Lihat Ranking Artis dengan Cup Size ini"
                  >
                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">CUP SIZE</div>
                    <div className="text-xl font-black text-pink-300 mt-1 group-hover:text-pink-200">
                      {artist.measurements.cupSize || '-'} Cup
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Ukuran Cup</div>
                  </div>
                  <button
                    onClick={() => setSelectedFieldInfo('cupSize')}
                    className="text-stone-500 hover:text-pink-400 p-0.5 shrink-0"
                    title="Informasi Cup Size"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* BUST SIZE */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 text-left transition-all relative group`}>
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => {
                      const b = artist.measurements?.bustCm || 0;
                      const bustRange = b < 85 ? '<85' : b <= 90 ? '85-90' : '>90';
                      onNavigateToRanking('overall', 'BUST_SIZE', bustRange);
                    }}
                    className="cursor-pointer flex-1"
                    title="Lihat Ranking Artis dengan Bust Size ini"
                  >
                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">BUST SIZE</div>
                    <div className="text-xl font-black text-stone-100 font-mono mt-1 group-hover:text-white">
                      {artist.measurements.bustCm || '-'} <span className="text-xs font-normal">cm</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Lingkar Dada</div>
                  </div>
                  <button
                    onClick={() => setSelectedFieldInfo('bustCm')}
                    className="text-stone-500 hover:text-stone-200 p-0.5 shrink-0"
                    title="Informasi Bust Size"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* WAIST SIZE */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 text-left transition-all relative group`}>
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => {
                      const w = artist.measurements?.waistCm || 0;
                      const waistRange = w < 58 ? '<58' : w <= 62 ? '58-62' : '>62';
                      onNavigateToRanking('overall', 'WAIST_SIZE', waistRange);
                    }}
                    className="cursor-pointer flex-1"
                    title="Lihat Ranking Artis dengan Waist Size ini"
                  >
                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">WAIST SIZE</div>
                    <div className="text-xl font-black text-stone-100 font-mono mt-1 group-hover:text-white">
                      {artist.measurements.waistCm || '-'} <span className="text-xs font-normal">cm</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Lingkar Pinggang</div>
                  </div>
                  <button
                    onClick={() => setSelectedFieldInfo('waistCm')}
                    className="text-stone-500 hover:text-stone-200 p-0.5 shrink-0"
                    title="Informasi Waist Size"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* HIP SIZE */}
              <div className={`p-3.5 ${innerRadius} bg-stone-800/60 border border-stone-700/60 text-left transition-all relative group`}>
                <div className="flex justify-between items-start">
                  <div
                    onClick={() => {
                      const h = artist.measurements?.hipCm || 0;
                      const hipRange = h < 86 ? '<86' : h <= 90 ? '86-90' : '>90';
                      onNavigateToRanking('overall', 'HIP_SIZE', hipRange);
                    }}
                    className="cursor-pointer flex-1"
                    title="Lihat Ranking Artis dengan Hip Size ini"
                  >
                    <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">HIP SIZE</div>
                    <div className="text-xl font-black text-stone-100 font-mono mt-1 group-hover:text-white">
                      {artist.measurements.hipCm || '-'} <span className="text-xs font-normal">cm</span>
                    </div>
                    <div className="text-[10px] text-stone-400 mt-0.5">Lingkar Pinggul</div>
                  </div>
                  <button
                    onClick={() => setSelectedFieldInfo('hipCm')}
                    className="text-stone-500 hover:text-stone-200 p-0.5 shrink-0"
                    title="Informasi Hip Size"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: SPEK (ATTRIBUTES | APPEAL | SPECIALTY) DYNAMIC CONFIGURABLE     */}
          {/* ========================================================================= */}
          <div id="artist-detail-spek">
            <SpekRenderer
              artist={artist}
              config={spekConfig}
              isDark={true}
              schema={schema}
              onFilterByAttribute={onFilterByAttribute}
              onNavigateToRanking={onNavigateToRanking}
              onShowHelp={(field, name) => {
                setSelectedFieldInfo(field);
                setSelectedItemName(name || null);
              }}
            />
          </div>

          {/* ========================================================================= */}
          {/* SECTION 4: SCORE (APPEARANCE & IMPRESSION) DYNAMIC CONFIGURABLE           */}
          {/* ========================================================================= */}
          <div id="artist-detail-score">
            <ScoreRenderer
              artist={artist}
              config={scoreConfig}
              isDark={true}
              schema={schema}
              onNavigateToRanking={onNavigateToRanking}
              onShowHelp={(field) => {
                setSelectedFieldInfo(field);
                setSelectedItemName(null);
              }}
            />
          </div>
        </>
      ) : (
        /* TAB SIMILAR ARTISTS */
        <div className="space-y-5">
          <div className={`flex flex-wrap justify-center items-center gap-1.5 p-3 ${radius} bg-stone-900/80 border border-stone-800 shadow-sm`}>
            {(
              [
                'by all',
                'by status',
                'by age',
                'by maturity',
                'by appeal',
                'by attributes',
                'by specialty',
                'by country',
                'by type artist',
                'by class',
              ] as SimilarFilterCategory[]
            ).map(cat => (
              <button
                key={cat}
                onClick={() => setSimilarFilter(cat)}
                className={`px-3 py-1.5 ${innerRadius} text-xs font-bold uppercase transition-all ${
                  similarFilter === cat
                    ? 'bg-primary text-on-primary shadow-sm font-black ring-1 ring-primary/50'
                    : 'bg-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-700'
                }`}
                style={similarFilter === cat ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>

          {similarList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {similarList.map(sim => {
                const simFlag = getCountryFlag(sim.countryCode, sim.country);
                const simIsSpecial = (sim.attributes?.length || 0) > 0;
                const simOverall = calculateOverallRating(
                  calculateAppearanceScore(sim.appearanceScores),
                  calculateImpressionScore(sim.impressionScores)
                );
                const isCurrentActive = sim.id === artist.id;

                return (
                  <div
                    key={sim.id}
                    onClick={() => onSelectArtist(sim)}
                    className={`group bg-stone-900/90 border ${radius} p-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between relative ${
                      isCurrentActive
                        ? 'border-primary ring-2 ring-primary/40 bg-stone-800/90'
                        : 'border-stone-800 hover:border-primary/50'
                    }`}
                  >
                    {isCurrentActive && (
                      <div
                        className="absolute -top-2 -right-2 bg-primary text-on-primary font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg z-20 uppercase"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                      >
                        Active
                      </div>
                    )}
                    <div
                      className={`relative w-full ${innerRadius} overflow-hidden mb-2.5 border`}
                      style={{
                        borderColor: simIsSpecial ? '#00BCD5' : '#FECDD2',
                        aspectRatio: '2/3',
                      }}
                    >
                      <img
                        src={sim.avatarUrl}
                        alt={sim.firstName}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase text-white bg-black/80">
                        {simFlag} {sim.countryCode}
                      </div>
                      <div
                        className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-primary text-on-primary font-black text-xs shadow-md"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
                      >
                        ★ {simOverall.toFixed(1)}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-xs sm:text-sm tracking-wide truncate group-hover:text-primary transition-colors uppercase">
                        {sim.firstName} {sim.lastName}
                      </h4>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">{sim.country}</p>

                      {/* Dynamic Extra Attribute based on selected category tab */}
                      {similarFilter === 'by status' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Status:</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            (sim.artistStatus || 'Amatir').toLowerCase() === 'profesional'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {sim.artistStatus || 'Amatir'}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by age' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Umur:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {calculateAge(sim.bornDate)} thn
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by maturity' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Maturity:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 truncate max-w-[100px]">
                            {sim.appeal?.maturity || '-'}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by appeal' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Appeal:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30 truncate max-w-[100px]" title={sim.appeal?.vibe || sim.appeal?.style || '-'}>
                            {sim.appeal?.vibe || sim.appeal?.style || sim.appeal?.maturity || '-'}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by attributes' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Atribut:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 truncate max-w-[100px]" title={sim.attributes?.join(', ')}>
                            {sim.attributes && sim.attributes.length > 0 ? sim.attributes[0] : 'None'}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by specialty' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Keahlian:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 truncate max-w-[100px]" title={sim.specialty?.join(', ')}>
                            {sim.specialty && sim.specialty.length > 0 ? sim.specialty[0] : 'None'}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by country' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Negara:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-200 border border-stone-700 truncate max-w-[100px]">
                            {sim.country}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by type artist' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Tipe:</span>
                          <span className="font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[100px]">
                            {sim.typeCode}
                          </span>
                        </div>
                      )}

                      {similarFilter === 'by class' && (
                        <div className="mt-1.5 pt-1.5 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-stone-400">Class:</span>
                          <span className={`font-black px-1.5 py-0.5 rounded ${
                            simIsSpecial
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}>
                            {simIsSpecial ? 'SPECIAL' : 'STANDARD'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-12 text-center border ${radius} border-stone-800 bg-stone-900/40 text-stone-400`}>
              Tidak ditemukan artis dengan karakteristik serupa pada filter ini.
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {showCardModal && (
        <CardPreviewModal
          artist={artist}
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
        />
      )}

      {showCompareModal && (
        <CompareModal
          initialArtistA={artist}
          allArtists={allArtists}
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {showExportModal && (
        <ArtistExportModal
          artist={artist}
          schema={schema}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          primaryColor={primaryColor}
          radius={radius}
          innerRadius={innerRadius}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-stone-900 border-stone-800`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hapus Profil Artis</h3>
                <p className="text-xs text-stone-400">Konfirmasi tindakan penghapusan</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus data profil <strong className="text-white font-bold">{artist.firstName} {artist.lastName}</strong> dari database? Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  onDelete(artist.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Artis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFieldInfo && (
        <FieldInfoModal
          fieldKey={selectedFieldInfo}
          itemName={selectedItemName || undefined}
          isEditorMode={false}
          isOpen={!!selectedFieldInfo}
          onClose={() => {
            setSelectedFieldInfo(null);
            setSelectedItemName(null);
          }}
          schema={schema}
        />
      )}
    </div>
  );
};
