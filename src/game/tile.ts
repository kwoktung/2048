/**
 * Represents a tile in the 2048 game
 * Each tile has a position (x, y), value, and unique ID
 */
export class Tile {
  private static nextId = 1;

  public id: number;
  public value: number;
  public mergeSource?: Tile; // The other tile involved in a merge animation

  constructor(
    public x: number,
    public y: number
  ) {
    this.id = Tile.nextId++;
    // 30% chance for value 4, 70% chance for value 2
    this.value = Math.random() < 0.3 ? 4 : 2;
  }

  /**
   * Updates the tile's position based on its index in the board
   * @param boardIndex Index of the tile in the board array
   * @param boardWidth Width of the game board
   */
  updatePosition(boardIndex: number, boardWidth: number): void {
    this.x = boardIndex % boardWidth;
    this.y = Math.floor(boardIndex / boardWidth);
  }

  /**
   * Creates a deep copy of this tile
   * @returns New Tile instance with same properties
   */
  clone(): Tile {
    const cloned = new Tile(this.x, this.y);
    cloned.value = this.value;
    cloned.id = this.id;
    return cloned;
  }

  /**
   * Checks if this tile has the same position and value as another tile
   * @param other Tile to compare with
   * @returns true if tiles are identical
   */
  isSame(other: Tile): boolean {
    return this.x === other.x && this.y === other.y && this.value === other.value;
  }

  // Legacy method for backward compatibility
  location(val: number, base: number): void {
    this.updatePosition(val, base);
  }
}

/**
 * Represents a cell on the game board.
 * Can be either a Tile (occupied), number (empty cell index), or undefined.
 */
export type BoardCell = Tile | number | undefined;

/**
 * Moves tiles to the left and merges adjacent tiles with the same value
 * @param cellLine Array of board cells to process
 * @param mergeLimit Maximum value before tiles stop merging (default: 2048)
 * @returns Processed array of tiles
 */
export function moveAndMergeLeft(cellLine: BoardCell[], mergeLimit: number = 2048): Tile[] {
  const lineLength = cellLine.length;
  const tiles = cellLine.filter((item) => item instanceof Tile) as Tile[];

  // Clear any existing merge references
  tiles.forEach((tile) => delete tile.mergeSource);

  // Find and merge adjacent tiles with same value
  let mergeTargetIndex = -1;
  for (let i = 0; i < tiles.length - 1; i++) {
    const currentTile = tiles[i];
    const nextTile = tiles[i + 1];

    if (
      currentTile &&
      nextTile &&
      currentTile.value === nextTile.value &&
      mergeLimit > currentTile.value
    ) {
      mergeTargetIndex = i;
      // Set up merge animation references
      nextTile.mergeSource = currentTile;
      currentTile.mergeSource = nextTile;
      break;
    }
  }

  // Remove the first tile of the merged pair
  if (mergeTargetIndex !== -1) {
    tiles.splice(mergeTargetIndex, 1);
  }

  // Ensure array has correct length
  tiles.length = lineLength;

  return tiles;
}

/**
 * Moves tiles to the right and merges adjacent tiles with the same value
 * @param cellLine Array of board cells to process
 * @param mergeLimit Maximum value before tiles stop merging (default: 2048)
 * @returns Processed array of tiles
 */
export function moveAndMergeRight(
  cellLine: BoardCell[],
  mergeLimit: number = 2048
): (Tile | undefined)[] {
  const lineLength = cellLine.length;
  const tiles = cellLine.filter((item) => item instanceof Tile) as Tile[];

  // Clear any existing merge references
  tiles.forEach((tile) => delete tile.mergeSource);

  // Find and merge adjacent tiles with same value (from right to left)
  let mergeTargetIndex = -1;
  for (let i = tiles.length - 1; i > 0; i--) {
    const currentTile = tiles[i];
    const previousTile = tiles[i - 1];

    if (
      currentTile &&
      previousTile &&
      currentTile.value === previousTile.value &&
      mergeLimit > currentTile.value
    ) {
      mergeTargetIndex = i;
      // Set up merge animation references
      previousTile.mergeSource = currentTile;
      currentTile.mergeSource = previousTile;
      break;
    }
  }

  // Remove the second tile of the merged pair
  if (mergeTargetIndex !== -1) {
    tiles.splice(mergeTargetIndex, 1);
  }

  // Create result array with tiles shifted to the right
  const result: (Tile | undefined)[] = [...tiles];
  while (result.length < lineLength) {
    result.unshift(undefined);
  }

  return result;
}

/**
 * Converts a 2D array of tiles (columns) to a 1D board array
 * @param columnGrid 2D array of tiles organized by columns
 * @returns 1D array representing the game board
 */
export function convertGridToBoard(columnGrid: BoardCell[][]): (Tile | undefined)[] {
  const result: (Tile | undefined)[] = [];
  const maxLength = Math.max(...columnGrid.map((col) => col.length));

  for (let positionIndex = 0; positionIndex < maxLength; positionIndex++) {
    for (let gridIndex = 0; gridIndex < columnGrid.length; gridIndex++) {
      const tile = columnGrid[gridIndex][positionIndex];
      result.push(tile instanceof Tile ? tile : undefined);
    }
  }

  return result;
}
