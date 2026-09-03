import React, { useState, useRef } from 'react';
import {
  Artist,
  DatabaseSchema,
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
  formatMonthYear,
} from '../utils/calculations';
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Check,
  Award,
  Sparkles,
  Layers,
  Star,
  Activity,
  CheckCircle2,
  Calendar,
  Ruler,
  Eye,
  Smile,
  Zap,
  Sliders,
} from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ArtistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist;
  schema: DatabaseSchema;
  primaryColor?: string;
  radius?: string;
  innerRadius?: string;
}

export const ArtistExportModal: React.FC<ArtistExportModalProps> = ({
  isOpen,
  onClose,
  artist,
  schema,
  primaryColor = '#00BCD4',
  radius = 'rounded-2xl',
  innerRadius = 'rounded-xl',
}) => {
  // Section visibility toggles
  const [showAgeAndBirthdate, setShowAgeAndBirthdate] = useState<boolean>(true);
  const [showMeasurements, setShowMeasurements] = useState<boolean>(true);
  const [showAttributes, setShowAttributes] = useState<boolean>(true);
  const [showSpecialty, setShowSpecialty] = useState<boolean>(true);
  const [showAppeal, setShowAppeal] = useState<boolean>(true);
  const [showAppearance, setShowAppearance] = useState<boolean>(true);
  const [showImpression, setShowImpression] = useState<boolean>(true);

  // Exporting state
  const [isExporting, setIsExporting] = useState<'png' | 'pdf' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const exportSheetRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  // Pre-calculate ratings
  const appScore = calculateAppearanceScore(artist.appearanceScores);
  const impScore = calculateImpressionScore(artist.impressionScores);
  const overallRating = calculateOverallRating(appScore, impScore);
  const propRating = calculateProportionalRating(artist.measurements);
  const age = calculateAge(artist.bornDate);
  const ageAtDebut = calculateAgeAtDebut(artist.bornDate, artist.debutDate);
  const flag = getCountryFlag(artist.countryCode, artist.country);
  const typeInfo = getTypeInfo(artist.typeCode);

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

  const cleanFileName = `${artist.firstName}_${artist.lastName}_Profile`.replace(/\s+/g, '_');

  // Handle Export to PNG
  const handleExportPNG = async () => {
    if (!exportSheetRef.current) return;
    try {
      setIsExporting('png');
      setStatusMessage('Mengonversi halaman artis ke gambar PNG...');

      const element = exportSheetRef.current;
      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: '#0c0a09',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const link = document.createElement('a');
      link.download = `${cleanFileName}.png`;
      link.href = dataUrl;
      link.click();

      setStatusMessage('Gambar PNG berhasil diunduh!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setStatusMessage('Gagal mengunduh gambar PNG. Silakan coba lagi.');
    } finally {
      setIsExporting(null);
    }
  };

  // Handle Export to PDF
  const handleExportPDF = async () => {
    if (!exportSheetRef.current) return;
    try {
      setIsExporting('pdf');
      setStatusMessage('Menyusun dokumen PDF resolusi tinggi...');

      const element = exportSheetRef.current;
      const imgData = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#0c0a09',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      // Load image to determine aspect ratio
      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Gagal memproses gambar untuk PDF'));
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (img.naturalHeight * imgWidth) / img.naturalWidth;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: imgHeight > pageHeight ? [imgWidth, imgHeight + 10] : 'a4',
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${cleanFileName}.pdf`);

      setStatusMessage('Dokumen PDF berhasil diunduh!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setStatusMessage('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        style={{
          backgroundColor: 'var(--color-surface, #16131c)',
          borderColor: 'var(--color-border, #2e273b)',
          color: 'var(--color-text-main, #f5f3f8)',
        }}
        className="border rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div
          style={{
            borderColor: 'var(--color-border, #2e273b)',
            backgroundColor: 'var(--color-surface-sub, #201b29)',
          }}
          className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.15))',
                borderColor: 'var(--color-primary-border, rgba(149,138,184,0.3))',
                color: 'var(--color-primary, #958ab8)',
              }}
              className="w-10 h-10 rounded-2xl border flex items-center justify-center"
            >
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{ color: 'var(--color-text-main, #f5f3f8)' }}
                className="text-base sm:text-lg font-bold flex items-center gap-2"
              >
                <span>Simpan Halaman Artis</span>
                <span
                  style={{
                    backgroundColor: 'var(--color-surface, #16131c)',
                    borderColor: 'var(--color-border, #2e273b)',
                    color: 'var(--color-text-muted, #a395a8)',
                  }}
                  className="text-xs px-2 py-0.5 rounded-full border font-mono"
                >
                  PNG / PDF
                </span>
              </h2>
              <p
                style={{ color: 'var(--color-text-muted, #a395a8)' }}
                className="text-xs"
              >
                Sesuaikan bagian profil yang ingin disertakan sebelum mengunduh.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ color: 'var(--color-text-muted, #a395a8)' }}
            className="p-2 rounded-xl hover:opacity-100 hover:bg-white/10 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visibility Toggles Settings Bar */}
        <div
          style={{
            borderColor: 'var(--color-border, #2e273b)',
            backgroundColor: 'var(--color-surface-sub, #201b29)',
          }}
          className="px-4 py-3 border-b shrink-0 overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-2 min-w-max text-xs">
            <span
              style={{ color: 'var(--color-text-muted, #a395a8)' }}
              className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1 mr-1"
            >
              <Sliders
                style={{ color: 'var(--color-primary, #958ab8)' }}
                className="w-3.5 h-3.5"
              />
              <span>Tampilan Section:</span>
            </span>

            {/* Age & Birthdate Toggle */}
            <button
              type="button"
              onClick={() => setShowAgeAndBirthdate(!showAgeAndBirthdate)}
              style={
                showAgeAndBirthdate
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Calendar className="w-3 h-3" />
              <span>Umur & Lahir</span>
            </button>

            {/* Measurements Toggle */}
            <button
              type="button"
              onClick={() => setShowMeasurements(!showMeasurements)}
              style={
                showMeasurements
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Ruler className="w-3 h-3" />
              <span>Measurements</span>
            </button>

            {/* Attributes Toggle */}
            <button
              type="button"
              onClick={() => setShowAttributes(!showAttributes)}
              style={
                showAttributes
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Sparkles className="w-3 h-3" />
              <span>Attributes</span>
            </button>

            {/* Specialty Toggle */}
            <button
              type="button"
              onClick={() => setShowSpecialty(!showSpecialty)}
              style={
                showSpecialty
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Award className="w-3 h-3" />
              <span>Specialty</span>
            </button>

            {/* Appeal Toggle */}
            <button
              type="button"
              onClick={() => setShowAppeal(!showAppeal)}
              style={
                showAppeal
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Smile className="w-3 h-3" />
              <span>Appeal</span>
            </button>

            {/* Appearance Scores Toggle */}
            <button
              type="button"
              onClick={() => setShowAppearance(!showAppearance)}
              style={
                showAppearance
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Eye className="w-3 h-3" />
              <span>Appearance</span>
            </button>

            {/* Impression Scores Toggle */}
            <button
              type="button"
              onClick={() => setShowImpression(!showImpression)}
              style={
                showImpression
                  ? {
                      backgroundColor: 'var(--color-primary-light, rgba(149,138,184,0.2))',
                      color: 'var(--color-primary, #958ab8)',
                      borderColor: 'var(--color-primary-border, rgba(149,138,184,0.4))',
                    }
                  : {
                      backgroundColor: 'var(--color-surface, #16131c)',
                      color: 'var(--color-text-muted, #a395a8)',
                      borderColor: 'var(--color-border, #2e273b)',
                    }
              }
              className="px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 border"
            >
              <Activity className="w-3 h-3" />
              <span>Impression</span>
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-950/60">
          <div
            ref={exportSheetRef}
            className="p-6 sm:p-8 bg-stone-950 text-stone-100 rounded-2xl border border-stone-800 space-y-6 shadow-xl max-w-3xl mx-auto"
            style={{ minWidth: '320px' }}
          >
            {/* Header Profil (Tanpa tombol interaktif) */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between border-b border-stone-800 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-lg shrink-0 bg-stone-900">
                  <img
                    src={artist.avatarUrl}
                    alt={artist.firstName}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400">
                    <span>{flag} {artist.country}</span>
                    <span>•</span>
                    <span>{typeInfo.indonesia || typeInfo.code}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {artist.firstName} {artist.lastName}
                  </h1>
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider border font-mono ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Body: {artist.appeal?.bodyShape || '-'} • {artist.appeal?.maturity || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Overall Rating Box */}
              <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-500/30 text-right min-w-[130px] shrink-0 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Overall Rating
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  ★ {Math.round(overallRating)}
                  <span className="text-xs text-stone-500 font-normal"> /99</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  APP: {appScore.toFixed(1)} | IMP: {impScore.toFixed(1)}
                </span>
              </div>
            </div>

            {/* SECTION: Umur & Tanggal Lahir */}
            {showAgeAndBirthdate && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>BIODATA & KELAHIRAN</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Tanggal Lahir</span>
                    <span className="text-sm font-bold font-mono text-white">{formatMonthYear(artist.bornDate)}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Usia</span>
                    <span className="text-sm font-bold font-mono text-white">{age ? `${age} tahun` : '-'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Tinggi Badan</span>
                    <span className="text-sm font-bold font-mono text-white">{artist.heightCm ? `${artist.heightCm} cm` : '-'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Debut</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {formatMonthYear(artist.debutDate)} {ageAtDebut ? `(${ageAtDebut} th)` : ''}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: Measurements */}
            {showMeasurements && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5" />
                    <span>MEASUREMENTS & PROPORTION</span>
                  </span>
                  <span className="font-mono text-pink-300 font-bold text-[11px]">
                    Proportion: {propRating} PTS
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Cup Size</span>
                    <span className="text-sm font-black text-pink-300">{artist.measurements?.cupSize || '-'} Cup</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Dada (Bust)</span>
                    <span className="text-sm font-bold font-mono text-white">{artist.measurements?.bustCm || '-'} cm</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Pinggang (Waist)</span>
                    <span className="text-sm font-bold font-mono text-white">{artist.measurements?.waistCm || '-'} cm</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Pinggul (Hip)</span>
                    <span className="text-sm font-bold font-mono text-white">{artist.measurements?.hipCm || '-'} cm</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: Attributes */}
            {showAttributes && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SPECIAL ATTRIBUTES</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap gap-2">
                  {artist.attributes && artist.attributes.length > 0 ? (
                    artist.attributes.map((attr, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs font-semibold"
                      >
                        {attr}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-500 italic">Tidak ada atribut khusus</span>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: Specialty */}
            {showSpecialty && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>SPECIALTY & TALENTA</span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap gap-2">
                  {artist.specialty && artist.specialty.length > 0 ? (
                    artist.specialty.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-semibold"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-stone-500 italic">Tidak ada spesialisasi terdaftar</span>
                  )}
                </div>
              </div>
            )}

            {/* SECTION: Appeal */}
            {showAppeal && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5" />
                  <span>APPEAL & DAYA TARIK</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Body Shape</span>
                    <span className="text-xs font-bold text-white">{artist.appeal?.bodyShape || '-'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-[10px] text-stone-400 block uppercase">Maturity Level</span>
                    <span className="text-xs font-bold text-amber-300">{artist.appeal?.maturity || '-'}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-stone-400 block uppercase">Aura / Appeal</span>
                    <span className="text-xs font-bold text-rose-300 truncate block">
                      {artist.appeal?.mainAppeal || '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION: Appearance Scores */}
            {showAppearance && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    <span>SKOR PENAMPILAN (APPEARANCE)</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold text-[11px]">
                    Avg: {appScore.toFixed(1)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(artist.appearanceScores || {}).map(([key, val]) => {
                    const numericVal = typeof val === 'number' ? val : Number(val) || 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-300 capitalize">{key}</span>
                          <span className="font-mono font-bold text-white">{numericVal}</span>
                        </div>
                        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, numericVal))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION: Impression Scores */}
            {showImpression && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>SKOR KESAN (IMPRESSION)</span>
                  </span>
                  <span className="font-mono text-indigo-300 font-bold text-[11px]">
                    Avg: {impScore.toFixed(1)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(artist.impressionScores || {}).map(([key, val]) => {
                    const numericVal = typeof val === 'number' ? val : Number(val) || 0;
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-stone-300 capitalize">{key}</span>
                          <span className="font-mono font-bold text-white">{numericVal}</span>
                        </div>
                        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, numericVal))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Watermark */}
            <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-500 font-mono">
              <span>Talent Profile System v3.0</span>
              <span>Generated on {new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            borderColor: 'var(--color-border, #2e273b)',
            backgroundColor: 'var(--color-surface-sub, #201b29)',
          }}
          className="p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
        >
          <div
            style={{ color: 'var(--color-primary, #958ab8)' }}
            className="text-xs flex items-center gap-2"
          >
            {statusMessage && (
              <span className="font-semibold animate-pulse">{statusMessage}</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--color-surface, #16131c)',
                borderColor: 'var(--color-border, #2e273b)',
                color: 'var(--color-text-muted, #a395a8)',
              }}
              className="px-4 py-2 rounded-xl border text-xs font-semibold transition-colors hover:opacity-100"
            >
              Batal
            </button>

            {/* PNG Download Button */}
            <button
              type="button"
              onClick={handleExportPNG}
              disabled={isExporting !== null}
              style={{
                backgroundColor: 'var(--color-primary, #958ab8)',
                color: 'var(--color-text-on-primary, #ffffff)',
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isExporting === 'png' ? 'Memproses...' : 'Simpan PNG'}</span>
            </button>

            {/* PDF Download Button */}
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting !== null}
              style={{
                backgroundColor: 'var(--color-secondary, #43395b)',
                color: 'var(--color-text-on-secondary, #ffffff)',
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
            >
              <FileText className="w-4 h-4" />
              <span>{isExporting === 'pdf' ? 'Menyusun...' : 'Simpan PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
