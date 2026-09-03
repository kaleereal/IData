import React, { useRef, useState } from 'react';
import { Artist } from '../types';
import { ArtistCard } from './ArtistCard';
import { X, Download, Share2, Sparkles, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: Artist | null;
  rank?: number;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  isOpen,
  onClose,
  artist,
  rank,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !artist) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.98,
        pixelRatio: 3,
        backgroundColor: '#1c1917',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });
      const link = document.createElement('a');
      link.download = `ARTIST_CARD_${artist.firstName}_${artist.lastName || ''}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${artist.firstName} ${artist.lastName}`,
          text: `Profil Penilaian Artis ${artist.firstName} ${artist.lastName} di Talent Rating System.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Close Button Floating */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors shadow-lg"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Canvas */}
        <div className="w-full max-w-[320px] shadow-2xl rounded-xl overflow-hidden ring-1 ring-white/20">
          <ArtistCard
            artist={artist}
            rank={rank}
            showRankBadge={true}
            isDownloadableRef={cardRef}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 mt-5 w-full max-w-[320px]">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Menyimpan...' : 'Simpan Card (PNG)'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-xs border border-stone-700 transition-all active:scale-95"
            title="Bagikan Tautan"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-stone-300" />
                <span>Bagikan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
