import React, { useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Layers,
  BarChart3,
  Check,
  Eye,
  Sliders,
  Palette,
  Maximize2,
  Minimize2,
  ChevronRight,
  Sun,
  Moon,
  Users,
  CheckCircle2,
  Flame,
  Zap,
  Tag,
  Star,
  Activity,
  Plus,
  Trash2,
  SlidersHorizontal,
  Info,
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
import { SpekRenderer, ScoreRenderer } from './score-layout/ScoreSpekRenderers';
import { SPEK_PRESETS, SCORE_PRESETS, LayoutPreset } from './score-layout/presetData';
import { useUITheme } from '../context/UIThemeContext';
import { getEffectiveLayoutScoreConfig } from '../utils/uiThemeEngine';

interface LayoutScoreSettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onBack: () => void;
  artists?: Artist[];
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

export const LayoutScoreSettingsPage: React.FC<LayoutScoreSettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onBack,
  artists = [],
  schema,
  isDark = true,
}) => {
  // Navigation tabs for settings controls
  const [activeTab, setActiveTab] = useState<'spek' | 'score' | 'color' | 'presets'>('spek');

  // Preview tab state (defaults to matching activeTab)
  const [previewCategoryOverride, setPreviewCategoryOverride] = useState<'spek' | 'score' | null>(null);
  const [previewDarkTheme, setPreviewDarkTheme] = useState<boolean>(isDark);
  const [selectedArtistIndex, setSelectedArtistIndex] = useState<number>(0);
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Active sample artist
  const previewArtist = (artists && artists.length > 0 && artists[selectedArtistIndex]) || FALLBACK_PREVIEW_ARTIST;

  // Determine current active preview mode based on tab or manual override
  const activePreviewMode: 'spek' | 'score' = (() => {
    if (previewCategoryOverride) return previewCategoryOverride;
    if (activeTab === 'spek') return 'spek';
    if (activeTab === 'score') return 'score';
    if (activeTab === 'color') {
      return ['attributes', 'appeal', 'specialty'].includes(colorTargetField) ? 'spek' : 'score';
    }
    return 'spek';
  })();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleUseThemeDefaults = (enabled: boolean) => {
    onUpdateSettings({
      ...settings,
      layoutScoreConfig: {
        ...config,
        useThemeDefaults: enabled,
      },
    });
    showToast(enabled ? `Menyelaraskan Score & Spek ke Tema (${uiTheme.name})` : 'Beralih ke Kustomisasi Manual');
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
    showToast('Tata letak & visual score dikembalikan ke bawaan');
  };

  // Color target select
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

  // Preset definitions
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

  const scoreLayoutOptions: { id: ScoreLayoutStyle; label: string; desc: string; icon: string }[] = [
    { id: 'two_columns', label: '2 Kolom Bersebelahan', desc: 'Appearance kiri, Impression kanan', icon: '⚖️' },
    { id: 'stacked_rows', label: 'Baris Bertumpuk', desc: 'Lebar penuh atas & bawah', icon: '☰' },
    { id: 'tabbed_panels', label: 'Tabbed Panels', desc: 'Tab switch Appearance vs Impression', icon: '📑' },
    { id: 'compact_matrix', label: '12-Param Matrix', desc: 'Grid padat 12 parameter sekaligus', icon: '🔢' },
    { id: 'split_master', label: 'Split Master Score', desc: 'Overall rating kiri, detail kanan', icon: '🏆' },
    { id: 'bento_scores', label: 'Bento Box Scores', desc: 'Grid kotak bento asimetris', icon: '🍱' },
    { id: 'hud_dashboard', label: 'HUD Telemetry', desc: 'Dashboard analitik sci-fi', icon: '🔬' },
  ];

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
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 text-stone-950 font-bold text-xs shadow-2xl shadow-amber-500/30 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBack}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              isDark
                ? 'bg-stone-950 border-stone-800 hover:border-amber-500/60 text-stone-300 hover:text-white'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
            title="Kembali ke Pengaturan"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`text-lg sm:text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-stone-950'}`}>
                Pengaturan Tampilan Score & Spek
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                STICKY TOP PREVIEW
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Live preview menempel di bagian atas saat Anda menggulir opsi di bawah. Preview berganti otomatis mengikuti tab yang aktif.
            </p>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-stone-950 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:text-stone-950'
            }`}
            title="Kembalikan semua pengaturan score ke bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bawaan</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 1. STICKY TOP LIVE PREVIEW PANEL (PINNED AT THE TOP)                   */}
      {/* ========================================================================= */}
      <div className="sticky top-2 z-40 space-y-2">
        <div
          className={`rounded-3xl border shadow-2xl transition-all duration-200 backdrop-blur-xl ${
            previewDarkTheme
              ? 'bg-stone-950/95 border-amber-500/50 shadow-black/80 ring-1 ring-amber-500/20'
              : 'bg-white/95 border-amber-500/40 shadow-stone-400/40 ring-1 ring-amber-500/20'
          }`}
        >
          {/* Top Live Preview Toolbar Header */}
          <div className="p-3 sm:px-4 sm:py-3 border-b border-stone-800/80 flex items-center justify-between gap-2 flex-wrap">
            {/* Live Indicator & Active Preview Tab Badge */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black tracking-wider uppercase text-stone-100 flex items-center gap-2">
                <span>LIVE PREVIEW</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border transition-all ${
                    activePreviewMode === 'spek'
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-pink-500/20 text-pink-400 border-pink-500/40'
                  }`}
                >
                  {activePreviewMode === 'spek' ? '📐 PREVIEW SPEK' : '📊 PREVIEW SCORE'}
                </span>
              </span>
            </div>

            {/* Quick Preview Switcher (Spek vs Score) & Preview Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Preview Tab Selector */}
              <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCategoryOverride('spek');
                    setActiveTab('spek');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activePreviewMode === 'spek'
                      ? 'bg-cyan-500 text-stone-950 shadow-sm font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kategori Spek</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewCategoryOverride('score');
                    setActiveTab('score');
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activePreviewMode === 'score'
                      ? 'bg-pink-500 text-stone-950 shadow-sm font-black'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Kategori Score</span>
                </button>
              </div>

              {/* Sample Artist Switcher */}
              {artists && artists.length > 1 && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 font-medium">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <select
                    value={selectedArtistIndex}
                    onChange={(e) => setSelectedArtistIndex(parseInt(e.target.value))}
                    className="bg-stone-900 border border-stone-800 text-stone-200 text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer focus:border-amber-500 max-w-[130px] truncate"
                  >
                    {artists.slice(0, 10).map((a, i) => (
                      <option key={a.id} value={i}>
                        {a.firstName} {a.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Light/Dark Toggle */}
              <button
                type="button"
                onClick={() => setPreviewDarkTheme(!previewDarkTheme)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                  previewDarkTheme
                    ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                    : 'bg-stone-200 border-stone-300 text-stone-800 hover:text-stone-950'
                }`}
                title="Simulasikan Mode Terang / Gelap"
              >
                {previewDarkTheme ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-600" />}
              </button>

              {/* Collapse/Expand Toggle */}
              <button
                type="button"
                onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                className="p-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white cursor-pointer"
                title={isPreviewCollapsed ? 'Buka Preview Sticky' : 'Sembunyikan / Perkecil Preview'}
              >
                {isPreviewCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Live Component Render Area (Compact Scrollable Viewport with Height Cap) */}
          {!isPreviewCollapsed && (
            <div
              className={`p-4 max-h-[46vh] sm:max-h-[380px] overflow-y-auto space-y-3 transition-all ${
                previewDarkTheme ? 'bg-stone-950/90 text-white' : 'bg-stone-50/90 text-stone-950'
              }`}
            >
              {/* Sample Artist Mini Info Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono px-1 text-stone-400 pb-1 border-b border-stone-800/40">
                <span className="truncate font-bold text-amber-400">
                  Sampel Artis: {previewArtist.firstName} {previewArtist.lastName} ({previewArtist.countryCode})
                </span>
                <span className="shrink-0 text-stone-500 font-sans">{previewArtist.artistStatus || 'Profesional'}</span>
              </div>

              {/* TAB-ISOLATED PREVIEW: ONLY SPEK WHEN SPEK TAB IS ACTIVE */}
              {activePreviewMode === 'spek' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider px-1">
                    <span>Preview Nilai-Nilai Kategori Spek (Attributes, Appeal, Specialty)</span>
                    <span className="lowercase text-stone-500 font-mono">
                      {spekConfig.layout} • {spekConfig.visualStyle}
                    </span>
                  </div>
                  <SpekRenderer artist={previewArtist} config={spekConfig} isDark={previewDarkTheme} schema={schema} />
                </div>
              )}

              {/* TAB-ISOLATED PREVIEW: ONLY SCORE WHEN SCORE TAB IS ACTIVE */}
              {activePreviewMode === 'score' && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[10px] font-bold font-mono text-pink-400 uppercase tracking-wider px-1">
                    <span>Preview Nilai-Nilai Kategori Score (Appearance 60% + Impression 40%)</span>
                    <span className="lowercase text-stone-500 font-mono">
                      {scoreConfig.layout} • {scoreConfig.visualStyle}
                    </span>
                  </div>
                  <ScoreRenderer artist={previewArtist} config={scoreConfig} isDark={previewDarkTheme} schema={schema} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🛠️ 2. THEME DEFAULT TOGGLE & CONTROLS (BELOW STICKY PREVIEW)              */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        {/* Gunakan Bawaan Tema Card */}
        <div
          className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isUseThemeDefaults
              ? isDark
                ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/20'
                : 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400/20'
              : isDark
              ? 'bg-stone-900/60 border-stone-800'
              : 'bg-stone-100/80 border-stone-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-black text-stone-100 flex items-center gap-2">
                  <LayoutTemplate className="w-5 h-5 text-amber-400" />
                  <span>Gunakan Bawaan Tema</span>
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isUseThemeDefaults
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {isUseThemeDefaults ? 'AKTIF (MENGIKUTI TEMA)' : 'KUSTOM MANUAL'}
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
                {isUseThemeDefaults ? (
                  <span>
                    Tampilan Score & Spek saat ini otomatis mengikuti rancangan bawaan tema aktif:{' '}
                    <strong className="text-amber-300 font-semibold">{uiTheme.name}</strong> ({uiTheme.category}).
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isUseThemeDefaults
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/25'
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
            <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2 flex-wrap text-xs text-stone-400">
              <span className="flex items-center gap-1.5 text-amber-400/90 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Spek: <strong className="text-stone-200">{spekConfig.layout}</strong> ({spekConfig.visualStyle}) • Score:{' '}
                  <strong className="text-stone-200">{scoreConfig.layout}</strong> ({scoreConfig.visualStyle})
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleToggleUseThemeDefaults(false)}
                className="text-stone-400 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer text-xs"
              >
                Ubah ke Kustomisasi Manual
              </button>
            </div>
          )}
        </div>

        {/* Main Control Tabs */}
        <div
          className={`flex items-center gap-1 p-1 rounded-2xl border transition-all ${
            isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-stone-100 border-stone-200'
          }`}
        >
          {[
            { id: 'spek' as const, label: 'Kategori Spek', icon: Layers, count: '3 Sub-Kategori' },
            { id: 'score' as const, label: 'Kategori Score', icon: BarChart3, count: '12 Parameter' },
            { id: 'color' as const, label: 'Palet & Warna', icon: Palette, count: 'Slider Spectrum' },
            { id: 'presets' as const, label: 'Preset Siap Pakai', icon: Sparkles, count: '14+ Preset' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPreviewCategoryOverride(null);
                }}
                className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 scale-[1.01]'
                    : isDark
                    ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-white/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: KATEGORI SPEK */}
        {activeTab === 'spek' && (
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-6 animate-in fade-in duration-150 ${
              isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Kategori Spek (Attributes, Appeal, Specialty)</h2>
                  <p className="text-[11px] text-stone-400">Atur tata letak struktur dan gaya kartu visual sub-kategori spek</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400">{spekConfig.layout}</span>
            </div>

            {/* 1. Tata Letak Spek */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
                1. Pilih Tata Letak Struktur (Layout Grid)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {spekLayoutOptions.map((opt) => {
                  const selected = spekConfig.layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateSpek({ layout: opt.id })}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        selected
                          ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{opt.icon}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate text-stone-100">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Visual Style Spek */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
                2. Pilih Gaya Desain Komponen (Visual Style)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {spekVisualOptions.map((opt) => {
                  const selected = spekConfig.visualStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateSpek({ visualStyle: opt.id })}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        selected
                          ? 'border-cyan-400 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10 ring-1 ring-cyan-400/50'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{opt.icon}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate text-stone-100">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Spacing & Density */}
            <div className="space-y-2 pt-2 border-t border-stone-800/70">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300">Kerapatan / Spacing Komponen:</span>
                <span className="font-mono font-bold text-cyan-400">Level {spekConfig.spacing || 3}</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleUpdateSpek({ spacing: lvl as any })}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      (spekConfig.spacing || 3) === lvl
                        ? 'bg-cyan-500 text-stone-950 border-cyan-400 shadow-sm'
                        : isDark
                        ? 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        : 'bg-stone-100 border-stone-200 text-stone-600'
                    }`}
                  >
                    {lvl === 1 ? '1 Compact' : lvl === 5 ? '5 Spacious' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fitur & Toggle Spek */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800/70">
              <button
                type="button"
                onClick={() => handleUpdateSpek({ showIcons: !spekConfig.showIcons })}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer ${
                  spekConfig.showIcons
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                <span>Tampilkan Ikon Kategori Spek</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${spekConfig.showIcons ? 'bg-cyan-500 text-stone-950' : 'bg-stone-800'}`}>
                  {spekConfig.showIcons && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateSpek({ showHelpButtons: !spekConfig.showHelpButtons })}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer ${
                  spekConfig.showHelpButtons
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                <span>Tombol Bantuan (?) Panduan Parameter</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${spekConfig.showHelpButtons ? 'bg-cyan-500 text-stone-950' : 'bg-stone-800'}`}>
                  {spekConfig.showHelpButtons && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KATEGORI SCORE */}
        {activeTab === 'score' && (
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-6 animate-in fade-in duration-150 ${
              isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Kategori Score (Appearance 60% + Impression 40%)</h2>
                  <p className="text-[11px] text-stone-400">Atur tata letak metrik skor nilai fisik dan karisma profil</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-pink-400">{scoreConfig.layout}</span>
            </div>

            {/* 1. Tata Letak Score */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
                1. Pilih Tata Letak Struktur Skor
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {scoreLayoutOptions.map((opt) => {
                  const selected = scoreConfig.layout === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateScore({ layout: opt.id })}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        selected
                          ? 'border-pink-400 bg-pink-950/30 text-white shadow-md shadow-pink-500/10 ring-1 ring-pink-400/50'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{opt.icon}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate text-stone-100">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Visual Style Score */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
                2. Pilih Gaya Tampilan Nilai (Score Visual Style)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {scoreVisualOptions.map((opt) => {
                  const selected = scoreConfig.visualStyle === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateScore({ visualStyle: opt.id })}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        selected
                          ? 'border-pink-400 bg-pink-950/30 text-white shadow-md shadow-pink-500/10 ring-1 ring-pink-400/50'
                          : isDark
                          ? 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{opt.icon}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold truncate text-stone-100">{opt.label}</div>
                        <div className="text-[10px] text-stone-500 line-clamp-1">{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Spacing & Number Precision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-800/70">
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-300 block">Kerapatan / Spacing:</span>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleUpdateScore({ spacing: lvl as any })}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        (scoreConfig.spacing || 3) === lvl
                          ? 'bg-pink-500 text-stone-950 border-pink-400 shadow-sm'
                          : isDark
                          ? 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                          : 'bg-stone-100 border-stone-200 text-stone-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-300 block">Format Angka Skor:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateScore({ numberPrecision: 'integer' })}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      scoreConfig.numberPrecision === 'integer'
                        ? 'bg-pink-500 text-stone-950 border-pink-400'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    Bulat (92)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateScore({ numberPrecision: 'decimal_1' })}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      scoreConfig.numberPrecision === 'decimal_1'
                        ? 'bg-pink-500 text-stone-950 border-pink-400'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    1 Desimal (92.4)
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Fitur & Toggle Score */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-800/70">
              <button
                type="button"
                onClick={() => handleUpdateScore({ showWeightBadges: !scoreConfig.showWeightBadges })}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer ${
                  scoreConfig.showWeightBadges
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                <span>Tampilkan Label Bobot % (Appearance 60%, Impression 40%)</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${scoreConfig.showWeightBadges ? 'bg-pink-500 text-stone-950' : 'bg-stone-800'}`}>
                  {scoreConfig.showWeightBadges && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleUpdateScore({ showHelpButtons: !scoreConfig.showHelpButtons })}
                className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer ${
                  scoreConfig.showHelpButtons
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-300'
                    : 'bg-stone-950/60 border-stone-800 text-stone-400'
                }`}
              >
                <span>Tombol Bantuan (?) Panduan Parameter</span>
                <div className={`w-4 h-4 rounded flex items-center justify-center ${scoreConfig.showHelpButtons ? 'bg-pink-500 text-stone-950' : 'bg-stone-800'}`}>
                  {scoreConfig.showHelpButtons && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PALET WARNA & SPECTRUM */}
        {activeTab === 'color' && (
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-6 animate-in fade-in duration-150 ${
              isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Palet Warna Sub-Kategori</h2>
                  <p className="text-[11px] text-stone-400">Pilih sub-kategori target dan sesuaikan warna aksennya</p>
                </div>
              </div>
            </div>

            {/* Target Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300">Pilih Sub-Kategori Target Warna:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'appearance' as const, label: 'Appearance (Fisik)', color: scoreConfig.appearanceColor || '#06B6D4' },
                  { id: 'impression' as const, label: 'Impression (Karisma)', color: scoreConfig.impressionColor || '#EC4899' },
                  { id: 'overall' as const, label: 'Overall Total Score', color: scoreConfig.overallColor || '#F59E0B' },
                  { id: 'attributes' as const, label: 'Atribut / Ciri', color: spekConfig.attributesColor || '#00E5FF' },
                  { id: 'appeal' as const, label: 'Daya Tarik / Appeal', color: spekConfig.appealColor || '#F59E0B' },
                  { id: 'specialty' as const, label: 'Keahlian / Specialty', color: spekConfig.specialtyColor || '#10B981' },
                ].map((field) => {
                  const selected = colorTargetField === field.id;
                  return (
                    <button
                      key={field.id}
                      type="button"
                      onClick={() => handleSelectColorTarget(field.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        selected
                          ? 'border-amber-400 bg-amber-500/10 text-white ring-1 ring-amber-400/50 shadow-sm'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: field.color }} />
                        <span className="text-xs font-bold truncate">{field.label}</span>
                      </div>
                      {selected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spectrum Slider */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300">Spectrum Color Slider:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="w-4 h-4 rounded-md shadow-sm" style={{ backgroundColor: hexInput }} />
                  <span className="font-bold text-white tracking-wider">{hexInput}</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                value={sliderHue}
                onChange={(e) => {
                  const hue = parseInt(e.target.value);
                  setSliderHue(hue);
                  const hex = hslToHex(hue, 90, 52);
                  setHexInput(hex);
                  handleApplyColorToField(hex);
                }}
                className="w-full h-3.5 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />

              {/* Color Chips Presets */}
              <div className="pt-3 border-t border-stone-800/80">
                <span className="text-[11px] text-stone-400 block mb-2.5 font-bold">Preset Warna Siap Pakai:</span>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {colorPresets.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setHexInput(c);
                        setSliderHue(hexToHue(c));
                        handleApplyColorToField(c);
                      }}
                      className={`w-8 h-8 rounded-xl border-2 transition-transform hover:scale-110 cursor-pointer ${
                        hexInput.toUpperCase() === c.toUpperCase() ? 'border-white scale-110 shadow-md ring-2 ring-amber-400' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PRESET SIAP PAKAI */}
        {activeTab === 'presets' && (
          <div
            className={`p-5 sm:p-6 rounded-3xl border shadow-xl space-y-6 animate-in fade-in duration-150 ${
              isDark ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/70">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Preset Desain Siap Pakai (1-Click Apply)</h2>
                  <p className="text-[11px] text-stone-400">Pilih tema preset terintegrasi untuk Spek & Score</p>
                </div>
              </div>
            </div>

            {/* Spek Presets */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Layers className="w-3.5 h-3.5" />
                <span>Preset Kategori Spek (Attributes, Appeal, Specialty)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SPEK_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      handleUpdateSpek(preset.config);
                      setPreviewCategoryOverride('spek');
                      showToast(`Preset Spek "${preset.name}" diterapkan`);
                    }}
                    className="p-3.5 rounded-2xl border border-stone-800 bg-stone-950/70 hover:border-cyan-500/60 hover:bg-stone-900 text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-xs font-bold text-stone-100 group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2">{preset.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>

            {/* Score Presets */}
            <div className="space-y-2.5 pt-4 border-t border-stone-800/70">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-400">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Preset Kategori Score (Appearance & Impression)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SCORE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      handleUpdateScore(preset.config);
                      setPreviewCategoryOverride('score');
                      showToast(`Preset Score "${preset.name}" diterapkan`);
                    }}
                    className="p-3.5 rounded-2xl border border-stone-800 bg-stone-950/70 hover:border-pink-500/60 hover:bg-stone-900 text-left transition-all group flex items-start justify-between cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{preset.icon}</span>
                        <span className="text-xs font-bold text-stone-100 group-hover:text-pink-300 transition-colors">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-pink-500/15 text-pink-400 border border-pink-500/30">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 line-clamp-2">{preset.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
