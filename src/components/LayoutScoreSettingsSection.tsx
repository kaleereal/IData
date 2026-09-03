import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  BarChart3,
  Check,
  RotateCcw,
  Eye,
  HelpCircle,
  Trophy,
  Gauge,
  Grid,
  Columns,
  List,
  Maximize2,
  Minimize2,
  Palette,
  Cpu,
  Sliders,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Flame,
  Star,
  Activity,
  Zap,
  Tag,
  Radio,
  SlidersHorizontal,
  LayoutTemplate,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react';
import {
  AppSettings,
  LayoutScoreConfig,
  SpekLayoutConfig,
  ScoreLayoutConfig,
  DEFAULT_LAYOUT_SCORE_CONFIG,
  Artist,
  DatabaseSchema,
  SpekLayoutStyle,
  SpekVisualStyle,
  ScoreLayoutStyle,
  ScoreVisualStyle,
} from '../types';
import {
  SpekRenderer,
  ScoreRenderer,
} from './score-layout/ScoreSpekRenderers';
import {
  SPEK_PRESETS,
  SCORE_PRESETS,
} from './score-layout/presetData';
import { useUITheme } from '../context/UIThemeContext';
import { getEffectiveLayoutScoreConfig } from '../utils/uiThemeEngine';

interface LayoutScoreSettingsSectionProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  sampleArtist?: Artist;
  schema?: DatabaseSchema;
  isDark?: boolean;
}

