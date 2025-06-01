# Vibe Defense

A modern tower defense game built with JavaScript and HTML5 Canvas, featuring smooth tower mechanics and dynamic enemy interactions.

## Project Structure

```
VibeDefense/
├── assets/          # Game assets directory
│   ├── towers/      # Tower PNG images
│   ├── enemies/     # Enemy PNG images
│   ├── projectiles/ # Projectile PNG images
│   ├── effects/     # Visual effect PNG images
├── icons/           # UI icons in PNG format
├── js/
│   ├── game.js      # Main game logic and loop
│   ├── enemy.js     # Enemy types and behavior
│   ├── tower.js     # Tower types and combat
│   ├── path.js      # Path system and visualization
│   └── ui.js        # UI elements and interactions
├── index.html       # Main game container
└── README.md        # Project documentation
```

## Features

### Tower System
- Three distinct tower types with unique mechanics:
  - **Basic Tower**: Balanced tower with single-barrel design
    - Moderate damage and range
    - Consistent fire rate
    - Blue projectiles
  
  - **Sniper Tower**: Long-range specialist
    - High damage output
    - Slower fire rate
    - Extended range
    - Purple projectiles
    - Special ability: Piercing shots at max level
  
  - **Rapid Tower**: Multi-barrel design
    - Lower damage per shot
    - High fire rate
    - Triple-barrel system
    - Green projectiles
    - Special ability: Multi-shot spread at max level

### Tower Mechanics
- Dynamic rotation system that tracks enemies
- Projectiles originate from barrel tips
- Tower upgrades up to level 3
- Special abilities unlock at max level
- Visual upgrade indicators with gem system
- Range preview during placement and selection

### Asset System
- High-quality PNG assets for all game elements
- Smooth sprite animations
- Visual effects for projectiles and impacts
- UI icons for game resources

### Game Elements
- Enemy targeting system
- Projectile collision detection
- Tower placement validation
- Resource management (money, lives)
- Wave progression system

### UI Features
- Tower selection interface
- Resource display (money, lives, wave count)
- Tower range indicators
- Targeting line visualization
- Upgrade status display

## Technical Details

### Tower Implementation
- Modular tower class system
- Inheritance-based tower types
- Dynamic projectile management
- Efficient rendering system
- Collision detection optimization

### Asset Management
- Centralized asset loading system
- Optimized PNG sprites
- Cached image references
- Fallback rendering for missing assets

### Planned Features
- [x] Additional tower types
- [x] More enemy variations
- [x] Power-up system
- [x] Achievement system
- [ ] Wave difficulty progression
- [ ] Score tracking system
- [ ] Local high scores

### Implemented Features

#### Achievement System
- Statistics tracking
  - Time played
  - Enemies killed
  - Waves completed
  - Power-ups used
  - Total money earned
  - Highest wave reached

- Unlockable Rewards
  - Double Income: Earn twice as much money from kills
  - Wave Rush: 50% reduced time between waves
  - Veteran Bonus: Start with 500 extra money
  - Power-Up Master: 25% discount on power-ups

#### Power-Up System
- Tower power-ups with special abilities
- Chain reaction effects
- Critical hit bonuses
- Special shot mechanics

#### Tower Types
- Basic Tower: Balanced single-target damage
- Sniper Tower: High damage, long range
- Rapid Tower: Fast firing, multi-barrel
- Chain Lightning Tower: Area damage with chain effects

#### Enemy Variations
- Basic Enemy: Standard movement and health
- Speed Enemy: Fast movement with trail effects
- Armored Enemy: High defense, resistant to damage
- Layered Enemy: Multiple health stages
- Boss Enemy: High health with special abilities

## Levels
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

## Development Notes

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