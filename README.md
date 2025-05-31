# Vibe Defense

A modern tower defense game built with JavaScript and HTML5 Canvas.

## Project Structure

```
VibeDefense/
├── js/
│   ├── game.js       # Main game logic and loop
│   ├── enemy.js      # Enemy types and behavior
│   ├── tower.js      # Tower types and combat
│   ├── path.js       # Path system and visualization
│   ├── wave.js       # Wave management system
│   ├── levels.js     # Level definitions and difficulty
│   └── menu.js       # Menu system and UI management
├── index.html        # Main game container and styles
└── README.md         # Project documentation
```

## Features

### Game Mechanics
- Multiple tower types (Basic, Sniper, Rapid) with unique abilities
- Different enemy types with varying behaviors
- Wave-based progression system
- Path system with direction indicators
- Tower placement and upgrade system

### Levels
1. **Beginner's Path** (Easy)
   - Simple S-shaped path
   - Reduced enemy health and spawn rate
   - More forgiving boss waves

2. **Zigzag Challenge** (Medium)
   - Zigzag pattern path
   - Balanced enemy stats
   - Regular boss frequency

3. **Spiral Madness** (Hard)
   - Complex spiral path
   - Increased enemy health and spawn rate
   - More frequent boss waves

4. **Maze Runner** (Expert)
   - Intricate maze-like path
   - Double enemy health
   - Very frequent boss waves

### UI Features
- Animated splash screen with logo
- Level selection with difficulty indicators
- In-game stats tracking (Money, Lives, Score, Wave)
- Tower placement preview with range indicator
- Wave completion messages
- Game over screen with score

## Development Notes

### Tower Types
- **Basic Tower**: Balanced damage and range
- **Sniper Tower**: High damage, slow fire rate, long range
- **Rapid Tower**: Low damage, fast fire rate, medium range

### Enemy Types
- **Basic Enemy**: Balanced stats
- **Speed Enemy**: Fast with trail effects
- **Armored Enemy**: High defense
- **Layered Enemy**: Multiple health layers
- **Boss Enemy**: Powerful with rotating spikes

### Wave System
- Progressive difficulty scaling
- Enemy count increases per wave
- Boss waves at regular intervals
- Bonus rewards for wave completion

### Planned Features
- [ ] Additional tower types
- [ ] More enemy variations
- [ ] Power-up system
- [ ] Achievement system
- [ ] Local high scores 