// Convert Hue to Hex helper
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Convert Hex to Hue helper
function hexToHue(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;

  if (max === min) {
    h = 0;
  } else if (max === r) {
    h = ((g - b) / (max - min)) % 6;
  } else if (max === g) {
    h = (b - r) / (max - min) + 2;
  } else {
    h = (r - g) / (max - min) + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return h;
}

// Fallback preview artist
const FALLBACK_PREVIEW_ARTIST: Artist = {
  id: 'preview_sample_01',
  firstName: 'Aurelia',
  lastName: 'Vance',
  avatarUrl: '',
  country: 'Indonesia',
  countryCode: 'ID',
  bornDate: '2001-05-14',
  debutDate: '2020-10-20',
  heightCm: 168,
  typeCode: 'SL',
  artistStatus: 'Profesional',
  measurements: {
    cupSize: 'D',
    bustCm: 88,
    waistCm: 58,
    hipCm: 86,
  },
  attributes: ['Cat Eyes', 'Dimples', 'Tall', 'Sharp Jawline'],
  appeal: {
    maturity: 'Youthful',
    vibe: 'Charismatic',
    style: 'Cyber Streetwear',
    bodyShape: 'Athletic',
  },
  specialty: ['Main Vocal & Visual', 'Mezzo-Soprano (D3-G5)', 'Acoustic Guitar, Piano', 'Live Vocal Stability & Stage Dance'],
  appearanceScores: {
    face: 92,
    skin: 90,
    breast: 88,
    butt: 86,
    v: 91,
    thighCalve: 89,
  },
  impressionScores: {
    voice: 93,
    expression: 95,
    sexAppeal: 91,
    authenticity: 90,
    chemistry: 88,
    aura: 94,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const LayoutScoreSettingsSection: React.FC<LayoutScoreSettingsSectionProps> = ({
  settings,
  onUpdateSettings,
  sampleArtist = FALLBACK_PREVIEW_ARTIST,
  schema,
  isDark = true,
}) => {
  // Main settings category tabs
  const [activeSettingsTab, setActiveSettingsTab] = useState<'spek' | 'score' | 'color' | 'presets'>('spek');

  // Preview Mode state
  const [previewCategory, setPreviewCategory] = useState<'both' | 'spek' | 'score'>('both');
  const [isPreviewExpanded, setIsPreviewExpanded] = useState<boolean>(true);

  // Color customization tab state
  const [colorTargetField, setColorTargetField] = useState<
    'appearance' | 'impression' | 'attributes' | 'appeal' | 'specialty' | 'overall'
  >('appearance');
  const [sliderHue, setSliderHue] = useState<number>(190);
  const [hexInput, setHexInput] = useState<string>('#06B6D4');
  const [colorPresets, setColorPresets] = useState<string[]>([
    '#06B6D4',
    '#EC4899',
    '#00E5FF',
    '#F59E0B',
    '#10B981',
    '#8B5CF6',
    '#F43F5E',
    '#14B8A6',
    '#EAB308',
    '#38BDF8',
  ]);

  const uiTheme = useUITheme();
  const config: LayoutScoreConfig = settings.layoutScoreConfig || DEFAULT_LAYOUT_SCORE_CONFIG;
  const isUseThemeDefaults = config.useThemeDefaults ?? true;
  const effectiveConfig = getEffectiveLayoutScoreConfig(config, uiTheme);
  const spekConfig = isUseThemeDefaults ? effectiveConfig.spek : (config.spek || DEFAULT_LAYOUT_SCORE_CONFIG.spek);
  const scoreConfig = isUseThemeDefaults ? effectiveConfig.score : (config.score || DEFAULT_LAYOUT_SCORE_CONFIG.score);

  const handleToggleUseThemeDefaults = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      layoutScoreConfig: {
        ...config,
        useThemeDefaults: enabled,
      },
    });
  };

  const handleUpdateSpek = (patch: Partial<SpekLayoutConfig>) => {
    const updated: LayoutScoreConfig = {
      ...config,
      useThemeDefaults: false, // Automatically switch to manual if user directly tweaks parameters
      spek: {
        ...(config.spek || DEFAULT_LAYOUT_SCORE_CONFIG.spek),
        ...patch,
      },
    };
    onUpdateSettings({
      ...settings,
      layoutScoreConfig: updated,
    });
  };

  const handleUpdateScore = (patch: Partial<ScoreLayoutConfig>) => {
    const updated: LayoutScoreConfig = {
      ...config,
      useThemeDefaults: false, // Automatically switch to manual if user directly tweaks parameters
      score: {
        ...(config.score || DEFAULT_LAYOUT_SCORE_CONFIG.score),
        ...patch,
      },
    };
    onUpdateSettings({
      ...settings,
      layoutScoreConfig: updated,
    });
  };

  const handleResetToDefault = () => {
    onUpdateSettings({
      ...settings,
      layoutScoreConfig: DEFAULT_LAYOUT_SCORE_CONFIG,
    });
  };

  // Color apply handler for target field
  const handleApplyColorToField = (colorHex: string) => {
    if (colorTargetField === 'appearance') {
      handleUpdateScore({ appearanceColor: colorHex });
    } else if (colorTargetField === 'impression') {
      handleUpdateScore({ impressionColor: colorHex });
    } else if (colorTargetField === 'overall') {
      handleUpdateScore({ overallColor: colorHex });
    } else if (colorTargetField === 'attributes') {
      handleUpdateSpek({ attributesColor: colorHex });
    } else if (colorTargetField === 'appeal') {
      handleUpdateSpek({ appealColor: colorHex });
    } else if (colorTargetField === 'specialty') {
      handleUpdateSpek({ specialtyColor: colorHex });
    }
  };

  // Get current active color for current target field
  const getCurrentTargetColor = () => {
    if (colorTargetField === 'appearance') return scoreConfig.appearanceColor || '#06B6D4';
    if (colorTargetField === 'impression') return scoreConfig.impressionColor || '#EC4899';
    if (colorTargetField === 'overall') return scoreConfig.overallColor || '#F59E0B';
    if (colorTargetField === 'attributes') return spekConfig.attributesColor || '#00E5FF';
    if (colorTargetField === 'appeal') return spekConfig.appealColor || '#F59E0B';
    if (colorTargetField === 'specialty') return spekConfig.specialtyColor || '#10B981';
    return '#06B6D4';
  };

  // Change color target field and sync slider hue
  const handleSelectColorTarget = (field: typeof colorTargetField) => {
    setColorTargetField(field);
    let currentColor = '#06B6D4';
    if (field === 'appearance') currentColor = scoreConfig.appearanceColor || '#06B6D4';
    else if (field === 'impression') currentColor = scoreConfig.impressionColor || '#EC4899';
    else if (field === 'overall') currentColor = scoreConfig.overallColor || '#F59E0B';
    else if (field === 'attributes') currentColor = spekConfig.attributesColor || '#00E5FF';
    else if (field === 'appeal') currentColor = spekConfig.appealColor || '#F59E0B';
    else if (field === 'specialty') currentColor = spekConfig.specialtyColor || '#10B981';

    setHexInput(currentColor);
    setSliderHue(hexToHue(currentColor));
  };

  // Layout list definitions for Spek
  const spekLayoutOptions: { id: SpekLayoutStyle; label: string; desc: string; icon: string }[] = [
    { id: 'three_columns', label: '3 Kolom Seimbang', desc: 'Simetris 3 kolom standar profil', icon: '📐' },
    { id: 'two_columns', label: '2 Kolom Asimetris', desc: '2 atas + 1 bawah lebar penuh', icon: '⚖️' },
    { id: 'single_column', label: '1 Kolom Stacked', desc: 'Vertikal bertumpuk satu per satu', icon: '📑' },
    { id: 'bento_grid', label: 'Bento Grid Modern', desc: 'Asimetris grid proporsional modern', icon: '🍱' },
    { id: 'horizontal_cards', label: 'Carousel Scroll', desc: 'Kartu horisontal geser hemat ruang', icon: '↔️' },
    { id: 'tabbed_categories', label: 'Tabbed Categories', desc: 'Navigasi tab per kategori fokus', icon: '📑' },
    { id: 'accordion_drawer', label: 'Accordion Drawer', desc: 'Buka tutup collapsible minimalis', icon: '🗂️' },
    { id: 'matrix_hud', label: 'Cyber Matrix HUD', desc: 'Futuristik cyber HUD dashboard', icon: '⚡' },
    { id: 'tag_cloud', label: 'Fluid Tag Cloud', desc: 'Awan tag terpadu mengalir bebas', icon: '🏷️' },
  ];

  // Visual style definitions for Spek
  const spekVisualOptions: { id: SpekVisualStyle; label: string; desc: string; icon: string }[] = [
    { id: 'bordered_cards', label: 'Bordered Cards', desc: 'Kartu klasik berbingkai halus', icon: '🔲' },
    { id: 'pill_tags', label: 'Soft Pill Tags', desc: 'Pil kapsul melengkung lembut', icon: '💊' },
    { id: 'glowing_chips', label: 'Glowing Neon Chips', desc: 'Chip neon berpendar kontras', icon: '✨' },
    { id: 'compact_dots', label: 'Bullet Dots Rapi', desc: 'Titik penanda rapi & padat', icon: '🟢' },
    { id: 'minimal_list', label: 'Minimalist Clean', desc: 'Daftar teks bersih tanpa bingkai', icon: '📄' },
    { id: 'matrix_boxes', label: 'Monospace Box', desc: 'Kotak digital beraksen mono', icon: '⏹️' },
    { id: 'glassmorphism', label: 'Frost Glassmorphism', desc: 'Efek kaca transparan blur', icon: '🪟' },
    { id: 'striped_accent', label: 'Striped Border-L', desc: 'Garis aksen sisi kiri', icon: '▍' },
    { id: 'gradient_outline', label: 'Gradient Glow', desc: 'Bingkai gradasi warna cerah', icon: '🌈' },
    { id: 'terminal_cli', label: 'Terminal CLI Dev', desc: 'Konsol kode monospace hacker', icon: '💻' },
  ];

  // Layout list definitions for Score
  const scoreLayoutOptions: { id: ScoreLayoutStyle; label: string; desc: string; icon: string }[] = [
    { id: 'two_columns', label: '2 Kolom Bersebelahan', desc: 'Appearance kiri, Impression kanan', icon: '⚖️' },
    { id: 'stacked_rows', label: 'Baris Bertumpuk', desc: 'Lebar penuh atas & bawah', icon: '☰' },
    { id: 'tabbed_panels', label: 'Tabbed Panels', desc: 'Tab switch Appearance vs Impression', icon: '📑' },
    { id: 'compact_matrix', label: '12-Param Matrix', desc: 'Grid padat 12 parameter sekaligus', icon: '🔢' },
    { id: 'split_master', label: 'Split Master Score', desc: 'Overall rating kiri, detail kanan', icon: '🏆' },
    { id: 'bento_scores', label: 'Bento Box Scores', desc: 'Grid kotak bento asimetris', icon: '🍱' },
    { id: 'hud_dashboard', label: 'HUD Telemetry', desc: 'Dashboard analitik sci-fi', icon: '🔬' },
  ];

  // Visual style definitions for Score
  const scoreVisualOptions: { id: ScoreVisualStyle; label: string; desc: string; icon: string }[] = [
    { id: 'progress_bars', label: 'Gradient Bars', desc: 'Bilah progres gradasi halus', icon: '📊' },
    { id: 'circular_gauges', label: 'Radial Speedo', desc: 'Speedometer dial melingkar', icon: '⏱️' },
    { id: 'score_cards', label: 'Metric Cards', desc: 'Kartu nilai dengan angka besar', icon: '🃏' },
    { id: 'radar_matrix', label: 'Segmented Matrix', desc: '10 Segmen LED digital blok', icon: '📶' },
    { id: 'pill_badges', label: 'Pill Badges', desc: 'Pil kapsul dengan badge angka', icon: '💊' },
    { id: 'minimal_numbers', label: 'Swiss Numerals', desc: 'Tipografi bersih + microbar', icon: '💎' },
    { id: 'arcade_neon', label: 'Arcade Neon Bar', desc: 'Bilah neon game arcade retro', icon: '🕹️' },
    { id: 'equalizer_bars', label: 'Audio Equalizer', desc: 'Spektrum equalizer musik', icon: '🎛️' },
    { id: 'clean_table', label: 'Monospace Table', desc: 'Tabel metrik angka rapi', icon: '📋' },
  ];

  return (
    <div className="space-y-4">
      {/* ========================================================================= */}
      {/* 1. STICKY LIVE PREVIEW CONTAINER (AT THE VERY TOP)                       */}
      {/* ========================================================================= */}
      <div
        className={`sticky top-2 z-20 rounded-2xl border transition-all duration-300 backdrop-blur-xl shadow-2xl ${
          isDark
            ? 'bg-stone-950/90 border-amber-500/40 shadow-black/80'
            : 'bg-white/95 border-amber-500/50 shadow-stone-300'
        }`}
      >
        {/* Preview Control Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-stone-800/80 gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black tracking-wider uppercase text-stone-100 flex items-center gap-1.5">
              <span>LIVE PREVIEW</span>
              <span className="text-[10px] text-amber-400 font-mono hidden sm:inline">• Layout Scoring Realtime</span>
            </span>
          </div>

          {/* View Filter Pill (Both / Spek / Score) */}
          <div className="flex items-center gap-1 bg-stone-900/90 p-1 rounded-xl border border-stone-800 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPreviewCategory('both');
                setIsPreviewExpanded(true);
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                previewCategory === 'both' && isPreviewExpanded
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Semua (Spek + Score)
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewCategory('spek');
                setIsPreviewExpanded(true);
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                previewCategory === 'spek' && isPreviewExpanded
                  ? 'bg-cyan-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Spek
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewCategory('score');
                setIsPreviewExpanded(true);
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                previewCategory === 'score' && isPreviewExpanded
                  ? 'bg-pink-500 text-stone-950 shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Score
            </button>

            {/* Collapse / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors ml-1 cursor-pointer"
              title={isPreviewExpanded ? 'Kecilkan Preview' : 'Buka Preview'}
            >
              {isPreviewExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Live Preview Content Area */}
        {isPreviewExpanded && (
          <div className="p-3.5 max-h-[420px] overflow-y-auto space-y-4 no-scrollbar">
            {(previewCategory === 'both' || previewCategory === 'spek') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 font-mono uppercase tracking-wider px-1">
                  <span>Kategori Spek (Attributes, Appeal, Specialty)</span>
                  <span className="text-cyan-400 lowercase">
                    {spekConfig.layout} • {spekConfig.visualStyle} • sp:{spekConfig.spacing || 3}
                  </span>
                </div>
                <SpekRenderer artist={sampleArtist} config={spekConfig} isDark={isDark} schema={schema} />
              </div>
            )}

            {(previewCategory === 'both' || previewCategory === 'score') && (
              <div className="space-y-2 pt-1 border-t border-stone-800/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 font-mono uppercase tracking-wider px-1">
                  <span>Kategori Score (Appearance 60% + Impression 40%)</span>
                  <span className="text-pink-400 lowercase">
                    {scoreConfig.layout} • {scoreConfig.visualStyle} • sp:{scoreConfig.spacing || 3}
                  </span>
                </div>
                <ScoreRenderer artist={sampleArtist} config={scoreConfig} isDark={isDark} schema={schema} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. THEME DEFAULT TOGGLE CARD (GUNAKAN BAWAAN TEMA)                        */}
      {/* ========================================================================= */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isUseThemeDefaults
            ? isDark
              ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
              : 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400/20'
            : isDark
            ? 'bg-stone-900/60 border-stone-800'
            : 'bg-stone-100/80 border-stone-200'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-black text-stone-100 flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-amber-400" />
                <span>Gunakan Bawaan Tema</span>
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isUseThemeDefaults
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-stone-800 text-stone-400 border-stone-700'
                }`}
              >
                {isUseThemeDefaults ? 'AKTIF (MENGIKUTI TEMA)' : 'KUSTOM MANUAL'}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {isUseThemeDefaults ? (
                <span>
                  Tampilan Score & Spek saat ini otomatis mengikuti gaya bawaan tema aktif:{' '}
                  <strong className="text-amber-300">{uiTheme.name}</strong>.
                </span>
              ) : (
                <span>
                  Mode kustomisasi manual aktif. Anda bebas mengubah tata letak, gaya visual, dan palet warna di bawah secara independen.
                </span>
              )}
            </p>
          </div>

          {/* Toggle Button */}
          <button
            type="button"
            onClick={() => handleToggleUseThemeDefaults(!isUseThemeDefaults)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
              isUseThemeDefaults
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                : isDark
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border-stone-300'
            }`}
          >
            {isUseThemeDefaults ? (
              <>
                <ToggleRight className="w-5 h-5 text-stone-950" />
                <span>Bawaan Tema: ON</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-stone-400" />
                <span>Gunakan Tema</span>
              </>
            )}
          </button>
        </div>

        {isUseThemeDefaults && (
          <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2 flex-wrap text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5 text-amber-400/90 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                Spek: <span className="text-stone-200">{spekConfig.layout}</span> • Score: <span className="text-stone-200">{scoreConfig.layout}</span>
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleToggleUseThemeDefaults(false)}
              className="text-stone-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Ubah ke Kustomisasi Manual
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORY CONFIGURATION TABS (BELOW STICKY PREVIEW)                      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900/80 border border-stone-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'spek' as const, label: 'Kategori Spek', icon: Layers, count: '3 Bidang' },
            { id: 'score' as const, label: 'Kategori Score', icon: BarChart3, count: '12 Matriks' },
            { id: 'color' as const, label: 'Palet & Kustom Warna', icon: Palette, count: 'Spectrum Slide' },
            { id: 'presets' as const, label: 'Preset Gaya Siap Pakai', icon: Sparkles, count: '14+ Preset' },
          ].map((tab) => {
            const active = activeSettingsTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <div className="text-left truncate">
                  <span className="block leading-tight">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KATEGORI SPEK SETTINGS                                             */}
        {/* ========================================================================= */}
        {activeSettingsTab === 'spek' && (
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>PENGATURAN KATEGORI SPEK</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Kustomisasi tata letak, gaya visual komponen, jarak kerapatan, dan visibilitas pada kartu Ciri Khusus, Daya Tarik & Keahlian.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateSpek(DEFAULT_LAYOUT_SCORE_CONFIG.spek)}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                title="Kembalikan Spek ke default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Opsi Tata Letak Spek */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                1. Tata Letak Grid (Layout Architecture)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {spekLayoutOptions.map((opt) => {
                  const isSelected = spekConfig.layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateSpek({ layout: opt.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 text-stone-100 shadow-sm'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{opt.icon}</span>
                        {isSelected && <span className="text-[10px] text-cyan-400 font-bold font-mono">AKTIF</span>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-200 truncate">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opsi Gaya Visual Spek */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                2. Gaya Visual Komponen & Item (Visual Style)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {spekVisualOptions.map((opt) => {
                  const isSelected = spekConfig.visualStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateSpek({ visualStyle: opt.id })}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 text-stone-100 shadow-sm'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{opt.icon}</span>
                        <span className="text-xs font-bold text-stone-200 truncate">{opt.label}</span>
                      </div>
                      <div className="text-[9px] text-stone-500 line-clamp-1">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jarak Kerapatan (Natural Spacing Slider) */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Jarak Kerapatan (Natural Spacing)</span>
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  Tingkat: {spekConfig.spacing || 3} / 5 (
                  {(spekConfig.spacing || 3) === 1
                    ? 'Ultra Padat'
                    : (spekConfig.spacing || 3) === 2
                    ? 'Rapat'
                    : (spekConfig.spacing || 3) === 3
                    ? 'Standar'
                    : (spekConfig.spacing || 3) === 4
                    ? 'Renggang'
                    : 'Sangat Luas'}
                  )
                </span>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={spekConfig.spacing || 3}
                  onChange={(e) => handleUpdateSpek({ spacing: Number(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-800 accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
                  <span>1 (Padat)</span>
                  <span>2 (Rapat)</span>
                  <span>3 (Normal)</span>
                  <span>4 (Renggang)</span>
                  <span>5 (Luas)</span>
                </div>
              </div>
            </div>

            {/* Tipe Background Kartu */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                4. Tipe Permukaan / Background Kartu
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'subtle_dark' as const, label: 'Subtle Translucent', desc: 'Gelap halus standar' },
                  { id: 'glass_transparent' as const, label: 'Frost Glassmorphism', desc: 'Kaca transparan berkabut' },
                  { id: 'solid_elevated' as const, label: 'Solid Elevated', desc: 'Pekat solid berefek timbul' },
                  { id: 'neon_bordered' as const, label: 'Cyber Neon Bordered', desc: 'Border cyan menyala' },
                  { id: 'bordered' as const, label: 'Clean Bordered', desc: 'Border minimalis tegas' },
                  { id: 'transparent' as const, label: 'Ultra Transparent', desc: 'Tanpa background' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => handleUpdateSpek({ cardBackground: bg.id })}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      spekConfig.cardBackground === bg.id
                        ? 'bg-cyan-950/40 border-cyan-400 text-stone-100'
                        : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="font-bold">{bg.label}</div>
                    <div className="text-[10px] text-stone-500">{bg.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tombol Toggle Visibilitas */}
            <div className="pt-2 border-t border-stone-800/60 space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                5. Visibilitas Elemen & Tombol
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'showCategoryHeaders' as const, label: 'Header Kategori' },
                  { key: 'showIcons' as const, label: 'Ikon Kategori' },
                  { key: 'showCountBadges' as const, label: 'Badge Jumlah' },
                  { key: 'showHelpButtons' as const, label: 'Tombol Bantuan' },
                ].map((toggle) => {
                  const isChecked = !!spekConfig[toggle.key];
                  return (
                    <button
                      key={toggle.key}
                      type="button"
                      onClick={() => handleUpdateSpek({ [toggle.key]: !isChecked })}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300'
                          : 'bg-stone-950/40 border-stone-800 text-stone-500'
                      }`}
                    >
                      <span className="truncate">{toggle.label}</span>
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ml-1 ${
                          isChecked ? 'bg-cyan-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {isChecked ? '✓' : '✕'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KATEGORI SCORE SETTINGS                                            */}
        {/* ========================================================================= */}
        {activeSettingsTab === 'score' && (
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-pink-400" />
                  <span>PENGATURAN KATEGORI SCORE (60% + 40%)</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Kustomisasi visualisasi metrik nilai, gaya visual progress bar, dial speedometer, presisi angka desimal, dan tata letak parameter.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUpdateScore(DEFAULT_LAYOUT_SCORE_CONFIG.score)}
                className="flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400 transition-colors"
                title="Kembalikan Score ke default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Opsi Tata Letak Score */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                1. Tata Letak Scoring (Layout Architecture)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {scoreLayoutOptions.map((opt) => {
                  const isSelected = scoreConfig.layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateScore({ layout: opt.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-pink-950/40 border-pink-400 ring-1 ring-pink-400 text-stone-100 shadow-sm'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{opt.icon}</span>
                        {isSelected && <span className="text-[10px] text-pink-400 font-bold font-mono">AKTIF</span>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-200 truncate">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opsi Gaya Visual Score */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                2. Gaya Visual Metrik Nilai (Visual Metric Style)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {scoreVisualOptions.map((opt) => {
                  const isSelected = scoreConfig.visualStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateScore({ visualStyle: opt.id })}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-pink-950/40 border-pink-400 ring-1 ring-pink-400 text-stone-100 shadow-sm'
                          : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs">{opt.icon}</span>
                        <span className="text-xs font-bold text-stone-200 truncate">{opt.label}</span>
                      </div>
                      <div className="text-[9px] text-stone-500 line-clamp-1">{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jarak Kerapatan (Natural Spacing Slider for Score) */}
            <div className="space-y-2 pt-2 border-t border-stone-800/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-pink-400" />
                  <span>3. Jarak Kerapatan (Natural Spacing)</span>
                </label>
                <span className="text-xs font-mono font-bold text-pink-400">
                  Tingkat: {scoreConfig.spacing || 3} / 5
                </span>
              </div>

              <div className="relative pt-1">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={scoreConfig.spacing || 3}
                  onChange={(e) => handleUpdateScore({ spacing: Number(e.target.value) })}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-stone-800 accent-pink-400"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1">
                  <span>1 (Padat)</span>
                  <span>2 (Rapat)</span>
                  <span>3 (Normal)</span>
                  <span>4 (Renggang)</span>
                  <span>5 (Luas)</span>
                </div>
              </div>
            </div>

            {/* Presisi Angka & Toggles */}
            <div className="pt-2 border-t border-stone-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Presisi Angka */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  4. Format & Presisi Angka Nilai
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateScore({ numberPrecision: 'integer' })}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      scoreConfig.numberPrecision === 'integer'
                        ? 'bg-pink-950/40 border-pink-400 text-pink-300 ring-1 ring-pink-400'
                        : 'bg-stone-950/40 border-stone-800 text-stone-400'
                    }`}
                  >
                    Angka Bulat (92)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateScore({ numberPrecision: 'decimal_1' })}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      scoreConfig.numberPrecision === 'decimal_1'
                        ? 'bg-pink-950/40 border-pink-400 text-pink-300 ring-1 ring-pink-400'
                        : 'bg-stone-950/40 border-stone-800 text-stone-400'
                    }`}
                  >
                    1 Desimal (92.4)
                  </button>
                </div>
              </div>

              {/* Toggles Visibilitas Score */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                  5. Indikator & Skala
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'showWeightBadges' as const, label: 'Bobot (%)' },
                    { key: 'showPercentFillBar' as const, label: 'Bilah Fill' },
                    { key: 'showScoreScale' as const, label: 'Skala (/99)' },
                    { key: 'showHelpButtons' as const, label: 'Bantuan' },
                  ].map((toggle) => {
                    const isChecked = !!scoreConfig[toggle.key];
                    return (
                      <button
                        key={toggle.key}
                        type="button"
                        onClick={() => handleUpdateScore({ [toggle.key]: !isChecked })}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-pink-950/30 border-pink-500/50 text-pink-300'
                            : 'bg-stone-950/40 border-stone-800 text-stone-500'
                        }`}
                      >
                        <span className="truncate">{toggle.label}</span>
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                            isChecked ? 'bg-pink-500 text-stone-950' : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {isChecked ? '✓' : '✕'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PALET & KUSTOM WARNA (COLOR SPECTRUM SLIDER + TARGET FIELD TABS)   */}
        {/* ========================================================================= */}
        {activeSettingsTab === 'color' && (
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-100 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>KUSTOMISASI WARNA DENGAN SPEKTRUM SLIDE</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Pilih bidang target yang ingin diubah warnanya, lalu geser slide spektrum atau masukkan kode hex warna.
                </p>
              </div>
            </div>

            {/* Target Bidang Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                1. Pilih Bidang Target yang Akan Diubah Warnanya:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'appearance' as const, label: 'Appearance (Fisik)', color: scoreConfig.appearanceColor || '#06B6D4' },
                  { id: 'impression' as const, label: 'Impression (Karisma)', color: scoreConfig.impressionColor || '#EC4899' },
                  { id: 'attributes' as const, label: 'Ciri Khusus', color: spekConfig.attributesColor || '#00E5FF' },
                  { id: 'appeal' as const, label: 'Daya Tarik', color: spekConfig.appealColor || '#F59E0B' },
                  { id: 'specialty' as const, label: 'Keahlian', color: spekConfig.specialtyColor || '#10B981' },
                  { id: 'overall' as const, label: 'Overall Accent', color: scoreConfig.overallColor || '#F59E0B' },
                ].map((field) => {
                  const isSelected = colorTargetField === field.id;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleSelectColorTarget(field.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-stone-800 border-amber-400 ring-2 ring-amber-400/40 text-stone-100 shadow-md'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: field.color }}
                        />
                        {isSelected && <span className="text-[10px] text-amber-400 font-bold">TERPILIH</span>}
                      </div>
                      <span className="text-xs font-bold truncate">{field.label}</span>
                      <span className="text-[10px] font-mono text-stone-400">{field.color}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smooth Spectrum Range Slider */}
            <div className="pt-2 border-t border-stone-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                  <span>2. Geser Spektrum Warna:</span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/30"
                    style={{ backgroundColor: getCurrentTargetColor() }}
                  />
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">{getCurrentTargetColor()}</span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={sliderHue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSliderHue(val);
                    const hex = hslToHex(val, 95, 50);
                    setHexInput(hex);
                    handleApplyColorToField(hex);
                  }}
                  className="w-full h-3.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
              </div>
            </div>

            {/* Bottom Controls: Hex Input + Apply Button + Quick Palette Swatches */}
            <div className="pt-2 border-t border-stone-800/60 flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Hex Input */}
              <div className="flex items-center gap-1.5 min-w-[110px] max-w-[130px] shrink-0">
                <span className="text-xs font-mono text-stone-400 font-bold">#</span>
                <input
                  type="text"
                  value={hexInput.replace('#', '')}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                    const fullHex = '#' + val;
                    setHexInput(fullHex);
                    if (val.length === 6) {
                      handleApplyColorToField(fullHex);
                      setSliderHue(hexToHue(fullHex));
                    }
                  }}
                  maxLength={6}
                  placeholder="06B6D4"
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border bg-stone-950 border-stone-700 text-stone-200 focus:border-amber-400 uppercase outline-hidden"
                />
              </div>

              {/* + Gunakan / Terapkan Warna Button */}
              <button
                type="button"
                onClick={() => {
                  if (hexInput && hexInput.length >= 4) {
                    handleApplyColorToField(hexInput);
                    if (!colorPresets.includes(hexInput.toUpperCase())) {
                      setColorPresets([hexInput.toUpperCase(), ...colorPresets.slice(0, 9)]);
                    }
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gunakan Warna</span>
              </button>

              {/* Quick Swatches Slider */}
              <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-1.5 py-1 pl-1">
                {colorPresets.map((swatch, idx) => {
                  const isCurrent = swatch.toUpperCase() === getCurrentTargetColor().toUpperCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setHexInput(swatch);
                        setSliderHue(hexToHue(swatch));
                        handleApplyColorToField(swatch);
                      }}
                      className={`w-7 h-7 rounded-lg shrink-0 border transition-all cursor-pointer flex items-center justify-center ${
                        isCurrent ? 'ring-2 ring-amber-400 scale-110 border-white' : 'border-stone-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch }}
                      title={`Pilih swatch ${swatch}`}
                    >
                      {isCurrent && <span className="text-[10px] font-black text-black">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PRESET GAYA SIAP PAKAI (PRESETS LIBRARY - MIN 5 PER KATEGORI)      */}
        {/* ========================================================================= */}
        {activeSettingsTab === 'presets' && (
          <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800/60 pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>KOLEKSI PRESET GAYA SCORING SIAP PAKAI</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Terapkan preset tema teruji dengan 1-klik untuk Kategori Spek dan Kategori Score.
                </p>
              </div>
            </div>

            {/* Section 1: Presets untuk Kategori Spek */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Preset Kategori Spek ({SPEK_PRESETS.length} Pilihan)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SPEK_PRESETS.map((preset) => {
                  const isCurrent =
                    spekConfig.layout === preset.config.layout &&
                    spekConfig.visualStyle === preset.config.visualStyle;
                  return (
                    <div
                      key={preset.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400 shadow-md'
                          : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-base">{preset.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                            {preset.badge}
                          </span>
                        </div>
                        <div className="text-xs font-black text-stone-100">{preset.name}</div>
                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateSpek(preset.config)}
                        className={`mt-3 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isCurrent
                            ? 'bg-cyan-500 text-stone-950 font-black'
                            : 'bg-stone-800 text-stone-200 hover:bg-cyan-600 hover:text-white'
                        }`}
                      >
                        {isCurrent ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isCurrent ? 'Preset Aktif' : 'Terapkan Preset'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Presets untuk Kategori Score */}
            <div className="space-y-3 pt-4 border-t border-stone-800/60">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Preset Kategori Score ({SCORE_PRESETS.length} Pilihan)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {SCORE_PRESETS.map((preset) => {
                  const isCurrent =
                    scoreConfig.layout === preset.config.layout &&
                    scoreConfig.visualStyle === preset.config.visualStyle;
                  return (
                    <div
                      key={preset.id}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-pink-950/40 border-pink-400 ring-1 ring-pink-400 shadow-md'
                          : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-base">{preset.icon}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                            {preset.badge}
                          </span>
                        </div>
                        <div className="text-xs font-black text-stone-100">{preset.name}</div>
                        <p className="text-[10px] text-stone-400 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateScore(preset.config)}
                        className={`mt-3 w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          isCurrent
                            ? 'bg-pink-500 text-stone-950 font-black'
                            : 'bg-stone-800 text-stone-200 hover:bg-pink-600 hover:text-white'
                        }`}
                      >
                        {isCurrent ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3 h-3" />}
                        <span>{isCurrent ? 'Preset Aktif' : 'Terapkan Preset'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
