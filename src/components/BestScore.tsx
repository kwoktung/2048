import type { BestScore } from "../hooks/useBestScore";

interface Props {
  bestScore: BestScore | null;
}

export function BestScore({ bestScore }: Props) {
  if (!bestScore) return null;

  return (
    <div className="w-full mt-3 bg-white/60 rounded-2xl px-4 py-3 flex justify-between items-center">
      <span className="text-text-primary font-black text-base">Best</span>
      <span className="font-bold text-text-primary text-base">
        {bestScore.score.toLocaleString()}
      </span>
      <span className="text-text-muted text-xs">
        {new Date(bestScore.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    </div>
  );
}
