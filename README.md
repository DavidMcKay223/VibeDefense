# Tower Defense Game

A modern tower defense game built with JavaScript and HTML5 Canvas. Defend your path from incoming enemies by strategically placing different types of towers.

## Features

### Game Mechanics
- Dynamic zig-zag path with smooth curves and direction indicators
- Multiple tower types with unique abilities
- Enemy health system with visual health bars
- Score tracking and resource management
- Lives system with game over condition

### Tower Types
1. **Basic Tower** ($100)
   - Balanced damage and fire rate
   - Medium range
   - Good all-around defender

2. **Sniper Tower** ($200)
   - High damage
   - Long range
   - Slower fire rate
   - Perfect for taking out tough enemies

3. **Rapid Tower** ($150)
   - Fast fire rate
   - Lower damage per shot
   - Shorter range
   - Great for clusters of enemies

### Game Elements
- **Path System**: Enemies follow a zig-zag pattern from top to bottom
- **Enemy System**: Enemies move along the path with health bars
- **Tower Placement**: Strategic placement with visual range indicators
- **Resource Management**: Earn money by defeating enemies
- **Lives System**: Lose lives when enemies reach the end
- **Score System**: Earn points for each enemy defeated

## Project Structure

```
├── index.html          # Main HTML file
├── js/                 # JavaScript files
│   ├── game.js        # Main game engine
│   ├── tower.js       # Tower classes and mechanics
│   ├── enemy.js       # Enemy class and behavior
│   └── path.js        # Path generation and rendering
```

## Getting Started

1. Clone this repository
2. Open `index.html` in a modern web browser
3. Start with $300 and 20 lives
4. Place towers strategically to defend the path
5. Earn money and points by defeating enemies

## Game Controls
- Click tower buttons to select a tower type
- Click on the game field to place selected tower
- Towers automatically target and shoot nearby enemies
- Monitor your resources and lives in the top-right corner

## Strategy Tips
1. Place towers near curves for maximum coverage
2. Mix different tower types for better defense
3. Don't let enemies reach the end
4. Manage your resources carefully
5. Use Sniper Towers for tough enemies
6. Place Rapid Towers in high-traffic areas

## Technical Details
- Built with vanilla JavaScript
- Uses HTML5 Canvas for rendering
- No external dependencies
- Modular code structure
- Object-oriented design 