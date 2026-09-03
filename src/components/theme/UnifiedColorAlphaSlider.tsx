import React, { useState, useMemo } from 'react';
import { Sliders, Check, Eye, RefreshCw, Palette } from 'lucide-react';
import { ThumbDragSlider } from './ThumbDragSlider';

interface UnifiedColorAlphaSliderProps {
  label: string;
  color?: string; // can be rgba(r, g, b, a), #hex, #hexa, rgb(...)
  value?: string; // support both value and color props
  onChange: (newColor: string) => void;
  isDark?: boolean;
  defaultColor?: string;
  showAlpha?: boolean;
}

// Convert any color string (rgba, rgb, hex, hexa) to { r, g, b, a, h, s, l }
export function parseAnyColor(input: string): {
  r: number;
  g: number;
  b: number;
  a: number; // 0 to 1
  h: number; // 0 to 360
  s: number; // 0 to 100
  l: number; // 0 to 100
} {
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  const str = (input || '').trim();

  if (str.startsWith('rgba') || str.startsWith('rgb')) {
    const match = str.match(
      /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i
    );
    if (match) {
      r = Math.min(255, Math.max(0, parseFloat(match[1])));
      g = Math.min(255, Math.max(0, parseFloat(match[2])));
      b = Math.min(255, Math.max(0, parseFloat(match[3])));
      if (match[4] !== undefined) {
        a = Math.min(1, Math.max(0, parseFloat(match[4])));
      }
    }
  } else if (str.startsWith('#')) {
    let hex = str.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('') + 'FF';
    } else if (hex.length === 4) {
      hex = hex.split('').map((c) => c + c).join('');
    } else if (hex.length === 6) {
      hex = hex + 'FF';
    }
    if (hex.length >= 8) {
      r = parseInt(hex.substring(0, 2), 16) || 0;
      g = parseInt(hex.substring(2, 4), 16) || 0;
      b = parseInt(hex.substring(4, 6), 16) || 0;
      a = (parseInt(hex.substring(6, 8), 16) || 255) / 255;
    }
  } else if (str === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0, h: 0, s: 0, l: 0 };
  }

  // Convert r,g,b to HSL
  const rNorm = r / 255,
    gNorm = g / 255,
    bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm),
    min = Math.min(rNorm, gNorm, bNorm);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
    a: Math.min(1, Math.max(0, a)),
    h: Math.round(h * 360) || 0,
    s: Math.round(s * 100) || 0,
    l: Math.round(l * 100) || 0,
  };
}

// Convert HSL + Alpha to formatted rgba string
export function hslToRgbaString(h: number, s: number, l: number, a: number): string {
  const lNorm = l / 100;
  const sNorm = s / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const aColor = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => lNorm - aColor * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  const alphaRounded = Math.round(a * 100) / 100;
  if (alphaRounded === 1) {
    return `rgba(${r}, ${g}, ${b}, 1)`;
  }
  return `rgba(${r}, ${g}, ${b}, ${alphaRounded})`;
}

// Quick presets for element background and borders
const QUICK_PRESETS = [
  { label: 'Gelap Transparan (65%)', value: 'rgba(0, 0, 0, 0.65)' },
  { label: 'Gelap Pekat (90%)', value: 'rgba(0, 0, 0, 0.9)' },
  { label: 'Kaca Gelap (40%)', value: 'rgba(12, 10, 9, 0.4)' },
  { label: 'Kaca Putih (15%)', value: 'rgba(255, 255, 255, 0.15)' },
  { label: 'Amber Gold (60%)', value: 'rgba(254, 153, 0, 0.6)' },
  { label: 'Cyan Glow (60%)', value: 'rgba(0, 188, 213, 0.6)' },
  { label: 'Emerald (60%)', value: 'rgba(16, 185, 129, 0.6)' },
  { label: 'Rose Pink (60%)', value: 'rgba(244, 63, 94, 0.6)' },
  { label: 'Purple (60%)', value: 'rgba(168, 85, 247, 0.6)' },
  { label: 'Transparan Penuh', value: 'rgba(0, 0, 0, 0)' },
];

