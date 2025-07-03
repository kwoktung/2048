import { Point, forward, backward, flatten } from "./point"
import type { Block } from "./point"

/**
 * Represents the current state of the 2048 game
 */
export type State = { 
  alts: Point[],    // Alternative points for animations
  elements: Point[] // Current game elements
}

/**
 * 2048 Game implementation
 * Manages the game board, moves, spawning, and game state
 */
export class Game {
  private board: Block[];
  private readonly boardSize: number;

  constructor(public readonly width: number = 8, public readonly height: number = 8) {
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
    const emptyPositions = this.board.filter(position => typeof position === "number");
    
    if (emptyPositions.length === 0) {
      return this.getState();
    }

    // Choose random empty position
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const positionIndex = emptyPositions[randomIndex] as number;
    
    // Calculate grid coordinates
    const x = positionIndex % this.width;
    const y = Math.floor(positionIndex / this.height);
    
    // Create new tile
    this.board[positionIndex] = new Point(x, y);
    
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
      // Ensure row has correct length
      row.length = this.width;
      // Apply leftward movement and merging
      rows[rowIndex] = forward(row);
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
      // Ensure row has correct length
      row.length = this.width;
      // Apply rightward movement and merging
      rows[rowIndex] = backward(row) as Point[];
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
      // Ensure column has correct length
      column.length = this.height;
      // Apply upward movement and merging
      columns[columnIndex] = forward(column);
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
      // Ensure column has correct length
      column.length = this.height;
      // Apply downward movement and merging
      columns[columnIndex] = backward(column) as Point[];
    }
    
    this.updateBoardFromColumns(columns);
    return this.getState();
  }

  /**
   * Checks if the game is over (no more moves possible)
   * @returns true if game is over, false otherwise
   */
  isGameOver(): boolean {
    // If there are empty positions, game is not over
    const emptyPositions = this.board.filter(position => !(position instanceof Point));
    if (emptyPositions.length > 0) {
      return false;
    }

    // Check if any merges are possible in rows
    const rows = this.getRows();
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex] as Point[];
      if (this.canMergeInLine(row)) {
        return false;
      }
    }

    // Check if any merges are possible in columns
    const columns = this.getColumns();
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex++) {
      const column = columns[columnIndex] as Point[];
      if (this.canMergeInLine(column)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the current game state
   * @returns Current game state with elements and alternative points
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
      .filter(position => position instanceof Point)
      .reduce((score, position) => score + (position as Point).val, 0);
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
      const position = this.board[i];
      if (position instanceof Point) {
        // Update point's internal position tracking
        position.location(i, this.width);
      } else {
        // Set empty position to its index
        this.board[i] = i;
      }
    }
  }

  /**
   * Gets all rows from the board
   * @returns Array of rows, each containing points for that row
   */
  private getRows(): Point[][] {
    const rows: Point[][] = new Array(this.height);
    
    for (let i = 0; i < this.board.length; i++) {
      const position = this.board[i];
      if (position instanceof Point) {
        const rowIndex = position.y;
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        rows[rowIndex].push(position.clone());
      }
    }
    
    return rows;
  }

  /**
   * Gets all columns from the board
   * @returns Array of columns, each containing points for that column
   */
  private getColumns(): Point[][] {
    const columns: Point[][] = new Array(this.width);
    
    for (let i = 0; i < this.board.length; i++) {
      const position = this.board[i];
      if (position instanceof Point) {
        const columnIndex = position.x;
        if (!columns[columnIndex]) {
          columns[columnIndex] = [];
        }
        columns[columnIndex].push(position.clone());
      }
    }
    
    return columns;
  }

  /**
   * Updates the board from processed rows
   * @param rows Processed rows to update the board with
   */
  private updateBoardFromRows(rows: Point[][]): void {
    this.board = rows.reduce((board, row) => board.concat(row), [] as Point[]);
  }

  /**
   * Updates the board from processed columns
   * @param columns Processed columns to update the board with
   */
  private updateBoardFromColumns(columns: Point[][]): void {
    this.board = flatten(columns);
  }

  /**
   * Checks if any merges are possible in a line of tiles
   * @param line Array of points representing a row or column
   * @returns true if merges are possible, false otherwise
   */
  private canMergeInLine(line: Point[]): boolean {
    if (line.length <= 1) {
      return false;
    }
    
    for (let i = 0; i < line.length - 1; i++) {
      const current = line[i];
      const next = line[i + 1];
      if (current.val === next.val) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gets the current game state
   * @returns Current game state with elements and alternative points
   */
  private getState(): State {
    this.updateBoardIndices();
    
    const alternativePoints: Point[] = [];
    const gameElements = this.board.filter(position => position instanceof Point) as Point[];
    
    // Collect alternative points for animations
    for (let i = 0; i < gameElements.length; i++) {
      const element = gameElements[i];
      if (element.alt) {
        // Update alternative point position
        element.alt.x = element.x;
        element.alt.y = element.y;
        alternativePoints.push(element.alt);
      }
    }
    
    // Sort elements by ID for consistent rendering
    const sortedElements = gameElements.sort((a, b) => a.id < b.id ? -1 : 1);
    
    return { 
      alts: alternativePoints, 
      elements: sortedElements 
    };
  }

  // Legacy method names for backward compatibility
  doSpawn(): State { return this.spawnNewTile(); }
  onLeft(): State { return this.moveLeft(); }
  onRight(): State { return this.moveRight(); }
  onUp(): State { return this.moveUp(); }
  onDown(): State { return this.moveDown(); }
  isOver(): boolean { return this.isGameOver(); }
}
