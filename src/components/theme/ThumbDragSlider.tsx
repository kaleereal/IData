import React, { useRef, useState, useCallback } from 'react';

interface ThumbDragSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  className?: string;
  disabled?: boolean;
  accentColor?: string;
  trackBackground?: string;
  ariaLabel?: string;
}

export const ThumbDragSlider: React.FC<ThumbDragSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  className = '',
  disabled = false,
  accentColor,
  trackBackground,
  ariaLabel = 'Slider',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Safe normalized percentage (0 to 100%)
  const percentage = Math.max(
    0,
    Math.min(100, ((value - min) / (max - min || 1)) * 100)
  );

  const calculateValueFromPointer = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      if (trackWidth <= 0) return value;

      const offsetX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, offsetX / trackWidth));
      const rawVal = min + ratio * (max - min);

      // Quantize to step
      const stepped = Math.round((rawVal - min) / step) * step + min;
      const clamped = Math.max(min, Math.min(max, stepped));
      return clamped;
    },
    [min, max, step, value]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.stopPropagation();
    e.preventDefault();

    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      // safe fallback
    }
    setIsDragging(true);

    const initialVal = calculateValueFromPointer(e.clientX);
    onChange(initialVal);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const newVal = calculateValueFromPointer(moveEvent.clientX);
      onChange(newVal);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {
        // safe fallback
      }
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    let nextVal = value;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      nextVal = Math.min(max, value + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      nextVal = Math.max(min, value - step);
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextVal = min;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextVal = max;
      e.preventDefault();
    }
    if (nextVal !== value) {
      onChange(nextVal);
    }
  };

  return (
    <div
      ref={trackRef}
      onPointerDown={handlePointerDown}
      className={`relative w-full h-7 flex items-center select-none cursor-pointer touch-none ${
        disabled ? 'opacity-40 pointer-events-none' : ''
      } ${className}`}
    >
      {/* Background Track */}
      <div
        className="w-full h-2.5 rounded-full relative overflow-hidden bg-stone-800/90 border border-stone-700/50 pointer-events-none"
        style={trackBackground ? { background: trackBackground } : undefined}
      >
        {/* Filled Track Segment */}
        {!trackBackground && (
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: `${percentage}%`,
              backgroundColor: accentColor || 'var(--color-primary, #FE9900)',
            }}
          />
        )}
      </div>

      {/* Draggable Circular Knob (Dot Bulat) */}
      <div
        role="slider"
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        style={{
          left: `calc(${percentage}% - 10px)`,
          touchAction: 'none',
        }}
        className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-grab active:cursor-grabbing pointer-events-none ${
          isDragging ? 'scale-125 ring-4 ring-primary/40' : 'hover:scale-110'
        }`}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            backgroundColor: accentColor || 'var(--color-primary, #FE9900)',
          }}
        />
      </div>
    </div>
  );
};
