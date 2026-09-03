import React, { useState } from 'react';
import { Sparkles, Star, Heart, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export interface ThemeColors {
  background: string;
  secondary: string;
  primary: string;
  text: string;
  accent: string;
  buttonText?: string;
  isDark?: boolean;
}

interface ThemeMiniPreviewStackProps {
  colors: ThemeColors;
  themeName?: string;
  isDark?: boolean;
}

export const ThemeMiniPreviewStack: React.FC<ThemeMiniPreviewStackProps> = ({
  colors,
  themeName = 'Kustom',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFavorited, setIsFavorited] = useState(true);

  const btnText = colors.buttonText || '#ffffff';

  return (
    <div className="sticky top-0 sm:top-2 z-50 mb-4 transition-all duration-200 py-1">
      <div
        className="rounded-2xl border shadow-2xl backdrop-blur-xl overflow-hidden transition-all"
        style={{
          backgroundColor: colors.background,
          borderColor: `${colors.primary}50`,
          color: colors.text,
          boxShadow: `0 16px 36px -10px ${colors.primary}35, 0 0 0 1px ${colors.primary}25`,
        }}
      >
        {/* Sticky Header Bar */}
        <div
          className="px-3.5 py-2 flex items-center justify-between border-b transition-colors"
          style={{
            backgroundColor: `${colors.secondary}90`,
            borderColor: `${colors.primary}30`,
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-xs"
              style={{ backgroundColor: colors.primary, color: btnText }}
            >
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-black uppercase tracking-wider truncate" style={{ color: colors.text }}>
                Pratinjau Real-Time
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 truncate max-w-[140px]"
                style={{
                  backgroundColor: `${colors.accent}20`,
                  borderColor: `${colors.accent}60`,
                  color: colors.accent,
                }}
              >
                {themeName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 6-Color Swatch Dots */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border"
              style={{
                backgroundColor: colors.background,
                borderColor: `${colors.primary}30`,
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: colors.background }} title={`Background: ${colors.background}`} />
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: colors.secondary }} title={`Secondary (Card): ${colors.secondary}`} />
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: colors.primary }} title={`Primary: ${colors.primary}`} />
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: colors.text }} title={`Teks: ${colors.text}`} />
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: colors.accent }} title={`Accent: ${colors.accent}`} />
              <span className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs" style={{ backgroundColor: btnText }} title={`Button Text: ${btnText}`} />
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: `${colors.primary}15`,
                color: colors.text,
              }}
              title={isMinimized ? 'Perluas Pratinjau' : 'Ciutkan Pratinjau'}
            >
              {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mini Preview Stack Content */}
        {!isMinimized && (
          <div className="p-3 sm:p-3.5 grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch text-xs">
            {/* 1. Mini Card Item Sample (Container Secondary) */}
            <div
              className="p-3 rounded-xl border space-y-2 relative transition-all flex flex-col justify-between shadow-xs"
              style={{
                backgroundColor: colors.secondary,
                borderColor: `${colors.primary}35`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                    borderColor: `${colors.primary}40`,
                  }}
                >
                  TOP #1 ARTIS
                </span>
                <button
                  type="button"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="transition-transform active:scale-90 cursor-pointer p-0.5"
                >
                  <Heart
                    className="w-3.5 h-3.5"
                    style={{
                      fill: isFavorited ? colors.accent : 'transparent',
                      color: colors.accent,
                    }}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2.5 my-1">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border shadow-xs"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    color: colors.accent,
                    borderColor: `${colors.primary}40`,
                  }}
                >
                  AV
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-xs truncate" style={{ color: colors.text }}>
                    Eimi Fukada
                  </h5>
                  <p className="text-[10px] truncate font-medium" style={{ color: colors.accent }}>
                    Tokyo • Debut 2017
                  </p>
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-1.5 border-t"
                style={{ borderColor: `${colors.primary}20` }}
              >
                <span className="text-[10px]" style={{ color: colors.accent }}>
                  Rating Keseluruhan:
                </span>
                <span
                  className="font-mono font-bold text-[11px] flex items-center gap-1"
                  style={{ color: colors.accent }}
                >
                  <Star className="w-3 h-3 fill-current" /> 9.85
                </span>
              </div>
            </div>

            {/* 2. Interactive Buttons & Badges (Secondary Container) */}
            <div
              className="p-3 rounded-xl border space-y-2.5 flex flex-col justify-between shadow-xs"
              style={{
                backgroundColor: colors.secondary,
                borderColor: `${colors.primary}35`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: colors.accent }}>
                  Elemen Tombol & Aksen
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${colors.accent}20`,
                    borderColor: `${colors.accent}50`,
                    color: colors.accent,
                  }}
                >
                  Active
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  style={{
                    backgroundColor: colors.primary,
                    color: btnText,
                    boxShadow: `0 4px 12px -2px ${colors.primary}50`,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tombol Primary</span>
                </button>

                <button
                  type="button"
                  className="py-1.5 px-2.5 rounded-xl font-bold text-xs border transition-all cursor-pointer"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: `${colors.primary}40`,
                    color: colors.text,
                  }}
                >
                  Secondary
                </button>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${colors.accent}20`,
                    borderColor: `${colors.accent}60`,
                    color: colors.accent,
                  }}
                >
                  ★ Badge Aksen
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${colors.primary}25`,
                    borderColor: `${colors.primary}50`,
                    color: colors.primary,
                  }}
                >
                  Tag Primary
                </span>
                <span
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold border"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: `${colors.accent}40`,
                    color: colors.accent,
                  }}
                >
                  #1 Rank
                </span>
              </div>
            </div>

            {/* 3. Typography & 6-Color System Spec */}
            <div
              className="p-3 rounded-xl border space-y-2 flex flex-col justify-between shadow-xs"
              style={{
                backgroundColor: colors.secondary,
                borderColor: `${colors.primary}35`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: colors.accent }}>
                  Hierarki Teks & Warna
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: colors.primary, color: btnText }}
                >
                  6 ATURAN
                </span>
              </div>

              <div>
                <h4 className="font-black text-xs sm:text-sm tracking-tight truncate" style={{ color: colors.text }}>
                  Teks Judul Utama (Text)
                </h4>
                <p className="text-[10px] sm:text-[11px] line-clamp-1 font-medium" style={{ color: colors.accent }}>
                  Sub-teks detail deskripsi dengan warna accent.
                </p>
              </div>

              {/* 6-Element HEX Swatches Matrix */}
              <div
                className="grid grid-cols-3 gap-1 pt-1.5 border-t text-[9px] font-mono"
                style={{ borderColor: `${colors.primary}20` }}
              >
                <div className="truncate" title={`Background: ${colors.background}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>BG: </span>
                  <span style={{ color: colors.text }}>{colors.background}</span>
                </div>
                <div className="truncate" title={`Secondary (Card): ${colors.secondary}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>SEC: </span>
                  <span style={{ color: colors.text }}>{colors.secondary}</span>
                </div>
                <div className="truncate" title={`Primary: ${colors.primary}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>PRI: </span>
                  <span style={{ color: colors.primary }}>{colors.primary}</span>
                </div>
                <div className="truncate" title={`Text: ${colors.text}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>TXT: </span>
                  <span style={{ color: colors.text }}>{colors.text}</span>
                </div>
                <div className="truncate" title={`Accent: ${colors.accent}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>ACC: </span>
                  <span style={{ color: colors.accent }}>{colors.accent}</span>
                </div>
                <div className="truncate" title={`Button Text: ${btnText}`}>
                  <span className="font-bold opacity-75" style={{ color: colors.accent }}>BTN: </span>
                  <span style={{ color: btnText }}>{btnText}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
