# 2048 Game Architecture

This document explains the improved architecture of the 2048 game implementation.

## Overview

The game is built with TypeScript and React, featuring a clean separation between game logic and UI components.

## Core Components

### 1. Game Class (`src/game/index.ts`)

The main game controller that manages:
- **Board State**: A 1D array representing the game grid
- **Tile Movement**: Handles all directional moves (left, right, up, down)
- **Tile Spawning**: Randomly places new tiles on empty positions
- **Game Over Detection**: Determines when no more moves are possible

#### Key Methods:
- `spawnNewTile()`: Creates a new tile at a random empty position
- `moveLeft()`, `moveRight()`, `moveUp()`, `moveDown()`: Handle directional movement
- `isGameOver()`: Checks if the game has ended
- `getState()`: Returns current game state for UI rendering

#### Private Helper Methods:
- `getRows()` / `getColumns()`: Extract 2D structure from 1D board
- `canMergeInLine()`: Checks if merges are possible in a line
- `updateBoardIndices()`: Synchronizes board positions

### 2. Point Class (`src/game/point.ts`)

Represents individual tiles in the game:
- **Position**: (x, y) coordinates on the grid
- **Value**: The tile's numerical value (2, 4, 8, etc.)
- **ID**: Unique identifier for rendering consistency
- **Alt Reference**: Points to merged tile for animations

#### Key Methods:
- `updatePosition()`: Updates coordinates based on board index
- `clone()`: Creates a deep copy for safe manipulation
- `isSame()`: Compares tiles for equality

### 3. Movement Functions (`src/game/point.ts`)

Handle the core 2048 mechanics:
- `moveAndMergeLeft()`: Moves tiles left and merges adjacent same values
- `moveAndMergeRight()`: Moves tiles right and merges adjacent same values
- `convertGridToBoard()`: Converts 2D arrays back to 1D board format

## Data Flow

1. **User Input**: Arrow keys trigger movement methods
2. **Board Processing**: 
   - Extract rows/columns from 1D board
   - Apply movement and merging logic
   - Convert back to 1D format
3. **State Update**: Return new game state to UI
4. **Tile Spawning**: Add new tile if move was successful
5. **Animation**: Handle merge animations using alt references

## Key Improvements Made

### 1. **Better Naming**
- `elements` → `board`
- `xMax/yMax` → `width/height`
- `onRank()` → `getRows()/getColumns()`
- `forward/backward` → `moveAndMergeLeft/moveAndMergeRight`

### 2. **Clear Documentation**
- Comprehensive JSDoc comments
- Inline explanations for complex logic
- Type annotations for better IDE support

### 3. **Improved Structure**
- Separated concerns into focused methods
- Reduced method complexity
- Better error handling and edge cases

### 4. **Enhanced Readability**
- Descriptive variable names
- Logical code organization
- Consistent formatting and style

### 5. **Backward Compatibility**
- Legacy method names preserved
- Existing API unchanged
- Gradual migration path

## Game Mechanics

### Tile Values
- New tiles spawn with value 2 (70% chance) or 4 (30% chance)
- Adjacent tiles with same value merge into double value
- Maximum merge value is 2048 (configurable)

### Movement Rules
- Tiles slide in the direction of movement
- Merges happen when adjacent tiles have same value
- Only one merge per pair per move
- Tiles don't merge beyond the maximum value

### Game Over Conditions
- No empty positions available AND
- No possible merges in any direction

## Usage Example

```typescript
// Create a new 4x4 game
const game = new Game(4, 4);

// Spawn initial tiles
game.spawnNewTile();
game.spawnNewTile();

// Make moves
const state = game.moveLeft();
console.log(state.elements); // Current tiles
console.log(state.alts);     // Merge animations

// Check game status
if (game.isGameOver()) {
  console.log("Game Over!");
}
```

## Performance Considerations

- 1D board representation for efficient storage
- Minimal object creation during moves
- Efficient merge detection algorithms
- Optimized state updates for React rendering 