export const UnifiedColorAlphaSlider: React.FC<UnifiedColorAlphaSliderProps> = ({
  label,
  color,
  value,
  onChange,
  isDark = true,
  defaultColor = 'rgba(0, 0, 0, 0.65)',
  showAlpha = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currentColor = color !== undefined ? color : value !== undefined ? value : defaultColor;

  const parsed = useMemo(() => parseAnyColor(currentColor), [currentColor]);

  // Handle single Hue Slider Change (0-360)
  const handleHueChange = (newHue: number) => {
    // If saturation is too low, boost saturation so color is visible
    const safeSat = parsed.s < 15 ? 90 : parsed.s;
    const safeLit = parsed.l < 10 ? 50 : parsed.l > 90 ? 50 : parsed.l;
    const nextColor = hslToRgbaString(newHue, safeSat, safeLit, parsed.a);
    onChange(nextColor);
  };

  // Handle Alpha / Opacity Slider Change (0-100%)
  const handleAlphaChange = (newAlphaPercent: number) => {
    const alphaNorm = newAlphaPercent / 100;
    const nextColor = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alphaNorm.toFixed(2)})`;
    onChange(nextColor);
  };

  const solidRgb = `rgb(${parsed.r}, ${parsed.g}, ${parsed.b})`;

  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
      }`}
    >
      {/* Top Header Row: Swatch, Label, Text Input, Expand Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Swatch with Checkerboard background for alpha */}
          <div
            className="w-8 h-8 rounded-xl border border-stone-700/80 shrink-0 relative overflow-hidden shadow-xs"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
            title="Warna aktif saat ini"
          >
            <div className="w-full h-full" style={{ backgroundColor: currentColor }} />
          </div>

          <div className="min-w-0">
            <span className="text-xs font-bold block truncate text-stone-200">
              {label}
            </span>
            <span className="text-[10px] font-mono text-stone-400 block truncate">
              {Math.round(parsed.a * 100)}% Opasitas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={currentColor}
            onChange={(e) => onChange(e.target.value)}
            placeholder="rgba(0,0,0,0.65)"
            className={`w-32 p-1.5 rounded-lg border text-[11px] font-mono font-bold text-center ${
              isDark
                ? 'bg-stone-950 border-stone-700 text-amber-300'
                : 'bg-stone-50 border-stone-300 text-stone-900'
            }`}
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-sm'
                : 'bg-stone-800 text-stone-400 hover:text-white border-stone-700 hover:bg-stone-700'
            }`}
            title="Buka slider warna & opasitas terpadu"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Unified Sliders: Hue (Spectrum) & Alpha (Opacity) */}
      <div className="mt-3 space-y-2.5 pt-2 border-t border-stone-800/80">
        {/* 1. HUE COLOR SLIDER (Rainbow Spectrum) with Interactive Thumb Knob */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span className="font-bold text-stone-300">Hue Spektrum Warna</span>
            <span className="text-amber-400 font-bold">{parsed.h}°</span>
          </div>
          <ThumbDragSlider
            min={0}
            max={360}
            step={1}
            value={parsed.h}
            onChange={handleHueChange}
            trackBackground="linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
            accentColor={`hsl(${parsed.h}, 100%, 50%)`}
            ariaLabel="Hue Color Spectrum"
          />
        </div>

        {/* 2. OPACITY / ALPHA SLIDER with Interactive Thumb Knob */}
        {showAlpha && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
              <span className="font-bold text-stone-300">Opasitas / Transparansi</span>
              <span className="text-amber-400 font-bold">{Math.round(parsed.a * 100)}%</span>
            </div>
            <div
              className="rounded-lg overflow-hidden p-0.5"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%)',
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            >
              <ThumbDragSlider
                min={0}
                max={100}
                step={1}
                value={Math.round(parsed.a * 100)}
                onChange={handleAlphaChange}
                trackBackground={`linear-gradient(to right, transparent, ${solidRgb})`}
                accentColor={solidRgb}
                ariaLabel="Alpha Opacity"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded Controls: Saturation/Lightness & Quick Preset Swatches */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-3 animate-in fade-in duration-150">
          {/* Saturation & Lightness Fine-tune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>Kejenuhan (Saturation)</span>
                <span className="text-stone-300 font-bold">{parsed.s}%</span>
              </div>
              <ThumbDragSlider
                min={0}
                max={100}
                step={1}
                value={parsed.s}
                onChange={(s) => {
                  const nextColor = hslToRgbaString(parsed.h, s, parsed.l, parsed.a);
                  onChange(nextColor);
                }}
                trackBackground={`linear-gradient(to right, hsl(${parsed.h}, 0%, ${parsed.l}%), hsl(${parsed.h}, 100%, ${parsed.l}%))`}
                accentColor={`hsl(${parsed.h}, ${parsed.s}%, ${parsed.l}%)`}
                ariaLabel="Saturation"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                <span>Kecerahan (Lightness)</span>
                <span className="text-stone-300 font-bold">{parsed.l}%</span>
              </div>
              <ThumbDragSlider
                min={0}
                max={100}
                step={1}
                value={parsed.l}
                onChange={(l) => {
                  const nextColor = hslToRgbaString(parsed.h, parsed.s, l, parsed.a);
                  onChange(nextColor);
                }}
                trackBackground={`linear-gradient(to right, #000, hsl(${parsed.h}, ${parsed.s}%, 50%), #fff)`}
                accentColor={`hsl(${parsed.h}, ${parsed.s}%, ${parsed.l}%)`}
                ariaLabel="Lightness"
              />
            </div>
          </div>

          {/* Quick Tone Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-stone-400 w-full sm:w-auto font-mono">Preset Cepat:</span>
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.value)}
                className="px-2 py-1 rounded-md text-[10px] font-mono font-bold border border-stone-800 bg-stone-950 text-stone-300 hover:text-white hover:border-amber-400 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-stone-600"
                  style={{ backgroundColor: p.value }}
                />
                <span className="truncate max-w-[120px]">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
