import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { Artist, AppTheme, DatabaseSchema, RankingFilterDimension } from '../types';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
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
  Trophy,
  Crown,
  Search,
  X,
  ChevronRight,
  Sparkles,
  Award,
  Flame,
  Star,
  Activity,
} from 'lucide-react';
import { getTranslation, TranslationDictionary } from '../utils/i18n';

interface RankingPageProps {
  artists: Artist[];
  onSelectArtist: (artist: Artist) => void;
  defaultSortCategory?: 'overall' | 'appearance' | 'impression' | 'proportional';
  defaultDimension?: RankingFilterDimension;
  defaultSubFilter?: string;
  highlightArtistId?: string;
  onClearHighlight?: () => void;
  theme?: AppTheme;
  t?: TranslationDictionary;
  schema?: DatabaseSchema;
}

export const RankingPage: React.FC<RankingPageProps> = ({
  artists,
  onSelectArtist,
  defaultSortCategory = 'overall',
  defaultDimension = 'ALL',
  defaultSubFilter = 'ALL',
  highlightArtistId,
  onClearHighlight,
  theme = 'dark',
  t = getTranslation('default'),
  schema,
}) => {
  const isDark = theme !== 'light' && theme !== 'sepia';
  const [sortCategory, setSortCategory] = useState<
    'overall' | 'appearance' | 'impression' | 'proportional'
  >(defaultSortCategory);
  const [activeDimension, setActiveDimension] = useState<RankingFilterDimension>(defaultDimension);
  const [subFilterValue, setSubFilterValue] = useState<string>(defaultSubFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to dynamically update podium status text
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const rankingTabs: ('overall' | 'appearance' | 'impression' | 'proportional')[] = useMemo(
    () => ['overall', 'appearance', 'impression', 'proportional'],
    []
  );

  const handleSwipeLeft = useCallback(() => {
    const currentIndex = rankingTabs.indexOf(sortCategory);
    if (currentIndex < rankingTabs.length - 1) {
      setSortCategory(rankingTabs[currentIndex + 1]);
    }
  }, [sortCategory, rankingTabs]);

  const handleSwipeRight = useCallback(() => {
    const currentIndex = rankingTabs.indexOf(sortCategory);
    if (currentIndex > 0) {
      setSortCategory(rankingTabs[currentIndex - 1]);
    }
  }, [sortCategory, rankingTabs]);

  useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 55,
  });

  // Auto scroll and highlight specific artist if requested
  useEffect(() => {
    if (!highlightArtistId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`ranking-artist-${highlightArtistId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('search-target-pulse');
        void (el as HTMLElement).offsetWidth;
        el.classList.add('search-target-pulse');
        setTimeout(() => el.classList.remove('search-target-pulse'), 3000);
      }
      onClearHighlight?.();
    }, 200);
    return () => clearTimeout(timer);
  }, [highlightArtistId, sortCategory, activeDimension, subFilterValue, onClearHighlight]);

  // Get podium dynamic title
  const getPodiumTitle = () => {
    if (isScrolled) {
      switch (sortCategory) {
        case 'overall':
          return 'OVERALL TOP';
        case 'appearance':
          return 'APPEARANCE TOP';
        case 'impression':
          return 'IMPRESSION TOP';
        case 'proportional':
          return 'PROPORTIONAL TOP';
        default:
          return 'OVERALL TOP';
      }
    }
    return schema?.pageTexts?.ranking?.labels?.podiumTitle || 'Top 3 Podium';
  };

  // Synchronize when parent navigation sends updated filter criteria
  useEffect(() => {
    if (defaultSortCategory) {
      setSortCategory(defaultSortCategory);
    }
  }, [defaultSortCategory]);

  useEffect(() => {
    if (defaultDimension) {
      setActiveDimension(defaultDimension);
    }
    if (defaultSubFilter !== undefined) {
      setSubFilterValue(defaultSubFilter);
    }
  }, [defaultDimension, defaultSubFilter]);

  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);
  const primaryColor = uiTheme.tokens?.colors?.primary || uiTheme.global.primaryColor || '#FE9900';
  const decorations = uiTheme.decorationSystem;

  const rankingLayout = (uiTheme.ranking?.composition?.podiumType || uiTheme.ranking?.layout || uiTheme.ranking?.podiumStyle || 'step_podium') as string;
  const listStyle = uiTheme.ranking?.listItemStyle || 'numbered_card';

  // Process artists with calculated stats
  const processedArtists = useMemo(() => {
    return artists.map(a => {
      const app = calculateAppearanceScore(a.appearanceScores);
      const imp = calculateImpressionScore(a.impressionScores);
      const overall = calculateOverallRating(app, imp);
      const prop = calculateProportionalRating(a.measurements);
      const age = calculateAge(a.bornDate);
      const isSpecial = (a.attributes?.length || 0) > 0;
      return {
        artist: a,
        app,
        imp,
        overall,
        prop,
        age,
        isSpecial,
      };
    });
  }, [artists]);

  // Dimension Category list for horizontal slider
  const filterDimensions: { id: RankingFilterDimension; label: string }[] = useMemo(() => [
    { id: 'ALL', label: t.allCategories },
    { id: 'COUNTRY', label: `🌐 ${schema?.fields?.country?.label || 'COUNTRY'}` },
    { id: 'STATUS', label: '🏷️ STATUS ARTIS' },
    { id: 'BODY_TYPE', label: `🧍 ${schema?.fields?.typeCode?.label || 'BODY TYPE'}` },
    { id: 'BODY_SHAPES', label: `💃 ${schema?.fields?.bodyShape?.label || 'BODY SHAPES'}` },
    { id: 'MATURITY', label: `🍷 ${schema?.fields?.maturity?.label || 'MATURITY'}` },
    { id: 'CUP_SIZE', label: `👙 ${schema?.fields?.cupSize?.label || 'CUP SIZE'}` },
    { id: 'BUST_SIZE', label: `📏 ${schema?.fields?.bustCm?.label || 'BUST SIZE'}` },
    { id: 'WAIST_SIZE', label: `⏳ ${schema?.fields?.waistCm?.label || 'WAIST SIZE'}` },
    { id: 'HIP_SIZE', label: `🍑 ${schema?.fields?.hipCm?.label || 'HIP SIZE'}` },
    { id: 'AGE', label: `🎂 ${schema?.fields?.bornDate?.label || 'AGE'}` },
    { id: 'HEIGHT', label: `📐 ${schema?.fields?.heightCm?.label || 'HEIGHT'}` },
    { id: 'ATTRIBUTES', label: `✨ ${schema?.sectionTitles?.attributes || 'ATTRIBUTES'}` },
    { id: 'APPEAL', label: `🔥 ${schema?.sectionTitles?.appeal || 'APPEAL'}` },
    { id: 'SPECIALTY', label: `⭐ ${schema?.sectionTitles?.specialty || 'SPECIALTY'}` },
  ], [t, schema]);

  // Dynamic sub-filter options based on active dimension
  const subFilterOptions = useMemo(() => {
    if (activeDimension === 'ALL') return [];

    if (activeDimension === 'COUNTRY') {
      const unique = Array.from(
        new Set(artists.map(a => a.country).filter(Boolean))
      ).sort((a, b) => String(a).localeCompare(String(b)));
      return unique.map(val => ({ label: val, value: val }));
    }

    if (activeDimension === 'STATUS') {
      return [
        { label: 'Amatir', value: 'Amatir' },
        { label: 'Profesional', value: 'Profesional' },
      ];
    }

    if (activeDimension === 'BODY_TYPE') {
      const unique = Array.from(
        new Set(artists.map(a => a.typeCode).filter(Boolean))
      ).sort();
      return unique.map(val => {
        const strVal = String(val);
        const info = getTypeInfo(strVal);
        const label = `${strVal} - ${info.indonesia}`;
        return { label, value: strVal };
      });
    }

    if (activeDimension === 'BODY_SHAPES') {
      const unique = Array.from(
        new Set(artists.map(a => a.appeal?.bodyShape).filter(Boolean))
      ).sort((a, b) => String(a).localeCompare(String(b)));
      return unique.map(val => ({ label: val, value: val }));
    }

    if (activeDimension === 'MATURITY') {
      const unique = Array.from(
        new Set(artists.map(a => a.appeal?.maturity).filter(Boolean))
      ).sort((a, b) => String(a).localeCompare(String(b)));
      return unique.map(val => ({ label: val, value: val }));
    }

    if (activeDimension === 'CUP_SIZE') {
      const unique = Array.from(
        new Set(artists.map(a => a.measurements?.cupSize).filter(Boolean))
      ).sort();
      return unique.map(val => ({ label: `${val} Cup`, value: val }));
    }

    if (activeDimension === 'BUST_SIZE') {
      return [
        { label: '< 85 cm', value: '<85' },
        { label: '85 - 90 cm', value: '85-90' },
        { label: '> 90 cm', value: '>90' },
      ];
    }

    if (activeDimension === 'WAIST_SIZE') {
      return [
        { label: '< 58 cm', value: '<58' },
        { label: '58 - 62 cm', value: '58-62' },
        { label: '> 62 cm', value: '>62' },
      ];
    }

    if (activeDimension === 'HIP_SIZE') {
      return [
        { label: '< 86 cm', value: '<86' },
        { label: '86 - 90 cm', value: '86-90' },
        { label: '> 90 cm', value: '>90' },
      ];
    }

    if (activeDimension === 'AGE') {
      return [
        { label: '< 22 th', value: '<22' },
        { label: '22 - 27 th', value: '22-27' },
        { label: '28 - 35 th', value: '28-35' },
        { label: '> 35 th', value: '>35' },
      ];
    }

    if (activeDimension === 'HEIGHT') {
      return [
        { label: '< 158 cm', value: '<158' },
        { label: '158 - 165 cm', value: '158-165' },
        { label: '> 165 cm', value: '>165' },
      ];
    }

    if (activeDimension === 'ATTRIBUTES') {
      const set = new Set<string>();
      Object.values(schema?.attributeCategories || {}).forEach((cat: any) => {
        (cat?.options || []).forEach((opt: any) => {
          if (opt && opt.name && opt.name.trim()) set.add(opt.name.trim());
        });
      });
      (schema?.presetAttributes || []).forEach(p => {
        if (p && p.trim()) set.add(p.trim());
      });
      // Fallback to artists data if empty
      if (set.size === 0) {
        artists.flatMap(a => a.attributes || []).filter(Boolean).forEach(a => set.add(String(a)));
      }
      return Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map(val => ({ label: val, value: val }));
    }

    if (activeDimension === 'APPEAL') {
      const set = new Set<string>();
      Object.values(schema?.appealCategories || {}).forEach((cat: any) => {
        (cat?.options || []).forEach((opt: any) => {
          if (opt && opt.name && opt.name.trim()) set.add(opt.name.trim());
        });
      });
      // Fallback to artists data if empty
      if (set.size === 0) {
        artists.flatMap(a => a.appeal ? Object.values(a.appeal) : []).filter(Boolean).forEach(v => set.add(String(v)));
      }
      return Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map(val => ({ label: val, value: val }));
    }

    if (activeDimension === 'SPECIALTY') {
      const set = new Set<string>();
      Object.values(schema?.specialtyCategories || {}).forEach((cat: any) => {
        (cat?.options || []).forEach((opt: any) => {
          if (opt && opt.name && opt.name.trim()) set.add(opt.name.trim());
        });
      });
      (schema?.presetSpecialties || []).forEach(p => {
        if (p && p.trim()) set.add(p.trim());
      });
      // Fallback to artists data if empty
      if (set.size === 0) {
        artists.flatMap(a => a.specialty || []).filter(Boolean).forEach(s => set.add(String(s)));
      }
      return Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map(val => ({ label: val, value: val }));
    }

    return [];
  }, [activeDimension, artists, schema]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    let list = [...processedArtists];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        item =>
          item.artist.firstName.toLowerCase().includes(q) ||
          item.artist.lastName.toLowerCase().includes(q) ||
          item.artist.country.toLowerCase().includes(q)
      );
    }

    // Dimension Subfilter
    if (subFilterValue !== 'ALL') {
      if (activeDimension === 'COUNTRY') {
        list = list.filter(item => item.artist.country === subFilterValue);
      } else if (activeDimension === 'STATUS') {
        list = list.filter(item => (item.artist.artistStatus || 'Amatir') === subFilterValue);
      } else if (activeDimension === 'BODY_TYPE') {
        list = list.filter(item => item.artist.typeCode === subFilterValue);
      } else if (activeDimension === 'BODY_SHAPES') {
        list = list.filter(item => item.artist.appeal?.bodyShape === subFilterValue);
      } else if (activeDimension === 'MATURITY') {
        list = list.filter(item => item.artist.appeal?.maturity === subFilterValue);
      } else if (activeDimension === 'CUP_SIZE') {
        list = list.filter(item => item.artist.measurements?.cupSize === subFilterValue);
      } else if (activeDimension === 'BUST_SIZE') {
        if (subFilterValue === '<85') list = list.filter(i => (i.artist.measurements?.bustCm || 0) < 85);
        if (subFilterValue === '85-90')
          list = list.filter(
            i => (i.artist.measurements?.bustCm || 0) >= 85 && (i.artist.measurements?.bustCm || 0) <= 90
          );
        if (subFilterValue === '>90') list = list.filter(i => (i.artist.measurements?.bustCm || 0) > 90);
      } else if (activeDimension === 'WAIST_SIZE') {
        if (subFilterValue === '<58') list = list.filter(i => (i.artist.measurements?.waistCm || 0) < 58);
        if (subFilterValue === '58-62')
          list = list.filter(
            i => (i.artist.measurements?.waistCm || 0) >= 58 && (i.artist.measurements?.waistCm || 0) <= 62
          );
        if (subFilterValue === '>62') list = list.filter(i => (i.artist.measurements?.waistCm || 0) > 62);
      } else if (activeDimension === 'HIP_SIZE') {
        if (subFilterValue === '<86') list = list.filter(i => (i.artist.measurements?.hipCm || 0) < 86);
        if (subFilterValue === '86-90')
          list = list.filter(
            i => (i.artist.measurements?.hipCm || 0) >= 86 && (i.artist.measurements?.hipCm || 0) <= 90
          );
        if (subFilterValue === '>90') list = list.filter(i => (i.artist.measurements?.hipCm || 0) > 90);
      } else if (activeDimension === 'AGE') {
        if (subFilterValue === '<22') list = list.filter(i => (i.age || 0) < 22);
        if (subFilterValue === '22-27')
          list = list.filter(i => (i.age || 0) >= 22 && (i.age || 0) <= 27);
        if (subFilterValue === '28-35')
          list = list.filter(i => (i.age || 0) >= 28 && (i.age || 0) <= 35);
        if (subFilterValue === '>35') list = list.filter(i => (i.age || 0) > 35);
      } else if (activeDimension === 'HEIGHT') {
        if (subFilterValue === '<158') list = list.filter(i => (i.artist.heightCm || 0) < 158);
        if (subFilterValue === '158-165')
          list = list.filter(
            i => (i.artist.heightCm || 0) >= 158 && (i.artist.heightCm || 0) <= 165
          );
        if (subFilterValue === '>165') list = list.filter(i => (i.artist.heightCm || 0) > 165);
      } else if (activeDimension === 'ATTRIBUTES') {
        list = list.filter(item => item.artist.attributes?.includes(subFilterValue));
      } else if (activeDimension === 'APPEAL') {
        list = list.filter(item => {
          if (!item.artist.appeal) return false;
          return Object.values(item.artist.appeal).some(v => v === subFilterValue);
        });
      } else if (activeDimension === 'SPECIALTY') {
        list = list.filter(item => item.artist.specialty?.includes(subFilterValue));
      }
    }

    // Sort by Category
    list.sort((a, b) => {
      if (sortCategory === 'appearance') return b.app - a.app;
      if (sortCategory === 'impression') return b.imp - a.imp;
      if (sortCategory === 'proportional') return b.prop - a.prop;
      return b.overall - a.overall;
    });

    return list;
  }, [processedArtists, searchQuery, activeDimension, subFilterValue, sortCategory]);

  const rank1 = filtered[0];
  const rank2 = filtered[1];
  const rank3 = filtered[2];

  const getScoreValue = (item: (typeof processedArtists)[0]) => {
    if (sortCategory === 'appearance') return item.app.toFixed(1);
    if (sortCategory === 'impression') return item.imp.toFixed(1);
    if (sortCategory === 'proportional') return `${item.prop} pts`;
    return Math.round(item.overall).toString();
  };

  const getDimensionStatusText = useCallback(
    (item: (typeof processedArtists)[0]) => {
      const artist = item.artist;
      switch (activeDimension) {
        case 'COUNTRY':
          return artist.country || '-';
        case 'BODY_TYPE': {
          const typeObj = getTypeInfo(artist.typeCode);
          return `${artist.typeCode} - ${typeObj.indonesia}`;
        }
        case 'BODY_SHAPES':
          return artist.appeal?.bodyShape || '-';
        case 'CUP_SIZE':
          return artist.measurements?.cupSize ? `Cup ${artist.measurements.cupSize}` : '-';
        case 'BUST_SIZE':
          return artist.measurements?.bustCm ? `Bust ${artist.measurements.bustCm} cm` : '-';
        case 'WAIST_SIZE':
          return artist.measurements?.waistCm ? `Waist ${artist.measurements.waistCm} cm` : '-';
        case 'HIP_SIZE':
          return artist.measurements?.hipCm ? `Hip ${artist.measurements.hipCm} cm` : '-';
        case 'AGE': {
          const ageVal = item.age || calculateAge(artist.bornDate);
          return ageVal ? `${ageVal} th` : '-';
        }
        case 'HEIGHT':
          return artist.heightCm ? `${artist.heightCm} cm` : '-';
        case 'ATTRIBUTES': {
          if (subFilterValue !== 'ALL' && artist.attributes?.includes(subFilterValue)) {
            return subFilterValue;
          }
          return artist.attributes && artist.attributes.length > 0
            ? artist.attributes.slice(0, 2).join(', ')
            : '-';
        }
        case 'APPEAL': {
          if (subFilterValue !== 'ALL') {
            return subFilterValue;
          }
          return (
            artist.appeal?.vibe ||
            artist.appeal?.style ||
            artist.appeal?.maturity ||
            artist.appeal?.bodyShape ||
            '-'
          );
        }
        case 'SPECIALTY': {
          if (subFilterValue !== 'ALL' && artist.specialty?.includes(subFilterValue)) {
            return subFilterValue;
          }
          return artist.specialty && artist.specialty.length > 0
            ? artist.specialty.slice(0, 2).join(', ')
            : '-';
        }
        case 'MATURITY':
          return artist.appeal?.maturity || '-';
        case 'STATUS':
          return artist.artistStatus || 'Amatir';
        case 'ALL':
        default: {
          const typeObj = getTypeInfo(artist.typeCode);
          return `${artist.typeCode} - ${typeObj.indonesia}`;
        }
      }
    },
    [activeDimension, subFilterValue, schema]
  );

  return (
    <div className="w-full max-w-5xl mx-auto pb-28 space-y-6 animate-in fade-in duration-300 relative">
      {/* Decorative Grid Texture */}
      {decorations?.showGridBackground && <HUDGridTexture opacity={0.05} />}

      {/* Main Sort Category Tab Bar */}
      <div
        className={`p-1.5 ${radius} border ${elevation}`}
        style={{
          backgroundColor: 'var(--color-surface, var(--app-surface, #1C1917))',
          borderColor: 'var(--color-border, var(--app-border, #44403C))',
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          <button
            onClick={() => setSortCategory('overall')}
            style={sortCategory === 'overall' ? { backgroundColor: 'var(--color-primary, #FE9900)', color: 'var(--color-text-on-primary, #0C0A09)' } : undefined}
            className={`py-2 px-3 ${innerRadius} font-bold whitespace-nowrap transition-all uppercase flex items-center justify-center gap-1.5 ${
              sortCategory === 'overall'
                ? 'shadow-md font-black'
                : 'hover:opacity-80'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{t.rankOverall}</span>
          </button>
          <button
            onClick={() => setSortCategory('appearance')}
            style={sortCategory === 'appearance' ? { backgroundColor: 'var(--color-primary, #00BCD5)', color: 'var(--color-text-on-primary, #0C0A09)' } : undefined}
            className={`py-2 px-3 ${innerRadius} font-bold whitespace-nowrap transition-all uppercase flex items-center justify-center gap-1.5 ${
              sortCategory === 'appearance'
                ? 'shadow-md font-black'
                : 'hover:opacity-80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{schema?.sectionTitles?.appearance || t.rankAppearance}</span>
          </button>
          <button
            onClick={() => setSortCategory('impression')}
            style={sortCategory === 'impression' ? { backgroundColor: 'var(--color-accent, #EC4899)', color: 'var(--color-text-on-primary, #0C0A09)' } : undefined}
            className={`py-2 px-3 ${innerRadius} font-bold whitespace-nowrap transition-all uppercase flex items-center justify-center gap-1.5 ${
              sortCategory === 'impression'
                ? 'shadow-md font-black'
                : 'hover:opacity-80'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{schema?.sectionTitles?.impression || t.rankImpression}</span>
          </button>
          <button
            onClick={() => setSortCategory('proportional')}
            style={sortCategory === 'proportional' ? { backgroundColor: 'var(--color-secondary, #A855F7)', color: 'var(--color-text-on-secondary, #0C0A09)' } : undefined}
            className={`py-2 px-3 ${innerRadius} font-bold whitespace-nowrap transition-all uppercase flex items-center justify-center gap-1.5 ${
              sortCategory === 'proportional'
                ? 'shadow-md font-black'
                : 'hover:opacity-80'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{t.rankProportional}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-3.5 ${radius} border space-y-3 ${elevation}`}
        style={{
          backgroundColor: 'var(--color-surface, var(--app-surface, #1C1917))',
          borderColor: 'var(--color-border, var(--app-border, #44403C))',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 opacity-60" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full border ${innerRadius} pl-9 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors`}
              style={{
                backgroundColor: 'var(--color-bg-app, var(--app-bg, #0C0A09))',
                borderColor: 'var(--color-border, var(--app-border, #44403C))',
                color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 opacity-60 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 1-Row Slider for Filter Dimensions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          {filterDimensions.map(dim => (
            <button
              key={dim.id}
              onClick={() => {
                setActiveDimension(dim.id);
                setSubFilterValue('ALL');
              }}
              style={
                activeDimension === dim.id
                  ? {
                      backgroundColor: 'var(--color-primary, #FE9900)',
                      color: 'var(--color-text-on-primary, #0C0A09)',
                      borderColor: 'var(--color-primary, #FE9900)',
                    }
                  : {
                      backgroundColor: 'var(--color-surface-sub, var(--app-surface, #292524))',
                      borderColor: 'var(--color-border, var(--app-border, #44403C))',
                      color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
                    }
              }
              className={`px-3 py-1.5 ${innerRadius} text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                activeDimension === dim.id ? 'shadow-md font-extrabold' : 'hover:opacity-80'
              }`}
            >
              {dim.label}
            </button>
          ))}
        </div>

        {/* Sub-Filter Slider */}
        {subFilterOptions.length > 0 && (
          <div
            className="pt-1 border-t flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            style={{ borderColor: 'var(--color-border, var(--app-border, #44403C))' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 opacity-70">
              {t.filterBy} {activeDimension.replace('_', ' ')}:
            </span>
            <button
              onClick={() => setSubFilterValue('ALL')}
              style={
                subFilterValue === 'ALL'
                  ? {
                      backgroundColor: 'var(--color-accent, #F59E0B)',
                      color: 'var(--color-text-on-primary, #0C0A09)',
                    }
                  : {
                      backgroundColor: 'var(--color-surface-sub, var(--app-surface, #292524))',
                      color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
                    }
              }
              className={`px-2.5 py-1 ${innerRadius} text-xs font-semibold whitespace-nowrap transition-all shrink-0 hover:opacity-80`}
            >
              {t.all}
            </button>
            {subFilterOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSubFilterValue(opt.value)}
                style={
                  subFilterValue === opt.value
                    ? {
                        backgroundColor: 'var(--color-accent, #F59E0B)',
                        color: 'var(--color-text-on-primary, #0C0A09)',
                      }
                    : {
                        backgroundColor: 'var(--color-surface-sub, var(--app-surface, #292524))',
                        color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
                      }
                }
                className={`px-2.5 py-1 ${innerRadius} text-xs font-semibold whitespace-nowrap transition-all shrink-0 hover:opacity-80`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TOP PODIUM COMPONENT (Dynamic Composition) */}
      {filtered.length > 0 && (
        <div className={`sticky top-16 z-30 backdrop-blur-md pt-1 pb-3 -mx-2 px-2 ${radius} border-b shadow-md transition-colors duration-200 relative ${
          isDark ? 'bg-stone-950/95 border-stone-800/60' : 'bg-stone-100/95 border-stone-300'
        }`}>
          {decorations?.showCornerBrackets && <HUDCornerBrackets color={primaryColor} size={10} />}

          <div className="flex items-center justify-between px-1 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>{getPodiumTitle()}</span>
            </div>
            <span className={`text-[11px] font-mono ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Rankings Leaderboard
            </span>
          </div>

          {(rankingLayout === 'winner_hero' || rankingLayout === 'winner_spotlight') && rank1 ? (
            /* Winner Hero Spotlight */
            <div
              id={`ranking-artist-${rank1.artist.id}`}
              onClick={() => onSelectArtist(rank1.artist)}
              className={`p-4 sm:p-5 ${radius} border-2 border-amber-500 shadow-2xl cursor-pointer hover:scale-101 transition-all flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 relative overflow-hidden`}
            >
              <div className="w-20 sm:w-28 aspect-3/4 rounded-xl overflow-hidden border-2 border-amber-500 shrink-0 shadow-lg">
                <img
                  src={rank1.artist.avatarUrl}
                  alt={rank1.artist.firstName}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-bold uppercase">
                  <Crown className="w-4 h-4 fill-current" />
                  <span>#1 GRAND CHAMPION</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white truncate mt-1">
                  {rank1.artist.firstName} {rank1.artist.lastName}
                </h3>
                <p className="text-xs text-stone-400">{getCountryFlag(rank1.artist.countryCode, rank1.artist.country)} {rank1.artist.country}</p>
              </div>
              <div className="text-center sm:text-right px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40">
                <span className="text-[10px] text-amber-300 uppercase font-mono block">Score</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{getScoreValue(rank1)}</span>
              </div>
            </div>
          ) : (
            /* Standard 3-Column Podium */
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
              {/* Rank 1 (Gold) */}
              {rank1 && (
                <div
                  id={`ranking-artist-${rank1.artist.id}`}
                  onClick={() => onSelectArtist(rank1.artist)}
                  className={`p-3 sm:p-4 ${innerRadius} border-2 border-amber-500 shadow-xl cursor-pointer hover:scale-[1.02] transition-all flex flex-col items-center text-center relative group ${
                    isDark
                      ? 'bg-gradient-to-b from-amber-950/60 via-stone-900 to-stone-900'
                      : 'bg-gradient-to-b from-amber-50 to-white'
                  }`}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center shadow-md">
                    1
                  </div>
                  <div className="absolute top-2 right-2 text-amber-500">
                    <Crown className="w-4 h-4 fill-current" />
                  </div>

                  <div className="w-14 h-18 sm:w-20 sm:h-26 rounded-lg overflow-hidden my-1 sm:my-2 border-2 border-amber-500 shadow-md">
                    <img
                      src={rank1.artist.avatarUrl}
                      alt={rank1.artist.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className={`font-black text-xs sm:text-sm truncate max-w-full px-1 ${isDark ? 'text-white' : 'text-stone-950'}`}>
                    {rank1.artist.firstName} {rank1.artist.lastName}
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
                    {getCountryFlag(rank1.artist.countryCode, rank1.artist.country)} {rank1.artist.country}
                  </div>
                  <div className="mt-1.5 py-0.5 sm:py-1 px-2 rounded-md bg-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-xs">
                    {getScoreValue(rank1)}
                  </div>
                </div>
              )}

              {/* Rank 2 (Silver) */}
              {rank2 && (
                <div
                  id={`ranking-artist-${rank2.artist.id}`}
                  onClick={() => onSelectArtist(rank2.artist)}
                  className={`p-3 sm:p-4 ${innerRadius} border-2 border-slate-400 shadow-lg cursor-pointer hover:scale-[1.02] transition-all flex flex-col items-center text-center relative group ${
                    isDark
                      ? 'bg-gradient-to-b from-stone-800/70 via-stone-900 to-stone-900'
                      : 'bg-gradient-to-b from-slate-100 to-white'
                  }`}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-slate-300 text-stone-900 font-black text-xs flex items-center justify-center shadow-md">
                    2
                  </div>

                  <div className="w-14 h-18 sm:w-20 sm:h-26 rounded-lg overflow-hidden my-1 sm:my-2 border-2 border-slate-400 shadow-md">
                    <img
                      src={rank2.artist.avatarUrl}
                      alt={rank2.artist.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className={`font-bold text-xs sm:text-sm truncate max-w-full px-1 ${isDark ? 'text-white' : 'text-stone-950'}`}>
                    {rank2.artist.firstName} {rank2.artist.lastName}
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {getCountryFlag(rank2.artist.countryCode, rank2.artist.country)} {rank2.artist.country}
                  </div>
                  <div className="mt-1.5 py-0.5 sm:py-1 px-2 rounded-md bg-slate-300 text-stone-900 font-black text-xs sm:text-sm shadow-xs">
                    {getScoreValue(rank2)}
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {rank3 && (
                <div
                  id={`ranking-artist-${rank3.artist.id}`}
                  onClick={() => onSelectArtist(rank3.artist)}
                  className={`p-3 sm:p-4 ${innerRadius} border-2 border-amber-700/80 shadow-lg cursor-pointer hover:scale-[1.02] transition-all flex flex-col items-center text-center relative group ${
                    isDark
                      ? 'bg-gradient-to-b from-amber-950/40 via-stone-900 to-stone-900'
                      : 'bg-gradient-to-b from-amber-50 to-white'
                  }`}
                >
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center shadow-md">
                    3
                  </div>

                  <div className="w-14 h-18 sm:w-20 sm:h-26 rounded-lg overflow-hidden my-1 sm:my-2 border-2 border-amber-700/80 shadow-md">
                    <img
                      src={rank3.artist.avatarUrl}
                      alt={rank3.artist.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className={`font-bold text-xs sm:text-sm truncate max-w-full px-1 ${isDark ? 'text-white' : 'text-stone-950'}`}>
                    {rank3.artist.firstName} {rank3.artist.lastName}
                  </div>
                  <div className={`text-[10px] truncate ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                    {getCountryFlag(rank3.artist.countryCode, rank3.artist.country)} {rank3.artist.country}
                  </div>
                  <div className="mt-1.5 py-0.5 sm:py-1 px-2 rounded-md bg-amber-700 text-amber-100 font-black text-xs sm:text-sm shadow-xs">
                    {getScoreValue(rank3)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* LEADERBOARD LIST / TABLE (Dynamic Composition) */}
      <div className="space-y-2">
        {filtered.map((item, index) => {
          const rankNumber = index + 1;
          const isTop3 = rankNumber <= 3;
          const score = getScoreValue(item);
          const typeObj = getTypeInfo(item.artist.typeCode);

          return (
            <div
              key={item.artist.id}
              id={`ranking-artist-${item.artist.id}`}
              onClick={() => onSelectArtist(item.artist)}
              className={`virtual-row-item p-3 sm:p-4 ${radius} border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group hover:scale-[1.005]`}
              style={{
                backgroundColor: isTop3
                  ? 'var(--color-surface, var(--app-surface, #1C1917))'
                  : 'var(--color-surface-sub, var(--app-surface, #292524))',
                borderColor: isTop3
                  ? 'var(--color-primary, #FE9900)'
                  : 'var(--color-border, var(--app-border, #44403C))',
                color: 'var(--color-text-main, var(--app-text, #FAFAF9))',
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Number */}
                <div
                  className={`w-8 h-8 ${innerRadius} font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-xs`}
                  style={
                    rankNumber === 1
                      ? { backgroundColor: 'var(--color-primary, #FE9900)', color: 'var(--color-text-on-primary, #0C0A09)' }
                      : rankNumber === 2
                      ? { backgroundColor: 'var(--color-secondary, #94A3B8)', color: 'var(--color-text-on-secondary, #0C0A09)' }
                      : rankNumber === 3
                      ? { backgroundColor: 'var(--color-accent, #B45309)', color: '#FFFFFF' }
                      : {
                          backgroundColor: 'var(--color-bg-app, var(--app-bg, #0C0A09))',
                          color: 'var(--color-text-muted, #78716C)',
                          border: '1px solid var(--color-border, #44403C)',
                        }
                  }
                >
                  {rankNumber}
                </div>

                {/* Avatar thumbnail */}
                <div
                  className={`w-10 h-14 ${innerRadius} overflow-hidden border shrink-0`}
                  style={{ borderColor: 'var(--color-border, var(--app-border, #44403C))' }}
                >
                  <img
                    src={item.artist.avatarUrl}
                    alt={item.artist.firstName}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <h4
                    className="font-black text-xs sm:text-sm tracking-wide truncate transition-colors uppercase"
                    style={{ color: 'var(--color-text-main, #FAFAF9)' }}
                  >
                    {item.artist.firstName} {item.artist.lastName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] opacity-70 truncate mt-0.5">
                    <span>{getCountryFlag(item.artist.countryCode, item.artist.country)}</span>
                    <span className="truncate">{item.artist.country}</span>
                    <span>•</span>
                    <span className="font-mono truncate">{getDimensionStatusText(item)}</span>
                  </div>
                </div>
              </div>

              {/* Score and action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div
                    className="text-base sm:text-lg font-black font-mono"
                    style={{ color: 'var(--color-primary, #FE9900)' }}
                  >
                    {score}
                  </div>
                  <div className="text-[9px] font-mono opacity-70 uppercase">
                    {sortCategory}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
