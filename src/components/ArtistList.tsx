import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Artist, DatabaseSchema, AppTheme } from '../types';
import { ArtistCard } from './ArtistCard';
import { ArtistCollectionRenderer } from './ArtistCollectionRenderer';
import { useVirtualGrid } from '../hooks/useVirtualGrid';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
  getGridGapClass,
  getDividerClass,
  getElevationClass,
  HUDCornerBrackets,
  HUDGridTexture,
} from '../utils/uiThemeEngine';
import {
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  calculateAge,
  getCountryFlag,
  getTypeInfo,
} from '../utils/calculations';
import {
  Plus,
  Search,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  LayoutGrid,
  Sparkles,
  Trophy,
  Flame,
  Award,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Layers,
  Star,
  Users,
  Dices,
  Download,
  X,
  CheckSquare,
  Trash2,
  ChevronDown,
  Check,
  HelpCircle,
} from 'lucide-react';
import { getTranslation, TranslationDictionary } from '../utils/i18n';
import { useFavorites } from '../context/FavoritesContext';
import { exportDatabaseAsCSV } from '../utils/backupRestore';
import { RandomArtistModal } from './RandomArtistModal';

interface ArtistListProps {
  artists: Artist[];
  schema: DatabaseSchema;
  onSelectArtist: (artist: Artist) => void;
  onAddNew: () => void;
  onEdit?: (artist: Artist) => void;
  onDelete?: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onOpenDatabaseEditor?: () => void;
  activeFilter?: { type: string; value: string } | null;
  onClearActiveFilter?: () => void;
  externalSearchQuery?: string;
  theme?: AppTheme;
  t?: TranslationDictionary;
  onOpenCompare?: (artist: Artist) => void;
  onNavigateNextPage?: () => void;
  onNavigatePrevPage?: () => void;
}

export type SortField =
  | 'created_desc'
  | 'overall_desc'
  | 'overall_asc'
  | 'appearance_desc'
  | 'impression_desc'
  | 'proportional_desc'
  | 'age_asc'
  | 'age_desc'
  | 'height_desc'
  | 'height_asc'
  | 'debut_desc'
  | 'name_asc';

