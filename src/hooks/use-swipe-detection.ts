import { useCallback, useEffect, useRef } from "react";

type Direction = "left" | "right" | "up" | "down";

const MIN_SWIPE_DISTANCE = 50;

export function useSwipeDetection(onSwipe: (direction: Direction) => void, isActive: boolean) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isActive) return;
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [isActive]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isActive || !touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < MIN_SWIPE_DISTANCE) return;

      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      if (angle >= -45 && angle <= 45) {
        onSwipe("right");
      } else if (angle >= 45 && angle <= 135) {
        onSwipe("down");
      } else if (angle >= 135 || angle <= -135) {
        onSwipe("left");
      } else {
        onSwipe("up");
      }

      touchStartRef.current = null;
    },
    [onSwipe, isActive]
  );

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove, isActive]);
}
