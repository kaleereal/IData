import React, { useState, useMemo } from 'react';
import { Artist, DatabaseSchema, SCORE_TRAIT_INFO } from '../types';
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
  calculateAgeAtDebut,
  getCountryFlag,
  getTypeInfo,
} from '../utils/calculations';
import {
  ArrowRightLeft,
  Search,
  Check,
  Trophy,
  Sparkles,
  Award,
  Ruler,
  TrendingUp,
  X,
  UserCheck,
  Swords,
  Crown,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface ComparePageProps {
  primaryArtistId?: string | null;
  allArtists: Artist[];
  schema: DatabaseSchema;
  onBackToHome: () => void;
  onSelectArtist: (artist: Artist) => void;
}

type CompareByFilter =
  | 'all'
  | 'same_status'
  | 'closest_rank'
  | 'same_country'
  | 'same_type'
  | 'same_maturity'
  | 'same_cup'
  | 'top_overall'
  | 'top_appearance'
  | 'top_impression'
  | 'top_proportional';

export const ComparePage: React.FC<ComparePageProps> = ({
  primaryArtistId,
  allArtists,
  schema,
  onBackToHome,
  onSelectArtist,
}) => {
  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);
  const primaryColor = uiTheme.tokens?.colors?.primary || uiTheme.global.primaryColor || '#FE9900';
  const decorations = uiTheme.decorationSystem;
  const compareConfig = uiTheme.compare || {};
  const winnerHighlightStyle = compareConfig.winnerHighlight || 'glow_border';

  // Memoized scores map for all artists to eliminate redundant calculations during candidate scrolling
  const artistScoresMap = useMemo(() => {
    const map = new Map<
      string,
      {
        appScore: number;
        impScore: number;
        overallRating: number;
        proportionalRating: number;
        age: number;
        debutAge: number;
      }
    >();
    for (const a of allArtists) {
      const app = calculateAppearanceScore(a.appearanceScores);
      const imp = calculateImpressionScore(a.impressionScores);
      const overall = calculateOverallRating(app, imp);
      const prop = calculateProportionalRating(a.measurements);
      const age = calculateAge(a.bornDate);
      const debutAge = calculateAgeAtDebut(a.bornDate, a.debutDate);
      map.set(a.id, {
        appScore: app,
        impScore: imp,
        overallRating: overall,
        proportionalRating: prop,
        age,
        debutAge,
      });
    }
    return map;
  }, [allArtists]);

  // Sort all artists by overall score to have consistent rank references
  const rankedArtists = useMemo(() => {
    return [...allArtists].sort((a, b) => {
      const aScore = artistScoresMap.get(a.id)?.overallRating ?? 0;
      const bScore = artistScoresMap.get(b.id)?.overallRating ?? 0;
      return bScore - aScore;
    });
  }, [allArtists, artistScoresMap]);

  // Primary artist state
  const [primaryId, setPrimaryId] = useState<string>(() => {
    if (primaryArtistId && allArtists.some(a => a.id === primaryArtistId)) {
      return primaryArtistId;
    }
    return rankedArtists[0]?.id || allArtists[0]?.id || '';
  });

  // Opponent artist state
  const [opponentId, setOpponentId] = useState<string>(() => {
    const others = rankedArtists.filter(a => a.id !== primaryId);
    return others[0]?.id || allArtists[1]?.id || primaryId;
  });

  // Selection tab state ('primary' | 'opponent')
  const [activePickerTarget, setActivePickerTarget] = useState<'primary' | 'opponent'>('opponent');

  // Filter & Search states
  const [compareBy, setCompareBy] = useState<CompareByFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Primary & Opponent objects
  const primaryArtist = allArtists.find(a => a.id === primaryId) || rankedArtists[0] || allArtists[0];
  const opponentArtist = allArtists.find(a => a.id === opponentId) || rankedArtists[1] || allArtists[0];

  const primaryRank = rankedArtists.findIndex(a => a.id === primaryArtist?.id) + 1;
  const opponentRank = rankedArtists.findIndex(a => a.id === opponentArtist?.id) + 1;

  // Primary stats (memoized map lookup)
  const primaryStats = artistScoresMap.get(primaryArtist.id);
  const primaryApp = primaryStats?.appScore ?? calculateAppearanceScore(primaryArtist.appearanceScores);
  const primaryImp = primaryStats?.impScore ?? calculateImpressionScore(primaryArtist.impressionScores);
  const primaryOverall = primaryStats?.overallRating ?? calculateOverallRating(primaryApp, primaryImp);
  const primaryProp = primaryStats?.proportionalRating ?? calculateProportionalRating(primaryArtist.measurements);
  const primaryAge = primaryStats?.age ?? calculateAge(primaryArtist.bornDate);
  const primaryDebutAge = primaryStats?.debutAge ?? calculateAgeAtDebut(primaryArtist.bornDate, primaryArtist.debutDate);
  const primaryType = getTypeInfo(primaryArtist.typeCode);
  const primaryFlag = getCountryFlag(primaryArtist.countryCode, primaryArtist.country);

  // Opponent stats (memoized map lookup)
  const opponentStats = artistScoresMap.get(opponentArtist.id);
  const opponentApp = opponentStats?.appScore ?? calculateAppearanceScore(opponentArtist.appearanceScores);
  const opponentImp = opponentStats?.impScore ?? calculateImpressionScore(opponentArtist.impressionScores);
  const opponentOverall = opponentStats?.overallRating ?? calculateOverallRating(opponentApp, opponentImp);
  const opponentProp = opponentStats?.proportionalRating ?? calculateProportionalRating(opponentArtist.measurements);
  const opponentAge = opponentStats?.age ?? calculateAge(opponentArtist.bornDate);
  const opponentDebutAge = opponentStats?.debutAge ?? calculateAgeAtDebut(opponentArtist.bornDate, opponentArtist.debutDate);
  const opponentType = getTypeInfo(opponentArtist.typeCode);
  const opponentFlag = getCountryFlag(opponentArtist.countryCode, opponentArtist.country);

  // Appearance & Impression traits from schema or default SCORE_TRAIT_INFO
  const appearanceTraits = useMemo(() => {
    if (schema?.scoringTraits?.appearance && schema.scoringTraits.appearance.length > 0) {
      return schema.scoringTraits.appearance;
    }
    return SCORE_TRAIT_INFO.appearance;
  }, [schema]);

  const impressionTraits = useMemo(() => {
    if (schema?.scoringTraits?.impression && schema.scoringTraits.impression.length > 0) {
      return schema.scoringTraits.impression;
    }
    return SCORE_TRAIT_INFO.impression;
  }, [schema]);

  // Filter selectable candidates based on Compare By & Search
  const candidatePool = useMemo(() => {
    const targetArtist = activePickerTarget === 'opponent' ? primaryArtist : opponentArtist;
    let list = [...allArtists];

    if (compareBy === 'same_status') {
      const targetStatus = (targetArtist.artistStatus || 'Amatir').toLowerCase();
      list = list.filter(a => (a.artistStatus || 'Amatir').toLowerCase() === targetStatus);
    } else if (compareBy === 'closest_rank') {
      const targetRank = rankedArtists.findIndex(a => a.id === targetArtist.id);
      list = [...rankedArtists].filter((_, idx) => Math.abs(idx - targetRank) <= 6 && idx !== targetRank);
    } else if (compareBy === 'same_country') {
      list = list.filter(a => a.country.toLowerCase() === targetArtist.country.toLowerCase());
    } else if (compareBy === 'same_type') {
      list = list.filter(a => a.typeCode.toUpperCase() === targetArtist.typeCode.toUpperCase());
    } else if (compareBy === 'same_maturity') {
      list = list.filter(
        a => a.appeal?.maturity?.toLowerCase() === targetArtist.appeal?.maturity?.toLowerCase()
      );
    } else if (compareBy === 'same_cup') {
      list = list.filter(
        a =>
          a.measurements?.cupSize?.toUpperCase() === targetArtist.measurements?.cupSize?.toUpperCase()
      );
    } else if (compareBy === 'top_overall') {
      list = [...rankedArtists];
    } else if (compareBy === 'top_appearance') {
      list = [...allArtists].sort(
        (a, b) =>
          calculateAppearanceScore(b.appearanceScores) - calculateAppearanceScore(a.appearanceScores)
      );
    } else if (compareBy === 'top_impression') {
      list = [...allArtists].sort(
        (a, b) =>
          calculateImpressionScore(b.impressionScores) - calculateImpressionScore(a.impressionScores)
      );
    } else if (compareBy === 'top_proportional') {
      list = [...allArtists].sort(
        (a, b) =>
          calculateProportionalRating(b.measurements) - calculateProportionalRating(a.measurements)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(a => {
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
    }

    return list;
  }, [
    allArtists,
    rankedArtists,
    compareBy,
    searchQuery,
    activePickerTarget,
    primaryArtist,
    opponentArtist,
  ]);

  const handleSelectCandidate = (candidateId: string) => {
    if (activePickerTarget === 'primary') {
      setPrimaryId(candidateId);
      if (candidateId === opponentId) {
        const alt = rankedArtists.find(a => a.id !== candidateId);
        if (alt) setOpponentId(alt.id);
      }
    } else {
      setOpponentId(candidateId);
      if (candidateId === primaryId) {
        const alt = rankedArtists.find(a => a.id !== candidateId);
        if (alt) setPrimaryId(alt.id);
      }
    }
  };

  const handleSwapRoles = () => {
    const temp = primaryId;
    setPrimaryId(opponentId);
    setOpponentId(temp);
  };

  const overallDiff = Math.abs(primaryOverall - opponentOverall);
  const isPrimaryOverallWinner = primaryOverall > opponentOverall;
  const isOpponentOverallWinner = opponentOverall > primaryOverall;
  const isTied = primaryOverall === opponentOverall;

  return (
    <div className="w-full max-w-5xl mx-auto pb-28 space-y-6 animate-in fade-in duration-300 relative text-stone-100">
      {/* Decorative Texture from UI Theme */}
      {decorations?.showGridBackground && <HUDGridTexture opacity={0.05} />}

      {/* SECTION 1: CANDIDATE PICKER & ROLE CONTROLS */}
      <div
        className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 backdrop-blur-md space-y-4 ${elevation} relative`}
      >
        {decorations?.showCornerBrackets && <HUDCornerBrackets color={primaryColor} size={10} />}

        {/* Top Controls: [ ICON SLOT 1 ] - [ ICON TUKAR POSISI ] - [ ICON SLOT 2 ] */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pb-3 border-b border-stone-800/80">
          {/* ICON SLOT 1 */}
          <button
            type="button"
            onClick={() => setActivePickerTarget('primary')}
            className={`relative p-1.5 sm:p-2 ${innerRadius} border transition-all flex items-center gap-2 group ${
              activePickerTarget === 'primary'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-md scale-105'
                : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850 hover:border-stone-700'
            }`}
            title={`Slot 1 (Target): ${primaryArtist.firstName} ${primaryArtist.lastName} - Klik untuk memilih artis Slot 1`}
            aria-label={`Pilih Slot 1: ${primaryArtist.firstName} ${primaryArtist.lastName}`}
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-stone-900 border border-amber-500/60 shrink-0">
              <img
                src={primaryArtist.avatarUrl}
                alt={primaryArtist.firstName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 right-0 px-1 py-0.2 text-[8px] font-black font-mono bg-amber-500 text-stone-950 rounded-tl">
                1
              </span>
            </div>
            <div className="text-left hidden xs:block pr-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Slot 1
              </div>
              <div className="text-xs font-bold text-white max-w-[100px] sm:max-w-[130px] truncate">
                {primaryArtist.firstName}
              </div>
            </div>
          </button>

          {/* ICON TUKAR POSISI */}
          <button
            type="button"
            onClick={handleSwapRoles}
            className={`p-2.5 sm:p-3 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-amber-400 hover:text-amber-300 border border-stone-700 transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center`}
            title="Tukar Posisi Artis (Slot 1 ⇄ Slot 2)"
            aria-label="Tukar Posisi Artis"
          >
            <ArrowRightLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          {/* ICON SLOT 2 */}
          <button
            type="button"
            onClick={() => setActivePickerTarget('opponent')}
            className={`relative p-1.5 sm:p-2 ${innerRadius} border transition-all flex items-center gap-2 group ${
              activePickerTarget === 'opponent'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/50 shadow-md scale-105'
                : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850 hover:border-stone-700'
            }`}
            title={`Slot 2 (Pembanding): ${opponentArtist.firstName} ${opponentArtist.lastName} - Klik untuk memilih artis Slot 2`}
            aria-label={`Pilih Slot 2: ${opponentArtist.firstName} ${opponentArtist.lastName}`}
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden bg-stone-900 border border-cyan-500/60 shrink-0">
              <img
                src={opponentArtist.avatarUrl}
                alt={opponentArtist.firstName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-0 right-0 px-1 py-0.2 text-[8px] font-black font-mono bg-cyan-500 text-stone-950 rounded-tl">
                2
              </span>
            </div>
            <div className="text-left hidden xs:block pr-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Slot 2
              </div>
              <div className="text-xs font-bold text-white max-w-[100px] sm:max-w-[130px] truncate">
                {opponentArtist.firstName}
              </div>
            </div>
          </button>
        </div>

        {/* Search & Filter Candidates Shelf */}
        <div className="space-y-2.5 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Filter Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs flex-1">
              {[
                { id: 'all', label: '🌟 Semua Artis' },
                { id: 'same_status', label: `🏷️ By Status (${primaryArtist.artistStatus || 'Amatir'})` },
                { id: 'closest_rank', label: '🎯 Rank Terdekat' },
                { id: 'same_country', label: `🏳️ Negara (${primaryArtist.country})` },
                { id: 'same_type', label: `📐 Tipe (${primaryArtist.typeCode})` },
                { id: 'same_maturity', label: `🍷 Maturity (${primaryArtist.appeal?.maturity || '-'})` },
                { id: 'same_cup', label: `👙 Cup (${primaryArtist.measurements?.cupSize || '-'})` },
                { id: 'top_overall', label: '🏆 Top Overall' },
                { id: 'top_appearance', label: '✨ Top Appearance' },
                { id: 'top_impression', label: '💖 Top Impression' },
                { id: 'top_proportional', label: '📊 Top Proportional' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCompareBy(f.id as CompareByFilter)}
                  className={`px-3 py-1.5 ${innerRadius} text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                    compareBy === f.id
                      ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow-md'
                      : 'bg-stone-950/80 text-stone-300 border-stone-800 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-60 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Cari artis pembanding..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`w-full bg-stone-950 border border-stone-700 ${innerRadius} pl-8 pr-7 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400`}
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
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {candidatePool.map(candidate => {
              const isCurrentlySelected =
                activePickerTarget === 'opponent'
                  ? candidate.id === opponentId
                  : candidate.id === primaryId;

              const cStats = artistScoresMap.get(candidate.id);
              const cOverall = cStats?.overallRating ?? 0;
              const cFlag = getCountryFlag(candidate.countryCode, candidate.country);

              return (
                <button
                  key={candidate.id}
                  onClick={() => handleSelectCandidate(candidate.id)}
                  className={`shrink-0 flex items-center gap-2.5 p-2 pr-3.5 ${innerRadius} border transition-all text-left group ${
                    isCurrentlySelected
                      ? activePickerTarget === 'primary'
                        ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                        : 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700 hover:bg-stone-800/80'
                  }`}
                >
                  <div className={`w-11 h-14 ${innerRadius} overflow-hidden shrink-0 border border-stone-700 relative`}>
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.firstName}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-top"
                    />
                    {isCurrentlySelected && (
                      <div className="absolute inset-0 bg-stone-950/50 flex items-center justify-center">
                        <Check className="w-4 h-4 text-amber-400 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-[105px]">
                    {/* Baris 1: Nama & Flag */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate max-w-[90px]">
                        {candidate.firstName} {candidate.lastName}
                      </span>
                      <span className="text-xs">{cFlag}</span>
                    </div>
                    {/* Baris 2: Overall Score & TypeCode */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {cOverall.toFixed(1)} <span className="text-[9px] text-stone-400 font-normal">pts</span>
                      </span>
                      <span className="text-[10px] text-stone-400 bg-stone-800 px-1 rounded font-mono">
                        {candidate.typeCode}
                      </span>
                    </div>
                    {/* Baris 3: Atribut Tambahan berdasarkan Tab Slide Bar (Kecuali Tab Overall dan Negara) */}
                    {compareBy === 'top_appearance' && (
                      <div className="text-[10px] font-mono font-bold text-amber-300 truncate mt-0.5">
                        App: {(cStats?.appScore ?? calculateAppearanceScore(candidate.appearanceScores)).toFixed(1)} pts
                      </div>
                    )}
                    {compareBy === 'top_impression' && (
                      <div className="text-[10px] font-mono font-bold text-pink-300 truncate mt-0.5">
                        Imp: {(cStats?.impScore ?? calculateImpressionScore(candidate.impressionScores)).toFixed(1)} pts
                      </div>
                    )}
                    {compareBy === 'top_proportional' && (
                      <div className="text-[10px] font-mono font-bold text-emerald-300 truncate mt-0.5">
                        Prop: {(cStats?.proportionalRating ?? calculateProportionalRating(candidate.measurements)).toFixed(1)} pts
                      </div>
                    )}
                    {compareBy === 'same_status' && (
                      <div className="text-[10px] font-mono font-bold text-cyan-300 truncate mt-0.5">
                        Status: {candidate.artistStatus || 'Amatir'}
                      </div>
                    )}
                    {compareBy === 'closest_rank' && (
                      <div className="text-[10px] font-mono font-bold text-amber-400 truncate mt-0.5">
                        Rank: #{rankedArtists.findIndex(a => a.id === candidate.id) + 1}
                      </div>
                    )}
                    {compareBy === 'same_type' && (
                      <div className="text-[10px] font-mono font-bold text-indigo-300 truncate mt-0.5">
                        Tipe: {candidate.typeCode}
                      </div>
                    )}
                    {compareBy === 'same_maturity' && (
                      <div className="text-[10px] font-mono font-bold text-purple-300 truncate mt-0.5">
                        Maturity: {candidate.appeal?.maturity || '-'}
                      </div>
                    )}
                    {compareBy === 'same_cup' && (
                      <div className="text-[10px] font-mono font-bold text-rose-300 truncate mt-0.5">
                        Cup: {candidate.measurements?.cupSize || '-'}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {candidatePool.length === 0 && (
              <div className="py-2 text-xs text-stone-400 italic">
                Tidak ada artis yang sesuai dengan kriteria filter "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: FIXED/STICKY COMPARISON HEADER & HERO DUEL */}
      <div
        className={`sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border border-stone-800 ${radius} p-4 sm:p-5 shadow-2xl relative overflow-hidden`}
      >
        {decorations?.showCornerBrackets && <HUDCornerBrackets color={primaryColor} size={10} />}

        {/* STATUS KOMPARASI BANNER */}
        <div className="flex items-center justify-center mb-3">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 ${innerRadius} bg-stone-900/90 border border-stone-700 text-xs shadow-md`}
          >
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> STATUS KOMPARASI:
            </span>
            <span className="font-mono">
              {isPrimaryOverallWinner ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  {primaryArtist.firstName} Unggul (+{overallDiff.toFixed(1)} pts)
                </span>
              ) : isOpponentOverallWinner ? (
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-cyan-400" />
                  {opponentArtist.firstName} Unggul (+{overallDiff.toFixed(1)} pts)
                </span>
              ) : (
                <span className="text-amber-300 font-bold">Skor Imbang ({primaryOverall.toFixed(1)} pts)</span>
              )}
            </span>
          </div>
        </div>

        {/* SIDE-BY-SIDE DUEL CARDS */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 relative">
          {/* Central VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-stone-950 border-2 border-stone-700 text-amber-400 font-black text-xs sm:text-sm flex items-center justify-center shadow-2xl pointer-events-none">
            VS
          </div>

          {/* LEFT: Primary Artist (Slot 1 / Target Artis) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-1">
              <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span className="px-1.5 py-0.2 bg-amber-500/20 rounded border border-amber-500/40">Slot 1</span>
                <span>#{primaryRank}</span>
              </span>
              <button
                onClick={() => onSelectArtist(primaryArtist)}
                className="text-[10px] sm:text-xs text-stone-400 hover:text-amber-400 font-bold transition-colors"
              >
                Profil ➔
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3.5">
              <div
                className={`w-16 sm:w-24 aspect-3/4 shrink-0 ${innerRadius} overflow-hidden border-2 border-amber-500/60 shadow-lg relative`}
              >
                <img
                  src={primaryArtist.avatarUrl}
                  alt={primaryArtist.firstName}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
                {isPrimaryOverallWinner && winnerHighlightStyle === 'badge_crown' && (
                  <div className="absolute top-1 right-1 p-1 bg-amber-500 rounded-full text-stone-950 shadow-md">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="min-w-0 text-center sm:text-left flex-1">
                <h3 className="text-xs sm:text-base font-black text-white uppercase truncate">
                  {primaryArtist.firstName} {primaryArtist.lastName}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
                  {primaryFlag} {primaryArtist.country} • {primaryArtist.measurements.cupSize} Cup ({primaryType.indonesia || primaryType.code})
                </p>

                <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs">
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">OVERALL</span>
                    <strong className="text-amber-400 font-mono font-black">{primaryOverall.toFixed(1)}</strong>
                  </div>
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">APP</span>
                    <strong className="text-cyan-400 font-mono font-bold">{primaryApp.toFixed(1)}</strong>
                  </div>
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">IMP</span>
                    <strong className="text-pink-400 font-mono font-bold">{primaryImp.toFixed(1)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Opponent Artist (Slot 2 / Pembanding Terpilih) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-1">
              <span className="text-[10px] sm:text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <span className="px-1.5 py-0.2 bg-cyan-500/20 rounded border border-cyan-500/40">Slot 2</span>
                <span>#{opponentRank}</span>
              </span>
              <button
                onClick={() => onSelectArtist(opponentArtist)}
                className="text-[10px] sm:text-xs text-stone-400 hover:text-cyan-400 font-bold transition-colors"
              >
                Profil ➔
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 sm:gap-3.5">
              <div
                className={`w-16 sm:w-24 aspect-3/4 shrink-0 ${innerRadius} overflow-hidden border-2 border-cyan-500/60 shadow-lg relative`}
              >
                <img
                  src={opponentArtist.avatarUrl}
                  alt={opponentArtist.firstName}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
                {isOpponentOverallWinner && winnerHighlightStyle === 'badge_crown' && (
                  <div className="absolute top-1 right-1 p-1 bg-cyan-500 rounded-full text-stone-950 shadow-md">
                    <Crown className="w-3 h-3" />
                  </div>
                )}
              </div>
              <div className="min-w-0 text-center sm:text-left flex-1">
                <h3 className="text-xs sm:text-base font-black text-white uppercase truncate">
                  {opponentArtist.firstName} {opponentArtist.lastName}
                </h3>
                <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
                  {opponentFlag} {opponentArtist.country} • {opponentArtist.measurements.cupSize} Cup ({opponentType.indonesia || opponentType.code})
                </p>

                <div className="grid grid-cols-3 gap-1 mt-2 text-center text-xs">
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">OVERALL</span>
                    <strong className="text-cyan-400 font-mono font-black">{opponentOverall.toFixed(1)}</strong>
                  </div>
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">APP</span>
                    <strong className="text-cyan-400 font-mono font-bold">{opponentApp.toFixed(1)}</strong>
                  </div>
                  <div className={`p-1 ${innerRadius} bg-stone-900 border border-stone-800`}>
                    <span className="text-[8px] text-stone-400 block font-bold">IMP</span>
                    <strong className="text-pink-400 font-mono font-bold">{opponentImp.toFixed(1)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: KEY METRIC SCORE COMPARISON TABLE (METRIK UTAMA) */}
      <div
        className={`bg-stone-900/80 ${radius} border border-stone-800 overflow-hidden shadow-xl ${elevation}`}
      >
        <div className="px-5 py-3 bg-stone-950 border-b border-stone-800 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-300">
          <span className="text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {primaryArtist.firstName} {primaryArtist.lastName}
          </span>
          <span className="text-stone-400">Metrik Utama & Perbandingan</span>
          <span className="text-cyan-400 flex items-center gap-1">
            {opponentArtist.firstName} {opponentArtist.lastName}
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          </span>
        </div>

        <div className="divide-y divide-stone-800 text-xs sm:text-sm">
          {/* Overall Rating */}
          <div className="p-4 flex items-center justify-between bg-amber-500/5">
            <div className="w-1/3 text-left flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                {primaryOverall.toFixed(1)}
              </span>
              {isPrimaryOverallWinner && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                  +{overallDiff.toFixed(1)}
                </span>
              )}
            </div>
            <div className="w-1/3 text-center font-bold text-stone-200 uppercase tracking-wider text-xs">
              Overall Rating (1-99)
            </div>
            <div className="w-1/3 text-right flex items-center justify-end gap-1.5">
              {isOpponentOverallWinner && (
                <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                  +{overallDiff.toFixed(1)}
                </span>
              )}
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
                {opponentOverall.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Appearance Score */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="w-1/3 text-left">
              <span
                className={`font-mono text-sm sm:text-base font-bold ${
                  primaryApp >= opponentApp ? 'text-amber-400 font-black' : 'text-stone-300'
                }`}
              >
                {primaryApp.toFixed(1)}
              </span>
            </div>
            <div className="w-1/3 text-center text-xs text-stone-400 font-semibold">
              Appearance Score (60%)
            </div>
            <div className="w-1/3 text-right">
              <span
                className={`font-mono text-sm sm:text-base font-bold ${
                  opponentApp >= primaryApp ? 'text-cyan-400 font-black' : 'text-stone-300'
                }`}
              >
                {opponentApp.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Impression Score */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="w-1/3 text-left">
              <span
                className={`font-mono text-sm sm:text-base font-bold ${
                  primaryImp >= opponentImp ? 'text-amber-400 font-black' : 'text-stone-300'
                }`}
              >
                {primaryImp.toFixed(1)}
              </span>
            </div>
            <div className="w-1/3 text-center text-xs text-stone-400 font-semibold">
              Impression Score (40%)
            </div>
            <div className="w-1/3 text-right">
              <span
                className={`font-mono text-sm sm:text-base font-bold ${
                  opponentImp >= primaryImp ? 'text-pink-400 font-black' : 'text-stone-300'
                }`}
              >
                {opponentImp.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Proportional Rating Index */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="w-1/3 text-left font-bold text-amber-300 font-mono">
              {primaryProp}
            </div>
            <div className="w-1/3 text-center text-xs text-stone-400 font-semibold">
              Proportional Index
            </div>
            <div className="w-1/3 text-right font-bold text-cyan-300 font-mono">
              {opponentProp}
            </div>
          </div>

          {/* Body Measurements */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="w-1/3 text-left text-xs font-mono text-stone-200">
              {primaryArtist.measurements.cupSize} Cup ({primaryArtist.measurements.bustCm || '-'}/
              {primaryArtist.measurements.waistCm || '-'}/{primaryArtist.measurements.hipCm || '-'})
            </div>
            <div className="w-1/3 text-center text-xs text-stone-400 font-semibold">
              Ukuran Tubuh (Cup / B-W-H)
            </div>
            <div className="w-1/3 text-right text-xs font-mono text-stone-200">
              {opponentArtist.measurements.cupSize} Cup ({opponentArtist.measurements.bustCm || '-'}/
              {opponentArtist.measurements.waistCm || '-'}/{opponentArtist.measurements.hipCm || '-'})
            </div>
          </div>

          {/* Height, Age & Debut */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="w-1/3 text-left text-xs text-stone-300">
              {primaryArtist.heightCm} cm • {primaryAge ? `${primaryAge} th` : '-'}
              {primaryDebutAge ? ` (Debut: ${primaryDebutAge} th)` : ''}
            </div>
            <div className="w-1/3 text-center text-xs text-stone-400 font-semibold">
              Tinggi, Usia & Debut
            </div>
            <div className="w-1/3 text-right text-xs text-stone-300">
              {opponentArtist.heightCm} cm • {opponentAge ? `${opponentAge} th` : '-'}
              {opponentDebutAge ? ` (Debut: ${opponentDebutAge} th)` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: DETAILED TRAIT BREAKDOWNS (APPEARANCE & IMPRESSION) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* APPEARANCE BREAKDOWN */}
        <div
          className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 space-y-4 shadow-lg ${elevation}`}
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
                Detail Atribut {schema?.sectionTitles?.appearance || 'Appearance'}
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-amber-400 font-bold">{primaryApp.toFixed(1)}</span>
              <span className="text-stone-500">vs</span>
              <span className="text-cyan-400 font-bold">{opponentApp.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {appearanceTraits.map(trait => {
              const pVal =
                (primaryArtist.appearanceScores as any)?.[trait.key] ?? 0;
              const oVal =
                (opponentArtist.appearanceScores as any)?.[trait.key] ?? 0;
              const total = pVal + oVal || 1;
              const pPercent = (pVal / total) * 100;
              const oPercent = (oVal / total) * 100;
              const isPWinner = pVal > oVal;
              const isOWinner = oVal > pVal;

              return (
                <div key={trait.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-stone-300 font-mono">
                    <span
                      className={`font-bold text-xs ${
                        isPWinner ? 'text-amber-400 font-black' : 'text-stone-300'
                      }`}
                    >
                      {pVal}
                    </span>
                    <div className="text-center">
                      <span className="text-stone-300 font-semibold font-sans uppercase text-[11px] block">
                        {trait.label}
                      </span>
                      {trait.weightLabel && (
                        <span className="text-[9px] text-stone-500 font-mono">Bobot: {trait.weightLabel}</span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-xs ${
                        isOWinner ? 'text-cyan-400 font-black' : 'text-stone-300'
                      }`}
                    >
                      {oVal}
                    </span>
                  </div>

                  {/* Dual Comparison Split Bar */}
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-stone-950 border border-stone-800 p-0.5">
                    <div
                      className="bg-amber-400 rounded-l transition-all duration-300"
                      style={{ width: `${pPercent}%` }}
                    />
                    <div
                      className="bg-cyan-400 rounded-r transition-all duration-300"
                      style={{ width: `${oPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* IMPRESSION BREAKDOWN */}
        <div
          className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 space-y-4 shadow-lg ${elevation}`}
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-pink-400">
                Detail Atribut {schema?.sectionTitles?.impression || 'Impression'}
              </h4>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-amber-400 font-bold">{primaryImp.toFixed(1)}</span>
              <span className="text-stone-500">vs</span>
              <span className="text-pink-400 font-bold">{opponentImp.toFixed(1)}</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {impressionTraits.map(trait => {
              const pVal =
                (primaryArtist.impressionScores as any)?.[trait.key] ?? 0;
              const oVal =
                (opponentArtist.impressionScores as any)?.[trait.key] ?? 0;
              const total = pVal + oVal || 1;
              const pPercent = (pVal / total) * 100;
              const oPercent = (oVal / total) * 100;
              const isPWinner = pVal > oVal;
              const isOWinner = oVal > pVal;

              return (
                <div key={trait.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-stone-300 font-mono">
                    <span
                      className={`font-bold text-xs ${
                        isPWinner ? 'text-amber-400 font-black' : 'text-stone-300'
                      }`}
                    >
                      {pVal}
                    </span>
                    <div className="text-center">
                      <span className="text-stone-300 font-semibold font-sans uppercase text-[11px] block">
                        {trait.label}
                      </span>
                      {trait.weightLabel && (
                        <span className="text-[9px] text-stone-500 font-mono">Bobot: {trait.weightLabel}</span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-xs ${
                        isOWinner ? 'text-pink-400 font-black' : 'text-stone-300'
                      }`}
                    >
                      {oVal}
                    </span>
                  </div>

                  {/* Dual Comparison Split Bar */}
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-stone-950 border border-stone-800 p-0.5">
                    <div
                      className="bg-amber-400 rounded-l transition-all duration-300"
                      style={{ width: `${pPercent}%` }}
                    />
                    <div
                      className="bg-pink-400 rounded-r transition-all duration-300"
                      style={{ width: `${oPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: APPEAL, ATTRIBUTES & SPECIALTY COMPARISON (DIMENSI KARAKTER & FITUR) */}
      <div
        className={`bg-stone-900/80 ${radius} border border-stone-800 overflow-hidden shadow-xl ${elevation} divide-y divide-stone-800 text-xs`}
      >
        <div className="px-5 py-3 bg-stone-950 font-bold uppercase tracking-wider text-stone-400 flex justify-between items-center">
          <span className="text-amber-400">{primaryArtist.firstName}</span>
          <span className="text-stone-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Dimensi Karakter & Fitur
          </span>
          <span className="text-cyan-400">{opponentArtist.firstName}</span>
        </div>

        {/* Maturity */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="w-1/3 text-left font-bold text-amber-300">
            {primaryArtist.appeal?.maturity || '-'}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
            Maturity
          </div>
          <div className="w-1/3 text-right font-bold text-cyan-300">
            {opponentArtist.appeal?.maturity || '-'}
          </div>
        </div>

        {/* Vibe */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="w-1/3 text-left font-bold text-stone-200">
            {primaryArtist.appeal?.vibe || '-'}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
            Vibe
          </div>
          <div className="w-1/3 text-right font-bold text-stone-200">
            {opponentArtist.appeal?.vibe || '-'}
          </div>
        </div>

        {/* Style */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="w-1/3 text-left font-bold text-stone-200">
            {primaryArtist.appeal?.style || '-'}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
            Style
          </div>
          <div className="w-1/3 text-right font-bold text-stone-200">
            {opponentArtist.appeal?.style || '-'}
          </div>
        </div>

        {/* Body Shape */}
        <div className="p-3.5 flex items-center justify-between">
          <div className="w-1/3 text-left font-bold text-stone-200">
            {primaryArtist.appeal?.bodyShape || '-'}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px]">
            Body Shape
          </div>
          <div className="w-1/3 text-right font-bold text-stone-200">
            {opponentArtist.appeal?.bodyShape || '-'}
          </div>
        </div>

        {/* Active Attributes Tags */}
        <div className="p-3.5 flex items-start justify-between">
          <div className="w-1/3 text-left flex flex-wrap gap-1">
            {(primaryArtist.attributes || []).map(attr => (
              <span
                key={attr}
                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold"
              >
                {attr}
              </span>
            ))}
            {(!primaryArtist.attributes || primaryArtist.attributes.length === 0) && (
              <span className="text-stone-500 italic text-[11px]">-</span>
            )}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px] pt-0.5">
            Attributes
          </div>
          <div className="w-1/3 text-right flex flex-wrap gap-1 justify-end">
            {(opponentArtist.attributes || []).map(attr => (
              <span
                key={attr}
                className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[10px] font-semibold"
              >
                {attr}
              </span>
            ))}
            {(!opponentArtist.attributes || opponentArtist.attributes.length === 0) && (
              <span className="text-stone-500 italic text-[11px]">-</span>
            )}
          </div>
        </div>

        {/* Active Specialty Tags */}
        <div className="p-3.5 flex items-start justify-between">
          <div className="w-1/3 text-left flex flex-wrap gap-1">
            {(primaryArtist.specialty || []).map(spec => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
              >
                {spec}
              </span>
            ))}
            {(!primaryArtist.specialty || primaryArtist.specialty.length === 0) && (
              <span className="text-stone-500 italic text-[11px]">-</span>
            )}
          </div>
          <div className="w-1/3 text-center text-stone-400 uppercase tracking-wider font-semibold text-[11px] pt-0.5">
            Specialty
          </div>
          <div className="w-1/3 text-right flex flex-wrap gap-1 justify-end">
            {(opponentArtist.specialty || []).map(spec => (
              <span
                key={spec}
                className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold"
              >
                {spec}
              </span>
            ))}
            {(!opponentArtist.specialty || opponentArtist.specialty.length === 0) && (
              <span className="text-stone-500 italic text-[11px]">-</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
