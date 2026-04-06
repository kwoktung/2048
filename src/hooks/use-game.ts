import { useState, useEffect, useRef, useCallback } from "react";
import { Game } from "../game";
import type { State } from "../game";
import { Tile } from "../game/tile";
import { useBestScore } from "./useBestScore";
import { useCountUp } from "./useCountUp";
import { useDebounceCallback } from "./use-debounce-callback";
import { areTileArraysEqual } from "../utils/tile-style";

interface GameState {
  tiles: Tile[];
  mergingTiles: Tile[];
  isStarted: boolean;
  isGameOver: boolean;
  score: number;
}

const GRID_SIZE = 4;

interface UseGameOptions {
  audioEnabled: boolean;
}

export function useGame({ audioEnabled }: UseGameOptions) {
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

  const onTransitionEnd = useCallback(() => {
    const callbacks = pendingCallbacks.current;
    pendingCallbacks.current = [];
    callbacks.forEach((fn) => fn());
  }, []);

  const debouncedOnTransitionEnd = useDebounceCallback(onTransitionEnd, 10);

  const handleMove = useCallback(
    (direction: "left" | "right" | "up" | "down") => {
      if (pendingCallbacks.current.length > 0) return;

      let result: State;
      switch (direction) {
        case "left":
          result = gameRef.current!.moveLeft();
          break;
        case "up":
          result = gameRef.current!.moveUp();
          break;
        case "right":
          result = gameRef.current!.moveRight();
          break;
        case "down":
          result = gameRef.current!.moveDown();
          break;
        default:
          return;
      }

      const { tiles, mergingTiles } = result;
      if (areTileArraysEqual(tiles, state.tiles)) return;

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
        const { tiles: newTiles } = gameRef.current!.spawnNewTile();
        const newScore = gameRef.current!.getScore();
        const gameOver = gameRef.current!.isGameOver();
        if (gameOver && newScore > 0) {
          updateBestScore(newScore);
        }
        setState((prev) => ({
          ...prev,
          mergingTiles: [],
          tiles: newTiles,
          isGameOver: gameOver,
          score: newScore,
        }));
      });
    },
    [state.tiles, audioEnabled, updateBestScore]
  );

  const handleStartOrRestart = useCallback(() => {
    if (state.isStarted) {
      gameRef.current = new Game(GRID_SIZE, GRID_SIZE);
    } else {
      setState((prev) => ({ ...prev, isStarted: true }));
    }
    const { tiles } = gameRef.current!.spawnNewTile();
    const newScore = gameRef.current!.getScore();
    setState((prev) => ({ ...prev, tiles, score: newScore, isGameOver: false }));
  }, [state.isStarted]);

  useEffect(() => {
    audioRef.current = document.getElementById("player") as HTMLAudioElement;
    gameRef.current = new Game(GRID_SIZE, GRID_SIZE);
  }, []);

  return {
    state,
    animatedScore,
    bestScore,
    handleMove,
    handleStartOrRestart,
    debouncedOnTransitionEnd,
    gridSize: GRID_SIZE,
  };
}
