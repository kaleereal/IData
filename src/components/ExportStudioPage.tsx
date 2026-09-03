import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Artist,
  DatabaseSchema,
  ExportPageRatio,
  ExportTheme,
  ExportPadding,
  ExportFontScale,
  ExportVisibleFields,
  ExportStudioPreferences,
} from '../types';
import {
  calculateAge,
  calculateAgeAtDebut,
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  getCountryFlag,
  getTypeInfo,
} from '../utils/calculations';
import {
  ArrowLeft,
  Download,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Award,
  Calendar,
  Ruler,
  Eye,
  Smile,
  Activity,
  Sliders,
  RotateCcw,
  Palette,
  Maximize2,
  Check,
  Layout,
  Type,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Star,
  Layers,
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

const EXPORT_PREFS_STORAGE_KEY = 'talent_rating_export_studio_preferences';

const DEFAULT_EXPORT_PREFERENCES: ExportStudioPreferences = {
  ratio: 'a4',
  theme: 'dark_modern',
  padding: 'normal',
  fontScale: 'normal',
  fields: {
    avatar: true,
    biodata: true,
    measurements: true,
    rankingRating: true,
    attributes: true,
    specialty: true,
    appeal: true,
    appearance: true,
    impression: true,
    footerNotes: true,
  },
};

interface ExportStudioPageProps {
  artist: Artist;
  allArtists?: Artist[];
  schema: DatabaseSchema;
  onBack: () => void;
}

export const ExportStudioPage: React.FC<ExportStudioPageProps> = ({
  artist,
  allArtists = [],
  schema,
  onBack,
}) => {
  // -------------------------------------------------------------
  // PREFERENCE STATE WITH AUTO-SAVE (LOCAL STORAGE)
  // -------------------------------------------------------------
  const [preferences, setPreferences] = useState<ExportStudioPreferences>(() => {
    try {
      const saved = localStorage.getItem(EXPORT_PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ratio: parsed.ratio || DEFAULT_EXPORT_PREFERENCES.ratio,
          theme: parsed.theme || DEFAULT_EXPORT_PREFERENCES.theme,
          padding: parsed.padding || DEFAULT_EXPORT_PREFERENCES.padding,
          fontScale: parsed.fontScale || DEFAULT_EXPORT_PREFERENCES.fontScale,
          fields: {
            ...DEFAULT_EXPORT_PREFERENCES.fields,
            ...(parsed.fields || {}),
          },
        };
      }
    } catch (e) {
      console.error('Failed to parse export studio preferences', e);
    }
    return DEFAULT_EXPORT_PREFERENCES;
  });

  // Automatically remember/persist preferences on change
  useEffect(() => {
    try {
      localStorage.setItem(EXPORT_PREFS_STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save export studio preferences', e);
    }
  }, [preferences]);

  // Export process state
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeConfigTab, setActiveConfigTab] = useState<'ratio' | 'theme' | 'layout' | 'fields'>(
    'ratio'
  );
  const [previewZoom, setPreviewZoom] = useState<'fit' | 'fill'>('fit');

  const exportCanvasRef = useRef<HTMLDivElement | null>(null);

  // Swipe gesture to go back
  useSwipeGesture({
    onSwipeRight: onBack,
    minDistance: 50,
  });

  // Calculate scores & metrics
  const appScore = calculateAppearanceScore(artist.appearanceScores);
  const impScore = calculateImpressionScore(artist.impressionScores);
  const overallRating = calculateOverallRating(appScore, impScore);
  const propRating = calculateProportionalRating(artist.measurements);
  const age = calculateAge(artist.bornDate);
  const ageAtDebut = calculateAgeAtDebut(artist.bornDate, artist.debutDate);
  const flag = getCountryFlag(artist.countryCode, artist.country);
  const typeInfo = getTypeInfo(artist.typeCode);

  // Calculate rank among all artists if available
  const artistRank = useMemo(() => {
    if (!allArtists || allArtists.length === 0) return null;
    const sorted = [...allArtists].sort((a, b) => {
      const aScore = calculateOverallRating(
        calculateAppearanceScore(a.appearanceScores),
        calculateImpressionScore(a.impressionScores)
      );
      const bScore = calculateOverallRating(
        calculateAppearanceScore(b.appearanceScores),
        calculateImpressionScore(b.impressionScores)
      );
      return bScore - aScore;
    });
    const rankIndex = sorted.findIndex(a => a.id === artist.id);
    return rankIndex >= 0 ? rankIndex + 1 : null;
  }, [allArtists, artist.id]);

  // Status badge styling
  const statusLabel = artist.artistStatus || 'Amatir';
  const statusColor =
    artist.artistStatus === 'Top Tier'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
      : artist.artistStatus === 'High Class'
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
      : artist.artistStatus === 'Pro'
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
      : artist.artistStatus === 'Semi Pro'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
      : 'bg-stone-800 text-stone-300 border-stone-700';

  // Theme style mapping
  const themeStyles = useMemo(() => {
    switch (preferences.theme) {
      case 'clean_light':
        return {
          container: 'bg-white text-stone-900 border-stone-200 shadow-xl',
          card: 'bg-stone-50 border-stone-200 text-stone-800',
          accentText: 'text-amber-700',
          accentBg: 'bg-amber-100 text-amber-900 border-amber-300',
          highlight: 'text-stone-950 font-black',
          subtext: 'text-stone-600',
          border: 'border-stone-200',
          scoreBarBg: 'bg-stone-200',
          scoreBarFillApp: 'bg-emerald-600',
          scoreBarFillImp: 'bg-indigo-600',
          headerBg: 'bg-stone-100 border-stone-200',
          tagBg: 'bg-stone-100 border-stone-200 text-stone-800',
          isLight: true,
          canvasBg: '#ffffff',
        };
      case 'amber_gold':
        return {
          container: 'bg-stone-950 text-amber-50 border-amber-500/40 shadow-2xl',
          card: 'bg-stone-900/90 border-amber-500/30 text-stone-100',
          accentText: 'text-amber-400',
          accentBg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          highlight: 'text-amber-200 font-black',
          subtext: 'text-stone-400',
          border: 'border-amber-500/30',
          scoreBarBg: 'bg-stone-900',
          scoreBarFillApp: 'bg-amber-500',
          scoreBarFillImp: 'bg-amber-400',
          headerBg: 'bg-stone-900 border-amber-500/30',
          tagBg: 'bg-amber-950/60 border-amber-500/40 text-amber-200',
          isLight: false,
          canvasBg: '#0c0a09',
        };
      case 'classic_monochrome':
        return {
          container: 'bg-stone-950 text-stone-100 border-stone-700 shadow-2xl',
          card: 'bg-stone-900 border-stone-700 text-stone-100',
          accentText: 'text-white',
          accentBg: 'bg-stone-800 text-stone-200 border-stone-600',
          highlight: 'text-white font-black',
          subtext: 'text-stone-400',
          border: 'border-stone-700',
          scoreBarBg: 'bg-stone-800',
          scoreBarFillApp: 'bg-stone-400',
          scoreBarFillImp: 'bg-stone-300',
          headerBg: 'bg-stone-900 border-stone-700',
          tagBg: 'bg-stone-800 border-stone-600 text-stone-200',
          isLight: false,
          canvasBg: '#09090b',
        };
      case 'dark_modern':
      default:
        return {
          container: 'bg-stone-950 text-stone-100 border-stone-800 shadow-2xl',
          card: 'bg-stone-900 border-stone-800 text-stone-100',
          accentText: 'text-amber-400',
          accentBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          highlight: 'text-white font-black',
          subtext: 'text-stone-400',
          border: 'border-stone-800',
          scoreBarBg: 'bg-stone-800',
          scoreBarFillApp: 'bg-emerald-500',
          scoreBarFillImp: 'bg-indigo-500',
          headerBg: 'bg-stone-900/90 border-stone-800',
          tagBg: 'bg-stone-900 border-stone-800 text-stone-300',
          isLight: false,
          canvasBg: '#0c0a09',
        };
    }
  }, [preferences.theme]);

  // Padding styles
  const paddingClass = useMemo(() => {
    switch (preferences.padding) {
      case 'compact':
        return 'p-4 sm:p-5 space-y-3';
      case 'spacious':
        return 'p-8 sm:p-12 space-y-7';
      case 'normal':
      default:
        return 'p-6 sm:p-8 space-y-5';
    }
  }, [preferences.padding]);

  // Font scale styles
  const fontScaleStyle = useMemo(() => {
    switch (preferences.fontScale) {
      case 'small':
        return { transform: 'scale(0.92)', transformOrigin: 'top center' };
      case 'large':
        return { transform: 'scale(1.08)', transformOrigin: 'top center' };
      case 'xlarge':
        return { transform: 'scale(1.16)', transformOrigin: 'top center' };
      case 'normal':
      default:
        return {};
    }
  }, [preferences.fontScale]);

  // Aspect ratio dimension specifications
  const ratioSpec = useMemo(() => {
    switch (preferences.ratio) {
      case 'card':
        return {
          label: 'Card (1:1)',
          desc: '1080 x 1080 px Square',
          aspect: 'aspect-square',
          width: '780px',
          pdfFormat: [210, 210] as [number, number],
        };
      case 'story':
        return {
          label: 'Story (9:16)',
          desc: '1080 x 1920 px Vertical',
          aspect: 'aspect-[9/16]',
          width: '680px',
          pdfFormat: [210, 373] as [number, number],
        };
      case 'letter':
        return {
          label: 'Letter (8.5x11")',
          desc: '215.9 x 279.4 mm Document',
          aspect: 'aspect-[8.5/11]',
          width: '800px',
          pdfFormat: 'letter' as const,
        };
      case 'a4':
      default:
        return {
          label: 'A4 (210x297mm)',
          desc: 'Standar Dokumen & Arsip',
          aspect: 'aspect-[210/297]',
          width: '800px',
          pdfFormat: 'a4' as const,
        };
    }
  }, [preferences.ratio]);

  // File name generator
  const cleanFileName = useMemo(() => {
    const name = `${artist.firstName}_${artist.lastName}`.trim().replace(/\s+/g, '_');
    return `${name}_Profile_${preferences.ratio.toUpperCase()}`;
  }, [artist.firstName, artist.lastName, preferences.ratio]);

  // Field toggle helper
  const handleToggleField = (fieldKey: keyof ExportVisibleFields) => {
    setPreferences(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: !prev.fields[fieldKey],
      },
    }));
  };

  const handleSelectAllFields = (val: boolean) => {
    setPreferences(prev => ({
      ...prev,
      fields: {
        avatar: val,
        biodata: val,
        measurements: val,
        rankingRating: val,
        attributes: val,
        specialty: val,
        appeal: val,
        appearance: val,
        impression: val,
        footerNotes: val,
      },
    }));
  };

  // Reset to default preferences
  const handleResetPreferences = () => {
    setPreferences(DEFAULT_EXPORT_PREFERENCES);
    setStatusMessage('Preferensi ekspor di-reset ke setelan awal.');
    setTimeout(() => setStatusMessage(''), 2500);
  };

  // -------------------------------------------------------------
  // PNG EXPORT ENGINE
  // -------------------------------------------------------------
  const handleExportPNG = async () => {
    if (!exportCanvasRef.current) return;
    try {
      setIsExporting('png');
      setStatusMessage('Mengonversi kanvas profil artis ke gambar PNG resolusi tinggi...');

      const element = exportCanvasRef.current;
      const dataUrl = await toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: themeStyles.canvasBg,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const link = document.createElement('a');
      link.download = `${cleanFileName}.png`;
      link.href = dataUrl;
      link.click();

      setStatusMessage('✓ Gambar PNG berkualitas tinggi berhasil diunduh!');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setStatusMessage('Gagal mengunduh gambar PNG. Silakan coba kembali.');
      setTimeout(() => setStatusMessage(''), 4000);
    } finally {
      setIsExporting(null);
    }
  };

  // -------------------------------------------------------------
  // PDF EXPORT ENGINE
  // -------------------------------------------------------------
  const handleExportPDF = async () => {
    if (!exportCanvasRef.current) return;
    try {
      setIsExporting('pdf');
      setStatusMessage('Menyusun lembar PDF beresolusi tinggi...');

      const element = exportCanvasRef.current;
      const imgData = await toJpeg(element, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: themeStyles.canvasBg,
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memuat visual render untuk PDF'));
      });

      let pdfWidth = 210;
      let pdfHeight = 297;
      let format: any = 'a4';

      if (preferences.ratio === 'card') {
        pdfWidth = 210;
        pdfHeight = 210;
        format = [210, 210];
      } else if (preferences.ratio === 'story') {
        pdfWidth = 210;
        pdfHeight = (210 * 16) / 9;
        format = [210, pdfHeight];
      } else if (preferences.ratio === 'letter') {
        pdfWidth = 215.9;
        pdfHeight = 279.4;
        format = 'letter';
      }

      // Calculate actual element aspect ratio
      const computedImgHeight = (img.naturalHeight * pdfWidth) / img.naturalWidth;
      const finalPdfHeight = Math.max(pdfHeight, computedImgHeight);

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: typeof format === 'string' && computedImgHeight <= pdfHeight ? format : [pdfWidth, finalPdfHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, computedImgHeight);
      pdf.save(`${cleanFileName}.pdf`);

      setStatusMessage('✓ Dokumen PDF resmi berhasil diunduh!');
      setTimeout(() => setStatusMessage(''), 3500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setStatusMessage('Gagal menyusun PDF. Silakan coba kembali.');
      setTimeout(() => setStatusMessage(''), 4000);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TITLE BAR                                                 */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-4 sm:p-5 rounded-2xl backdrop-blur-md shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700/80 transition-colors shadow-xs"
            title="Kembali ke Detail Artis"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Export Studio Artis</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  PNG & PDF
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400">
              Kustomisasi layout, bidang, dan tema visual untuk{' '}
              <strong className="text-stone-200 font-bold">
                {artist.firstName} {artist.lastName}
              </strong>
            </p>
          </div>
        </div>

        {/* Quick Reset & Status Message */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {statusMessage && (
            <span className="text-xs text-amber-400 font-semibold animate-pulse mr-2">
              {statusMessage}
            </span>
          )}
          <button
            type="button"
            onClick={handleResetPreferences}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold transition-colors"
            title="Kembalikan semua preferensi ekspor ke bawaan"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Setelan</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STICKY TOP MINI PREVIEW & QUICK EXPORT ACTIONS                         */}
      {/* ========================================================================= */}
      <div className="sticky top-14 sm:top-16 z-30 bg-stone-950/95 border border-stone-800/90 rounded-2xl p-3 sm:p-4 backdrop-blur-xl shadow-2xl space-y-3">
        {/* Preview Control Bar */}
        <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-stone-200 uppercase tracking-wider">
              Live Preview Mini
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-900 border border-stone-700 text-stone-400">
              {ratioSpec.label} • {preferences.theme.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Quick Action Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Unduh Gambar PNG Resolusi Tinggi"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isExporting === 'png' ? 'Memproses...' : 'Unduh PNG'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting !== null}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Unduh Dokumen PDF Resmi"
            >
              <FileText className="w-4 h-4" />
              <span>{isExporting === 'pdf' ? 'Menyusun...' : 'Unduh PDF'}</span>
            </button>
          </div>
        </div>

        {/* Scaled Preview Viewport */}
        <div className="relative w-full max-h-[360px] sm:max-h-[420px] overflow-y-auto overflow-x-hidden rounded-xl bg-stone-900/60 border border-stone-800/80 p-3 flex items-start justify-center shadow-inner">
          <div
            style={{
              width: '100%',
              maxWidth: ratioSpec.width,
              ...fontScaleStyle,
            }}
            className="transition-all duration-200 origin-top"
          >
            {/* The Actual Render Canvas */}
            <div
              ref={exportCanvasRef}
              className={`w-full rounded-2xl border ${themeStyles.container} ${paddingClass} ${ratioSpec.aspect} overflow-hidden`}
              style={{
                boxSizing: 'border-box',
              }}
            >
              {/* Profile Header (Avatar + Name + Status + Overall Rating) */}
              <div
                className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b ${themeStyles.border} pb-4`}
              >
                <div className="flex items-center gap-3.5">
                  {preferences.fields.avatar && (
                    <div
                      className={`w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border-2 shrink-0 ${themeStyles.border} shadow-md bg-stone-900`}
                    >
                      <img
                        src={artist.avatarUrl}
                        alt={artist.firstName}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className={`flex items-center gap-1.5 text-xs font-mono font-bold ${themeStyles.accentText}`}>
                      <span>
                        {flag} {artist.country}
                      </span>
                      <span>•</span>
                      <span>{typeInfo.indonesia || typeInfo.code}</span>
                      {artistRank !== null && preferences.fields.rankingRating && (
                        <>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-black">
                            RANK #{artistRank}
                          </span>
                        </>
                      )}
                    </div>
                    <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${themeStyles.highlight}`}>
                      {artist.firstName} {artist.lastName}
                    </h1>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border font-mono ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                      <span className={`text-[11px] font-mono ${themeStyles.subtext}`}>
                        {artist.appeal?.bodyShape || '-'} • {artist.appeal?.maturity || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overall Rating Box */}
                {preferences.fields.rankingRating && (
                  <div
                    className={`p-3 rounded-xl border ${themeStyles.card} text-right min-w-[120px] shrink-0 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end`}
                  >
                    <span className={`text-[9px] uppercase font-bold tracking-wider ${themeStyles.subtext}`}>
                      Overall Rating
                    </span>
                    <div className={`text-xl sm:text-2xl font-black font-mono ${themeStyles.accentText}`}>
                      ★ {Math.round(overallRating)}
                      <span className="text-[10px] opacity-60 font-normal"> /99</span>
                    </div>
                    <span className={`text-[9.5px] font-mono ${themeStyles.subtext}`}>
                      APP: {appScore.toFixed(1)} | IMP: {impScore.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Section: Biodata & Kelahiran */}
              {preferences.fields.biodata && (
                <div className="space-y-1.5">
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider ${themeStyles.accentText} flex items-center gap-1.5`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>BIODATA & KELAHIRAN</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Tanggal Lahir
                      </span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.bornDate || '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>Usia</span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {age ? `${age} tahun` : '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Tinggi Badan
                      </span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.heightCm ? `${artist.heightCm} cm` : '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>Debut</span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.debutDate || '-'} {ageAtDebut ? `(${ageAtDebut} th)` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Measurements & Proporsi */}
              {preferences.fields.measurements && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-pink-400`}
                    >
                      <Ruler className="w-3 h-3" />
                      <span>MEASUREMENTS & PROPORSI</span>
                    </span>
                    <span className="font-mono text-pink-400 font-bold text-[10px]">
                      Proportion: {propRating} PTS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>Cup Size</span>
                      <span className="text-xs font-black text-pink-400">
                        {artist.measurements?.cupSize || '-'} Cup
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Dada (Bust)
                      </span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.measurements?.bustCm || '-'} cm
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Pinggang (Waist)
                      </span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.measurements?.waistCm || '-'} cm
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Pinggul (Hip)
                      </span>
                      <span className={`text-xs font-bold font-mono ${themeStyles.highlight}`}>
                        {artist.measurements?.hipCm || '-'} cm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Attributes */}
              {preferences.fields.attributes && (
                <div className="space-y-1.5">
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>SPECIAL ATTRIBUTES</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${themeStyles.card} flex flex-wrap gap-1.5`}>
                    {artist.attributes && artist.attributes.length > 0 ? (
                      artist.attributes.map((attr, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[11px] font-semibold"
                        >
                          {attr}
                        </span>
                      ))
                    ) : (
                      <span className={`text-[11px] italic ${themeStyles.subtext}`}>
                        Tidak ada atribut khusus
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Specialty */}
              {preferences.fields.specialty && (
                <div className="space-y-1.5">
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5`}
                  >
                    <Award className="w-3 h-3" />
                    <span>SPECIALTY & TALENTA</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${themeStyles.card} flex flex-wrap gap-1.5`}>
                    {artist.specialty && artist.specialty.length > 0 ? (
                      artist.specialty.map((spec, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-200 text-[11px] font-semibold"
                        >
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className={`text-[11px] italic ${themeStyles.subtext}`}>
                        Tidak ada spesialisasi terdaftar
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Appeal */}
              {preferences.fields.appeal && (
                <div className="space-y-1.5">
                  <div
                    className={`text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5`}
                  >
                    <Smile className="w-3 h-3" />
                    <span>APPEAL & DAYA TARIK</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>Body Shape</span>
                      <span className={`text-xs font-bold ${themeStyles.highlight}`}>
                        {artist.appeal?.bodyShape || '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card}`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>Maturity</span>
                      <span className="text-xs font-bold text-amber-400">
                        {artist.appeal?.maturity || '-'}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${themeStyles.card} col-span-2 sm:col-span-1`}>
                      <span className={`text-[9px] block uppercase ${themeStyles.subtext}`}>
                        Main Appeal / Aura
                      </span>
                      <span className="text-xs font-bold text-rose-400 truncate block">
                        {artist.appeal?.mainAppeal || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Appearance Scores */}
              {preferences.fields.appearance && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-emerald-400`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>SKOR PENAMPILAN (APPEARANCE)</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">
                      Avg: {appScore.toFixed(1)}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${themeStyles.card} grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs`}>
                    {Object.entries(artist.appearanceScores || {}).map(([key, val]) => {
                      const numericVal = typeof val === 'number' ? val : Number(val) || 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`capitalize ${themeStyles.subtext}`}>{key}</span>
                            <span className={`font-mono font-bold ${themeStyles.highlight}`}>{numericVal}</span>
                          </div>
                          <div className={`h-1.5 ${themeStyles.scoreBarBg} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full ${themeStyles.scoreBarFillApp} rounded-full`}
                              style={{ width: `${Math.min(100, Math.max(0, numericVal))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section: Impression Scores */}
              {preferences.fields.impression && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5 text-indigo-400`}
                    >
                      <Activity className="w-3 h-3" />
                      <span>SKOR KESAN (IMPRESSION)</span>
                    </span>
                    <span className="font-mono text-indigo-400 font-bold text-[10px]">
                      Avg: {impScore.toFixed(1)}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${themeStyles.card} grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs`}>
                    {Object.entries(artist.impressionScores || {}).map(([key, val]) => {
                      const numericVal = typeof val === 'number' ? val : Number(val) || 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className={`capitalize ${themeStyles.subtext}`}>{key}</span>
                            <span className={`font-mono font-bold ${themeStyles.highlight}`}>{numericVal}</span>
                          </div>
                          <div className={`h-1.5 ${themeStyles.scoreBarBg} rounded-full overflow-hidden`}>
                            <div
                              className={`h-full ${themeStyles.scoreBarFillImp} rounded-full`}
                              style={{ width: `${Math.min(100, Math.max(0, numericVal))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Footer / Watermark */}
              {preferences.fields.footerNotes && (
                <div
                  className={`pt-3 border-t ${themeStyles.border} flex items-center justify-between text-[9px] ${themeStyles.subtext} font-mono`}
                >
                  <span>Talent Profile System • Export Studio</span>
                  <span>Generated on {new Date().toLocaleDateString('id-ID')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CATEGORIZED SETTINGS SUITE (AREA BAWAH HALAMAN)                         */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'ratio', label: 'Ukuran & Rasio Kertas', icon: <Layout className="w-3.5 h-3.5" /> },
            { id: 'theme', label: 'Tema Tampilan', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'layout', label: 'Layout & Tipografi', icon: <Type className="w-3.5 h-3.5" /> },
            { id: 'fields', label: 'Visibilitas Bidang', icon: <Sliders className="w-3.5 h-3.5" /> },
          ].map(tab => {
            const isActive = activeConfigTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveConfigTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm font-black'
                    : 'bg-stone-950/60 text-stone-400 hover:text-stone-200 border-stone-800/80 hover:bg-stone-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Ukuran & Rasio Kertas / Layar */}
        {activeConfigTab === 'ratio' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layout className="w-4 h-4 text-amber-400" />
                <span>Pilih Rasio & Format Ukuran Layar / Dokumen</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Sesuaikan dimensi kanvas visual dengan target output penyimpanan (media sosial, feed, atau cetak lembar arsip).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'card',
                  title: 'Card Square (1:1)',
                  desc: '1080 x 1080 px • Ideal untuk avatar, feed medsos, dan album cover',
                  icon: '🔲',
                },
                {
                  id: 'story',
                  title: 'Story Vertical (9:16)',
                  desc: '1080 x 1920 px • Pas untuk smartphone, Instagram Story & TikTok',
                  icon: '📱',
                },
                {
                  id: 'a4',
                  title: 'A4 Document (1:1.414)',
                  desc: '210 x 297 mm • Standar dokumen cetak resmi & biodata internasional',
                  icon: '📄',
                },
                {
                  id: 'letter',
                  title: 'Letter Document (1:1.294)',
                  desc: '8.5 x 11 inci • Format standar arsip kertas & presentasi',
                  icon: '📑',
                },
              ].map(opt => {
                const isSelected = preferences.ratio === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setPreferences(prev => ({ ...prev, ratio: opt.id as ExportPageRatio }))
                    }
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{opt.icon}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Tema Tampilan Khusus Ekspor */}
        {activeConfigTab === 'theme' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Pilih Tema Skema Warna Ekspor</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Pilih estetika warna visual yang paling cocok untuk dicetak atau disimpan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'dark_modern',
                  title: 'Dark Modern',
                  desc: 'Kanvas hitam obsidian, aksen amber & cyan neon modern berkelas',
                  bgPreview: 'bg-stone-950 border-stone-800',
                  accent: 'bg-amber-500',
                },
                {
                  id: 'clean_light',
                  title: 'Clean Light',
                  desc: 'Kanvas putih cerah platinum, kontras tinggi & cocok untuk cetak printer',
                  bgPreview: 'bg-white border-stone-300 text-stone-900',
                  accent: 'bg-amber-600',
                },
                {
                  id: 'amber_gold',
                  title: 'Amber Gold Luxury',
                  desc: 'Kanvas gelap premium dengan nuansa gold & perunggu mewah',
                  bgPreview: 'bg-stone-950 border-amber-500/40',
                  accent: 'bg-amber-400',
                },
                {
                  id: 'classic_monochrome',
                  title: 'Classic Monochrome',
                  desc: 'Skema hitam-putih kontras tinggi minimalis tanpa warna berlebih',
                  bgPreview: 'bg-zinc-950 border-zinc-700',
                  accent: 'bg-zinc-200',
                },
              ].map(t => {
                const isSelected = preferences.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setPreferences(prev => ({ ...prev, theme: t.id as ExportTheme }))
                    }
                    className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full ${t.bgPreview} border`} />
                        <span className={`w-4 h-4 rounded-full ${t.accent}`} />
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{t.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-1 leading-snug">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Layout & Tipografi */}
        {activeConfigTab === 'layout' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-400" />
                <span>Pengaturan Padding Margin & Skala Tipografi</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Sesuaikan kerapatan ruang kanvas serta ukuran teks visual untuk keterbacaan optimal.
              </p>
            </div>

            {/* Sub 1: Padding / Margin */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                Tingkat Margin / Padding Kanvas:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'compact', label: 'Ringkas (Compact)', desc: 'Margin tipis 16px' },
                  { id: 'normal', label: 'Standar (Normal)', desc: 'Margin pas 28px' },
                  { id: 'spacious', label: 'Lega (Spacious)', desc: 'Margin lebar 40px' },
                ].map(p => {
                  const isSelected = preferences.padding === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setPreferences(prev => ({ ...prev, padding: p.id as ExportPadding }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{p.label}</span>
                      <span className="text-[10px] opacity-75">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sub 2: Skala Font */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
                Skala Ukuran Font Teks:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'small', label: 'Kecil (85%)', desc: 'Rapat & Padat' },
                  { id: 'normal', label: 'Normal (100%)', desc: 'Standar Seimbang' },
                  { id: 'large', label: 'Besar (115%)', desc: 'Jelas & Menonjol' },
                  { id: 'xlarge', label: 'Ekstra (130%)', desc: 'Maksimal Jelas' },
                ].map(f => {
                  const isSelected = preferences.fontScale === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() =>
                        setPreferences(prev => ({ ...prev, fontScale: f.id as ExportFontScale }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-sm'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      <span className="block text-xs font-bold">{f.label}</span>
                      <span className="text-[10px] opacity-75">{f.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Visibilitas Bidang (Fields) */}
        {activeConfigTab === 'fields' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Pilih Bidang Informasi yang Ditampilkan</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Centang atau hilangkan bidang untuk menyesuaikan privasi & isi lembar ekspor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllFields(true)}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700"
                >
                  Tampilkan Semua
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAllFields(false)}
                  className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold border border-stone-700"
                >
                  Sembunyikan Semua
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  key: 'avatar' as const,
                  label: 'Foto Profil Artis (Avatar)',
                  icon: <User className="w-4 h-4 text-amber-400" />,
                },
                {
                  key: 'rankingRating' as const,
                  label: 'Peringkat & Overall Rating',
                  icon: <Star className="w-4 h-4 text-amber-400" />,
                },
                {
                  key: 'biodata' as const,
                  label: 'Biodata & Kelahiran (Lahir, Umur, Tinggi)',
                  icon: <Calendar className="w-4 h-4 text-amber-400" />,
                },
                {
                  key: 'measurements' as const,
                  label: 'Measurements & Ukuran Tubuh (B/W/H)',
                  icon: <Ruler className="w-4 h-4 text-pink-400" />,
                },
                {
                  key: 'attributes' as const,
                  label: 'Atribut Khusus & Tag Karakter',
                  icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
                },
                {
                  key: 'specialty' as const,
                  label: 'Specialty & Talenta Khusus',
                  icon: <Award className="w-4 h-4 text-purple-400" />,
                },
                {
                  key: 'appeal' as const,
                  label: 'Daya Tarik (Body Shape, Maturity, Aura)',
                  icon: <Smile className="w-4 h-4 text-rose-400" />,
                },
                {
                  key: 'appearance' as const,
                  label: 'Skor Penampilan (Appearance Scores)',
                  icon: <Eye className="w-4 h-4 text-emerald-400" />,
                },
                {
                  key: 'impression' as const,
                  label: 'Skor Kesan (Impression Scores)',
                  icon: <Activity className="w-4 h-4 text-indigo-400" />,
                },
                {
                  key: 'footerNotes' as const,
                  label: 'Catatan Kaki & Watermark Tanggal',
                  icon: <ShieldCheck className="w-4 h-4 text-stone-400" />,
                },
              ].map(field => {
                const isChecked = preferences.fields[field.key];
                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => handleToggleField(field.key)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-stone-950 border-amber-500/40 text-stone-100'
                        : 'bg-stone-950/50 border-stone-800/80 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0">{field.icon}</div>
                      <span className="text-xs font-semibold truncate">{field.label}</span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked
                          ? 'bg-amber-500 border-amber-400 text-stone-950 font-bold'
                          : 'border-stone-700 bg-stone-900 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. FIXED FLOATING ACTION BAR (BOTTOM SCREEN)                              */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[calc(100%-1.5rem)] sm:w-full px-4 sm:px-6 py-3 rounded-2xl bg-stone-950/95 border border-stone-800 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        {/* Back Button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-bold text-xs transition-colors border border-stone-800 hover:border-stone-700 cursor-pointer"
          title="Kembali ke Detail Artis"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Action Downloads */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleExportPNG}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-102 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isExporting === 'png' ? 'Memproses...' : 'Simpan PNG'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting !== null}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/20 transition-all hover:scale-102 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isExporting === 'pdf' ? 'Menyusun...' : 'Simpan PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
