import { useEffect, useRef } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minDistance?: number;
  maxVerticalRatio?: number;
  disabled?: boolean;
}

/**
 * Hook to attach touch swipe gestures to an element or window
 */
export function useSwipeGesture<T extends HTMLElement = HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  minDistance = 50,
  maxVerticalRatio = 0.6,
  disabled = false,
}: SwipeOptions) {
  const containerRef = useRef<T | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number; target: EventTarget | null } | null>(null);

  useEffect(() => {
    if (disabled) return;
    const element = containerRef.current || document.body;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const target = e.target as HTMLElement | null;

      // Ignore interactive controls that handle their own gestures
      if (target) {
        if (
          target.closest('input') ||
          target.closest('textarea') ||
          target.closest('select') ||
          target.closest('[data-drag-slider]') ||
          target.closest('[data-no-swipe]') ||
          target.closest('.overflow-x-auto') ||
          target.closest('.overflow-x-scroll')
        ) {
          touchStartRef.current = null;
          return;
        }
      }

      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        target: e.target,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || e.changedTouches.length !== 1) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      touchStartRef.current = null;

      // Must be within reasonable swipe duration (e.g. < 800ms)
      if (deltaTime > 800) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Check distance and that horizontal movement dominates vertical movement
      if (absX >= minDistance && absY <= absX * maxVerticalRatio) {
        if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, minDistance, maxVerticalRatio, disabled]);

  return containerRef;
}
