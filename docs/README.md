# 🎮 Advanced Phaser 3 Platform Game Framework

An enterprise-grade 2D platform game framework built with Phaser 3, TypeScript, and modern web technologies. Features a revolutionary UUID-based object management system, trigger-based event system, and fully configurable game mechanics.

## ✨ Core Features

### 🏃 Advanced Player Mechanics
- **Multi-Jump System**: Double jump, wall jump, charged jump
- **Combat System**: Shooting with physics-based bullets and recoil
- **Health System**: Configurable max health, damage system with invulnerability frames
- **Smart Collision**: Automatic terrain stuck detection and recovery

### 🤖 Intelligent Enemy AI
- **8 Movement Patterns**: Static, patrol, jump, follow, and combinations
- **Dynamic Behaviors**: Player detection, pathfinding, customizable properties
- **Visual Effects**: Death animations with particles, shockwaves, and screen shake

### 🎯 Revolutionary Trigger System
- **Event Triggers**: Place invisible zones that activate game events
- **Movement Events**: Make objects move, float, or follow paths
- **Scale Events**: Dynamic object scaling for dramatic effects
- **Configurable Properties**: Delay, duration, repeat, return-to-origin

### 🆔 UUID-Based Object Management
- **Unique Identification**: Every game object has a persistent UUID
- **Cross-Reference System**: Triggers can target any object by UUID
- **Debug Tools**: Object tracking and relationship visualization

### 🎵 Dynamic Audio System
- **Background Music**: Scene-based BGM with smooth transitions
- **Sound Effects**: Animation-synchronized SFX with fallback system
- **Configuration-Driven**: JSON-based audio mapping

### 💎 Collectibles & Progression
- **Item Types**: Coins, keys, gems with custom properties
- **Must-Collect System**: Required items for level completion
- **Score Tracking**: Persistent score and collection statistics
- **Visual Feedback**: Floating, rotating, pulsing animations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- [Tiled Map Editor](https://www.mapeditor.org/) (for level design)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd template-vite-ts

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Quick Play
1. Open `http://localhost:8081` in your browser
2. Use arrow keys to move
3. Press SPACE to jump (hold for charged jump)
4. Press X to shoot
5. Press R to restart
6. Collect all keys to unlock the goal!

## 🎮 Game Controls

| Key | Action | Special |
|-----|--------|---------|
| ← → | Move left/right | - |
| ↑ | Jump | Hold for charged jump |
| ↓ | Duck | - |
| SPACE | Alternative jump | Double-tap for double jump |
| X | Shoot | Limited by cooldown |
| R | Restart level | - |
| ESC | Pause (when implemented) | - |

### Advanced Techniques
- **Wall Jump**: Jump while touching a wall
- **Charged Jump**: Hold jump button, release for super jump
- **Stomp Attack**: Jump on enemies to defeat them
- **Bullet Physics**: Bullets inherit player momentum

## 🗺️ Level Design

### Using Tiled Editor
1. Open `public/assets/tilemap/scenes/tilemap.json`
2. Edit tile layers for terrain
3. Add objects for entities
4. Configure properties for behaviors
5. Save and refresh the game

### Object Properties

#### Player Configuration
```json
{
  "type": "player",
  "properties": [
    {"name": "uuid", "value": "unique-id"},
    {"name": "max_health", "value": 3}
  ]
}
```

#### Enemy Configuration
```json
{
  "type": "enemy",
  "properties": [
    {"name": "uuid", "value": "unique-id"},
    {"name": "move_method", "value": "patrol"},
    {"name": "move_speed", "value": 100},
    {"name": "damage", "value": 1}
  ]
}
```

#### Trigger Configuration
```json
{
  "type": "trigger",
  "properties": [
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "target-object-id"},
    {"name": "velocity_y", "value": -1000},
    {"name": "duration", "value": 1500},
    {"name": "return_to_origin", "value": false}
  ]
}
```

## 🏗️ Project Structure

```
├── src/
│   ├── game/
│   │   ├── scenes/        # Game scenes (Menu, Game, Victory)
│   │   ├── sprites/       # Game entities (Player, Enemy, etc.)
│   │   ├── managers/      # System managers (Animation, Audio, UUID)
│   │   ├── events/        # Event bus system
│   │   └── utils/         # Utilities (UUID generator, debugger)
│   └── main.ts           # Entry point
├── public/
│   └── assets/
│       ├── player/       # Player sprites and animations
│       ├── enemy/        # Enemy sprites and animations
│       ├── tilemap/      # Level maps and tilesets
│       └── audio/        # Music and sound effects
├── vite/                 # Build configurations
└── docs/                 # Documentation
```

## 🔧 Configuration Files

### Animation Configuration (`*.json`)
```json
{
  "anims": [
    {
      "key": "idle",
      "frames": [0, 1, 2, 3],
      "frameRate": 10,
      "repeat": -1
    }
  ]
}
```

### Audio Configuration (`bgm-config.json`)
```json
{
  "MainMenu": "Attic Secrets.mp3",
  "Game": "Baltic Levity.mp3",
  "volume": 0.5
}
```

### Sound Effects Configuration (`config.json`)
```json
{
  "player": {
    "jump": ["sfx_jump.mp3"],
    "hit": ["sfx_hurt.mp3"],
    "shoot": ["sfx_throw.mp3"]
  }
}
```

## 📊 Performance Optimization

- **Object Pooling**: Bullets and particles are recycled
- **Lazy Loading**: Assets load on-demand
- **Event Delegation**: Central event bus reduces listeners
- **Culling**: Off-screen objects are deactivated
- **Texture Atlas**: Sprites use atlases for batch rendering

## 🐛 Debug Mode

Enable debug features in development:
- Press `U` to show UUID registry (when enabled)
- View trigger zones by uncommenting debug visualization
- Event bus debugger shows all events
- Console logs for state changes

## 🚢 Deployment

### Production Build
```bash
# Optimized build
npm run build

# Build without console logs
npm run build-nolog

# Deploy dist/ folder to any static host
```

### Hosting Options
- **GitHub Pages**: Free static hosting
- **Netlify**: Automatic deploys from Git
- **Vercel**: Zero-config deployment
- **Custom Server**: Serve dist/ with any web server

## 📚 Documentation

- [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) - Architecture and API reference
- [Configuration Guide](./USER_CONFIGURATION_GUIDE.md) - Customization without coding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your feature
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

- **Framework**: [Phaser 3](https://phaser.io/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Level Editor**: [Tiled](https://www.mapeditor.org/)

## 💡 Tips & Tricks

- Hold jump button before landing for immediate charged jump
- Shoot downward while jumping for extra height
- Wall jump timing: Jump immediately after touching wall
- Enemies can be used as platforms after defeating them
- Triggers can create complex chain reactions
- UUID system allows for dynamic level scripting

---

Built with ❤️ using Phaser 3 and TypeScript