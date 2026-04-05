import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
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

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleTouchStart, handleTouchEnd, handleTouchMove, isActive]);
}

function SoundOnIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
    </svg>
  );
}

function getTileStyle(val: number): { bg: string; text: string } {
  if (val <= 2)   return { bg: "#FFF9C4", text: "#78550A" };
  if (val <= 4)   return { bg: "#FFE082", text: "#78550A" };
  if (val <= 8)   return { bg: "#FFB74D", text: "#fff" };
  if (val <= 16)  return { bg: "#FF8A65", text: "#fff" };
  if (val <= 32)  return { bg: "#FF7043", text: "#fff" };
  if (val <= 64)  return { bg: "#F4511E", text: "#fff" };
  if (val <= 128) return { bg: "#FFD740", text: "#78550A" };
  if (val <= 256) return { bg: "#FFC400", text: "#78550A" };
  if (val <= 512) return { bg: "#FF9100", text: "#fff" };
  if (val <= 1024) return { bg: "#FF6D00", text: "#fff" };
  return { bg: "#DD2C00", text: "#fff" };
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
        className="element box-border relative flex justify-center items-center"
        key={i}
        style={{
          width: 100 / len + "%",
          height: 100 / len + "%",
          aspectRatio: "1 / 1",
        }}
      >
        <div className="w-[90%] h-[90%] rounded-xl bg-[#F5E6C8]"></div>
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
      className="box-border absolute flex justify-center items-center transition-all duration-500 ease-in-out"
      style={{
        width: 100 / len + "%",
        top: (e.y * 100) / len + "%",
        left: (e.x * 100) / len + "%",
        aspectRatio: "1 / 1",
      }}
    >
      <div
          className={`w-[90%] h-[90%] rounded-xl flex justify-center items-center font-bold shadow-sm ${String(e.val).length >= 4 ? "text-lg" : String(e.val).length === 3 ? "text-xl" : "text-2xl"}`}
          style={{ backgroundColor: getTileStyle(e.val).bg, color: getTileStyle(e.val).text }}
        >
        {e.val}
      </div>
    </div>
  ));

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  return (
    <div className="main antialiased text-center w-full max-w-[600px] mx-auto h-full flex flex-col justify-center items-center relative p-[16px] box-border select-none [touch-action:manipulation] bg-[#FFF8F0]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="flex justify-between items-center w-full mb-4">
        <div className="bg-[#F5A623] text-white px-5 py-2 rounded-2xl text-lg font-bold shadow-md">
          Score: {state.score}
        </div>
        <button
          className="border-0 rounded-full w-[50px] h-[50px] text-xl cursor-pointer flex justify-center items-center bg-[#F5A623] text-white shadow-md transition-all duration-200 hover:bg-[#E09520] hover:scale-105 active:scale-95"
          onClick={toggleAudio}
          aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
        >
          {audioEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
      </div>
      <div className="flex items-center justify-center w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg [touch-action:manipulation]">
        <div className="flex flex-row w-full h-full flex-wrap relative bg-[#C9956C]">
          {es}
        </div>
        <div
          className="flex flex-row w-full h-full flex-wrap absolute inset-0"
          onTransitionEnd={debouncedOnTransitionEnd}
        >
          {elements}
        </div>
      </div>
      <div
        className="mt-3 rounded-2xl h-[8vh] min-h-[48px] w-full flex justify-center items-center bg-[#F5A623] hover:bg-[#E09520] active:bg-[#CC8510] text-white text-xl font-bold cursor-pointer shadow-md transition-all duration-200"
        onClick={onStart}
      >
        {state.isStarted ? "Restart" : "Start"}
      </div>
    </div>
  );
};

export default App;
