import React, { useState, useMemo } from 'react';
import { Artist, SCORE_TRAIT_INFO } from '../types';
import { ArtistCard } from './ArtistCard';
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
  X,
  ArrowRightLeft,
  Sparkles,
  Trophy,
  Check,
  Layers,
  Search,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryArtist: Artist;
  allArtists: Artist[];
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  primaryArtist,
  allArtists,
}) => {
  // Opponent artist state (default to first different artist)
  const otherArtists = allArtists.filter(a => a.id !== primaryArtist.id);
  const initialOpponent = otherArtists[0] || primaryArtist;
  const [opponentId, setOpponentId] = useState<string>(initialOpponent.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullGallery, setShowFullGallery] = useState(false);

  const opponentArtist =
    allArtists.find(a => a.id === opponentId) || initialOpponent;

  // Filter selectable candidates
  const filteredCandidates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return otherArtists;
    return otherArtists.filter(a => {
      const fullName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const reversedFullName = `${a.lastName} ${a.firstName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        reversedFullName.includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.countryCode.toLowerCase().includes(q) ||
        a.typeCode.toLowerCase().includes(q) ||
        (a.notes && a.notes.toLowerCase().includes(q)) ||
        (a.artistStatus && a.artistStatus.toLowerCase().includes(q)) ||
        (a.attributes && a.attributes.some(attr => attr.toLowerCase().includes(q))) ||
        (a.specialty && a.specialty.some(spec => spec.toLowerCase().includes(q)))
      );
    });
  }, [otherArtists, searchQuery]);

  // Primary stats
  const primaryStats = useMemo(() => {
    const app = calculateAppearanceScore(primaryArtist.appearanceScores);
    const imp = calculateImpressionScore(primaryArtist.impressionScores);
    const overall = calculateOverallRating(app, imp);
    const prop = calculateProportionalRating(primaryArtist.measurements);
    const age = calculateAge(primaryArtist.bornDate);
    return { app, imp, overall, prop, age };
  }, [primaryArtist]);

  const primaryApp = primaryStats.app;
  const primaryImp = primaryStats.imp;
  const primaryOverall = primaryStats.overall;
  const primaryProp = primaryStats.prop;
  const primaryAge = primaryStats.age;

  // Opponent stats
  const opponentStats = useMemo(() => {
    const app = calculateAppearanceScore(opponentArtist.appearanceScores);
    const imp = calculateImpressionScore(opponentArtist.impressionScores);
    const overall = calculateOverallRating(app, imp);
    const prop = calculateProportionalRating(opponentArtist.measurements);
    const age = calculateAge(opponentArtist.bornDate);
    return { app, imp, overall, prop, age };
  }, [opponentArtist]);

  const opponentApp = opponentStats.app;
  const opponentImp = opponentStats.imp;
  const opponentOverall = opponentStats.overall;
  const opponentProp = opponentStats.prop;
  const opponentAge = opponentStats.age;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                KOMPARASI ARTIS (HEAD-TO-HEAD)
              </h2>
              <p className="text-xs text-stone-400">
                Pilih artis pembanding melalui kartu pencarian interaktif di bawah ini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Scrollable Artist Picker with Search */}
        <div className="px-5 py-3 bg-stone-950/90 border-b border-stone-800 space-y-2.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Pilih Artis Pembanding:
              </span>
              <span className="text-[11px] text-stone-400">
                ({filteredCandidates.length} artis tersedia)
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari nama artis, negara, tipe..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Mini Cards List */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {filteredCandidates.map(candidate => {
              const isSelected = candidate.id === opponentArtist.id;
              const cApp = calculateAppearanceScore(candidate.appearanceScores);
              const cImp = calculateImpressionScore(candidate.impressionScores);
              const cOverall = calculateOverallRating(cApp, cImp);
              const cFlag = getCountryFlag(candidate.countryCode, candidate.country);
              const isCandidateSpecial = (candidate.attributes?.length || 0) > 0;

              return (
                <button
                  key={candidate.id}
                  onClick={() => setOpponentId(candidate.id)}
                  className={`shrink-0 flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg scale-102'
                      : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:bg-stone-800/80 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div
                    className="w-10 h-14 rounded-lg overflow-hidden shrink-0 border relative"
                    style={{ borderColor: isCandidateSpecial ? '#00BCD5' : '#FECDD2' }}
                  >
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-cyan-300 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-[100px]">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate max-w-[90px]">
                        {candidate.firstName} {candidate.lastName}
                      </span>
                      <span className="text-xs">{cFlag}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-amber-400">
                        {cOverall} <span className="text-[9px] text-stone-400 font-normal">pts</span>
                      </span>
                      <span className="text-[10px] text-stone-400 bg-stone-800 px-1 rounded font-mono">
                        {candidate.typeCode}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
            {filteredCandidates.length === 0 && (
              <div className="py-2 text-xs text-stone-400 italic">
                Tidak ada artis yang sesuai dengan kata kunci "{searchQuery}".
              </div>
            )}
          </div>
        </div>

        {/* Fixed/Sticky Comparison Cards Section (Stays in place when scrolling) */}
        <div className="px-4 sm:px-6 py-3 bg-stone-900/95 border-b border-stone-800 shadow-lg z-10">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto items-center relative">
            {/* VS Badge in Center */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-950 border-2 border-stone-700 text-amber-400 font-black text-xs sm:text-sm shadow-2xl pointer-events-none">
              VS
            </div>

            {/* Primary Artist Card (Target) */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[150px] sm:max-w-[190px]">
                <ArtistCard artist={primaryArtist} />
              </div>
              <div className="mt-1.5 text-center">
                <span className="text-[10px] sm:text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Target Artis
                </span>
              </div>
            </div>

            {/* Opponent Artist Card (Pembanding) */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-[150px] sm:max-w-[190px]">
                <ArtistCard artist={opponentArtist} />
              </div>
              <div className="mt-1.5 text-center">
                <span className="text-[10px] sm:text-xs font-bold text-cyan-400 bg-cyan-500/15 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Pembanding Terpilih
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Comparison Body (Scrolls underneath the fixed cards) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Key Metric Score Comparison Table */}
          <div className="bg-stone-950/60 rounded-xl border border-stone-800 overflow-hidden shadow-lg">
            <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-xs font-bold uppercase tracking-wider text-stone-400 flex justify-between items-center">
              <span>Metrik Utama</span>
              <span>Skor & Perbandingan</span>
            </div>

            <div className="divide-y divide-stone-800 text-xs sm:text-sm">
              {/* Overall Rating */}
              <div className="p-3.5 flex items-center justify-between bg-amber-500/5">
                <div className="w-1/3 text-left">
                  <span className="text-lg sm:text-xl font-black text-amber-400">
                    {primaryOverall}
                  </span>
                  {primaryOverall > opponentOverall && (
                    <span className="ml-1.5 text-[10px] text-emerald-400 font-bold">
                      +{primaryOverall - opponentOverall}
                    </span>
                  )}
                </div>

                <div className="w-1/3 text-center font-bold text-stone-200 uppercase tracking-wider text-xs">
                  Overall Rating
                </div>

                <div className="w-1/3 text-right">
                  {opponentOverall > primaryOverall && (
                    <span className="mr-1.5 text-[10px] text-emerald-400 font-bold">
                      +{opponentOverall - primaryOverall}
                    </span>
                  )}
                  <span className="text-lg sm:text-xl font-black text-cyan-400">
                    {opponentOverall}
                  </span>
                </div>
              </div>

              {/* Appearance Score */}
              <div className="p-3 flex items-center justify-between">
                <div className="w-1/3 text-left font-bold text-stone-100 font-mono">
                  {primaryApp.toFixed(1)}
                </div>
                <div className="w-1/3 text-center text-xs text-stone-400">
                  Appearance (60%)
                </div>
                <div className="w-1/3 text-right font-bold text-stone-100 font-mono">
                  {opponentApp.toFixed(1)}
                </div>
              </div>

              {/* Impression Score */}
              <div className="p-3 flex items-center justify-between">
                <div className="w-1/3 text-left font-bold text-stone-100 font-mono">
                  {primaryImp.toFixed(1)}
                </div>
                <div className="w-1/3 text-center text-xs text-stone-400">
                  Impression (40%)
                </div>
                <div className="w-1/3 text-right font-bold text-stone-100 font-mono">
                  {opponentImp.toFixed(1)}
                </div>
              </div>

              {/* Proportional Rating */}
              <div className="p-3 flex items-center justify-between">
                <div className="w-1/3 text-left font-bold text-pink-300 font-mono">
                  {primaryProp}
                </div>
                <div className="w-1/3 text-center text-xs text-stone-400">
                  Proportional Index
                </div>
                <div className="w-1/3 text-right font-bold text-pink-300 font-mono">
                  {opponentProp}
                </div>
              </div>

              {/* Age & Height */}
              <div className="p-3 flex items-center justify-between">
                <div className="w-1/3 text-left text-xs font-mono text-stone-300">
                  {primaryAge} th • {primaryArtist.heightCm} cm
                </div>
                <div className="w-1/3 text-center text-xs text-stone-400">
                  Usia & Tinggi
                </div>
                <div className="w-1/3 text-right text-xs font-mono text-stone-300">
                  {opponentAge} th • {opponentArtist.heightCm} cm
                </div>
              </div>

              {/* Measurements */}
              <div className="p-3 flex items-center justify-between">
                <div className="w-1/3 text-left text-xs font-mono text-stone-300">
                  {primaryArtist.measurements.cupSize} ({primaryArtist.measurements.bustCm}-{primaryArtist.measurements.waistCm}-{primaryArtist.measurements.hipCm})
                </div>
                <div className="w-1/3 text-center text-xs text-stone-400">
                  Ukuran Tubuh (B-W-H)
                </div>
                <div className="w-1/3 text-right text-xs font-mono text-stone-300">
                  {opponentArtist.measurements.cupSize} ({opponentArtist.measurements.bustCm}-{opponentArtist.measurements.waistCm}-{opponentArtist.measurements.hipCm})
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Trait Breakdown (Appearance & Impression) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Appearance Breakdown */}
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400 border-b border-stone-800 pb-2">
                Detail Atribut Appearance
              </h4>
              <div className="space-y-2.5 text-xs">
                {SCORE_TRAIT_INFO.appearance.map(trait => {
                  const pVal =
                    primaryArtist.appearanceScores[
                      trait.key as keyof typeof primaryArtist.appearanceScores
                    ];
                  const oVal =
                    opponentArtist.appearanceScores[
                      trait.key as keyof typeof opponentArtist.appearanceScores
                    ];
                  return (
                    <div key={trait.key} className="space-y-1">
                      <div className="flex justify-between text-stone-300 font-mono">
                        <span className={`font-bold ${pVal > oVal ? 'text-amber-400' : ''}`}>
                          {pVal}
                        </span>
                        <span className="text-stone-400 font-medium font-sans">{trait.label}</span>
                        <span className={`font-bold ${oVal > pVal ? 'text-cyan-400' : ''}`}>
                          {oVal}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-stone-800">
                        <div
                          className="bg-amber-400 rounded-l"
                          style={{ width: `${(pVal / (pVal + oVal || 1)) * 100}%` }}
                        />
                        <div
                          className="bg-cyan-400 rounded-r"
                          style={{ width: `${(oVal / (pVal + oVal || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impression Breakdown */}
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-pink-400 border-b border-stone-800 pb-2">
                Detail Atribut Impression
              </h4>
              <div className="space-y-2.5 text-xs">
                {SCORE_TRAIT_INFO.impression.map(trait => {
                  const pVal =
                    primaryArtist.impressionScores[
                      trait.key as keyof typeof primaryArtist.impressionScores
                    ];
                  const oVal =
                    opponentArtist.impressionScores[
                      trait.key as keyof typeof opponentArtist.impressionScores
                    ];
                  return (
                    <div key={trait.key} className="space-y-1">
                      <div className="flex justify-between text-stone-300 font-mono">
                        <span className={`font-bold ${pVal > oVal ? 'text-amber-400' : ''}`}>
                          {pVal}
                        </span>
                        <span className="text-stone-400 font-medium font-sans">{trait.label}</span>
                        <span className={`font-bold ${oVal > pVal ? 'text-pink-400' : ''}`}>
                          {oVal}
                        </span>
                      </div>
                      <div className="flex gap-1 h-1.5 rounded-full overflow-hidden bg-stone-800">
                        <div
                          className="bg-amber-400 rounded-l"
                          style={{ width: `${(pVal / (pVal + oVal || 1)) * 100}%` }}
                        />
                        <div
                          className="bg-pink-400 rounded-r"
                          style={{ width: `${(oVal / (pVal + oVal || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Appeal, Attributes & Specialty Comparison */}
          <div className="bg-stone-950/60 rounded-xl border border-stone-800 overflow-hidden shadow-lg space-y-0 divide-y divide-stone-800 text-xs">
            <div className="px-4 py-2.5 bg-stone-900 font-bold uppercase tracking-wider text-stone-400 flex justify-between items-center">
              <span>Dimensi Karakter & Fitur</span>
              <span>Perbandingan</span>
            </div>

            {/* Maturity */}
            <div className="p-3 flex items-center justify-between">
              <div className="w-1/3 text-left font-bold text-amber-300">
                {primaryArtist.appeal.maturity}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
                Maturity
              </div>
              <div className="w-1/3 text-right font-bold text-cyan-300">
                {opponentArtist.appeal.maturity}
              </div>
            </div>

            {/* Vibe */}
            <div className="p-3 flex items-center justify-between">
              <div className="w-1/3 text-left font-bold text-stone-200">
                {primaryArtist.appeal.vibe}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
                Vibe
              </div>
              <div className="w-1/3 text-right font-bold text-stone-200">
                {opponentArtist.appeal.vibe}
              </div>
            </div>

            {/* Style */}
            <div className="p-3 flex items-center justify-between">
              <div className="w-1/3 text-left font-bold text-stone-200">
                {primaryArtist.appeal.style}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
                Style
              </div>
              <div className="w-1/3 text-right font-bold text-stone-200">
                {opponentArtist.appeal.style}
              </div>
            </div>

            {/* Body Shape */}
            <div className="p-3 flex items-center justify-between">
              <div className="w-1/3 text-left font-bold text-stone-200">
                {primaryArtist.appeal.bodyShape}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
                Body Shape
              </div>
              <div className="w-1/3 text-right font-bold text-stone-200">
                {opponentArtist.appeal.bodyShape}
              </div>
            </div>

            {/* Active Attributes */}
            <div className="p-3 flex items-start justify-between">
              <div className="w-1/3 text-left flex flex-wrap gap-1">
                {(primaryArtist.attributes || []).map(attr => (
                  <span
                    key={attr}
                    className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold"
                  >
                    {attr}
                  </span>
                ))}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px] pt-1">
                Attributes
              </div>
              <div className="w-1/3 text-right flex flex-wrap gap-1 justify-end">
                {(opponentArtist.attributes || []).map(attr => (
                  <span
                    key={attr}
                    className="px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            </div>

            {/* Active Specialty */}
            <div className="p-3 flex items-start justify-between">
              <div className="w-1/3 text-left flex flex-wrap gap-1">
                {(primaryArtist.specialty || []).map(spec => (
                  <span
                    key={spec}
                    className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px] pt-1">
                Specialty
              </div>
              <div className="w-1/3 text-right flex flex-wrap gap-1 justify-end">
                {(opponentArtist.specialty || []).map(spec => (
                  <span
                    key={spec}
                    className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-800 bg-stone-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-stone-800 text-white hover:bg-stone-700 transition-colors"
          >
            Tutup Komparasi
          </button>
        </div>
      </div>
    </div>
  );
};
