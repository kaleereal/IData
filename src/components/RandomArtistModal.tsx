import React, { useState, useEffect } from 'react';
import { Artist } from '../types';
import {
  calculateAppearanceScore,
  calculateImpressionScore,
  calculateOverallRating,
  calculateProportionalRating,
  calculateAge,
  getCountryFlag,
  getTypeInfo,
  getScoreStatus,
} from '../utils/calculations';
import {
  X,
  Shuffle,
  Sparkles,
  Trophy,
  ArrowRightLeft,
  ChevronRight,
  Flame,
  Star,
  ExternalLink,
} from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';

interface RandomArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: Artist[];
  onSelectArtist: (artist: Artist) => void;
  onOpenCompare?: (artist: Artist) => void;
  isDark?: boolean;
}

export const RandomArtistModal: React.FC<RandomArtistModalProps> = ({
  isOpen,
  onClose,
  artists,
  onSelectArtist,
  onOpenCompare,
  isDark = true,
}) => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  // Function to pick a random artist
  const pickRandom = () => {
    if (artists.length === 0) return;
    setIsShuffling(true);

    let count = 0;
    const maxSteps = 10;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * artists.length);
      setSelectedArtist(artists[randomIndex]);
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 60);
  };

  useEffect(() => {
    if (isOpen) {
      pickRandom();
    }
  }, [isOpen]);

  // Keyboard shortcut: Esc to close, Space to shuffle
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        pickRandom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, artists]);

  if (!isOpen || !selectedArtist) return null;

  const app = calculateAppearanceScore(selectedArtist.appearanceScores);
  const imp = calculateImpressionScore(selectedArtist.impressionScores);
  const overall = calculateOverallRating(app, imp);
  const prop = calculateProportionalRating(selectedArtist.measurements);
  const age = calculateAge(selectedArtist.bornDate);
  const flag = getCountryFlag(selectedArtist.countryCode, selectedArtist.country);
  const typeInfo = getTypeInfo(selectedArtist.typeCode);
  const scoreStatus = getScoreStatus(overall);
  const isSpecial = (selectedArtist.attributes?.length || 0) > 0;
  const isFav = isFavorite(selectedArtist.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-stone-900 border-stone-800 text-stone-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800/80 bg-stone-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
                <span>Spotlight Acak Artis</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  GACHA
                </span>
              </h3>
              <p className="text-[10px] text-stone-400">Temukan profil artis secara acak</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="flex gap-4 items-start">
            {/* Avatar Photo with Glow */}
            <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden shrink-0 border border-amber-500/40 shadow-lg group bg-stone-800">
              {selectedArtist.avatarUrl ? (
                <img
                  src={selectedArtist.avatarUrl}
                  alt={selectedArtist.firstName}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isShuffling ? 'scale-110 blur-xs' : 'scale-100'
                  }`}
                  referrerPolicy="no-referrer"
                  onError={e => {
                    (e.currentTarget as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-black bg-stone-800 text-amber-400">
                  {selectedArtist.firstName.charAt(0)}
                </div>
              )}
              {/* Score Badge Overlay */}
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md border border-amber-500/50 text-[10px] font-black font-mono text-amber-300">
                {overall}
              </div>
            </div>

            {/* Info details */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{flag}</span>
                  <span
                    className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded border font-mono ${
                      isSpecial
                        ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50'
                        : 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                    }`}
                  >
                    {isSpecial ? 'SPECIAL' : 'STANDARD'}
                  </span>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedArtist.id)}
                  className={`p-1 rounded-lg border transition-all ${
                    isFav
                      ? 'bg-amber-500 text-stone-950 border-amber-400'
                      : 'bg-stone-800/80 text-stone-400 border-stone-700 hover:text-amber-300'
                  }`}
                  title={isFav ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>
              </div>

              <h4 className="text-base sm:text-lg font-black tracking-tight truncate">
                {selectedArtist.firstName} {selectedArtist.lastName}
              </h4>

              <div className="text-[11px] text-stone-400 space-y-0.5">
                <p>
                  Usia: <strong className="text-stone-200">{age > 0 ? `${age} thn` : '-'}</strong> • Tinggi: <strong className="text-stone-200">{selectedArtist.heightCm} cm</strong>
                </p>
                <p>
                  Ukuran: <strong className="text-stone-200">Cup {selectedArtist.measurements.cupSize}</strong> ({selectedArtist.measurements.bustCm}-{selectedArtist.measurements.waistCm}-{selectedArtist.measurements.hipCm})
                </p>
                <p>
                  Tipe: <strong className="text-stone-200">{selectedArtist.typeCode}</strong> ({typeInfo?.indonesia || '-'})
                </p>
              </div>

              {/* Status Pill */}
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${scoreStatus.borderColor} ${scoreStatus.bgColor} ${scoreStatus.color}`}>
                  <Trophy className="w-3 h-3" />
                  {scoreStatus.label} • {scoreStatus.tier}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Score Bars */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-950/50 border border-stone-800/80 text-xs">
            <div>
              <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Appearance (60%)</span>
                <span className="font-bold text-cyan-400">{app.toFixed(1)}</span>
              </div>
              <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, app)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-stone-400 mb-1">
                <span>Impression (40%)</span>
                <span className="font-bold text-pink-400">{imp.toFixed(1)}</span>
              </div>
              <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pink-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, imp)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={pickRandom}
              disabled={isShuffling}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold text-xs border border-stone-700 transition-all active:scale-95 disabled:opacity-50 shadow-md"
            >
              <Shuffle className={`w-3.5 h-3.5 text-amber-400 ${isShuffling ? 'animate-spin' : ''}`} />
              <span>{isShuffling ? 'Mengacak...' : 'Acak Lagi (Space)'}</span>
            </button>

            {onOpenCompare && (
              <button
                onClick={() => {
                  onOpenCompare(selectedArtist);
                  onClose();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 text-xs font-bold transition-all active:scale-95 shadow-md"
                title="Bandingkan artis ini"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Duel</span>
              </button>
            )}

            <button
              onClick={() => {
                onSelectArtist(selectedArtist);
                onClose();
              }}
              className="w-full sm:w-auto flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-950 transition-all active:scale-95"
            >
              <span>Buka Profil</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