export const ArtistList: React.FC<ArtistListProps> = ({
  artists,
  schema,
  onSelectArtist,
  onAddNew,
  onEdit,
  onDelete,
  onBatchDelete,
  activeFilter,
  onClearActiveFilter,
  externalSearchQuery = '',
  theme = 'dark',
  t = getTranslation('default'),
  onOpenCompare,
  onNavigateNextPage,
  onNavigatePrevPage,
}) => {
  const isDark = theme !== 'light' && theme !== 'sepia';
  const { isFavorite, favorites } = useFavorites();
  // Top Tab State: 'all' | 'special' | 'standard' | 'favorites'
  const [activeTab, setActiveTab] = useState<'all' | 'special' | 'standard' | 'favorites'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showGachaModal, setShowGachaModal] = useState<boolean>(false);
  const [localSearchQuery] = useState('');
  const searchQuery = externalSearchQuery || localSearchQuery;

  // Persisted Sorting State (Retensi Jenis Sortir dalam Sesi & Local Memory)
  const [sortOption, setSortOption] = useState<SortField>(() => {
    try {
      const sessionVal = sessionStorage.getItem('talent_rating_main_sort_option');
      if (sessionVal) return sessionVal as SortField;
      const localVal = localStorage.getItem('talent_rating_main_sort_option');
      if (localVal) return localVal as SortField;
    } catch (e) {
      console.error('Failed to read sort option', e);
    }
    return 'created_desc';
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('talent_rating_main_sort_option', sortOption);
      localStorage.setItem('talent_rating_main_sort_option', sortOption);
    } catch (e) {
      console.error('Failed to persist sort option', e);
    }
  }, [sortOption]);

  const [cardDensity, setCardDensity] = useState<2 | 3 | 4>(() => {
    const saved = localStorage.getItem('talent_rating_card_density');
    if (saved === '3') return 3;
    if (saved === '4') return 4;
    return 2;
  });

  // Sort Selection Modal State
  const [showSortModal, setShowSortModal] = useState<boolean>(false);

  // Multi-Select Delete State
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);
  const [artistToDeleteSingle, setArtistToDeleteSingle] = useState<Artist | null>(null);

  // -------------------------------------------------------------
  // GESTUR USAP (SWIPE GESTURES)
  // -------------------------------------------------------------
  const tabOrder: ('all' | 'special' | 'standard' | 'favorites')[] = useMemo(
    () => ['all', 'special', 'standard', 'favorites'],
    []
  );

  const handleSwipeLeft = useCallback(() => {
    if (isSelectionMode || showSortModal || showGachaModal || showBatchDeleteModal) return;
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    } else if (onNavigateNextPage) {
      onNavigateNextPage();
    }
  }, [activeTab, isSelectionMode, showSortModal, showGachaModal, showBatchDeleteModal, onNavigateNextPage, tabOrder]);

  const handleSwipeRight = useCallback(() => {
    if (isSelectionMode || showSortModal || showGachaModal || showBatchDeleteModal) return;
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    } else if (onNavigatePrevPage) {
      onNavigatePrevPage();
    }
  }, [activeTab, isSelectionMode, showSortModal, showGachaModal, showBatchDeleteModal, onNavigatePrevPage, tabOrder]);

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 50,
  });

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleDensityChange = (d: 2 | 3 | 4) => {
    setCardDensity(d);
    localStorage.setItem('talent_rating_card_density', String(d));
  };

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate counts for Special, Standard, and Favorites dynamically
  const specialCount = useMemo(
    () => artists.filter(a => (a.attributes?.length || 0) > 0).length,
    [artists]
  );
  const standardCount = useMemo(
    () => artists.filter(a => !a.attributes || a.attributes.length === 0).length,
    [artists]
  );
  const favoritesCount = useMemo(
    () => artists.filter(a => isFavorite(a.id)).length,
    [artists, isFavorite]
  );

  // Extract unique statuses for fast filter pills
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const a of artists) {
      if (a.status) set.add(a.status);
    }
    return Array.from(set);
  }, [artists]);

  // Memoized scores map for all artists to eliminate redundant calculations during rendering, sorting, and filtering
  const artistScoresMap = useMemo(() => {
    const map = new Map<
      string,
      {
        appScore: number;
        impScore: number;
        overallRating: number;
        proportionalRating: number;
        age: number;
      }
    >();
    for (const a of artists) {
      const app = calculateAppearanceScore(a.appearanceScores);
      const imp = calculateImpressionScore(a.impressionScores);
      const overall = calculateOverallRating(app, imp);
      const prop = calculateProportionalRating(a.measurements);
      const age = calculateAge(a.bornDate);
      map.set(a.id, {
        appScore: app,
        impScore: imp,
        overallRating: overall,
        proportionalRating: prop,
        age,
      });
    }
    return map;
  }, [artists]);

  // Top/Featured Artist for Spotlight Heroes (memoized O(N) lookup)
  const topFeaturedArtist = useMemo(() => {
    if (artists.length === 0) return null;
    let top = artists[0];
    let topScore = -1;
    for (const a of artists) {
      const score = artistScoresMap.get(a.id)?.overallRating ?? 0;
      if (score > topScore) {
        topScore = score;
        top = a;
      }
    }
    return top;
  }, [artists, artistScoresMap]);

  // Sort Option Definitions for Slider with translations
  const sortOptionsList: { id: SortField; label: string }[] = useMemo(() => [
    { id: 'created_desc', label: t.sortNewest },
    { id: 'overall_desc', label: t.sortOverallTop },
    { id: 'overall_asc', label: t.sortOverallLow },
    { id: 'appearance_desc', label: t.sortAppearance },
    { id: 'impression_desc', label: t.sortImpression },
    { id: 'proportional_desc', label: t.sortProportional },
    { id: 'age_asc', label: t.sortYoungest },
    { id: 'age_desc', label: t.sortOldest },
    { id: 'height_desc', label: t.sortTallest },
    { id: 'debut_desc', label: t.sortNewDebut },
    { id: 'name_asc', label: t.sortNameAsc },
  ], [t]);

  const currentSortOption = useMemo(() => {
    return sortOptionsList.find(opt => opt.id === sortOption) || sortOptionsList[0];
  }, [sortOptionsList, sortOption]);

  // Filter and sort the artists
  const filteredArtists = useMemo(() => {
    return artists
      .filter(artist => {
        const hasAttributes = (artist.attributes?.length || 0) > 0;

        // Tab Filter
        if (activeTab === 'special' && !hasAttributes) return false;
        if (activeTab === 'standard' && hasAttributes) return false;
        if (activeTab === 'favorites' && !isFavorite(artist.id)) return false;

        // Quick Status Filter
        if (statusFilter !== 'all' && artist.status !== statusFilter) return false;

        // Custom incoming external filter (from profile clicks)
        if (activeFilter) {
          if (activeFilter.type === 'country') {
            if (artist.country.toLowerCase() !== activeFilter.value.toLowerCase())
              return false;
          }
          if (activeFilter.type === 'type') {
            if (artist.typeCode !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'maturity') {
            if (artist.appeal.maturity !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'vibe') {
            if (artist.appeal?.vibe !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'style') {
            if (artist.appeal?.style !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'bodyShape') {
            if (artist.appeal?.bodyShape !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'cup') {
            if (artist.measurements?.cupSize !== activeFilter.value) return false;
          }
          if (activeFilter.type === 'attribute') {
            if (!artist.attributes?.includes(activeFilter.value)) return false;
          }
          if (activeFilter.type === 'specialty') {
            if (!artist.specialty?.includes(activeFilter.value)) return false;
          }
        }

        // Search Filter (High-Coverage Search Engine)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const fullName = `${artist.firstName} ${artist.lastName}`.toLowerCase();
          const reversedFullName = `${artist.lastName} ${artist.firstName}`.toLowerCase();
          const typeInfo = getTypeInfo(artist.typeCode);

          const matchesBasic =
            fullName.includes(q) ||
            reversedFullName.includes(q) ||
            artist.firstName.toLowerCase().includes(q) ||
            artist.lastName.toLowerCase().includes(q) ||
            artist.country.toLowerCase().includes(q) ||
            artist.countryCode.toLowerCase().includes(q) ||
            artist.typeCode.toLowerCase().includes(q) ||
            typeInfo.indonesia.toLowerCase().includes(q) ||
            typeInfo.english.toLowerCase().includes(q);

          const matchesNotes = Boolean(artist.notes && artist.notes.toLowerCase().includes(q));

          const matchesStatus = Boolean(
            artist.artistStatus && artist.artistStatus.toLowerCase().includes(q)
          );

          const matchesAppeal = Boolean(
            (artist.appeal?.maturity && artist.appeal.maturity.toLowerCase().includes(q)) ||
            (artist.appeal?.vibe && artist.appeal.vibe.toLowerCase().includes(q)) ||
            (artist.appeal?.style && artist.appeal.style.toLowerCase().includes(q)) ||
            (artist.appeal?.bodyShape && artist.appeal.bodyShape.toLowerCase().includes(q)) ||
            ((artist.appeal as any)?.mainAppeal && (artist.appeal as any).mainAppeal.toLowerCase().includes(q))
          );

          const matchesTags = Boolean(
            (artist.attributes && artist.attributes.some(attr => attr.toLowerCase().includes(q))) ||
            (artist.specialty && artist.specialty.some(spec => spec.toLowerCase().includes(q)))
          );

          const matchesMeasurements = Boolean(
            (artist.measurements?.cupSize && (
              artist.measurements.cupSize.toLowerCase().includes(q) ||
              `${artist.measurements.cupSize} cup`.toLowerCase().includes(q) ||
              `cup ${artist.measurements.cupSize}`.toLowerCase().includes(q)
            )) ||
            (artist.measurements?.bustCm && `${artist.measurements.bustCm}`.includes(q)) ||
            (artist.measurements?.waistCm && `${artist.measurements.waistCm}`.includes(q)) ||
            (artist.measurements?.hipCm && `${artist.measurements.hipCm}`.includes(q))
          );

          const matchesDatesAndHeight = Boolean(
            (artist.bornDate && artist.bornDate.toLowerCase().includes(q)) ||
            (artist.debutDate && artist.debutDate.toLowerCase().includes(q)) ||
            (artist.heightCm && (`${artist.heightCm}`.includes(q) || `${artist.heightCm}cm`.includes(q)))
          );

          const matchesLinks = Boolean(
            artist.links && artist.links.some(l =>
              l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q)
            )
          );

          return (
            matchesBasic ||
            matchesNotes ||
            matchesStatus ||
            matchesAppeal ||
            matchesTags ||
            matchesMeasurements ||
            matchesDatesAndHeight ||
            matchesLinks
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'created_desc') {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;
          return b.id.localeCompare(a.id);
        }

        const aScores = artistScoresMap.get(a.id);
        const bScores = artistScoresMap.get(b.id);
        const aApp = aScores?.appScore ?? 0;
        const aImp = aScores?.impScore ?? 0;
        const aOverall = aScores?.overallRating ?? 0;

        const bApp = bScores?.appScore ?? 0;
        const bImp = bScores?.impScore ?? 0;
        const bOverall = bScores?.overallRating ?? 0;

        if (sortOption === 'overall_desc') return bOverall - aOverall;
        if (sortOption === 'overall_asc') return aOverall - bOverall;
        if (sortOption === 'appearance_desc') return bApp - aApp;
        if (sortOption === 'impression_desc') return bImp - aImp;
        if (sortOption === 'proportional_desc') {
          return (
            (bScores?.proportionalRating ?? 0) -
            (aScores?.proportionalRating ?? 0)
          );
        }
        if (sortOption === 'age_asc') {
          return (aScores?.age ?? 0) - (bScores?.age ?? 0);
        }
        if (sortOption === 'age_desc') {
          return (bScores?.age ?? 0) - (aScores?.age ?? 0);
        }
        if (sortOption === 'height_desc') return (b.heightCm || 0) - (a.heightCm || 0);
        if (sortOption === 'height_asc') return (a.heightCm || 0) - (b.heightCm || 0);
        if (sortOption === 'debut_desc') {
          return (
            new Date(b.debutDate || '').getTime() -
            new Date(a.debutDate || '').getTime()
          );
        }
        if (sortOption === 'name_asc') {
          return a.firstName.localeCompare(b.firstName);
        }
        return bOverall - aOverall;
      });
  }, [artists, activeTab, statusFilter, isFavorite, activeFilter, searchQuery, sortOption, artistScoresMap]);

  // UI Theme Hooks & Config Resolution
  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);
  const gridGap = getGridGapClass(uiTheme.home.gridGap);
  const divider = getDividerClass(uiTheme.home.sectionDivider);
  const primaryColor = uiTheme.tokens?.colors?.primary || uiTheme.global.primaryColor || '#FE9900';
  const typeTabsStyle = uiTheme.home.typeTabs || 'segmented';
  const densityControlStyle = uiTheme.home.cardDensityControl || 'segmented';
  const emptyStyle = uiTheme.home.emptyStateStyle || 'card_box';
  const homeLayout = uiTheme.home.layout || 'dashboard';
  const decorations = uiTheme.decorationSystem;

  const collectionConfig = uiTheme.home.collection || { type: 'grid' };
  const itemConfig = uiTheme.home.item || {};
  const fieldPresentation = uiTheme.home.fieldPresentation || {};
  const responsiveCollection = uiTheme.home.responsiveCollection;

  const isListLayout =
    collectionConfig.type === 'list' ||
    collectionConfig.type === 'compact_list' ||
    collectionConfig.type === 'roster' ||
    collectionConfig.type === 'table' ||
    homeLayout === 'list' ||
    homeLayout === 'compact_list' ||
    homeLayout === 'roster' ||
    homeLayout === 'table';

  const isSplitLayout = collectionConfig.type === 'split' || homeLayout === 'split';

  const effectiveColumns = isListLayout
    ? 1
    : isSplitLayout
    ? (collectionConfig.columns || 2)
    : cardDensity;

  // Virtualized Windowing for the collection
  const {
    containerRef: gridRef,
    startIndex,
    endIndex,
    topPadding,
    bottomPadding,
  } = useVirtualGrid({
    totalItems: filteredArtists.length,
    columns: effectiveColumns,
    overscanRows: 3,
  });

  const visibleArtists = useMemo(() => {
    return filteredArtists.slice(startIndex, endIndex);
  }, [filteredArtists, startIndex, endIndex]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(filteredArtists.map(a => a.id)));
  }, [filteredArtists]);

  const handleConfirmBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    setShowBatchDeleteModal(true);
  }, [selectedIds]);

  const executeBatchDelete = useCallback(() => {
    if (selectedIds.size === 0) return;
    const idsArray = Array.from(selectedIds);
    if (onBatchDelete) {
      onBatchDelete(idsArray);
    } else if (onDelete) {
      idsArray.forEach(id => onDelete(id));
    }
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setShowBatchDeleteModal(false);
  }, [selectedIds, onBatchDelete, onDelete]);

  const handleRequestSingleDelete = useCallback((id: string) => {
    const found = artists.find(a => a.id === id);
    if (found) {
      setArtistToDeleteSingle(found);
    } else if (onDelete) {
      onDelete(id);
    }
  }, [artists, onDelete]);

  const executeSingleDelete = useCallback(() => {
    if (!artistToDeleteSingle) return;
    onDelete?.(artistToDeleteSingle.id);
    setArtistToDeleteSingle(null);
  }, [artistToDeleteSingle, onDelete]);

  // Render Type Tabs dynamically based on JSON config
  const renderTypeTabs = () => {
    if (typeTabsStyle === 'editorial_links') {
      return (
        <div className={`flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 border-b no-scrollbar whitespace-nowrap ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`text-xs uppercase tracking-widest font-serif font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-stone-100 border-b-2 border-stone-100 pb-1'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            All Archives ({artists.length})
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`text-xs uppercase tracking-widest font-serif font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'special'
                ? 'text-amber-400 border-b-2 border-amber-400 pb-1'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            Special Tier ({specialCount})
          </button>
          <button
            onClick={() => setActiveTab('standard')}
            className={`text-xs uppercase tracking-widest font-serif font-bold transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'standard'
                ? 'text-rose-400 border-b-2 border-rose-400 pb-1'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            Standard ({standardCount})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`text-xs uppercase tracking-widest font-serif font-bold transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'text-amber-300 border-b-2 border-amber-300 pb-1'
                : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>Favorit ({favoritesCount})</span>
          </button>
        </div>
      );
    }

    if (typeTabsStyle === 'pills') {
      return (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary border-primary shadow-md scale-102 font-black'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                : 'bg-white border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
          >
            <span>{t.all}</span>
            <span className="text-xs font-mono opacity-80 font-normal">({artists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('special')}
            className={`px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
              activeTab === 'special'
                ? 'bg-[#00BCD5] text-white border-cyan-400 shadow-md scale-102 font-black'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                : 'bg-white border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            <span>{t.special}</span>
            <span className="text-xs font-mono font-normal">({specialCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('standard')}
            className={`px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
              activeTab === 'standard'
                ? 'bg-[#FECDD2] text-stone-950 border-rose-300 shadow-md scale-102 font-black'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                : 'bg-white border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
            <span>{t.standard}</span>
            <span className="text-xs font-mono font-normal">({standardCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-3.5 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border shrink-0 whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md scale-102 font-black'
                : isDark
                ? 'bg-stone-900 border-stone-800 text-amber-300 hover:text-white'
                : 'bg-white border-stone-300 text-amber-600 hover:text-stone-950'
            }`}
          >
            <Star className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'favorites' ? 'fill-current' : 'text-amber-400 fill-amber-400/40'}`} />
            <span>Favorit</span>
            <span className="text-xs font-mono font-normal">({favoritesCount})</span>
          </button>
        </div>
      );
    }

    if (typeTabsStyle === 'chamfer_tabs') {
      return (
        <div className={`flex border p-1 font-mono text-xs overflow-x-auto no-scrollbar whitespace-nowrap gap-1 ${radius} ${
          isDark ? 'border-cyan-500/30 bg-stone-950/90' : 'border-stone-300 bg-stone-100'
        }`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-fit px-3 py-2 font-bold transition-all uppercase tracking-wider shrink-0 whitespace-nowrap ${
              activeTab === 'all'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'bg-white text-stone-950 shadow-xs'
                : isDark
                ? 'text-stone-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            [01] {t.all} ({artists.length})
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`flex-1 min-w-fit px-3 py-2 font-bold transition-all uppercase tracking-wider shrink-0 whitespace-nowrap ${
              activeTab === 'special'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'bg-cyan-100 text-cyan-900 shadow-xs'
                : isDark
                ? 'text-stone-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            [02] {t.special} ({specialCount})
          </button>
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 min-w-fit px-3 py-2 font-bold transition-all uppercase tracking-wider shrink-0 whitespace-nowrap ${
              activeTab === 'standard'
                ? isDark
                  ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                  : 'bg-rose-100 text-rose-950 shadow-xs'
                : isDark
                ? 'text-stone-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            [03] {t.standard} ({standardCount})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 min-w-fit px-3 py-2 font-bold transition-all uppercase tracking-wider shrink-0 whitespace-nowrap ${
              activeTab === 'favorites'
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-400'
                  : 'bg-amber-100 text-amber-950 shadow-xs'
                : isDark
                ? 'text-stone-400 hover:text-white'
                : 'text-stone-600 hover:text-stone-950'
            }`}
          >
            [04] Favorit ({favoritesCount})
          </button>
        </div>
      );
    }

    if (typeTabsStyle === 'subtle_bar') {
      return (
        <div className={`flex border-b pb-1 gap-3 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1.5 px-2 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'all'
                ? 'border-primary text-primary font-black'
                : 'border-transparent text-stone-500 hover:text-stone-400'
            }`}
          >
            {t.all} <span className="font-mono text-xs">({artists.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`py-1.5 px-2 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'special'
                ? 'border-cyan-400 text-cyan-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-400'
            }`}
          >
            {t.special} <span className="font-mono text-xs">({specialCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('standard')}
            className={`py-1.5 px-2 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 whitespace-nowrap ${
              activeTab === 'standard'
                ? 'border-rose-400 text-rose-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-400'
            }`}
          >
            {t.standard} <span className="font-mono text-xs">({standardCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-1.5 px-2 font-bold text-xs sm:text-sm border-b-2 transition-all flex items-center gap-1 shrink-0 whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-amber-400 text-amber-400 font-black'
                : 'border-transparent text-stone-500 hover:text-stone-400'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Favorit</span>
            <span className="font-mono text-xs">({favoritesCount})</span>
          </button>
        </div>
      );
    }

    // Default: 'segmented' or 'chips'
    return (
      <div className={`flex items-center overflow-x-auto no-scrollbar border ${radius} p-1.5 backdrop-blur-md gap-1.5 ${elevation} whitespace-nowrap ${
        isDark ? 'border-stone-800 bg-stone-900/90' : 'border-stone-200 bg-white'
      }`}>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 min-w-[70px] sm:min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 ${innerRadius} font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-primary text-on-primary shadow-md font-extrabold scale-101'
              : isDark
              ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span>{t.all}</span>
          <span className="text-xs font-mono opacity-90 font-normal">({artists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('special')}
          className={`flex-1 min-w-[85px] sm:min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 ${innerRadius} font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'special'
              ? 'bg-[#00BCD5] text-white shadow-md font-extrabold scale-101'
              : isDark
              ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
          <span>{t.special}</span>
          <span
            className={`text-[11px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'special'
                ? 'bg-black/20 text-white'
                : isDark
                ? 'bg-stone-800 text-stone-300'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {specialCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('standard')}
          className={`flex-1 min-w-[90px] sm:min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 ${innerRadius} font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'standard'
              ? 'bg-[#FECDD2] text-stone-900 shadow-md font-black scale-101'
              : isDark
              ? 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
          <span>{t.standard}</span>
          <span
            className={`text-[11px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'standard'
                ? 'bg-black/20 text-stone-950'
                : isDark
                ? 'bg-stone-800 text-stone-300'
                : 'bg-stone-200 text-stone-700'
            }`}
          >
            {standardCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex-1 min-w-[85px] sm:min-w-0 py-2 sm:py-2.5 px-2 sm:px-3 ${innerRadius} font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shrink-0 whitespace-nowrap ${
            activeTab === 'favorites'
              ? 'bg-amber-500 text-stone-950 shadow-md font-black scale-101'
              : isDark
              ? 'text-amber-400 hover:text-white hover:bg-stone-800/60'
              : 'text-amber-700 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Star className={`w-3.5 h-3.5 shrink-0 ${activeTab === 'favorites' ? 'fill-stone-950' : 'fill-amber-400/30'}`} />
          <span>Favorit</span>
          <span
            className={`text-[11px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'favorites'
                ? 'bg-black/20 text-stone-950'
                : isDark
                ? 'bg-stone-800 text-amber-300'
                : 'bg-stone-200 text-amber-800'
            }`}
          >
            {favoritesCount}
          </span>
        </button>
      </div>
    );
  };

  // Render Horizontal Shelf Layout (Layout D)
  const renderHorizontalShelves = () => {
    const topRatedStars = [...artists]
      .sort((a, b) => {
        const aO = artistScoresMap.get(a.id)?.overallRating ?? 0;
        const bO = artistScoresMap.get(b.id)?.overallRating ?? 0;
        return bO - aO;
      })
      .slice(0, 6);

    const specialAttributesStars = artists.filter(a => (a.attributes?.length || 0) > 0).slice(0, 6);

    return (
      <div className="space-y-6 pb-2">
        {/* Top Stars Shelf */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Top Rated Stars</h3>
            </div>
            <span className="text-xs text-stone-400">Peringkat Tertinggi</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {topRatedStars.map(a => (
              <div
                key={`shelf-top-${a.id}`}
                onClick={() => onSelectArtist(a)}
                className={`w-36 sm:w-44 shrink-0 p-2.5 ${radius} border cursor-pointer group transition-all hover:scale-102 ${
                  isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                <div className={`w-full aspect-3/4 ${innerRadius} overflow-hidden bg-stone-950 mb-2 relative`}>
                  <img
                    src={a.avatarUrl}
                    alt={a.firstName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                    ★ {Math.round(artistScoresMap.get(a.id)?.overallRating ?? 0)}
                  </div>
                </div>
                <h4 className="text-xs font-bold truncate">{a.firstName} {a.lastName}</h4>
                <p className="text-[10px] text-stone-400 truncate">{a.country}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Special Attributes Shelf */}
        {specialAttributesStars.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Special Attributes</h3>
              </div>
              <span className="text-xs text-stone-400">{specialAttributesStars.length} Bintang</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {specialAttributesStars.map(a => (
                <div
                  key={`shelf-spec-${a.id}`}
                  onClick={() => onSelectArtist(a)}
                  className={`w-36 sm:w-44 shrink-0 p-2.5 ${radius} border cursor-pointer group transition-all hover:scale-102 ${
                    isDark ? 'bg-stone-900/90 border-cyan-500/30' : 'bg-white border-cyan-300 shadow-sm'
                  }`}
                >
                  <div className={`w-full aspect-3/4 ${innerRadius} overflow-hidden bg-stone-950 mb-2 relative`}>
                    <img
                      src={a.avatarUrl}
                      alt={a.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 px-1.5 py-0.5 rounded-sm bg-cyan-950/90 text-[9px] font-mono text-cyan-300 border border-cyan-500/40 truncate text-center">
                      {a.attributes?.[0]}
                    </div>
                  </div>
                  <h4 className="text-xs font-bold truncate">{a.firstName} {a.lastName}</h4>
                  <p className="text-[10px] text-stone-400 truncate">{a.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-6xl mx-auto space-y-4 pb-28 relative"
    >
      {/* Decorative Texture for Technical HUD themes */}
      {decorations?.showGridBackground && <HUDGridTexture opacity={0.07} />}

      {/* COMPOSITION HERO: Featured Spotlight or Split Dashboard */}
      {homeLayout === 'featured_hero' && topFeaturedArtist && (
        <div
          onClick={() => onSelectArtist(topFeaturedArtist)}
          style={{ borderColor: primaryColor }}
          className={`relative overflow-hidden cursor-pointer group p-5 sm:p-7 border ${radius} ${elevation} ${
            isDark ? 'bg-stone-950/90' : 'bg-white'
          }`}
        >
          {decorations?.showCornerBrackets && <HUDCornerBrackets color={primaryColor} size={14} />}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-4 aspect-4/3 md:aspect-3/4 rounded-xl overflow-hidden bg-stone-900 relative shadow-2xl">
              <img
                src={topFeaturedArtist.avatarUrl}
                alt={topFeaturedArtist.firstName}
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-black text-xs shadow-lg flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>FEATURED SPOTLIGHT</span>
              </div>
            </div>
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-serif tracking-widest text-amber-500 font-bold">
                  {getCountryFlag(topFeaturedArtist.countryCode, topFeaturedArtist.country)} {topFeaturedArtist.country}
                </span>
                <span className="text-xs text-stone-500">•</span>
                <span className="text-xs font-mono text-stone-400">
                  {getTypeInfo(topFeaturedArtist.typeCode).indonesia || topFeaturedArtist.typeCode}
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors">
                {topFeaturedArtist.firstName} {topFeaturedArtist.lastName}
              </h2>
              <div className="flex items-center gap-3 pt-1">
                <div className="p-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block font-mono">OVERALL</span>
                  <span className="text-lg font-black text-amber-400">
                    {Math.round(artistScoresMap.get(topFeaturedArtist.id)?.overallRating ?? 0)}
                  </span>
                </div>
                <div className="p-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block font-mono">APPEARANCE</span>
                  <span className="text-lg font-black text-cyan-400">
                    {(artistScoresMap.get(topFeaturedArtist.id)?.appScore ?? 0).toFixed(1)}
                  </span>
                </div>
                <div className="p-2 px-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 block font-mono">IMPRESSION</span>
                  <span className="text-lg font-black text-rose-400">
                    {(artistScoresMap.get(topFeaturedArtist.id)?.impScore ?? 0).toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-stone-400 line-clamp-2 max-w-xl">
                {topFeaturedArtist.appeal?.vibe} • {topFeaturedArtist.appeal?.style} • {topFeaturedArtist.measurements.cupSize} Cup ({topFeaturedArtist.heightCm} cm)
              </p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md group-hover:translate-x-1"
              >
                <span>Lihat Profil Lengkap</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSITION HERO: Split Dashboard (Layout C) */}
      {homeLayout === 'split_dashboard' && topFeaturedArtist && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div
            onClick={() => onSelectArtist(topFeaturedArtist)}
            className={`md:col-span-7 p-4 sm:p-5 border ${radius} ${elevation} cursor-pointer group relative overflow-hidden ${
              isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
            }`}
          >
            <div className="flex gap-4 items-center">
              <div className="w-24 sm:w-28 aspect-3/4 rounded-xl overflow-hidden bg-stone-950 shrink-0">
                <img
                  src={topFeaturedArtist.avatarUrl}
                  alt={topFeaturedArtist.firstName}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-block">
                  #1 Top Performer
                </span>
                <h3 className="text-base sm:text-lg font-bold truncate group-hover:text-amber-400 transition-colors">
                  {topFeaturedArtist.firstName} {topFeaturedArtist.lastName}
                </h3>
                <p className="text-xs text-stone-400">{topFeaturedArtist.country} • {getTypeInfo(topFeaturedArtist.typeCode).indonesia || topFeaturedArtist.typeCode}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    ★ {calculateOverallRating(
                      calculateAppearanceScore(topFeaturedArtist.appearanceScores),
                      calculateImpressionScore(topFeaturedArtist.impressionScores)
                    ).toFixed(1)} Overall
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`md:col-span-5 p-4 border ${radius} ${elevation} flex flex-col justify-between ${
            isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Statistik Database</span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">{artists.length} Total Artis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-2 text-xs">
              <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
                <span className="text-[10px] text-stone-400 block font-mono">Special Talent</span>
                <strong className="text-cyan-400 text-sm font-bold">{specialCount} Entri</strong>
              </div>
              <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800/80">
                <span className="text-[10px] text-stone-400 block font-mono">Standard Talent</span>
                <strong className="text-rose-300 text-sm font-bold">{standardCount} Entri</strong>
              </div>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center justify-between">
              <span>Sistem Penilaian Terbobot</span>
              <span className="font-mono text-amber-400">Aktif</span>
            </div>
          </div>
        </div>
      )}

      {/* HORIZONTAL SHELVES (if layout === 'horizontal_shelf') */}
      {homeLayout === 'horizontal_shelf' && renderHorizontalShelves()}

      {/* FIXED / STICKY BARS: Tab Bar, Sort Bar & Density Control */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md pt-1.5 pb-2.5 space-y-2 border-b -mx-4 px-4 sm:mx-0 sm:px-0 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--color-bg-app, var(--app-bg, #0C0A09))',
          borderColor: 'var(--color-border, var(--app-border, #44403C))',
        }}
      >
        {/* 1. Dynamic Type Tabs */}
        {renderTypeTabs()}

        {/* 2. Dynamic Sort Bar (Single Button Trigger -> Opens Centered Sort Selection Pop-up) */}
        <div
          className={`border px-3.5 py-1.5 ${radius} backdrop-blur-md ${elevation} flex items-center justify-between gap-2`}
          style={{
            backgroundColor: 'var(--color-surface, var(--app-surface, #1C1917))',
            borderColor: 'var(--color-border, var(--app-border, #44403C))',
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--color-primary)' }}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.filterBy || 'Urutkan:'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowSortModal(true)}
            className={`px-3 py-1.5 ${innerRadius} text-xs font-bold transition-all flex items-center justify-between gap-2 border flex-1 max-w-xs sm:max-w-sm cursor-pointer hover:opacity-90`}
            style={{
              backgroundColor: 'var(--color-surface-sub, var(--app-surface, #292524))',
              borderColor: 'var(--color-border, var(--app-border, #44403C))',
              color: 'var(--color-primary, #FE9900)',
            }}
            title="Klik untuk memilih kriteria urutan / sortir"
          >
            <span className="truncate font-black tracking-wide">
              {currentSortOption.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0" style={{ color: 'var(--color-primary)' }} />
          </button>
        </div>

        {/* 3. Card Density Control & Quick Actions */}
        <div
          className={`border px-3.5 py-1.5 ${radius} backdrop-blur-md ${elevation} flex flex-wrap items-center justify-between gap-2`}
          style={{
            backgroundColor: 'var(--color-surface, var(--app-surface, #1C1917))',
            borderColor: 'var(--color-border, var(--app-border, #44403C))',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider shrink-0 opacity-70">
              <LayoutGrid className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
              <span>Grid:</span>
            </div>

            <div className="flex items-center gap-1">
              {([2, 3, 4] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDensityChange(d)}
                  style={
                    cardDensity === d
                      ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)', borderColor: 'var(--color-primary)' }
                      : {
                          backgroundColor: 'var(--color-surface-sub, var(--app-surface, #292524))',
                          borderColor: 'var(--color-border, var(--app-border, #44403C))',
                          color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
                        }
                  }
                  className={`px-2 py-0.5 ${innerRadius} text-xs font-mono font-bold transition-all border cursor-pointer hover:opacity-80 ${
                    cardDensity === d ? 'shadow-md scale-102 font-black' : ''
                  }`}
                  title={`${d} Kolom per baris`}
                >
                  {d}×
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Multi-Select Delete Mode Button (Icon-Only, with Centered Pop-up) */}
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(!isSelectionMode);
                if (isSelectionMode) {
                  setSelectedIds(new Set());
                }
              }}
              className={`relative p-2 ${innerRadius} text-xs font-bold transition-all border flex items-center justify-center shrink-0 ${
                isSelectionMode
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-2 ring-rose-400/40'
                  : isDark
                  ? 'bg-stone-800/80 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
                  : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
              title={isSelectionMode ? 'Batal Mode Pilih Multi-Hapus' : 'Pilih Multi-Hapus (Pilih Banyak Artis)'}
              aria-label="Pilih Multi-Hapus"
            >
              <CheckSquare className="w-4 h-4 text-rose-400" />
              {isSelectionMode && selectedIds.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {selectedIds.size}
                </span>
              )}
            </button>

            {/* Gacha Random Artist Button (Spotlight Acak) */}
            <button
              type="button"
              onClick={() => setShowGachaModal(true)}
              className={`px-2.5 py-1 ${innerRadius} text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
              title="Spotlight Acak / Gacha Artis"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">Spotlight Acak</span>
            </button>

            {/* Instant CSV Export Button */}
            <button
              type="button"
              onClick={() => exportDatabaseAsCSV(artists, schema)}
              className={`px-2.5 py-1 ${innerRadius} text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isDark
                  ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700 hover:text-white'
                  : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
              }`}
              title="Unduh Database CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>

        {/* 4. Quick Status Filter Pills (if status options exist) */}
        {statusOptions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
            <span className={`text-[10px] uppercase font-bold tracking-wider shrink-0 mr-1 ${
              isDark ? 'text-stone-400' : 'text-stone-600'
            }`}>
              Status:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-0.5 ${innerRadius} text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-stone-700 text-white border-stone-600 font-bold'
                  : isDark
                  ? 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                  : 'bg-stone-100 text-stone-600 border-stone-300 hover:text-stone-900'
              }`}
            >
              Semua
            </button>
            {statusOptions.map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(statusFilter === st ? 'all' : st)}
                className={`px-2.5 py-0.5 ${innerRadius} text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  statusFilter === st
                    ? 'bg-cyan-600 text-white border-cyan-500 font-bold shadow-xs'
                    : isDark
                    ? 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-cyan-300'
                    : 'bg-stone-100 text-stone-600 border-stone-300 hover:text-stone-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filter Notification Badge */}
      {activeFilter && (
        <div className={`flex items-center justify-between p-3 ${radius} border text-xs ${
          isDark
            ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
            : 'bg-cyan-50 border-cyan-300 text-cyan-900'
        }`}>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-500" />
            <span>
              Filter <strong>{activeFilter.type}</strong>:{' '}
              <strong className={isDark ? 'text-white' : 'text-stone-950'}>{activeFilter.value}</strong>
            </span>
          </div>
          <button
            onClick={onClearActiveFilter}
            className={`px-2.5 py-1 ${innerRadius} bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-500 transition-colors shadow-xs`}
          >
            {t.clearFilter}
          </button>
        </div>
      )}

      {/* Active Multi-Select Action Banner */}
      {isSelectionMode && (
        <div className={`p-3 ${radius} bg-rose-950/40 border border-rose-500/40 flex flex-wrap items-center justify-between gap-2 shadow-lg backdrop-blur-md animate-fadeIn`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-rose-400" />
              <span>Mode Multi-Hapus: <strong className="text-white text-sm">{selectedIds.size}</strong> artis terpilih</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-2.5 py-1 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all border border-stone-700`}
            >
              Pilih Semua ({filteredArtists.length})
            </button>
            <button
              type="button"
              onClick={handleClearSelection}
              className={`px-2.5 py-1 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 text-xs font-bold transition-all border border-stone-700`}
            >
              Batal Pilih
            </button>
            <button
              type="button"
              onClick={handleConfirmBatchDelete}
              disabled={selectedIds.size === 0}
              className={`px-3 py-1 ${innerRadius} bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Section Divider (if configured) */}
      {divider && <div className={divider} />}

      {/* 4. Dynamic Artist Collection Renderer (Grid / List / Compact / Roster / Table) */}
      {filteredArtists.length > 0 ? (
        <ArtistCollectionRenderer
          artists={visibleArtists}
          scoresMap={artistScoresMap}
          collection={collectionConfig}
          itemConfig={itemConfig}
          fieldPresentation={fieldPresentation}
          responsiveCollection={responsiveCollection}
          onSelectArtist={onSelectArtist}
          onEdit={onEdit}
          onDelete={handleRequestSingleDelete}
          cardDensity={cardDensity}
          isDark={isDark}
          radius={radius}
          innerRadius={innerRadius}
          elevation={elevation}
          primaryColor={primaryColor}
          decorations={decorations}
          gridGap={gridGap}
          gridRef={gridRef}
          topPadding={topPadding}
          bottomPadding={bottomPadding}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          searchQuery={searchQuery}
        />
      ) : (
        /* Dynamic Empty State */
        <div className={`p-12 ${radius} border text-center space-y-4 ${
          emptyStyle === 'hud_radar'
            ? isDark
              ? 'bg-stone-950 border-cyan-500/30 text-cyan-400'
              : 'bg-stone-50 border-cyan-400 text-cyan-800'
            : emptyStyle === 'minimal_text'
            ? 'border-transparent bg-transparent'
            : isDark
            ? 'bg-stone-900/40 border-stone-800 border-dashed'
            : 'bg-white border-stone-300 border-dashed shadow-sm'
        }`}>
          <div className={`w-14 h-14 ${radius} flex items-center justify-center mx-auto ${
            emptyStyle === 'hud_radar'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
              : isDark
              ? 'bg-stone-800 text-stone-400'
              : 'bg-stone-100 text-stone-500'
          }`}>
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
              {t.noArtistsFound}
            </h3>
            <p className={`text-xs mt-1 max-w-md mx-auto ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              {t.noArtistsDesc}
            </p>
          </div>
          <button
            onClick={onAddNew}
            style={{ backgroundColor: primaryColor }}
            className={`inline-flex items-center gap-2 py-2 px-4 ${radius} text-stone-950 font-bold text-xs transition-colors shadow-sm hover:scale-105 active:scale-95`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {t.addArtist}
          </button>
        </div>
      )}

      {/* Random Artist Picker Modal */}
      <RandomArtistModal
        isOpen={showGachaModal}
        onClose={() => setShowGachaModal(false)}
        artists={artists}
        onSelectArtist={onSelectArtist}
      />

      {/* Centered Sort Selection Modal */}
      {showSortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="border rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl bg-stone-900 border-stone-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <ArrowUpDown className="w-6 h-6" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-base font-black text-white">Urutkan Daftar Artis</h3>
              <p className="text-xs text-stone-400">Pilih kriteria untuk menyortir urutan kartu artis</p>
            </div>

            <div className="w-full space-y-1.5 max-h-72 overflow-y-auto no-scrollbar py-1">
              {sortOptionsList.map(opt => {
                const isSelected = sortOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortOption(opt.id);
                      setShowSortModal(false);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border text-center ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-md scale-[1.02]'
                        : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-700 hover:text-white hover:border-stone-600'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-stone-950" />}
                  </button>
                );
              })}
            </div>

            <div className="w-full pt-2 border-t border-stone-800 flex justify-center">
              <button
                type="button"
                onClick={() => setShowSortModal(false)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal (Center Aligned) */}
      {showBatchDeleteModal && selectedIds.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-stone-900 border-stone-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-white">Hapus {selectedIds.size} Artis Terpilih?</h3>
              <p className="text-xs text-stone-400">Konfirmasi tindakan penghapusan massal</p>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-center">
              Anda akan menghapus <strong className="text-white font-bold">{selectedIds.size} artis</strong> dari database. Tindakan ini akan menghapus data profil terkait secara permanen.
            </p>

            {/* Selected artists preview list */}
            <div className="w-full max-h-36 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-left">
              {artists
                .filter(a => selectedIds.has(a.id))
                .slice(0, 6)
                .map(a => (
                  <div key={a.id} className="flex items-center gap-2 text-stone-300">
                    <img
                      src={a.avatarUrl}
                      alt={a.firstName}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <span className="truncate font-medium">{a.firstName} {a.lastName}</span>
                    <span className="text-[10px] text-stone-500 font-mono ml-auto shrink-0">{a.country}</span>
                  </div>
                ))}
              {selectedIds.size > 6 && (
                <p className="text-[11px] text-stone-500 text-center pt-1 italic">
                  ...dan {selectedIds.size - 6} artis lainnya
                </p>
              )}
            </div>

            <div className="w-full flex items-center justify-center gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeBatchDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950 flex items-center justify-center gap-1.5 text-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal (Center Aligned) */}
      {artistToDeleteSingle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl bg-stone-900 border-stone-800 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-white">Hapus Profil Artis</h3>
              <p className="text-xs text-stone-400">Konfirmasi penghapusan</p>
            </div>

            <div className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-stone-950/80 border border-stone-800 text-left">
              <img
                src={artistToDeleteSingle.avatarUrl}
                alt={artistToDeleteSingle.firstName}
                className="w-12 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-stone-100 truncate">
                  {artistToDeleteSingle.firstName} {artistToDeleteSingle.lastName}
                </h4>
                <p className="text-xs text-stone-400">{artistToDeleteSingle.country} • {artistToDeleteSingle.typeCode}</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-center">
              Apakah Anda yakin ingin menghapus data profil artis ini dari database? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="w-full flex items-center justify-center gap-3 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setArtistToDeleteSingle(null)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-center"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeSingleDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950 flex items-center justify-center gap-1.5 text-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Artis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
