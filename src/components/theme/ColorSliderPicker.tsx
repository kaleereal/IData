import React, { useState } from 'react';
import { Sliders, Check, RefreshCw } from 'lucide-react';

interface ColorSliderPickerProps {
  label: string;
  colorHex: string;
  onChange: (newHex: string) => void;
  isDark?: boolean;
}

// Convert Hex to HSL
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360) || 0,
    s: Math.round(s * 100) || 0,
    l: Math.round(l * 100) || 0,
  };
}

// Convert HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Convert Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16) || 0,
      g: parseInt(cleanHex.substring(2, 4), 16) || 0,
      b: parseInt(cleanHex.substring(4, 6), 16) || 0,
    };
  }
  return { r: 0, g: 0, b: 0 };
}

// Convert RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`.toUpperCase();
}

export const ColorSliderPicker: React.FC<ColorSliderPickerProps> = ({
  label,
  colorHex,
  onChange,
  isDark = true,
}) => {
  const [mode, setMode] = useState<'hsl' | 'rgb'>('hsl');
  const [isExpanded, setIsExpanded] = useState(false);

  const hsl = hexToHsl(colorHex);
  const rgb = hexToRgb(colorHex);

  const handleHslChange = (part: 'h' | 's' | 'l', val: number) => {
    const nextHsl = { ...hsl, [part]: val };
    const nextHex = hslToHex(nextHsl.h, nextHsl.s, nextHsl.l);
    onChange(nextHex);
  };

  const handleRgbChange = (part: 'r' | 'g' | 'b', val: number) => {
    const nextRgb = { ...rgb, [part]: val };
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    onChange(nextHex);
  };

  return (
    <div
      className={`p-3 rounded-2xl border transition-all ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
      }`}
    >
      {/* Top Bar: Label, Color Swatch, Hex Input & Expand Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative">
            <input
              type="color"
              value={colorHex.startsWith('#') ? colorHex : `#${colorHex}`}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className="w-7 h-7 rounded-lg border border-stone-700 bg-transparent cursor-pointer shrink-0"
              title="Pilih warna native"
            />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider block truncate text-stone-300">
              {label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={colorHex}
            onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('#')) val = '#' + val;
              onChange(val.toUpperCase());
            }}
            className="w-20 bg-stone-950 border border-stone-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white text-center"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-stone-800 text-stone-400 hover:text-white border-stone-700 hover:bg-stone-700'
            }`}
            title="Buka slider warna presisi (HSL / RGB)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Slider Controls */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-800/80 space-y-2.5 animate-in fade-in duration-150">
          {/* Mode Switcher: HSL vs RGB */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-400">Mode Slider:</span>
            <div className="flex rounded-lg p-0.5 bg-stone-950 border border-stone-800 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setMode('hsl')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  mode === 'hsl' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                HSL
              </button>
              <button
                type="button"
                onClick={() => setMode('rgb')}
                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  mode === 'rgb' ? 'bg-purple-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                RGB
              </button>
            </div>
          </div>

          {/* HSL SLIDERS */}
          {mode === 'hsl' && (
            <div className="space-y-2">
              {/* Hue (0-360) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Hue (Warna)</span>
                  <span className="text-purple-300 font-bold">{hsl.h}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
              </div>

              {/* Saturation (0-100) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Saturation (Kejenuhan)</span>
                  <span className="text-purple-300 font-bold">{hsl.s}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
                  }}
                />
              </div>

              {/* Lightness (0-100) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Lightness (Kecerahan)</span>
                  <span className="text-purple-300 font-bold">{hsl.l}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #000000, ${hslToHex(hsl.h, hsl.s, 50)}, #ffffff)`,
                  }}
                />
              </div>
            </div>
          )}

          {/* RGB SLIDERS */}
          {mode === 'rgb' && (
            <div className="space-y-2">
              {/* Red (0-255) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Red (Merah)</span>
                  <span className="text-rose-400 font-bold">{rgb.r}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${rgbToHex(0, rgb.g, rgb.b)}, ${rgbToHex(255, rgb.g, rgb.b)})`,
                  }}
                />
              </div>

              {/* Green (0-255) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Green (Hijau)</span>
                  <span className="text-emerald-400 font-bold">{rgb.g}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${rgbToHex(rgb.r, 0, rgb.b)}, ${rgbToHex(rgb.r, 255, rgb.b)})`,
                  }}
                />
              </div>

              {/* Blue (0-255) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>Blue (Biru)</span>
                  <span className="text-cyan-400 font-bold">{rgb.b}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${rgbToHex(rgb.r, rgb.g, 0)}, ${rgbToHex(rgb.r, rgb.g, 255)})`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
