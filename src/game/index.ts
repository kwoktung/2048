import { Tile, moveAndMergeLeft, moveAndMergeRight, convertGridToBoard } from "./tile";
import type { BoardCell } from "./tile";

/**
 * Represents the current state of the 2048 game
 */
export type State = {
  mergingTiles: Tile[]; // Tiles involved in merge animations
  tiles: Tile[]; // Active tiles on the board
};

/**
 * 2048 Game implementation
 * Manages the game board, moves, spawning, and game state
 */
export class Game {
  private board: BoardCell[];
  private readonly boardSize: number;

  constructor(
    public readonly width: number = 8,
    public readonly height: number = 8
  ) {
    this.boardSize = width * height;
    this.board = new Array(this.boardSize);
    this.initializeBoard();
  }

  /**
   * Spawns a new tile at a random empty position
   * @returns Current game state after spawning
   */
  spawnNewTile(): State {
    this.updateBoardIndices();

    // Find all empty positions
    const emptyPositions = this.board.filter((cell) => typeof cell === "number");

    if (emptyPositions.length === 0) {
      return this.getState();
    }

    // Choose random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const positionIndex = emptyPositions[randomIndex] as number;

    // Calculate grid coordinates
    const x = positionIndex % this.width;
    const y = Math.floor(positionIndex / this.height);

    // Place new tile
    this.board[positionIndex] = new Tile(x, y);

    return this.getState();
  }

  /**
   * Moves all tiles to the left and merges adjacent tiles with same values
   * @returns Current game state after move
   */
  moveLeft(): State {
    const rows = this.getRows();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] || [];
      row.length = this.width;
      rows[rowIndex] = moveAndMergeLeft(row);
    }

    this.updateBoardFromRows(rows);
    return this.getState();
  }

  /**
   * Moves all tiles to the right and merges adjacent tiles with same values
   * @returns Current game state after move
   */
  moveRight(): State {
    const rows = this.getRows();

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] || [];
      row.length = this.width;
      rows[rowIndex] = moveAndMergeRight(row) as Tile[];
    }

    this.updateBoardFromRows(rows);
    return this.getState();
  }

  /**
   * Moves all tiles upward and merges adjacent tiles with same values
   * @returns Current game state after move
   */
  moveUp(): State {
    const columns = this.getColumns();

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex] || [];
      column.length = this.height;
      columns[columnIndex] = moveAndMergeLeft(column);
    }

    this.updateBoardFromColumns(columns);
    return this.getState();
  }

  /**
   * Moves all tiles downward and merges adjacent tiles with same values
   * @returns Current game state after move
   */
  moveDown(): State {
    const columns = this.getColumns();

    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex] || [];
      column.length = this.height;
      columns[columnIndex] = moveAndMergeRight(column) as Tile[];
    }

    this.updateBoardFromColumns(columns);
    return this.getState();
  }

  /**
   * Checks if the game is over (no more moves possible)
   * @returns true if game is over, false otherwise
   */
  isGameOver(): boolean {
    // If there are empty cells, game is not over
    const emptyCells = this.board.filter((cell) => !(cell instanceof Tile));
    if (emptyCells.length > 0) {
      return false;
    }

    // Check if any merges are possible in rows
    const rows = this.getRows();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] as Tile[];
      if (this.canMergeInLine(row)) {
        return false;
      }
    }

    // Check if any merges are possible in columns
    const columns = this.getColumns();
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex] as Tile[];
      if (this.canMergeInLine(column)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the current game state
   * @returns Current game state with tiles and merging tiles
   */
  get state(): State {
    return this.getState();
  }

  /**
   * Calculates the current score based on all tile values
   * @returns Current game score
   */
  getScore(): number {
    return this.board
      .filter((cell) => cell instanceof Tile)
      .reduce((score, cell) => score + (cell as Tile).value, 0);
  }

  // Private helper methods

  /**
   * Initializes the board with position indices
   */
  private initializeBoard(): void {
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = i;
    }
  }

  /**
   * Updates board indices to reflect current positions
   */
  private updateBoardIndices(): void {
    for (let i = 0; i < this.board.length; i++) {
      const cell = this.board[i];
      if (cell instanceof Tile) {
        cell.updatePosition(i, this.width);
      } else {
        this.board[i] = i;
      }
    }
  }

  /**
   * Gets all rows from the board
   * @returns Array of rows, each containing tiles for that row
   */
  private getRows(): Tile[][] {
    const rows: Tile[][] = new Array(this.height);

    for (let i = 0; i < this.board.length; i++) {
      const cell = this.board[i];
      if (cell instanceof Tile) {
        const rowIndex = cell.y;
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        rows[rowIndex].push(cell.clone());
      }
    }

    return rows;
  }

  /**
   * Gets all columns from the board
   * @returns Array of columns, each containing tiles for that column
   */
  private getColumns(): Tile[][] {
    const columns: Tile[][] = new Array(this.width);

    for (let i = 0; i < this.board.length; i++) {
      const cell = this.board[i];
      if (cell instanceof Tile) {
        const columnIndex = cell.x;
        if (!columns[columnIndex]) {
          columns[columnIndex] = [];
        }
        columns[columnIndex].push(cell.clone());
      }
    }

    return columns;
  }

  /**
   * Updates the board from processed rows
   */
  private updateBoardFromRows(rows: Tile[][]): void {
    this.board = rows.reduce((board, row) => board.concat(row), [] as Tile[]);
  }

  /**
   * Updates the board from processed columns
   */
  private updateBoardFromColumns(columns: Tile[][]): void {
    this.board = convertGridToBoard(columns);
  }

  /**
   * Checks if any merges are possible in a line of tiles
   * @param line Array of tiles representing a row or column
   * @returns true if merges are possible, false otherwise
   */
  private canMergeInLine(line: Tile[]): boolean {
    if (line.length <= 1) {
      return false;
    }

    for (let i = 0; i < line.length - 1; i++) {
      if (line[i].value === line[i + 1].value) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the current game state
   * @returns Current game state with tiles and merging tiles
   */
  private getState(): State {
    this.updateBoardIndices();

    const mergingTiles: Tile[] = [];
    const activeTiles = this.board.filter((cell) => cell instanceof Tile) as Tile[];

    // Collect tiles involved in merge animations
    for (let i = 0; i < activeTiles.length; i++) {
      const tile = activeTiles[i];
      if (tile.mergeSource) {
        tile.mergeSource.x = tile.x;
        tile.mergeSource.y = tile.y;
        mergingTiles.push(tile.mergeSource);
      }
    }

    // Sort tiles by ID for consistent rendering
    const sortedTiles = activeTiles.sort((a, b) => (a.id < b.id ? -1 : 1));

    return {
      mergingTiles,
      tiles: sortedTiles,
    };
  }
}
