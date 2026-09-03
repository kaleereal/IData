import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  BarChart3,
  HelpCircle,
  Trophy,
  Gauge,
  ChevronDown,
  ChevronUp,
  Cpu,
  Flame,
  Star,
  Activity,
  Zap,
} from 'lucide-react';
import {
  Artist,
  SpekLayoutConfig,
  ScoreLayoutConfig,
  AppearanceScores,
  ImpressionScores,
  DatabaseSchema,
  RankingFilterDimension,
} from '../../types';
import {
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
} from '../../utils/calculations';
import { getUIText } from '../../utils/dynamicLocalization';

// Spacing resolver from scale 1-5
export const getSpacingClass = (spacingLevel: number = 3) => {
  switch (spacingLevel) {
    case 1:
      return { gap: 'gap-1.5', spaceY: 'space-y-1.5', p: 'p-2.5', innerGap: 'gap-1' };
    case 2:
      return { gap: 'gap-2.5', spaceY: 'space-y-2', p: 'p-3', innerGap: 'gap-1.5' };
    case 3:
      return { gap: 'gap-3.5', spaceY: 'space-y-2.5', p: 'p-4', innerGap: 'gap-2' };
    case 4:
      return { gap: 'gap-4.5', spaceY: 'space-y-3.5', p: 'p-5', innerGap: 'gap-2.5' };
    case 5:
      return { gap: 'gap-6', spaceY: 'space-y-4', p: 'p-6', innerGap: 'gap-3' };
    default:
      return { gap: 'gap-3.5', spaceY: 'space-y-2.5', p: 'p-4', innerGap: 'gap-2' };
  }
};

// Background class resolver for Spek cards
export const getBackgroundClass = (bgType: SpekLayoutConfig['cardBackground'], isDark = true) => {
  switch (bgType) {
    case 'glass_transparent':
      return isDark
        ? 'bg-stone-900/40 backdrop-blur-md border border-stone-700/50 shadow-lg'
        : 'bg-white/60 backdrop-blur-md border border-stone-300/60 shadow-md';
    case 'solid_elevated':
      return isDark
        ? 'bg-stone-900 border border-stone-800 shadow-xl'
        : 'bg-white border border-stone-200 shadow-lg';
    case 'neon_bordered':
      return isDark
        ? 'bg-stone-950/90 border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
        : 'bg-cyan-50/50 border-2 border-cyan-400 shadow-md';
    case 'transparent':
      return 'bg-transparent border border-stone-800/40';
    case 'bordered':
      return isDark ? 'bg-stone-950/50 border border-stone-700' : 'bg-white border border-stone-300';
    case 'subtle_dark':
    default:
      return isDark
        ? 'bg-stone-900/70 border border-stone-800/80 shadow-sm'
        : 'bg-white border border-stone-200 shadow-xs';
  }
};

// Score Color Theme Resolver
export const getScoreColors = (config: ScoreLayoutConfig, isDark = true) => {
  // Check if custom colors are provided
  if (config.appearanceColor || config.impressionColor) {
    return {
      appearance: {
        name: 'Custom Fisik',
        hex: config.appearanceColor || '#06B6D4',
        accent: 'text-cyan-400',
        bg: 'bg-cyan-500/15',
        border: 'border-cyan-500/30',
        bar: 'from-cyan-500 to-blue-500',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
      },
      impression: {
        name: 'Custom Karisma',
        hex: config.impressionColor || '#EC4899',
        accent: 'text-pink-400',
        bg: 'bg-pink-500/15',
        border: 'border-pink-500/30',
        bar: 'from-pink-500 to-rose-500',
        glow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]',
      },
      overall: {
        hex: config.overallColor || '#F59E0B',
        accent: 'text-amber-400',
        bar: 'from-amber-400 to-orange-500',
      },
    };
  }

  switch (config.colorScheme) {
    case 'amber_gold':
      return {
        appearance: {
          name: 'Amber Gold',
          hex: '#F59E0B',
          accent: 'text-amber-400',
          bg: 'bg-amber-500/15',
          border: 'border-amber-500/30',
          bar: 'from-amber-500 to-yellow-400',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
        },
        impression: {
          name: 'Rose Gold',
          hex: '#F43F5E',
          accent: 'text-rose-400',
          bg: 'bg-rose-500/15',
          border: 'border-rose-500/30',
          bar: 'from-rose-500 to-pink-400',
          glow: 'shadow-[0_0_12px_rgba(244,63,94,0.3)]',
        },
        overall: {
          hex: '#F97316',
          accent: 'text-orange-400',
          bar: 'from-amber-400 to-orange-500',
        },
      };
    case 'emerald_teal':
      return {
        appearance: {
          name: 'Teal Cyan',
          hex: '#14B8A6',
          accent: 'text-teal-400',
          bg: 'bg-teal-500/15',
          border: 'border-teal-500/30',
          bar: 'from-teal-500 to-emerald-400',
          glow: 'shadow-[0_0_12px_rgba(20,184,166,0.3)]',
        },
        impression: {
          name: 'Emerald Mint',
          hex: '#10B981',
          accent: 'text-emerald-400',
          bg: 'bg-emerald-500/15',
          border: 'border-emerald-500/30',
          bar: 'from-emerald-500 to-green-400',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
        },
        overall: {
          hex: '#059669',
          accent: 'text-emerald-300',
          bar: 'from-teal-400 to-emerald-500',
        },
      };
    case 'violet_magenta':
      return {
        appearance: {
          name: 'Cyber Violet',
          hex: '#8B5CF6',
          accent: 'text-purple-400',
          bg: 'bg-purple-500/15',
          border: 'border-purple-500/30',
          bar: 'from-purple-500 to-indigo-500',
          glow: 'shadow-[0_0_12px_rgba(139,92,246,0.3)]',
        },
        impression: {
          name: 'Neon Magenta',
          hex: '#D946EF',
          accent: 'text-fuchsia-400',
          bg: 'bg-fuchsia-500/15',
          border: 'border-fuchsia-500/30',
          bar: 'from-fuchsia-500 to-pink-500',
          glow: 'shadow-[0_0_12px_rgba(217,70,239,0.3)]',
        },
        overall: {
          hex: '#A855F7',
          accent: 'text-purple-300',
          bar: 'from-purple-400 to-fuchsia-500',
        },
      };
    case 'monochrome_slate':
      return {
        appearance: {
          name: 'Slate Platinum',
          hex: '#94A3B8',
          accent: 'text-slate-300',
          bg: 'bg-slate-500/15',
          border: 'border-slate-500/30',
          bar: 'from-slate-400 to-stone-300',
          glow: 'shadow-[0_0_12px_rgba(148,163,184,0.2)]',
        },
        impression: {
          name: 'Cool Silver',
          hex: '#CBD5E1',
          accent: 'text-slate-200',
          bg: 'bg-slate-400/15',
          border: 'border-slate-400/30',
          bar: 'from-slate-300 to-stone-100',
          glow: 'shadow-[0_0_12px_rgba(203,213,225,0.2)]',
        },
        overall: {
          hex: '#E2E8F0',
          accent: 'text-white',
          bar: 'from-slate-300 to-white',
        },
      };
    case 'cyber_matrix':
      return {
        appearance: {
          name: 'Matrix Neon Blue',
          hex: '#00F0FF',
          accent: 'text-cyan-300',
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-400',
          bar: 'from-cyan-400 to-blue-500',
          glow: 'shadow-[0_0_15px_rgba(0,240,255,0.4)]',
        },
        impression: {
          name: 'Matrix Cyber Lime',
          hex: '#00FF66',
          accent: 'text-emerald-300',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-400',
          bar: 'from-emerald-400 to-green-500',
          glow: 'shadow-[0_0_15px_rgba(0,255,102,0.4)]',
        },
        overall: {
          hex: '#FFD000',
          accent: 'text-yellow-300',
          bar: 'from-cyan-400 to-yellow-400',
        },
      };
    case 'neon_cyan_pink':
    default:
      return {
        appearance: {
          name: 'Electric Cyan',
          hex: '#06B6D4',
          accent: 'text-cyan-400',
          bg: 'bg-cyan-500/15',
          border: 'border-cyan-500/30',
          bar: 'from-cyan-500 to-blue-500',
          glow: 'shadow-[0_0_12px_rgba(6,182,212,0.3)]',
        },
        impression: {
          name: 'Cyber Pink',
          hex: '#EC4899',
          accent: 'text-pink-400',
          bg: 'bg-pink-500/15',
          border: 'border-pink-500/30',
          bar: 'from-pink-500 to-rose-500',
          glow: 'shadow-[0_0_12px_rgba(236,72,153,0.3)]',
        },
        overall: {
          hex: '#F59E0B',
          accent: 'text-amber-400',
          bar: 'from-amber-400 to-orange-500',
        },
      };
  }
};

