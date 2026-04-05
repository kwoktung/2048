import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { Game } from "./game";
import type { State } from "./game";
import { Tile } from "./game/tile";
import { useBestScore } from "./hooks/useBestScore";
import { useCountUp } from "./hooks/useCountUp";

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

function areTileArraysEqual(prev: Tile[], next: Tile[]) {
  if (prev.length !== next.length) {
    return false;
  }
  for (let i = 0, len = prev.length; i < len; i++) {
    const a = prev[i];
    const b = next[i];
    if (a.id !== b.id || a.x !== b.x || a.y !== b.y || a.value !== b.value) {
      return false;
    }
  }
  return true;
}

interface GameState {
  tiles: Tile[];
  mergingTiles: Tile[];
  isStarted: boolean;
  isGameOver: boolean;
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6"
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
    </svg>
  );
}

function getTileStyle(value: number): { bg: string; text: string } {
  if (value <= 2) return { bg: "var(--color-tile-2-bg)", text: "var(--color-tile-2-text)" };
  if (value <= 4) return { bg: "var(--color-tile-4-bg)", text: "var(--color-tile-4-text)" };
  if (value <= 8) return { bg: "var(--color-tile-8-bg)", text: "var(--color-tile-8-text)" };
  if (value <= 16) return { bg: "var(--color-tile-16-bg)", text: "var(--color-tile-16-text)" };
  if (value <= 32) return { bg: "var(--color-tile-32-bg)", text: "var(--color-tile-32-text)" };
  if (value <= 64) return { bg: "var(--color-tile-64-bg)", text: "var(--color-tile-64-text)" };
  if (value <= 128) return { bg: "var(--color-tile-128-bg)", text: "var(--color-tile-128-text)" };
  if (value <= 256) return { bg: "var(--color-tile-256-bg)", text: "var(--color-tile-256-text)" };
  if (value <= 512) return { bg: "var(--color-tile-512-bg)", text: "var(--color-tile-512-text)" };
  if (value <= 1024)
    return { bg: "var(--color-tile-1024-bg)", text: "var(--color-tile-1024-text)" };
  return { bg: "var(--color-tile-max-bg)", text: "var(--color-tile-max-text)" };
}

