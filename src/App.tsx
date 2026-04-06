import React, { useState, useEffect, useCallback } from "react";
import "./index.css";
import { useGame } from "./hooks/use-game";
import { useSwipeDetection } from "./hooks/use-swipe-detection";
import { SoundToggle } from "./components/sound-toggle";
import { GameBoard } from "./components/game-board";

const App: React.FC = () => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const toggleAudio = useCallback(() => setAudioEnabled((prev) => !prev), []);

  const {
    state,
    animatedScore,
    bestScore,
    gridSize,
    handleMove,
    handleStartOrRestart,
    debouncedOnTransitionEnd,
  } = useGame({ audioEnabled });

  useSwipeDetection(handleMove, state.isStarted);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isStarted) {
        if (e.code === "Space") handleStartOrRestart();
        return;
      }
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      const direction = map[e.code];
      if (direction) handleMove(direction);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.isStarted, handleMove, handleStartOrRestart]);

  return (
    <div
      className="main antialiased text-center w-full max-w-[600px] mx-auto h-full flex flex-col justify-center items-center relative p-[16px] box-border select-none [touch-action:manipulation] bg-bg-page"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <SoundToggle audioEnabled={audioEnabled} onToggle={toggleAudio} />

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

      <GameBoard
        tiles={state.tiles}
        mergingTiles={state.mergingTiles}
        gridSize={gridSize}
        isGameOver={state.isGameOver}
        onTransitionEnd={debouncedOnTransitionEnd}
      />

      <div className="mt-3 h-[8vh] min-h-[48px] w-full">
        {(!state.isStarted || state.isGameOver) && (
          <div
            className="h-full rounded-2xl flex justify-center items-center bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-xl font-bold cursor-pointer shadow-md transition-all duration-200"
            onClick={handleStartOrRestart}
          >
            {state.isStarted ? "Restart" : "Start"}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
