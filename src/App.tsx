import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import { Game } from "./game";
import type { State } from "./game";
import { Point } from "./game/point";

function debounce(fn: () => void, ms: number) {
  let lastTime = 0;
  return function () {
    const now = Date.now();
    if (now - lastTime > ms) {
      fn();
      lastTime = now;
    }
  };
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
  });

  const onTransitionEnd = useCallback(() => {
    const currentFns = fns.current;
    fns.current = [];
    currentFns.forEach((fn) => fn());
  }, []);

  const debouncedOnTransitionEnd = useCallback(debounce(onTransitionEnd, 10), [
    onTransitionEnd,
  ]);

  const onBindEvent = useCallback(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fns.current.length > 0) {
        return;
      }

      const keyCode = e.code;
      let result: State;

      switch (keyCode) {
        case "ArrowLeft": {
          result = controllerRef.current!.onLeft();
          break;
        }
        case "ArrowUp": {
          result = controllerRef.current!.onUp();
          break;
        }
        case "ArrowRight": {
          result = controllerRef.current!.onRight();
          break;
        }
        case "ArrowDown": {
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

      setState((prev) => ({ ...prev, elements, alts }));

      fns.current.push(() => {
        if (alts.length && playerRef.current) {
          playerRef.current.play();
        }
        alts.forEach((e) => {
          if (e.alt) {
            e.alt.val += e.alt.val;
          }
        });
        const { elements } = controllerRef.current!.doSpawn();
        setState((prev) => ({
          ...prev,
          alts: [],
          elements: elements,
          isEnd: controllerRef.current!.isOver(),
        }));
      });
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.elements]);

  const onStart = useCallback(() => {
    if (state.isStarted) {
      controllerRef.current = new Game(len, len);
    } else {
      setState((prev) => ({ ...prev, isStarted: true }));
    }
    const { elements } = controllerRef.current!.doSpawn();
    setState((prev) => ({ ...prev, elements }));
  }, [state.isStarted]);

  useEffect(() => {
    playerRef.current = document.getElementById("player") as HTMLAudioElement;
    controllerRef.current = new Game(len, len);
  }, []);

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
        style={{ width: 88 / len + "vw", height: 88 / len + "vw" }}
      >
        <div className="el"></div>
      </div>
    );
  });

  const points = ([] as Point[])
    .concat(state.elements)
    .concat(state.alts)
    .sort((a: Point, b: Point) => (a.id < b.id ? -1 : 1));
  const elements = points.map((e) => (
    <div
      key={e.id}
      className="point"
      style={{
        width: 88 / len + "vw",
        height: 88 / len + "vw",
        top: (e.y * 88) / len + "vw",
        left: (e.x * 88) / len + "vw",
      }}
    >
      <div className="el">{e.val}</div>
    </div>
  ));

  return (
    <div className="app">
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