const App: React.FC = () => {
  const gridSize = 4;
  const pendingCallbacks = useRef<(() => void)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const { bestScore, updateBestScore } = useBestScore();

  const [state, setState] = useState<GameState>({
    tiles: [],
    mergingTiles: [],
    isStarted: false,
    isGameOver: false,
    score: 0,
  });

  const animatedScore = useCountUp(state.score);

  const [audioEnabled, setAudioEnabled] = useState(true);

  const onTransitionEnd = useCallback(() => {
    const callbacks = pendingCallbacks.current;
    pendingCallbacks.current = [];
    callbacks.forEach((fn) => fn());
  }, []);

  const debouncedOnTransitionEnd = useDebounceCallback(onTransitionEnd, 10);

  const handleMove = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (pendingCallbacks.current.length > 0) {
        return;
      }

      let result: State;

      switch (direction) {
        case "left": {
          result = gameRef.current!.moveLeft();
          break;
        }
        case "up": {
          result = gameRef.current!.moveUp();
          break;
        }
        case "right": {
          result = gameRef.current!.moveRight();
          break;
        }
        case "down": {
          result = gameRef.current!.moveDown();
          break;
        }
        default: {
          return;
        }
      }

      const { tiles, mergingTiles } = result;
      if (areTileArraysEqual(tiles, state.tiles)) {
        return;
      }

      setState((prev) => ({ ...prev, tiles, mergingTiles }));

      pendingCallbacks.current.push(() => {
        if (mergingTiles.length && audioRef.current && audioEnabled) {
          audioRef.current.play();
        }
        mergingTiles.forEach((tile) => {
          if (tile.mergeSource) {
            tile.mergeSource.value += tile.mergeSource.value;
          }
        });
        const { tiles } = gameRef.current!.spawnNewTile();
        const newScore = gameRef.current!.getScore();
        const gameOver = gameRef.current!.isGameOver();
        if (gameOver && newScore > 0) {
          updateBestScore(newScore);
        }
        setState((prev) => ({
          ...prev,
          mergingTiles: [],
          tiles,
          isGameOver: gameOver,
          score: newScore,
        }));
      });
    },
    [state.tiles, audioEnabled, updateBestScore]
  );

  const registerKeyboardListeners = useCallback(() => {
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

  const handleStartOrRestart = useCallback(() => {
    if (state.isStarted) {
      gameRef.current = new Game(gridSize, gridSize);
    } else {
      setState((prev) => ({ ...prev, isStarted: true }));
    }
    const { tiles } = gameRef.current!.spawnNewTile();
    const newScore = gameRef.current!.getScore();
    setState((prev) => ({ ...prev, tiles, score: newScore }));
  }, [state.isStarted]);

  useEffect(() => {
    audioRef.current = document.getElementById("player") as HTMLAudioElement;
    gameRef.current = new Game(gridSize, gridSize);
  }, []);

  // Use swipe detection hook - only active when game is started
  useSwipeDetection(handleMove, state.isStarted);

  useEffect(() => {
    if (state.isStarted) {
      return registerKeyboardListeners();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") handleStartOrRestart();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.isStarted, registerKeyboardListeners, handleStartOrRestart]);

  const cellIndices = Array.from({ length: gridSize * gridSize });
  const backgroundCells = cellIndices.map((_, i) => {
    return (
      <div
        className="element box-border relative flex justify-center items-center"
        key={i}
        style={{
          width: 100 / gridSize + "%",
          height: 100 / gridSize + "%",
          aspectRatio: "1 / 1",
        }}
      >
        <div className="w-[90%] h-[90%] rounded-xl bg-bg-empty-tile"></div>
      </div>
    );
  });

  const allTiles: Tile[] = ([] as Tile[])
    .concat(state.tiles)
    .concat(state.mergingTiles)
    .sort((a: Tile, b: Tile) => (a.id < b.id ? -1 : 1));
  const tileNodes = allTiles.map((tile) => (
    <div
      key={tile.id}
      className="box-border absolute flex justify-center items-center transition-all duration-500 ease-in-out"
      style={{
        width: 100 / gridSize + "%",
        top: (tile.y * 100) / gridSize + "%",
        left: (tile.x * 100) / gridSize + "%",
        aspectRatio: "1 / 1",
      }}
    >
      <div
        className={`w-[90%] h-[90%] rounded-xl flex justify-center items-center font-bold shadow-sm ${String(tile.value).length >= 4 ? "text-lg" : String(tile.value).length === 3 ? "text-xl" : "text-2xl"}`}
        style={{
          backgroundColor: getTileStyle(tile.value).bg,
          color: getTileStyle(tile.value).text,
        }}
      >
        {tile.value}
      </div>
    </div>
  ));

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => !prev);
  }, []);

  return (
    <div
      className="main antialiased text-center w-full max-w-[600px] mx-auto h-full flex flex-col justify-center items-center relative p-[16px] box-border select-none [touch-action:manipulation] bg-bg-page"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <button
        className="absolute top-4 right-4 border-0 rounded-full w-[44px] h-[44px] text-xl cursor-pointer flex justify-center items-center bg-accent text-white shadow-md transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95"
        onClick={toggleAudio}
        aria-label={audioEnabled ? "Mute audio" : "Unmute audio"}
      >
        {audioEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
      </button>
      <div className="flex justify-between items-center w-full mb-4">
        <div className="bg-accent text-white px-5 py-2 rounded-2xl text-lg font-bold shadow-md">
          Score: {animatedScore}
        </div>
        {bestScore && (
          <div className="bg-accent text-white px-5 py-2 rounded-2xl text-lg font-bold shadow-md">
            Best: {bestScore.score.toLocaleString()}
          </div>
        )}
      </div>
      <div className="flex items-center justify-center w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg [touch-action:manipulation]">
        <div className="flex flex-row w-full h-full flex-wrap relative bg-bg-board">
          {backgroundCells}
        </div>
        <div
          className="flex flex-row w-full h-full flex-wrap absolute inset-0"
          onTransitionEnd={debouncedOnTransitionEnd}
        >
          {tileNodes}
        </div>
      </div>
      <div
        className="mt-3 rounded-2xl h-[8vh] min-h-[48px] w-full flex justify-center items-center bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-xl font-bold cursor-pointer shadow-md transition-all duration-200"
        onClick={handleStartOrRestart}
      >
        {state.isStarted ? "Restart" : "Start"}
      </div>
    </div>
  );
};

export default App;
