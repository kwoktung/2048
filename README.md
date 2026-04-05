# 2048 Game

A modern, responsive implementation of the classic 2048 puzzle game built with React, TypeScript, and Vite.

## 🎮 About

2048 is a single-player sliding block puzzle game. The game's objective is to slide numbered tiles on a grid to combine them to create a tile with the number 2048. However, you can keep playing beyond 2048 to achieve higher scores!

## ✨ Features

- **Smooth Animations**: Fluid tile movements and merging animations
- **Sound Effects**: Audio feedback when tiles merge
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Keyboard Controls**: Intuitive arrow key navigation
- **Game State Management**: Automatic game over detection and restart functionality
- **Modern Tech Stack**: Built with React 19, TypeScript, and Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 2048
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🎯 How to Play

1. **Start the Game**: Click the "Start" button to begin
2. **Move Tiles**: Use the arrow keys (↑ ↓ ← →) to slide tiles in that direction
3. **Merge Tiles**: When two tiles with the same number collide, they merge into one tile with the sum of their values
4. **Goal**: Reach the 2048 tile (or keep going for higher scores!)
5. **Game Over**: The game ends when no more moves are possible
6. **Restart**: Click "Restart" to begin a new game

### Game Rules

- All tiles slide in the direction of the arrow key pressed
- Tiles with the same number merge when they collide
- After each move, a new tile (2 or 4) appears in a random empty cell
- The game continues until no more moves are possible

## 🛠️ Technical Details

### Tech Stack

- **Frontend Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS
- **Audio**: HTML5 Audio API

### Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Application styles
├── game/
│   ├── index.ts     # Game logic and state management
│   └── point.ts     # Point/tile class implementation
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

### Key Components

- **Game Class**: Handles game logic, tile movement, and state management
- **Point Class**: Represents individual tiles with position and value
- **App Component**: Main UI component with keyboard event handling

## 🎵 Audio

The game includes sound effects that play when tiles merge, enhancing the gaming experience. Audio files are located in the `public/` directory.

## 📱 Browser Support

This game works on all modern browsers that support:

- ES6+ JavaScript features
- CSS Grid and Flexbox
- HTML5 Audio API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the original 2048 game by Gabriele Cirulli
- Built with modern web technologies for the best user experience

---

**Enjoy playing 2048!** 🎮