// =========================================================================
// 1. SPEK RENDERER COMPONENT
// =========================================================================
interface SpekRendererProps {
  artist: Artist;
  config: SpekLayoutConfig;
  isDark?: boolean;
  schema?: DatabaseSchema;
  onHelpClick?: (topic: string) => void;
  onShowHelp?: (field: string, name?: string) => void;
  onFilterByAttribute?: (category: string, value: string) => void;
  onNavigateToRanking?: (
    tab?: 'overall' | 'appearance' | 'impression' | 'proportional',
    dimension?: RankingFilterDimension,
    subFilter?: string,
    highlightArtistId?: string
  ) => void;
}

export const SpekRenderer: React.FC<SpekRendererProps> = ({
  artist,
  config,
  isDark = true,
  schema,
  onHelpClick,
  onShowHelp,
  onFilterByAttribute,
  onNavigateToRanking,
}) => {
  const [activeTab, setActiveTab] = useState<'attributes' | 'appeal' | 'specialty'>('attributes');
  const [accordionOpen, setAccordionOpen] = useState({
    attributes: true,
    appeal: true,
    specialty: true,
  });

  const spacing = getSpacingClass(config.spacing || 3);
  const cardBg = getBackgroundClass(config.cardBackground, isDark);

  const attributesColor = config.attributesColor || '#00E5FF';
  const appealColor = config.appealColor || '#F59E0B';
  const specialtyColor = config.specialtyColor || '#10B981';

  const handleHelp = (field: string, name?: string) => {
    if (onShowHelp) {
      onShowHelp(field, name);
    } else if (onHelpClick) {
      onHelpClick(field);
    }
  };

  // 1. Render single item based on Visual Style
  const renderItem = (label: string, value: string, category: 'attributes' | 'appeal' | 'specialty', itemKey?: string) => {
    const accentColor = category === 'attributes' ? attributesColor : category === 'appeal' ? appealColor : specialtyColor;
    const canFilter = Boolean(onNavigateToRanking || onFilterByAttribute);

    const handleClick = () => {
      if (onNavigateToRanking) {
        if (category === 'attributes') {
          onNavigateToRanking('overall', 'ATTRIBUTES', value);
        } else if (category === 'appeal') {
          onNavigateToRanking('overall', 'APPEAL', value);
        } else if (category === 'specialty') {
          onNavigateToRanking('overall', 'SPECIALTY', value);
        }
      } else if (onFilterByAttribute) {
        onFilterByAttribute(category, value);
      }
    };

    switch (config.visualStyle) {
      case 'pill_tags':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-3 py-1.5 rounded-full text-xs border transition-all duration-200 hover:scale-[1.01]"
            style={{
              borderColor: `${accentColor}40`,
              backgroundColor: `${accentColor}12`,
            }}
          >
            <span className="text-stone-400 text-[11px] font-medium">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-100 ml-2 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
              style={{ color: isDark ? '#FFF' : '#1C1917' }}
            >
              {value}
            </button>
          </div>
        );

      case 'glowing_chips':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs border shadow-sm transition-all"
            style={{
              borderColor: accentColor,
              boxShadow: `0 0 10px ${accentColor}25`,
              backgroundColor: isDark ? '#0C0A09' : '#FFFFFF',
            }}
          >
            <span className="text-[11px] uppercase tracking-wider font-bold" style={{ color: accentColor }}>
              {label}
            </span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-mono font-bold text-stone-100 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'compact_dots':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between py-1 border-b border-stone-800/40 text-xs"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
              <span className="text-stone-400 text-[11px]">{label}</span>
            </div>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-semibold text-stone-200 text-right ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'minimal_list':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between py-1.5 text-xs"
          >
            <span className="text-stone-400 text-[11px]">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-100 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'matrix_boxes':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="p-2 rounded-lg bg-stone-950/80 border border-stone-800 font-mono text-xs space-y-0.5"
          >
            <div className="text-[9px] uppercase tracking-wider" style={{ color: accentColor }}>
              {label}
            </div>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-200 truncate text-left w-full ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'glassmorphism':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-xs"
          >
            <span className="text-stone-400 text-[11px] font-medium">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-100 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'striped_accent':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-r-lg bg-stone-900/50 border-l-2 text-xs"
            style={{ borderLeftColor: accentColor }}
          >
            <span className="text-stone-400 text-[11px]">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-200 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'gradient_outline':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs bg-stone-950/80 border"
            style={{
              borderColor: `${accentColor}60`,
              boxShadow: `0 0 8px ${accentColor}18`,
            }}
          >
            <span className="text-[11px] text-stone-400">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-100 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );

      case 'terminal_cli':
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-baseline justify-between font-mono text-[11px] py-1 border-b border-stone-800/60"
          >
            <span className="text-stone-500">
              <span className="text-emerald-400 mr-1">&gt;</span>
              {label.toLowerCase().replace(/\s+/g, '_')}:
            </span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`text-emerald-300 font-bold ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              &quot;{value}&quot;
            </button>
          </div>
        );

      case 'bordered_cards':
      default:
        return (
          <div
            key={itemKey || `${category}-${label}-${value}`}
            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-stone-950/40 border border-stone-800/60 text-xs"
          >
            <span className="text-stone-400 text-[11px]">{label}</span>
            <button
              type="button"
              onClick={handleClick}
              disabled={!canFilter}
              className={`font-bold text-stone-100 ${canFilter ? 'hover:underline cursor-pointer' : ''}`}
            >
              {value}
            </button>
          </div>
        );
    }
  };

  // Card 1: Attributes
  const renderAttributesCard = (className = '') => (
    <div className={`rounded-2xl ${cardBg} ${spacing.p} flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        {config.showCategoryHeaders && (
          <div className="flex items-center justify-between border-b border-stone-800/50 pb-2">
            <div className="flex items-center gap-2">
              {config.showIcons && (
                <div
                  className="p-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: `${attributesColor}20`, color: attributesColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <h4 className="text-xs font-black tracking-wide text-stone-100 uppercase">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionAttributes || 'Ciri Khusus'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionAttributesSub || 'Attributes Visual'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {config.showCountBadges && (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${attributesColor}15`,
                    color: attributesColor,
                    borderColor: `${attributesColor}30`,
                  }}
                >
                  {artist.attributes?.length || 0}
                </span>
              )}
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp('attributes')}
                  className="p-1 rounded-md text-stone-400 hover:text-cyan-400 hover:bg-stone-800 transition-colors"
                  title="Informasi Ciri Khusus"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={spacing.innerGap === 'gap-1' ? 'grid grid-cols-1 gap-1' : `grid grid-cols-1 ${spacing.innerGap}`}>
          {artist.attributes && artist.attributes.length > 0 ? (
            artist.attributes.map((attr, idx) => (
              <React.Fragment key={`attr-${idx}-${attr}`}>{renderItem(`Atribut ${idx + 1}`, attr, 'attributes', `attr-${idx}-${attr}`)}</React.Fragment>
            ))
          ) : (
            <div className="p-2 text-center text-xs text-stone-500 italic">Tidak ada atribut</div>
          )}
        </div>
      </div>
    </div>
  );

  // Card 2: Appeal
  const renderAppealCard = (className = '') => (
    <div className={`rounded-2xl ${cardBg} ${spacing.p} flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        {config.showCategoryHeaders && (
          <div className="flex items-center justify-between border-b border-stone-800/50 pb-2">
            <div className="flex items-center gap-2">
              {config.showIcons && (
                <div
                  className="p-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: `${appealColor}20`, color: appealColor }}
                >
                  <Flame className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <h4 className="text-xs font-black tracking-wide text-stone-100 uppercase">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionAppeal || 'Daya Tarik'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionAppealSub || 'Appeal & Pesona'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {config.showCountBadges && (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${appealColor}15`,
                    color: appealColor,
                    borderColor: `${appealColor}30`,
                  }}
                >
                  4
                </span>
              )}
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp('maturity')}
                  className="p-1 rounded-md text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors"
                  title="Informasi Daya Tarik"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={spacing.innerGap === 'gap-1' ? 'grid grid-cols-1 gap-1' : `grid grid-cols-1 ${spacing.innerGap}`}>
          {renderItem(schema?.appealCategories?.maturity?.title || 'Maturity', artist.appeal?.maturity || 'Youthful', 'appeal', 'appeal-maturity')}
          {renderItem(schema?.appealCategories?.vibe?.title || 'Vibe', artist.appeal?.vibe || 'Charismatic', 'appeal', 'appeal-vibe')}
          {renderItem(schema?.appealCategories?.style?.title || 'Style', artist.appeal?.style || 'Street Chic', 'appeal', 'appeal-style')}
          {renderItem(schema?.appealCategories?.bodyShape?.title || 'Bentuk Tubuh', artist.appeal?.bodyShape || 'Slim & Fit', 'appeal', 'appeal-bodyShape')}
        </div>
      </div>
    </div>
  );

  // Card 3: Specialty
  const renderSpecialtyCard = (className = '') => (
    <div className={`rounded-2xl ${cardBg} ${spacing.p} flex flex-col justify-between ${className}`}>
      <div className="space-y-3">
        {config.showCategoryHeaders && (
          <div className="flex items-center justify-between border-b border-stone-800/50 pb-2">
            <div className="flex items-center gap-2">
              {config.showIcons && (
                <div
                  className="p-1.5 rounded-lg text-xs"
                  style={{ backgroundColor: `${specialtyColor}20`, color: specialtyColor }}
                >
                  <Star className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <h4 className="text-xs font-black tracking-wide text-stone-100 uppercase">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionSpecialty || 'Keahlian'}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {schema?.pageTexts?.artistDetail?.labels?.sectionSpecialtySub || 'Specialty & Bakat'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {config.showCountBadges && (
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${specialtyColor}15`,
                    color: specialtyColor,
                    borderColor: `${specialtyColor}30`,
                  }}
                >
                  {artist.specialty?.length || 0}
                </span>
              )}
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp('specialty')}
                  className="p-1 rounded-md text-stone-400 hover:text-emerald-400 hover:bg-stone-800 transition-colors"
                  title="Informasi Keahlian"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={spacing.innerGap === 'gap-1' ? 'grid grid-cols-1 gap-1' : `grid grid-cols-1 ${spacing.innerGap}`}>
          {artist.specialty && artist.specialty.length > 0 ? (
            artist.specialty.map((spec, idx) => (
              <React.Fragment key={`spec-${idx}-${spec}`}>{renderItem(`Keahlian ${idx + 1}`, spec, 'specialty', `spec-${idx}-${spec}`)}</React.Fragment>
            ))
          ) : (
            <div className="p-2 text-center text-xs text-stone-500 italic">Tidak ada keahlian</div>
          )}
        </div>
      </div>
    </div>
  );

  // Layout switcher
  switch (config.layout) {
    case 'two_columns':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing.gap}`}>
          {renderAttributesCard()}
          {renderAppealCard()}
          <div className="md:col-span-2">{renderSpecialtyCard()}</div>
        </div>
      );

    case 'single_column':
      return (
        <div className={`flex flex-col ${spacing.gap}`}>
          {renderAttributesCard()}
          {renderAppealCard()}
          {renderSpecialtyCard()}
        </div>
      );

    case 'bento_grid':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-12 ${spacing.gap}`}>
          <div className="md:col-span-5">{renderAttributesCard('h-full')}</div>
          <div className="md:col-span-7">{renderAppealCard('h-full')}</div>
          <div className="md:col-span-12">{renderSpecialtyCard()}</div>
        </div>
      );

    case 'horizontal_cards':
      return (
        <div className={`flex ${spacing.gap} overflow-x-auto pb-2 snap-x no-scrollbar`}>
          <div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">{renderAttributesCard()}</div>
          <div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">{renderAppealCard()}</div>
          <div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">{renderSpecialtyCard()}</div>
        </div>
      );

    case 'tabbed_categories':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900/80 border border-stone-800 max-w-md">
            {[
              { id: 'attributes' as const, label: 'Ciri Khusus', color: attributesColor, icon: Sparkles },
              { id: 'appeal' as const, label: 'Daya Tarik', color: appealColor, icon: Flame },
              { id: 'specialty' as const, label: 'Keahlian', color: specialtyColor, icon: Star },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    active ? 'bg-stone-800 text-white shadow-xs border border-stone-700' : 'text-stone-400 hover:text-stone-200'
                  }`}
                  style={{ color: active ? tab.color : undefined }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            {activeTab === 'attributes' && renderAttributesCard()}
            {activeTab === 'appeal' && renderAppealCard()}
            {activeTab === 'specialty' && renderSpecialtyCard()}
          </div>
        </div>
      );

    case 'accordion_drawer':
      return (
        <div className={`flex flex-col ${spacing.gap}`}>
          {/* Attributes Drawer */}
          <div className={`rounded-2xl ${cardBg} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setAccordionOpen((prev) => ({ ...prev, attributes: !prev.attributes }))}
              className="w-full flex items-center justify-between p-3.5 hover:bg-stone-800/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: attributesColor }} />
                <span className="text-xs font-bold text-stone-200">CIRI KHUSUS (ATTRIBUTES)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                  {artist.attributes?.length || 0}
                </span>
                {accordionOpen.attributes ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </div>
            </button>
            {accordionOpen.attributes && <div className="p-3.5 pt-0 border-t border-stone-800/40">{renderAttributesCard('border-0 bg-transparent p-0')}</div>}
          </div>

          {/* Appeal Drawer */}
          <div className={`rounded-2xl ${cardBg} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setAccordionOpen((prev) => ({ ...prev, appeal: !prev.appeal }))}
              className="w-full flex items-center justify-between p-3.5 hover:bg-stone-800/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4" style={{ color: appealColor }} />
                <span className="text-xs font-bold text-stone-200">DAYA TARIK (APPEAL)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">4</span>
                {accordionOpen.appeal ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </div>
            </button>
            {accordionOpen.appeal && <div className="p-3.5 pt-0 border-t border-stone-800/40">{renderAppealCard('border-0 bg-transparent p-0')}</div>}
          </div>

          {/* Specialty Drawer */}
          <div className={`rounded-2xl ${cardBg} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setAccordionOpen((prev) => ({ ...prev, specialty: !prev.specialty }))}
              className="w-full flex items-center justify-between p-3.5 hover:bg-stone-800/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" style={{ color: specialtyColor }} />
                <span className="text-xs font-bold text-stone-200">KEAHLIAN (SPECIALTY)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                  {artist.specialty?.length || 0}
                </span>
                {accordionOpen.specialty ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
              </div>
            </button>
            {accordionOpen.specialty && <div className="p-3.5 pt-0 border-t border-stone-800/40">{renderSpecialtyCard('border-0 bg-transparent p-0')}</div>}
          </div>
        </div>
      );

    case 'matrix_hud':
      return (
        <div className="p-4 rounded-2xl bg-stone-950 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-black">
              <Cpu className="w-4 h-4 animate-pulse" />
              <span>SYS_TELEMETRY // SPEK_MATRIX</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800">
              STATUS: SYNCED
            </span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 ${spacing.gap}`}>
            {renderAttributesCard('bg-cyan-950/20 border-cyan-500/30')}
            {renderAppealCard('bg-cyan-950/20 border-cyan-500/30')}
            {renderSpecialtyCard('bg-cyan-950/20 border-cyan-500/30')}
          </div>
        </div>
      );

    case 'tag_cloud':
      return (
        <div className={`p-4 rounded-2xl ${cardBg} space-y-4`}>
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-black text-stone-200">FLUID PROFILE TAGS & ATTRIBUTES</span>
            <span className="text-[10px] font-mono text-stone-400">UNIFIED TAG CLOUD</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {artist.attributes?.map((attr, idx) => (
              <span
                key={`attr-${idx}`}
                className="px-3 py-1.5 rounded-full text-xs font-bold border transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${attributesColor}15`,
                  borderColor: `${attributesColor}40`,
                  color: attributesColor,
                }}
              >
                ✨ {attr}
              </span>
            ))}
            {artist.appeal && (
              <>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${appealColor}15`,
                    borderColor: `${appealColor}40`,
                    color: appealColor,
                  }}
                >
                  🔥 {artist.appeal.maturity} • {artist.appeal.vibe}
                </span>
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: `${appealColor}15`,
                    borderColor: `${appealColor}40`,
                    color: appealColor,
                  }}
                >
                  💎 {artist.appeal.style} ({artist.appeal.bodyShape})
                </span>
              </>
            )}
            {artist.specialty?.map((spec, idx) => (
              <span
                key={`spec-${idx}`}
                className="px-3 py-1.5 rounded-full text-xs font-bold border"
                style={{
                  backgroundColor: `${specialtyColor}15`,
                  borderColor: `${specialtyColor}40`,
                  color: specialtyColor,
                }}
              >
                ⭐ {spec}
              </span>
            ))}
          </div>
        </div>
      );

    case 'three_columns':
    default:
      return (
        <div className={`grid grid-cols-1 md:grid-cols-3 ${spacing.gap}`}>
          {renderAttributesCard()}
          {renderAppealCard()}
          {renderSpecialtyCard()}
        </div>
      );
  }
};

// =========================================================================
// 2. SCORE RENDERER COMPONENT
// =========================================================================
interface ScoreRendererProps {
  artist: Artist;
  config: ScoreLayoutConfig;
  isDark?: boolean;
  schema?: DatabaseSchema;
  onHelpClick?: (topic: string) => void;
  onShowHelp?: (field: string) => void;
  onNavigateToRanking?: (type: 'appearance' | 'impression') => void;
}

export const ScoreRenderer: React.FC<ScoreRendererProps> = ({
  artist,
  config,
  isDark = true,
  schema,
  onHelpClick,
  onShowHelp,
  onNavigateToRanking,
}) => {
  const [activeScoreTab, setActiveScoreTab] = useState<'appearance' | 'impression'>('appearance');

  const defaultAppScores: AppearanceScores = { face: 92, skin: 90, breast: 88, butt: 86, v: 91, thighCalve: 89 };
  const defaultImpScores: ImpressionScores = { voice: 93, expression: 95, sexAppeal: 91, authenticity: 90, chemistry: 88, aura: 94 };

  const appScores = artist.appearanceScores || defaultAppScores;
  const impScores = artist.impressionScores || defaultImpScores;

  const calcAppScore = calculateAppearanceScore(appScores);
  const calcImpScore = calculateImpressionScore(impScores);
  const calcOverallScore = calculateOverallRating(calcAppScore, calcImpScore);

  const colors = getScoreColors(config, isDark);
  const spacing = getSpacingClass(config.spacing || 3);

  const handleHelp = (field: string) => {
    if (onShowHelp) {
      onShowHelp(field);
    } else if (onHelpClick) {
      onHelpClick(field);
    }
  };

  const formatNumber = (num: number) => {
    return config.numberPrecision === 'decimal_1' ? num.toFixed(1) : Math.round(num).toString();
  };

  const appearanceParams = (schema?.scoringTraits?.appearance && schema.scoringTraits.appearance.length > 0)
    ? schema.scoringTraits.appearance.map(trait => ({
        key: trait.key,
        label: trait.label,
        score: (appScores as any)[trait.key] ?? 90,
        weight: trait.weightLabel || `${trait.weightPercent || 15}%`,
      }))
    : [
        { key: 'face', label: 'Wajah (Face)', score: appScores.face ?? 92, weight: '25%' },
        { key: 'skin', label: 'Kulit (Skin)', score: appScores.skin ?? 90, weight: '15%' },
        { key: 'breast', label: 'Dada (Breast)', score: appScores.breast ?? 88, weight: '15%' },
        { key: 'butt', label: 'Pinggul & Pantat', score: appScores.butt ?? 86, weight: '15%' },
        { key: 'v', label: 'Bentuk V (V-Line)', score: appScores.v ?? 91, weight: '15%' },
        { key: 'thighCalve', label: 'Paha & Betis', score: appScores.thighCalve ?? 89, weight: '15%' },
      ];

  const impressionParams = (schema?.scoringTraits?.impression && schema.scoringTraits.impression.length > 0)
    ? schema.scoringTraits.impression.map(trait => ({
        key: trait.key,
        label: trait.label,
        score: (impScores as any)[trait.key] ?? 90,
        weight: trait.weightLabel || `${trait.weightPercent || 15}%`,
      }))
    : [
        { key: 'expression', label: 'Ekspresi (Expression)', score: impScores.expression ?? 95, weight: '20%' },
        { key: 'aura', label: 'Aura Visual & Stage', score: impScores.aura ?? 94, weight: '20%' },
        { key: 'voice', label: 'Karakter Suara (Voice)', score: impScores.voice ?? 93, weight: '15%' },
        { key: 'sexAppeal', label: 'Daya Tarik / Sex Appeal', score: impScores.sexAppeal ?? 91, weight: '15%' },
        { key: 'authenticity', label: 'Keaslian (Authenticity)', score: impScores.authenticity ?? 90, weight: '15%' },
        { key: 'chemistry', label: 'Chemistry & Interaksi', score: impScores.chemistry ?? 88, weight: '15%' },
      ];

  // Render individual score parameter item based on Visual Style
  const renderParamItem = (
    param: { key: string; label: string; score: number; weight: string },
    colorObj: typeof colors.appearance,
    isAppearance: boolean
  ) => {
    const scoreVal = param.score;
    const percent = Math.min(100, Math.max(0, (scoreVal / 99) * 100));

    switch (config.visualStyle) {
      case 'circular_gauges':
        return (
          <div key={param.key} className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/50 border border-stone-800/80">
            <div className="flex items-center gap-1.5">
              <div>
                <span className="text-xs font-bold text-stone-200 block">{param.label}</span>
                {config.showWeightBadges && <span className="text-[10px] text-stone-500 font-mono">{getUIText('detail.score.weight.label', 'Bobot')}: {param.weight}</span>}
              </div>
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp(param.key)}
                  className="text-stone-500 hover:text-cyan-400 p-0.5"
                  title={`Informasi ${param.label}`}
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#262626" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke={colorObj.hex}
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset={88 - (88 * percent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-black font-mono" style={{ color: colorObj.hex }}>
                {formatNumber(scoreVal)}
              </span>
            </div>
          </div>
        );

      case 'score_cards':
        return (
          <div
            key={param.key}
            className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between"
            style={{ borderLeftColor: colorObj.hex, borderLeftWidth: 3 }}
          >
            <div className="flex items-center gap-1.5">
              <div>
                <span className="text-xs font-bold text-stone-200">{param.label}</span>
                {config.showWeightBadges && <span className="text-[10px] text-stone-500 font-mono block">{getUIText('detail.score.weight.label', 'Bobot')}: {param.weight}</span>}
              </div>
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp(param.key)}
                  className="text-stone-500 hover:text-cyan-400 p-0.5"
                  title={`Informasi ${param.label}`}
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="text-right">
              <span className="text-sm font-black font-mono px-2 py-0.5 rounded-md" style={{ backgroundColor: `${colorObj.hex}20`, color: colorObj.hex }}>
                {formatNumber(scoreVal)}
                {config.showScoreScale && <span className="text-[10px] opacity-70">/99</span>}
              </span>
            </div>
          </div>
        );

      case 'radar_matrix':
        // Segmented digital matrix
        const totalSegments = 10;
        const activeSegments = Math.round((percent / 100) * totalSegments);
        return (
          <div key={param.key} className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-stone-300 font-medium text-[11px]">{param.label}</span>
                {config.showHelpButtons && (
                  <button
                    type="button"
                    onClick={() => handleHelp(param.key)}
                    className="text-stone-500 hover:text-cyan-400 p-0.5"
                    title={`Informasi ${param.label}`}
                  >
                    <HelpCircle className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <span className="font-mono font-bold" style={{ color: colorObj.hex }}>
                {formatNumber(scoreVal)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSegments }).map((_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-xs transition-all"
                  style={{
                    backgroundColor: i < activeSegments ? colorObj.hex : '#262626',
                    boxShadow: i < activeSegments ? `0 0 6px ${colorObj.hex}50` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        );

      case 'pill_badges':
        return (
          <div
            key={param.key}
            className="flex items-center justify-between px-3 py-2 rounded-full border text-xs"
            style={{
              backgroundColor: `${colorObj.hex}12`,
              borderColor: `${colorObj.hex}35`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-stone-200 font-medium">{param.label}</span>
              {config.showWeightBadges && <span className="text-[10px] text-stone-400 font-mono">({param.weight})</span>}
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp(param.key)}
                  className="text-stone-400 hover:text-white p-0.5"
                  title={`Informasi ${param.label}`}
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="font-mono font-black px-2 py-0.5 rounded-full text-stone-950" style={{ backgroundColor: colorObj.hex }}>
              {formatNumber(scoreVal)}
            </span>
          </div>
        );

      case 'minimal_numbers':
        return (
          <div key={param.key} className="flex items-center justify-between py-1.5 border-b border-stone-800/50 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-stone-300 text-[11px]">{param.label}</span>
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp(param.key)}
                  className="text-stone-500 hover:text-cyan-400 p-0.5"
                  title={`Informasi ${param.label}`}
                >
                  <HelpCircle className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {config.showWeightBadges && <span className="text-[10px] text-stone-500 font-mono">{param.weight}</span>}
              <span className="font-mono font-black text-sm" style={{ color: colorObj.hex }}>
                {formatNumber(scoreVal)}
              </span>
            </div>
          </div>
        );

      case 'arcade_neon':
        return (
          <div key={param.key} className="p-2 rounded-lg bg-black border border-stone-800 space-y-1">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-stone-300 uppercase tracking-wider">{param.label}</span>
                {config.showHelpButtons && (
                  <button
                    type="button"
                    onClick={() => handleHelp(param.key)}
                    className="text-stone-500 hover:text-amber-400 p-0.5"
                    title={`Informasi ${param.label}`}
                  >
                    <HelpCircle className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
              <span className="font-bold text-amber-400">{formatNumber(scoreVal)} PTS</span>
            </div>
            <div className="h-3 w-full bg-stone-900 rounded-xs overflow-hidden p-0.5 flex gap-0.5">
              {Array.from({ length: 15 }).map((_, idx) => {
                const isLit = idx / 15 < percent / 100;
                return (
                  <div
                    key={idx}
                    className="h-full flex-1 rounded-xxs"
                    style={{
                      backgroundColor: isLit ? colorObj.hex : '#171717',
                      boxShadow: isLit ? `0 0 6px ${colorObj.hex}` : 'none',
                    }}
                  />
                );
              })}
            </div>
          </div>
        );

      case 'equalizer_bars':
        return (
          <div key={param.key} className="flex items-center justify-between p-2 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs">
            <div className="flex items-center gap-1 min-w-0 mr-2">
              <span className="text-stone-300 font-medium text-[11px] truncate">{param.label}</span>
              {config.showHelpButtons && (
                <button
                  type="button"
                  onClick={() => handleHelp(param.key)}
                  className="text-stone-500 hover:text-cyan-400 p-0.5 shrink-0"
                  title={`Informasi ${param.label}`}
                >
                  <HelpCircle className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-end gap-0.5 h-5 w-12">
                {[40, 70, 90, 60, 100, 85].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-t-xs"
                    style={{
                      height: `${(h * percent) / 100}%`,
                      backgroundColor: colorObj.hex,
                    }}
                  />
                ))}
              </div>
              <span className="font-mono font-bold text-stone-100 min-w-[32px] text-right" style={{ color: colorObj.hex }}>
                {formatNumber(scoreVal)}
              </span>
            </div>
          </div>
        );

      case 'clean_table':
        return (
          <tr key={param.key} className="border-b border-stone-800/40 text-xs font-mono">
            <td className="py-1.5 text-stone-300">
              <div className="flex items-center gap-1">
                <span>{param.label}</span>
                {config.showHelpButtons && (
                  <button
                    type="button"
                    onClick={() => handleHelp(param.key)}
                    className="text-stone-500 hover:text-cyan-400 p-0.5"
                    title={`Informasi ${param.label}`}
                  >
                    <HelpCircle className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </td>
            {config.showWeightBadges && <td className="py-1.5 text-stone-500 text-center">{param.weight}</td>}
            <td className="py-1.5 text-right font-black" style={{ color: colorObj.hex }}>
              {formatNumber(scoreVal)}
            </td>
          </tr>
        );

      case 'progress_bars':
      default:
        return (
          <div key={param.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-stone-300 font-medium">{param.label}</span>
                {config.showHelpButtons && (
                  <button
                    type="button"
                    onClick={() => handleHelp(param.key)}
                    className="text-stone-500 hover:text-cyan-400 p-0.5"
                    title={`Informasi ${param.label}`}
                  >
                    <HelpCircle className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {config.showWeightBadges && (
                  <span className="text-[10px] text-stone-500 font-mono">{getUIText('detail.score.weight.label', 'Bobot')}: {param.weight}</span>
                )}
                <span className="font-mono font-black text-stone-100" style={{ color: colorObj.hex }}>
                  {formatNumber(scoreVal)}
                  {config.showScoreScale && <span className="text-[10px] opacity-70">/99</span>}
                </span>
              </div>
            </div>
            {config.showPercentFillBar && (
              <div className="h-2 w-full bg-stone-950/80 rounded-full overflow-hidden border border-stone-800/80 p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${colorObj.bar} transition-all duration-300`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            )}
          </div>
        );
    }
  };

  // Appearance Card
  const renderAppearanceBox = (className = '') => (
    <div className={`rounded-2xl bg-stone-900/70 border border-stone-800/80 ${spacing.p} space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colors.appearance.bg} border ${colors.appearance.border}`}>
            <Sparkles className="w-4 h-4" style={{ color: colors.appearance.hex }} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-100 uppercase tracking-wide">
              {schema?.sectionTitles?.appearance || schema?.pageTexts?.artistDetail?.labels?.sectionAppearance || getUIText('taxonomy.field.appearance.label', 'APPEARANCE (FISIK)')}
            </h4>
            <p className="text-[10px] text-stone-400 font-mono">
              {schema?.pageTexts?.artistDetail?.labels?.weightContributionAppearance || getUIText('detail.score.weight.appearance', 'BOBOT KONTRIBUSI: 60%')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToRanking?.('appearance')}
            className={`text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-lg border transition-all ${
              onNavigateToRanking ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
            }`}
            style={{
              backgroundColor: `${colors.appearance.hex}20`,
              color: colors.appearance.hex,
              borderColor: `${colors.appearance.hex}40`,
            }}
            title={onNavigateToRanking ? 'Buka Ranking Appearance' : undefined}
          >
            {formatNumber(calcAppScore)}
          </button>
          {config.showHelpButtons && (
            <button
              type="button"
              onClick={() => handleHelp('appearanceScore')}
              className="p-1 text-stone-400 hover:text-cyan-400 transition-colors"
              title="Informasi Nilai Fisik"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className={spacing.spaceY}>
        {config.visualStyle === 'clean_table' ? (
          <table className="w-full">
            <tbody>{appearanceParams.map((p) => renderParamItem(p, colors.appearance, true))}</tbody>
          </table>
        ) : (
          appearanceParams.map((p) => renderParamItem(p, colors.appearance, true))
        )}
      </div>
    </div>
  );

  // Impression Card
  const renderImpressionBox = (className = '') => (
    <div className={`rounded-2xl bg-stone-900/70 border border-stone-800/80 ${spacing.p} space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colors.impression.bg} border ${colors.impression.border}`}>
            <Zap className="w-4 h-4" style={{ color: colors.impression.hex }} />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-stone-100 uppercase tracking-wide">
              {schema?.sectionTitles?.impression || schema?.pageTexts?.artistDetail?.labels?.sectionImpression || getUIText('taxonomy.field.impression.label', 'IMPRESSION (KARISMA)')}
            </h4>
            <p className="text-[10px] text-stone-400 font-mono">
              {schema?.pageTexts?.artistDetail?.labels?.weightContributionImpression || getUIText('detail.score.weight.impression', 'BOBOT KONTRIBUSI: 40%')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToRanking?.('impression')}
            className={`text-xs sm:text-sm font-black font-mono px-2 py-0.5 rounded-lg border transition-all ${
              onNavigateToRanking ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
            }`}
            style={{
              backgroundColor: `${colors.impression.hex}20`,
              color: colors.impression.hex,
              borderColor: `${colors.impression.hex}40`,
            }}
            title={onNavigateToRanking ? 'Buka Ranking Impression' : undefined}
          >
            {formatNumber(calcImpScore)}
          </button>
          {config.showHelpButtons && (
            <button
              type="button"
              onClick={() => handleHelp('impressionScore')}
              className="p-1 text-stone-400 hover:text-pink-400 transition-colors"
              title="Informasi Nilai Karisma"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className={spacing.spaceY}>
        {config.visualStyle === 'clean_table' ? (
          <table className="w-full">
            <tbody>{impressionParams.map((p) => renderParamItem(p, colors.impression, false))}</tbody>
          </table>
        ) : (
          impressionParams.map((p) => renderParamItem(p, colors.impression, false))
        )}
      </div>
    </div>
  );

  // Overall Master Card
  const renderOverallSummary = () => (
    <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-stone-200">
            {schema?.pageTexts?.artistDetail?.labels?.totalOverallScore || getUIText('detail.score.overall.title', 'TOTAL OVERALL SCORE')}
          </span>
          <p className="text-[10px] text-stone-400 font-mono">
            {schema?.pageTexts?.artistDetail?.labels?.totalOverallFormula || getUIText('detail.score.overall.formula', 'Perhitungan Formula Bobot (60% + 40%)')}
          </p>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
          {formatNumber(calcOverallScore)}
        </span>
        <span className="text-xs text-stone-500 font-mono">/99</span>
      </div>
    </div>
  );

  // Layout Switcher for Score
  switch (config.layout) {
    case 'stacked_rows':
      return (
        <div className={`space-y-4`}>
          {renderOverallSummary()}
          {renderAppearanceBox()}
          {renderImpressionBox()}
        </div>
      );

    case 'tabbed_panels':
      return (
        <div className="space-y-4">
          {renderOverallSummary()}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-stone-900 border border-stone-800 max-w-sm">
            <button
              type="button"
              onClick={() => setActiveScoreTab('appearance')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeScoreTab === 'appearance' ? 'bg-stone-800 text-cyan-400 shadow-xs' : 'text-stone-400'
              }`}
            >
              {getUIText('detail.score.tab.appearance', 'Appearance (60%)')}
            </button>
            <button
              type="button"
              onClick={() => setActiveScoreTab('impression')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeScoreTab === 'impression' ? 'bg-stone-800 text-pink-400 shadow-xs' : 'text-stone-400'
              }`}
            >
              {getUIText('detail.score.tab.impression', 'Impression (40%)')}
            </button>
          </div>
          {activeScoreTab === 'appearance' ? renderAppearanceBox() : renderImpressionBox()}
        </div>
      );

    case 'compact_matrix':
      return (
        <div className="space-y-3">
          {renderOverallSummary()}
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-xs font-black text-stone-200">12-PARAMETER COMPACT MATRIX</span>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-cyan-400">App: {formatNumber(calcAppScore)}</span>
                <span className="text-pink-400">Imp: {formatNumber(calcImpScore)}</span>
              </div>
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${spacing.gap}`}>
              {appearanceParams.map((p) => (
                <div key={p.key}>{renderParamItem(p, colors.appearance, true)}</div>
              ))}
              {impressionParams.map((p) => (
                <div key={p.key}>{renderParamItem(p, colors.impression, false)}</div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'split_master':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-12 ${spacing.gap}`}>
          <div className="md:col-span-4 rounded-2xl bg-stone-950 border border-stone-800 p-5 flex flex-col items-center justify-center text-center space-y-3">
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            <div>
              <span className="text-xs font-mono text-stone-400 tracking-wider">OVERALL SCORE</span>
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 my-1">
                {formatNumber(calcOverallScore)}
              </div>
              <span className="text-[10px] text-stone-500 font-mono">Formula: 60% App + 40% Imp</span>
            </div>
            <div className="w-full pt-3 border-t border-stone-800/80 flex justify-around text-xs font-mono">
              <div className="text-cyan-400">
                <span className="text-[10px] text-stone-500 block">Appearance</span>
                {formatNumber(calcAppScore)}
              </div>
              <div className="text-pink-400">
                <span className="text-[10px] text-stone-500 block">Impression</span>
                {formatNumber(calcImpScore)}
              </div>
            </div>
          </div>
          <div className="md:col-span-8 space-y-4">
            {renderAppearanceBox()}
            {renderImpressionBox()}
          </div>
        </div>
      );

    case 'bento_scores':
      return (
        <div className={`grid grid-cols-1 md:grid-cols-12 ${spacing.gap}`}>
          <div className="md:col-span-12">{renderOverallSummary()}</div>
          <div className="md:col-span-6">{renderAppearanceBox('h-full')}</div>
          <div className="md:col-span-6">{renderImpressionBox('h-full')}</div>
        </div>
      );

    case 'hud_dashboard':
      return (
        <div className="p-4 rounded-2xl bg-stone-950 border-2 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-black">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>DIAGNOSTIC_METRICS // SCORE_TELEMETRY</span>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-black px-2 py-0.5 rounded-md border border-stone-800">
              OVERALL: {formatNumber(calcOverallScore)} PTS
            </span>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing.gap}`}>
            {renderAppearanceBox('bg-stone-950 border-emerald-500/20')}
            {renderImpressionBox('bg-stone-950 border-emerald-500/20')}
          </div>
        </div>
      );

    case 'two_columns':
    default:
      return (
        <div className="space-y-4">
          {renderOverallSummary()}
          <div className={`grid grid-cols-1 md:grid-cols-2 ${spacing.gap}`}>
            {renderAppearanceBox()}
            {renderImpressionBox()}
          </div>
        </div>
      );
  }
};
