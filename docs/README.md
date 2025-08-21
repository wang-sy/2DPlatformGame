# Phaser 3 TypeScript Game Template

A powerful, configurable 2D platformer game template built with Phaser 3 and TypeScript. Features data-driven design, allowing you to create custom games through configuration files without modifying code.

## 🎮 What is This?

This is a complete game template featuring:
- **Platformer mechanics**: Jump, double-jump, wall-jump, charge-jump
- **Enemy AI**: 7 different movement patterns
- **Collectibles system**: Coins, keys, power-ups with scoring
- **Level design**: Tilemap-based levels created with Tiled editor
- **Audio system**: Background music and sound effects per animation
- **Scene flow**: Main menu → Game → Victory/Game Over

## 🚀 Quick Start

### For Players
```bash
# Install dependencies
npm install

# Run the game
npm run dev

# Open browser to http://localhost:8080
```

### For Level Designers
1. Install [Tiled Map Editor](https://www.mapeditor.org/)
2. Open `public/assets/tilemap/scenes/tilemap.json`
3. Design your level
4. Save and refresh the game

### For Developers
```bash
# Development with hot reload
npm run dev

# Production build
npm run build

# Output will be in dist/ folder
```

## 📚 Documentation

### [🎨 USER_CONFIGURATION_GUIDE.md](./USER_CONFIGURATION_GUIDE.md)
**For: Level Designers, Game Designers, Artists**

Learn how to customize the game without coding:
- **Tilemap Configuration**: Design levels using Tiled editor
- **Enemy Configuration**: Set movement patterns, damage, AI behavior
- **Collectibles Setup**: Configure items, scores, and requirements
- **Audio Configuration**: Add music and sound effects
- **Animation Setup**: Configure sprite animations
- **Asset Management**: Organize game resources

**Start here if you want to:**
- Create new levels
- Add new enemies or items
- Change game graphics
- Configure sounds and music
- Adjust game balance

---

### [🔧 DEVELOPER_DOCUMENTATION.md](./DEVELOPER_DOCUMENTATION.md)
**For: Programmers, Technical Artists, System Designers**

Deep technical guide for extending the codebase:
- **Architecture Overview**: Event-driven design, singleton patterns
- **Core Systems**: Scene management, entity system, physics
- **Event Bus**: Type-safe communication between systems
- **Manager Systems**: Animation, audio, collection tracking
- **Extension Guide**: Add new features and game mechanics
- **Performance Tips**: Optimization strategies
- **Debugging Tools**: Built-in debugging utilities

**Start here if you want to:**
- Add new game mechanics
- Create new sprite types
- Implement new AI behaviors
- Optimize performance
- Debug issues
- Understand the architecture

---

### [📦 HOW_TO_BUILD.md](./HOW_TO_BUILD.md)
**For: DevOps, Release Managers, Server Administrators**

Production build and deployment guide:
- **Prerequisites**: Node.js and npm setup
- **Build Commands**: Development and production builds
- **Output Structure**: Understanding dist/ folder
- **Deployment**: Hosting the game
- **Optimization**: Build configuration options

**Start here if you want to:**
- Deploy the game to a server
- Create distribution packages
- Set up CI/CD pipelines
- Optimize build size

## 🎯 Common Tasks

| I want to... | Documentation | Section |
|-------------|---------------|---------|
| **Create a new level** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Tilemap Configuration |
| **Add a new enemy type** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Enemy Configuration |
| **Change player abilities** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Player Configuration |
| **Add collectible items** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Collectibles Configuration |
| **Configure background music** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Audio Configuration → BGM |
| **Add sound effects** | [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md) | Audio Configuration → Sound Effects |
| **Build for production** | [How to Build](./HOW_TO_BUILD.md) | Build Commands |
| **Add new game mechanics** | [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) | Extension Guide |
| **Debug physics issues** | [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) | Debugging Guide |
| **Optimize performance** | [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) | Performance Optimization |
| **Understand the code** | [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) | Architecture Overview |
| **Add a new scene** | [Developer Documentation](./DEVELOPER_DOCUMENTATION.md) | Scene Management |

## 🗂️ Project Structure

```
template-vite-ts/
├── public/
│   └── assets/
│       ├── audio/
│       │   ├── bgm-config.json      # Background music configuration
│       │   ├── bgm/                 # Music files
│       │   └── sound_effect/
│       │       ├── config.json      # Sound effects configuration
│       │       └── *.mp3           # Sound files
│       ├── tilemap/
│       │   └── scenes/
│       │       └── tilemap.json    # Level design (Tiled)
│       ├── player/                 # Player sprites & animations
│       ├── enemy/                  # Enemy sprites & animations
│       ├── collectible/            # Item sprites
│       └── goal/                   # Goal/flag sprites
├── src/
│   └── game/
│       ├── main.ts                 # Game configuration
│       ├── scenes/                 # Game scenes
│       ├── sprites/                # Game entities
│       ├── managers/               # System managers
│       ├── events/                 # Event system
│       └── ui/                     # UI components
├── docs/                           # Documentation
├── vite/                           # Build configuration
└── package.json                    # Dependencies
```

## 🛠️ Technology Stack

- **Game Engine**: [Phaser 3.90.0](https://phaser.io/)
- **Language**: [TypeScript 5.7.2](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6.3.1](https://vitejs.dev/)
- **Level Editor**: [Tiled](https://www.mapeditor.org/)
- **Physics**: Arcade Physics
- **Module System**: ES Modules

## 📋 Key Features

### Game Mechanics
- **Player Movement**: Walk, run, jump, double-jump, wall-jump, charge-jump
- **Health System**: 3 hearts, damage and invulnerability frames
- **Collection System**: Items with scores, must-collect requirements
- **Enemy AI**: Static, patrol, jump, follow player, combined behaviors
- **Hazards**: Spikes and other environmental dangers
- **Victory Conditions**: Reach goal after collecting required items

### Technical Features
- **Data-Driven**: Configure through JSON and Tiled properties
- **Event System**: Loose coupling between components
- **Asset Management**: Automatic asset discovery from tilemap
- **Animation System**: Atlas support with frame-based animations
- **Audio System**: Scene-based BGM, animation-linked sound effects
- **Singleton Managers**: Global access to core systems
- **TypeScript**: Full type safety and IntelliSense support

## 🎨 Customization Options

Without coding, you can:
- Design unlimited levels
- Configure 7 enemy movement patterns
- Set damage values and health
- Create collectible items with scores
- Define must-collect items for progression
- Add background music per scene
- Configure sound effects per animation
- Adjust movement speeds and jump powers
- Set patrol distances and detection ranges
- Customize particle effects and colors

## 📝 Version Information

- **Template Version**: 1.4.0
- **Documentation Version**: 2.0.0
- **Last Updated**: January 2025

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Update relevant documentation
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Need Help?

- **Configuration issues**: Check [User Configuration Guide](./USER_CONFIGURATION_GUIDE.md)
- **Code questions**: See [Developer Documentation](./DEVELOPER_DOCUMENTATION.md)
- **Build problems**: Review [How to Build](./HOW_TO_BUILD.md)
- **Bug reports**: Create an issue on GitHub

---

**Ready to start?** Choose your path:
- 🎮 [Play the game](#for-players)
- 🎨 [Design levels](./USER_CONFIGURATION_GUIDE.md#tilemap-configuration)
- 💻 [Extend the code](./DEVELOPER_DOCUMENTATION.md#extension-guide)
- 📦 [Build for production](./HOW_TO_BUILD.md#build-commands)