import { useState, useCallback } from "react";

export interface BestScore {
  score: number;
  date: string;
}

const STORAGE_KEY = "2048_best_score";

export function useBestScore() {
  const [bestScore, setBestScore] = useState<BestScore | null>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    } catch {
      return null;
    }
  });

  const updateBestScore = useCallback((score: number) => {
    setBestScore((prev) => {
      if (prev && prev.score >= score) return prev;
      const next = { score, date: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { bestScore, updateBestScore };
}
