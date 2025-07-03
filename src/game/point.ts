/**
 * Represents a tile in the 2048 game
 * Each tile has a position (x, y), value, and unique ID
 */
export class Point {
  private static nextId = 1;
  
  public id: number;
  public val: number;
  public alt?: Point; // Alternative point for merge animations

  constructor(public x: number, public y: number) {
    this.id = Point.nextId++;
    // 30% chance for value 4, 70% chance for value 2
    this.val = Math.random() < 0.3 ? 4 : 2;
  }

  /**
   * Updates the point's position based on its index in the board
   * @param boardIndex Index of the point in the board array
   * @param boardWidth Width of the game board
   */
  updatePosition(boardIndex: number, boardWidth: number): void {
    this.x = boardIndex % boardWidth;
    this.y = Math.floor(boardIndex / boardWidth);
  }

  /**
   * Creates a deep copy of this point
   * @returns New Point instance with same properties
   */
  clone(): Point {
    const cloned = new Point(this.x, this.y);
    cloned.val = this.val;
    cloned.id = this.id;
    return cloned;
  }

  /**
   * Checks if this point has the same position and value as another point
   * @param other Point to compare with
   * @returns true if points are identical
   */
  isSame(other: Point): boolean {
    return this.x === other.x && this.y === other.y && this.val === other.val;
  }

  // Legacy method for backward compatibility
  location(val: number, base: number): void {
    this.updatePosition(val, base);
  }
}

/**
 * Represents a position on the game board
 * Can be either a Point (tile), number (empty position index), or undefined
 */
export type Block = Point | number | undefined;

/**
 * Moves tiles to the left and merges adjacent tiles with the same value
 * @param tiles Array of tiles to process
 * @param maxValue Maximum value before tiles stop merging (default: 2048)
 * @returns Processed array of tiles
 */
export function moveAndMergeLeft(tiles: Block[], maxValue: number = 2048): Point[] {
  const boardSize = tiles.length;
  const gameTiles = tiles.filter(item => item instanceof Point) as Point[];
  
  // Clear any existing merge references
  gameTiles.forEach(tile => delete tile.alt);
  
  // Find and merge adjacent tiles with same value
  let mergeIndex = -1;
  for (let i = 0; i < gameTiles.length - 1; i++) {
    const currentTile = gameTiles[i];
    const nextTile = gameTiles[i + 1];
    
    if (currentTile && nextTile && 
        currentTile.val === nextTile.val && 
        maxValue > currentTile.val) {
      mergeIndex = i;
      // Set up merge animation references
      nextTile.alt = currentTile;
      currentTile.alt = nextTile;
      break;
    }
  }
  
  // Remove the first tile of the merged pair
  if (mergeIndex !== -1) {
    gameTiles.splice(mergeIndex, 1);
  }
  
  // Ensure array has correct length
  gameTiles.length = boardSize;
  
  return gameTiles;
}

/**
 * Moves tiles to the right and merges adjacent tiles with the same value
 * @param tiles Array of tiles to process
 * @param maxValue Maximum value before tiles stop merging (default: 2048)
 * @returns Processed array of tiles
 */
export function moveAndMergeRight(tiles: Block[], maxValue: number = 2048): (Point | undefined)[] {
  const boardSize = tiles.length;
  const gameTiles = tiles.filter(item => item instanceof Point) as Point[];
  
  // Clear any existing merge references
  gameTiles.forEach(tile => delete tile.alt);
  
  // Find and merge adjacent tiles with same value (from right to left)
  let mergeIndex = -1;
  for (let i = gameTiles.length - 1; i > 0; i--) {
    const currentTile = gameTiles[i];
    const previousTile = gameTiles[i - 1];
    
    if (currentTile && previousTile && 
        currentTile.val === previousTile.val && 
        maxValue > currentTile.val) {
      mergeIndex = i;
      // Set up merge animation references
      previousTile.alt = currentTile;
      currentTile.alt = previousTile;
      break;
    }
  }
  
  // Remove the second tile of the merged pair
  if (mergeIndex !== -1) {
    gameTiles.splice(mergeIndex, 1);
  }
  
  // Create result array with tiles shifted to the right
  const result: (Point | undefined)[] = [...gameTiles];
  while (result.length < boardSize) {
    result.unshift(undefined);
  }
  
  return result;
}

/**
 * Converts a 2D array of tiles (rows/columns) to a 1D board array
 * @param tileGrid 2D array of tiles organized by rows or columns
 * @returns 1D array representing the game board
 */
export function convertGridToBoard(tileGrid: Block[][]): (Point | undefined)[] {
  const result: (Point | undefined)[] = [];
  const maxLength = Math.max(...tileGrid.map(row => row.length));
  
  // Iterate through each position in the grid
  for (let positionIndex = 0; positionIndex < maxLength; positionIndex++) {
    for (let gridIndex = 0; gridIndex < tileGrid.length; gridIndex++) {
      const tile = tileGrid[gridIndex][positionIndex];
      result.push(tile instanceof Point ? tile : undefined);
    }
  }
  
  return result;
}

// Legacy function names for backward compatibility
export const forward = moveAndMergeLeft;
export const backward = moveAndMergeRight;
export const flatten = convertGridToBoard;
