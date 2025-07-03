import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { Game } from "./game";
import type { State } from "./game";
import { Point } from "./game/point";

function useDebounceCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<number | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

function isEqual(prev: Point[], next: Point[]) {
  if (prev.length !== next.length) {
    return false;
  }
  for (let i = 0, len = prev.length; i < len; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id || a.x !== b.x || a.y !== b.y || a.val !== b.val) {
      return false;
    }
  }
  return true;
}

interface GameState {
  elements: Point[];
  alts: Point[];
  isStarted: boolean;
  isEnd: boolean;
  score: number;
}

// Custom hook for swipe detection
function useSwipeDetection(
  onSwipe: (direction: "left" | "right" | "up" | "down") => void,
  isActive: boolean
) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50; // Minimum distance to trigger a swipe

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

      if (distance < minSwipeDistance) return;

      const angle = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

      // Determine swipe direction based on angle
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

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchEnd, isActive]);
}

const App: React.FC = () => {
  const len = 4;
  const fns = useRef<(() => void)[]>([]);
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<Game | null>(null);

  const [state, setState] = useState<GameState>({
    elements: [],
    alts: [],
    isStarted: false,
    isEnd: false,
    score: 0,
  });

  const [audioEnabled, setAudioEnabled] = useState(true);

  const onTransitionEnd = useCallback(() => {
    const currentFns = fns.current;
    fns.current = [];
    currentFns.forEach((fn) => fn());
  }, []);

  const debouncedOnTransitionEnd = useDebounceCallback(onTransitionEnd, 10);

  const handleMove = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (fns.current.length > 0) {
        return;
      }

      let result: State;

      switch (direction) {
        case "left": {
          result = controllerRef.current!.onLeft();
          break;
        }
        case "up": {
          result = controllerRef.current!.onUp();
          break;
        }
        case "right": {
          result = controllerRef.current!.onRight();
          break;
        }
        case "down": {
          result = controllerRef.current!.onDown();
          break;
        }
        default: {
          return;
        }
      }

      const { elements, alts } = result;
      if (isEqual(elements, state.elements)) {
        return;
      }

      const newScore = controllerRef.current!.getScore();
      setState((prev) => ({ ...prev, elements, alts, score: newScore }));

      fns.current.push(() => {
        if (alts.length && playerRef.current && audioEnabled) {
          playerRef.current.play();
        }
        alts.forEach((e) => {
          if (e.alt) {
            e.alt.val += e.alt.val;
          }
        });
        const { elements } = controllerRef.current!.doSpawn();
        const newScore = controllerRef.current!.getScore();
        setState((prev) => ({
          ...prev,
          alts: [],
          elements: elements,
          isEnd: controllerRef.current!.isOver(),
          score: newScore,
        }));
      });
    },
    [state.elements, audioEnabled]
  );

  const onBindEvent = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyCode = e.code;
      let direction: "left" | "right" | "up" | "down" | null = null;

      switch (keyCode) {
        case "ArrowLeft": {
          direction = "left";
          break;
        }
        case "ArrowUp": {
          direction = "up";
          break;
        }
        case "ArrowRight": {
          direction = "right";
          break;
        }
        case "ArrowDown": {
          direction = "down";
          break;
        }
        default: {
          return;
        }
      }

      if (direction) {
        handleMove(direction);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleMove]);

  const onStart = useCallback(() => {
    if (state.isStarted) {
      controllerRef.current = new Game(len, len);
    } else {
      setState((prev) => ({ ...prev, isStarted: true }));
    }
    const { elements } = controllerRef.current!.doSpawn();
    const newScore = controllerRef.current!.getScore();
    setState((prev) => ({ ...prev, elements, score: newScore }));
  }, [state.isStarted]);

  useEffect(() => {
    playerRef.current = document.getElementById("player") as HTMLAudioElement;
    controllerRef.current = new Game(len, len);
  }, []);

  // Use swipe detection hook - only active when game is started
  useSwipeDetection(handleMove, state.isStarted);

  useEffect(() => {
    if (state.isStarted) {
      return onBindEvent();
    }
  }, [state.isStarted, onBindEvent]);

  const list = Array.from({ length: len * len });
  const es = list.map((_, i) => {
    return (
      <div
        className="element"
        key={i}
        style={{
          width: 100 / len + "%",
          height: 100 / len + "%",
          aspectRatio: "1 / 1",
        }}
      >
        <div className="el"></div>
      </div>
    );
  });

  const points: Point[] = ([] as Point[])
    .concat(state.elements)
    .concat(state.alts)
    .sort((a: Point, b: Point) => (a.id < b.id ? -1 : 1));
  const elements = points.map((e) => (
    <div
      key={e.id}
      className="point"
      style={{
        width: 100 / len + "%",
        top: (e.y * 100) / len + "%",
        left: (e.x * 100) / len + "%",
        aspectRatio: "1 / 1",
      }}
    >
      <div className="el">{e.val}</div>
    </div>
  ));

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  return (
    <div className="main">
      <div className="audio-control">
        <button
          className="audio-btn"
          onClick={toggleAudio}
          aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
        >
          {audioEnabled ? "🔊" : "🔇"}
        </button>
      </div>
      <div className="score-display">Score: {state.score}</div>
      <div className="container">
        <div className="static">{es}</div>
        <div className="dynamic" onTransitionEnd={debouncedOnTransitionEnd}>
          {elements}
        </div>
      </div>
      <div className="btn" onClick={onStart}>
        {state.isStarted ? "Restart" : "Start"}
      </div>
    </div>
  );
};

export default App;
