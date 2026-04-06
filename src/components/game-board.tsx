import type { Tile } from "../game/tile";
import { getTileStyle } from "../utils/tile-style";

interface Props {
  tiles: Tile[];
  mergingTiles: Tile[];
  gridSize: number;
  isGameOver: boolean;
  onTransitionEnd: () => void;
}

export function GameBoard({ tiles, mergingTiles, gridSize, isGameOver, onTransitionEnd }: Props) {
  const cellSize = 100 / gridSize + "%";

  const backgroundCells = Array.from({ length: gridSize * gridSize }).map((_, i) => (
    <div
      key={i}
      className="element box-border relative flex justify-center items-center"
      style={{ width: cellSize, height: cellSize, aspectRatio: "1 / 1" }}
    >
      <div className="w-[90%] h-[90%] rounded-xl bg-bg-empty-tile" />
    </div>
  ));

  const allTiles = ([] as Tile[])
    .concat(tiles)
    .concat(mergingTiles)
    .sort((a, b) => (a.id < b.id ? -1 : 1));

  const tileNodes = allTiles.map((tile) => {
    const { bg, text } = getTileStyle(tile.value);
    const digits = String(tile.value).length;
    const fontSize = digits >= 4 ? "text-lg" : digits === 3 ? "text-xl" : "text-2xl";

    return (
      <div
        key={tile.id}
        className="box-border absolute flex justify-center items-center transition-all duration-500 ease-in-out"
        style={{
          width: cellSize,
          top: (tile.y * 100) / gridSize + "%",
          left: (tile.x * 100) / gridSize + "%",
          aspectRatio: "1 / 1",
        }}
      >
        <div
          className={`w-[90%] h-[90%] rounded-xl flex justify-center items-center font-bold shadow-sm ${fontSize}`}
          style={{ backgroundColor: bg, color: text }}
        >
          {tile.value}
        </div>
      </div>
    );
  });

  return (
    <div className="flex items-center justify-center w-full aspect-square relative rounded-2xl overflow-hidden shadow-lg [touch-action:manipulation]">
      <div className="flex flex-row w-full h-full flex-wrap relative bg-bg-board">
        {backgroundCells}
      </div>
      <div
        className="flex flex-row w-full h-full flex-wrap absolute inset-0"
        onTransitionEnd={onTransitionEnd}
      >
        {tileNodes}
      </div>
      {isGameOver && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black/40 rounded-2xl">
          <span className="text-white text-3xl font-black drop-shadow">Game Over</span>
        </div>
      )}
    </div>
  );
}
