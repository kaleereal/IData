import React, { useState, useRef } from 'react';
import {
  CustomPageEntry,
  CustomPageBlock,
  CustomPageImage,
  CustomPageButton,
  Artist,
  AppTheme,
} from '../types';
import { useUITheme } from '../context/UIThemeContext';
import {
  getBorderRadiusClass,
  getInnerRadiusClass,
  getElevationClass,
} from '../utils/uiThemeEngine';
import {
  ArrowLeft,
  Edit2,
  User,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Maximize2,
  X,
  Layers,
  Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Share2,
} from 'lucide-react';

interface CustomPageViewProps {
  entry: CustomPageEntry;
  artists: Artist[];
  onBack: () => void;
  onBackToHome?: () => void;
  onEdit: (entry: CustomPageEntry) => void;
  onDelete?: (id: string) => void;
  onNavigateToArtistDetail?: (artist: Artist) => void;
  onSelectArtist?: (artist: Artist) => void;
  theme?: AppTheme;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  entry,
  artists,
  onBack,
  onBackToHome,
  onEdit,
  onDelete,
  onNavigateToArtistDetail,
  onSelectArtist,
}) => {
  const navigateToArtist = onNavigateToArtistDetail || onSelectArtist;
  const uiTheme = useUITheme();
  const radius = getBorderRadiusClass(uiTheme.tokens?.radius?.card || uiTheme.global.borderRadius);
  const innerRadius = getInnerRadiusClass(uiTheme.tokens?.radius?.inner || uiTheme.global.borderRadius);
  const elevation = getElevationClass(uiTheme.tokens?.shadows?.elevation || uiTheme.global.elevation);

  // Zoom / Lightbox modal state
  const [activeLightboxImage, setActiveLightboxImage] = useState<CustomPageImage | null>(null);

  // References for horizontal slide bar containers
  const slideBarRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Linked Artist lookup (with safe fallback if artist was deleted or missing)
  const linkedArtist = entry.linkedArtistId
    ? artists.find(a => a.id === entry.linkedArtistId)
    : undefined;

  const handleSlideScroll = (blockId: string, direction: 'left' | 'right') => {
    const el = slideBarRefs.current[blockId];
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-32 space-y-6 text-stone-100 animate-in fade-in duration-300">
      {/* 1. Header Bar & Navigation */}
      <div className={`p-4 sm:p-5 ${radius} bg-stone-900/90 border border-stone-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className={`p-2.5 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer`}
            title="Kembali ke Daftar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                HALAMAN CUSTOM
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase mt-0.5">
              {entry.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {linkedArtist && navigateToArtist && (
            <button
              type="button"
              onClick={() => navigateToArtist(linkedArtist)}
              className={`flex items-center gap-2 px-3.5 py-2 ${innerRadius} bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer`}
              title="Lihat Profil Lengkap Artis"
            >
              {linkedArtist.avatarUrl ? (
                <img
                  src={linkedArtist.avatarUrl}
                  alt={linkedArtist.firstName}
                  className="w-4 h-4 rounded-full object-cover shrink-0"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span className="truncate max-w-[140px]">
                {linkedArtist.firstName} {linkedArtist.lastName}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(entry)}
            className={`flex items-center gap-2 px-4 py-2 ${innerRadius} bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-bold transition-all cursor-pointer`}
          >
            <Edit2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Edit Entri</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Card: Description & Metadata */}
      {(entry.description || linkedArtist) && (
        <div className={`p-5 sm:p-6 ${radius} bg-stone-900 border border-stone-800 space-y-3.5 ${elevation}`}>
          {entry.description && (
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed whitespace-pre-line">
              {entry.description}
            </p>
          )}

          {linkedArtist && (
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 font-mono text-[11px]">Artis Tertaut:</span>
                <button
                  type="button"
                  onClick={() => navigateToArtist?.(linkedArtist)}
                  className="font-bold text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {linkedArtist.firstName} {linkedArtist.lastName}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    ({linkedArtist.country})
                  </span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-stone-400">
                {entry.blocks.length} Blok Konten Aktif
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Render Dynamic Content Blocks */}
      {/* Requirement 22 & 23: Dynamic Custom Renderer reading block configurations */}
      <div className="space-y-6">
        {!entry?.blocks || entry.blocks.length === 0 ? (
          <div className={`p-10 ${radius} bg-stone-900/40 border border-stone-800 text-center space-y-2`}>
            <Layers className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="text-xs text-stone-400">Entri ini belum memiliki blok konten.</p>
          </div>
        ) : (
          (entry.blocks || []).map((block, bIdx) => {
            // -------------------------------------------------------------
            // IMAGE CATEGORY BLOCK RENDERER
            // -------------------------------------------------------------
            if (block.type === 'image_category') {
              const images = block.images || [];

              return (
                <div
                  key={block.id || bIdx}
                  className={`p-4 sm:p-6 ${radius} bg-stone-900 border border-stone-800 space-y-4 ${elevation}`}
                >
                  {/* Category Title & Controls if Slide Bar */}
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-stone-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                        {block.title || `Galeri Foto #${bIdx + 1}`}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-stone-400 uppercase">
                        {images.length} Foto
                      </span>

                      {/* Slide Bar Nav Buttons */}
                      {block.layout === 'slide_bar' && images.length > 0 && (
                        <div className="flex items-center gap-1 ml-2">
                          <button
                            type="button"
                            onClick={() => handleSlideScroll(block.id, 'left')}
                            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                            title="Geser Kiri"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSlideScroll(block.id, 'right')}
                            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                            title="Geser Kanan"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empty state for category */}
                  {images.length === 0 ? (
                    <div className="p-8 text-center bg-stone-950/40 rounded-xl border border-stone-800/50 text-xs text-stone-400 italic">
                      Kategori galeri ini belum memiliki foto yang diunggah.
                    </div>
                  ) : block.layout === 'slide_bar' ? (
                    /* 1. Slide Bar (Horizontal Scroll Snap) */
                    <div
                      ref={el => (slideBarRefs.current[block.id] = el)}
                      className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
                    >
                      {images.map((img, imgIdx) => (
                        <div
                          key={img.id || imgIdx}
                          onClick={() => setActiveLightboxImage(img)}
                          className="w-64 sm:w-80 shrink-0 snap-start rounded-2xl bg-stone-950 border border-stone-800 hover:border-cyan-500/50 transition-all overflow-hidden cursor-pointer group shadow-lg flex flex-col justify-between"
                        >
                          <div className="aspect-[4/3] w-full bg-stone-950 overflow-hidden relative">
                            <img
                              src={img.url}
                              alt={img.caption || `Foto #${imgIdx + 1}`}
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {img.caption && (
                            <div className="p-2.5 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-300 truncate">
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* 2. Grid Layouts (2, 3, or 4 columns) */
                    <div
                      className={`grid gap-3 ${
                        block.layout === 'grid_2'
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : block.layout === 'grid_4'
                          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                          : 'grid-cols-2 sm:grid-cols-3' // default grid_3
                      }`}
                    >
                      {images.map((img, imgIdx) => (
                        <div
                          key={img.id || imgIdx}
                          onClick={() => setActiveLightboxImage(img)}
                          className="rounded-2xl bg-stone-950 border border-stone-800 hover:border-cyan-500/50 transition-all overflow-hidden cursor-pointer group shadow-md flex flex-col justify-between"
                        >
                          <div className="aspect-[4/3] w-full bg-stone-950 overflow-hidden relative">
                            <img
                              src={img.url}
                              alt={img.caption || `Foto #${imgIdx + 1}`}
                              onError={e => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="p-2 rounded-full bg-black/60 text-white backdrop-blur-sm">
                                <Maximize2 className="w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {img.caption && (
                            <div className="p-2.5 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-300 truncate">
                              {img.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // -------------------------------------------------------------
            // BUTTONS GROUP BLOCK RENDERER
            // -------------------------------------------------------------
            if (block.type === 'buttons_group') {
              const buttons = block.buttons || [];

              return (
                <div
                  key={block.id || bIdx}
                  className={`p-4 sm:p-6 ${radius} bg-stone-900 border border-emerald-500/20 space-y-4 ${elevation}`}
                >
                  {block.title && (
                    <div className="flex items-center gap-2 border-b border-stone-800/80 pb-2.5">
                      <LinkIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                      <h2 className="text-xs sm:text-sm font-black text-emerald-400 uppercase tracking-wider">
                        {block.title}
                      </h2>
                    </div>
                  )}

                  {buttons.length === 0 ? (
                    <div className="p-4 text-center text-xs text-stone-400 italic">
                      Belum ada tombol yang ditambahkan.
                    </div>
                  ) : (
                    <div
                      className={`gap-3 ${
                        block.layout === 'grid_2'
                          ? 'grid grid-cols-1 sm:grid-cols-2'
                          : block.layout === 'grid_3'
                          ? 'grid grid-cols-1 sm:grid-cols-3'
                          : block.layout === 'horizontal_wrap'
                          ? 'flex flex-wrap items-center'
                          : 'flex flex-col space-y-2' // vertical
                      }`}
                    >
                      {buttons.map((btn, btnIdx) => {
                        const rawUrl = btn.url || '#';
                        const href = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

                        // Style variations
                        let styleClass =
                          'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold border-transparent';
                        if (btn.layoutRule === 'gradient') {
                          styleClass =
                            'bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-stone-950 font-black';
                        } else if (btn.layoutRule === 'outline') {
                          styleClass =
                            'bg-stone-950/80 hover:bg-stone-800 border-stone-700 hover:border-amber-400 text-stone-100 font-semibold';
                        } else if (btn.layoutRule === 'pill') {
                          styleClass =
                            'bg-stone-800 hover:bg-stone-700 text-amber-300 border-amber-500/30 rounded-full font-bold';
                        }

                        return (
                          <a
                            key={btn.id || btnIdx}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-98 ${styleClass}`}
                          >
                            <span className="font-bold truncate">{btn.label || 'Buka Link'}</span>
                            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all shrink-0" />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {/* 4. Lightbox Modal */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveLightboxImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-stone-800 text-stone-300 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={activeLightboxImage.url}
              alt={activeLightboxImage.caption || 'Foto Zoom'}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-stone-700"
            />

            {activeLightboxImage.caption && (
              <div className="mt-3 px-4 py-2 rounded-xl bg-stone-900/90 border border-stone-800 text-xs text-stone-200 font-semibold max-w-xl text-center">
                {activeLightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
