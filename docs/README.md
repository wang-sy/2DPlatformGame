# Game Development Documentation Center

This documentation directory contains complete technical documentation for the Phaser 3 + TypeScript game project, helping developers quickly understand and extend the project.

## 📚 Documentation List

### 1. [Code Structure Guide](./CODE_STRUCTURE.md)
Comprehensive introduction to the project's overall architecture and code organization.

**Main Content:**
- Detailed project directory structure
- Core architecture and initialization flow
- Introduction to scene system, manager system, sprite system
- Design pattern applications (Singleton, Factory, Observer, etc.)
- Data flow and game loop
- Extension guide and best practices

**Suitable Reading Scenarios:**
- First time working with the project, need to understand overall architecture
- Adding new feature modules
- Code refactoring and optimization

---

### 2. [Tilemap Configuration Guide](./TILEMAP_GUIDE.md)
Detailed instructions on how to use the Tiled map editor to create and configure game levels.

**Main Content:**
- Tiled map editor configuration methods
- Differences and usage of Tilesets and Atlases
- Object layer configuration (player, enemies, collectibles, etc.)
- Automatic resource loading mechanism
- Collision detection configuration
- Animation configuration file format

**Suitable Reading Scenarios:**
- Creating new levels
- Adding new game object types
- Adjusting map collision and physics properties

---

### 3. [Sound Effect Configuration Guide](./SoundEffectConfiguration.md)
Introduction to the game's sound effect system configuration and usage methods.

**Main Content:**
- SoundEffectPlayer manager usage
- Sound effect configuration file format (config.json)
- Animation-sound automatic association mechanism
- Random sound variant configuration
- Volume control strategies
- Performance optimization suggestions

**Suitable Reading Scenarios:**
- Adding new sound effects
- Configuring character action sounds
- Adjusting sound playback logic
- Sound-related bug debugging

---

### 4. [Background Music Configuration Guide](./BGM_GUIDE.md)
Explanation of the background music system configuration and management methods.

**Main Content:**
- BGMPlayer singleton manager
- Automatic BGM switching between scenes
- BGM configuration file format (bgm-config.json)
- Preload and lazy load strategies
- Volume fade in/out effects
- Mobile device optimization

**Suitable Reading Scenarios:**
- Adding background music to new scenes
- Implementing dynamic music switching
- Handling browser autoplay restrictions
- BGM-related performance optimization

---

### 5. [How to Build](./HOW_TO_BUILD.md)
Quick guide for building the project for production.

**Main Content:**
- Prerequisites (Node.js, npm)
- Installation steps
- Build commands
- Output directory structure

**Suitable Reading Scenarios:**
- Deploying the game to production
- Creating distribution packages
- Setting up development environment
- CI/CD pipeline configuration

---

## 🚀 Quick Start

### Beginner Learning Path
1. First read the [Code Structure Guide](./CODE_STRUCTURE.md) to understand the overall project architecture
2. Check the [Tilemap Configuration Guide](./TILEMAP_GUIDE.md) to learn how to create levels
3. Configure sound effects and background music as needed

### Common Tasks Quick Reference

| Task | Reference Document | Section |
|------|--------------------|---------|
| Build for production | [How to Build](./HOW_TO_BUILD.md) | Steps |
| Add new scene | [Code Structure Guide](./CODE_STRUCTURE.md) | Extension Guide > Adding New Scenes |
| Create new level | [Tilemap Configuration Guide](./TILEMAP_GUIDE.md) | Tiled Map Editor Configuration |
| Add new enemy type | [Code Structure Guide](./CODE_STRUCTURE.md) | Extension Guide > Adding New Sprite Types |
| Configure character sounds | [Sound Effect Configuration Guide](./SoundEffectConfiguration.md) | Configuration File Format |
| Set scene BGM | [BGM Configuration Guide](./BGM_GUIDE.md) | Configuration File Format |
| Debug physics collision | [Tilemap Configuration Guide](./TILEMAP_GUIDE.md) | Debugging Tips |
| Optimize performance | "Performance Optimization" sections in each document | - |

---

## 🛠️ Technology Stack

- **Game Engine**: Phaser 3.90.0
- **Development Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Map Editor**: Tiled
- **Design Patterns**: Singleton, Factory, Observer, etc.

## 📁 Project Structure Overview

```
src/game/
├── managers/     # Global managers (sound, animation, BGM, etc.)
├── scenes/       # Game scenes (Boot, Game, Victory, etc.)
├── sprites/      # Game sprites (Player, Enemy, Collectible, etc.)
└── ui/          # UI components (HealthUI, etc.)
```

## 🔧 Configuration File Locations

- **Tilemap Configuration**: `assets/tilemap/scenes/tilemap.json`
- **Sound Effect Configuration**: `assets/audio/sound_effect/config.json`
- **BGM Configuration**: `assets/audio/bgm-config.json`
- **Animation Configuration**: `assets/tilemap/sprites/*_animators.json`

## 💡 Development Suggestions

1. **Modular Development**: Each feature uses independent managers, accessed globally through singleton pattern
2. **Configuration-Driven**: Use JSON configuration files instead of hardcoding
3. **Type Safety**: Fully utilize TypeScript's type system
4. **Performance First**: Use atlases, object pools, and other techniques to optimize performance
5. **Debug-Friendly**: All systems have detailed console log output

## 📝 Documentation Maintenance

These documents will be continuously updated as the project evolves. If you:
- Find documentation errors or outdated information
- Add new systems or features
- Optimize existing implementations

Please update the relevant documentation promptly to keep documentation synchronized with code.

## 🤝 Contribution Guide

When adding new features, please:
1. Follow existing code structure and naming conventions
2. Write corresponding manager classes for new systems
3. Use configuration files to manage variable parameters
4. Add necessary debug logs
5. Update relevant documentation

---

**Last Updated**: January 2024

**Documentation Version**: 1.0.0

**Project Version**: 1.4.0