import React, { useRef, useState, useCallback, useEffect } from 'react';

interface DragOnlySliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
  accentColor?: 'cyan' | 'pink' | 'amber';
  disabled?: boolean;
  ariaLabel?: string;
}

export const DragOnlySlider: React.FC<DragOnlySliderProps> = ({
  value,
  min = 0,
  max = 99,
  step = 1,
  onChange,
  accentColor = 'cyan',
  disabled = false,
  ariaLabel = 'Rating Slider',
}) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Clamp current value
  const clampedValue = Math.min(max, Math.max(min, value || 0));
  const percentage = max > min ? ((clampedValue - min) / (max - min)) * 100 : 0;

  const updateValueFromClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const relativeX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, relativeX / rect.width));
      let rawVal = min + ratio * (max - min);

      if (step > 0) {
        rawVal = Math.round((rawVal - min) / step) * step + min;
      }
      const finalVal = Math.round(Math.max(min, Math.min(max, rawVal)));
      onChange(finalVal);
    },
    [min, max, step, onChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    // Only initiate dragging if the interaction originated on the thumb handle
    e.stopPropagation();
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || disabled) return;
    e.preventDefault();
    updateValueFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDragging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(max, clampedValue + (e.shiftKey ? step * 5 : step));
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(min, clampedValue - (e.shiftKey ? step * 5 : step));
      onChange(prev);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(min);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(max);
    }
  };

  const colorStyles = {
    cyan: {
      fill: 'bg-cyan-400',
      thumb: 'bg-cyan-400 border-white text-cyan-950',
      ring: 'ring-4 ring-cyan-400/30',
      glow: 'shadow-cyan-400/50',
    },
    pink: {
      fill: 'bg-pink-400',
      thumb: 'bg-pink-400 border-white text-pink-950',
      ring: 'ring-4 ring-pink-400/30',
      glow: 'shadow-pink-400/50',
    },
    amber: {
      fill: 'bg-amber-400',
      thumb: 'bg-amber-400 border-white text-amber-950',
      ring: 'ring-4 ring-amber-400/30',
      glow: 'shadow-amber-400/50',
    },
  }[accentColor];

  return (
    <div className="w-full select-none py-1.5 touch-none">
      {/* Track Container (Clicking track does NOT jump value - protected) */}
      <div
        ref={trackRef}
        className="relative w-full h-3 bg-stone-800/90 rounded-full border border-stone-700/60 overflow-visible flex items-center cursor-default"
      >
        {/* Progress Fill */}
        <div
          style={{ width: `${percentage}%` }}
          className={`h-full rounded-full transition-all duration-75 ${colorStyles.fill}`}
        />

        {/* Draggable Thumb Knob */}
        <div
          ref={thumbRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={clampedValue}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            left: `calc(${percentage}% - 11px)`,
            touchAction: 'none',
          }}
          className={`absolute top-1/2 -translate-y-1/2 w-5.5 h-5.5 rounded-full border-2 shadow-lg transition-transform cursor-grab active:cursor-grabbing flex items-center justify-center ${
            colorStyles.thumb
          } ${isDragging ? `scale-125 ${colorStyles.ring} shadow-xl` : isHovered ? 'scale-110' : 'scale-100'} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {/* Inner Dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-stone-950/80" />
        </div>
      </div>
    </div>
  );
};
