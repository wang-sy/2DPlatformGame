# Phaser 3 Platform Game Framework

## 🎮 Overview

A **production-ready, mobile-first** 2D platform game framework built with Phaser 3, TypeScript, and Vite. Features comprehensive touch controls, advanced physics, intelligent AI, and a data-driven architecture that enables game creation without coding.

### ✨ Key Features

- **📱 Mobile-First Design**: Advanced virtual joystick, touch controls, and responsive UI
- **🎯 Zero-Code Game Creation**: Configure entire games through JSON and Tiled editor
- **🤖 Intelligent AI System**: 8 pre-built enemy behaviors with extensible patterns
- **⚡ Modern Tech Stack**: TypeScript 5.7, Phaser 3.90, Vite 6.3
- **🎨 Visual Level Editor**: Full Tiled map editor integration
- **🔊 Advanced Audio**: Scene-based BGM and synchronized SFX
- **🏃 Advanced Movement**: Wall jump, double jump, charged jump, super jump
- **📦 Optimized Builds**: Multiple build configurations for development and production

## 🚀 Quick Start

### Prerequisites

- Node.js v16 or higher
- npm or yarn
- Modern web browser with ES6 support

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd template-vite-ts

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build Commands

```bash
# Development
npm run dev              # Development server with logging
npm run dev-nolog        # Development without console logs

# Production
npm run build            # Optimized production build
npm run build-nolog      # Production build without logs

# Preview production build
npm run preview          # Serve production build locally
```

## 📱 Mobile Features

### Virtual Controls
- **Smart Joystick**: Appears on touch with force-based input
- **Action Buttons**: Jump (with charge indicator) and shoot controls
- **Multi-Touch**: Supports up to 4 simultaneous touches
- **Responsive Sizing**: Adapts to any screen size

### Device Optimization
- **Fullscreen Support**: Cross-platform with iOS-specific optimizations
- **PWA Ready**: Installable as standalone app
- **Performance**: 60 FPS on modern mobile devices
- **Orientation**: Supports both portrait and landscape

## 🏗️ Project Structure

```
template-vite-ts/
├── src/
│   ├── components/         # Game entities (Player, Enemy, etc.)
│   ├── managers/           # Global systems (Animation, Audio, etc.)
│   ├── scenes/             # Phaser scenes
│   ├── systems/            # Core systems (Events, Device, etc.)
│   ├── ui/                 # UI components and mobile controls
│   └── utils/              # Helper functions
├── public/
│   └── assets/
│       ├── player/         # Character sprites and animations
│       ├── enemy/          # Enemy sprites with AI configs
│       ├── tilemap/        # Tiled levels and tilesets
│       └── audio/          # BGM and sound effects
├── docs/                   # Comprehensive documentation
└── vite/                   # Build configurations
```

## 🎯 Core Systems

### Player Abilities
- **Movement**: Configurable speed and acceleration
- **Jumping**: Normal, double, wall, charged, and super jumps
- **Combat**: Projectile system with cooldown
- **Health**: Damage system with invulnerability frames

### Enemy AI Behaviors
1. **Static**: Stationary enemies
2. **Patrol**: Back-and-forth movement
3. **Jump**: Periodic jumping
4. **Move & Jump**: Combined movement
5. **Follow**: Player tracking
6. **Follow & Jump**: Tracking with jumping
7. **Patrol & Jump**: Patrol with jumping
8. **Custom**: Extensible for complex patterns

### Event System
- **50+ Event Types**: Comprehensive game events
- **Decoupled Architecture**: Clean component communication
- **Performance**: Optimized event bus with minimal overhead

## 🛠️ Configuration

### Game Configuration (`src/config/`)

```typescript
// gameConfig.ts - Core game settings
export const gameConfig = {
  width: window.innerWidth,
  height: window.innerHeight,
  gravity: { x: 0, y: 600 },
  playerSpeed: 160,
  jumpVelocity: -330
};
```

### Level Design (Tiled Editor)

Create levels visually with custom properties:
- **Enemies**: Set AI type, speed, health
- **Triggers**: Configure interactions without code
- **Collectibles**: Define scoring and effects
- **Platforms**: Moving and interactive platforms

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | Technical design and patterns |
| [Developer Guide](DEVELOPER_DOCUMENTATION.md) | Complete API reference |
| [User Guide](USER_CONFIGURATION_GUIDE.md) | Non-programmer customization |
| [Level Design](tilemap-guide.md) | Tiled editor tutorial |
| [Components](components.md) | Entity API reference |
| [Customization](modification-guide.md) | Extension examples |
| [UI System](ui-system-guide.md) | UI and mobile controls |
| [Resources](resources.md) | Asset management |

## 🔧 Development

### Technology Stack

- **Framework**: Phaser 3.90.0
- **Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Physics**: Arcade Physics
- **Module System**: ES Modules

### Performance Optimizations

- **Object Pooling**: Reusable game objects
- **Texture Atlases**: Efficient sprite loading
- **Tree Shaking**: Minimal bundle size
- **Code Splitting**: Optimized loading

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Chrome/Safari

## 🎨 Asset Pipeline

### Supported Formats
- **Images**: PNG, JPG, WebP
- **Audio**: MP3, OGG, WAV
- **Tilemaps**: JSON (Tiled)
- **Atlases**: JSON (TexturePacker)

### Organization
```
assets/
├── [entity]/
│   ├── sprite.png
│   ├── sprite.json      # Atlas definition
│   └── config.json      # Entity configuration
```

## 🚢 Deployment

### Production Build

```bash
# Create optimized build
npm run build

# Output in dist/ folder
# - Minified JavaScript
# - Optimized assets
# - Source maps (optional)
```

### Hosting Options

The `dist` folder can be deployed to:
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS S3 + CloudFront
- **Traditional**: Apache, Nginx

### Environment Variables

```bash
# .env.production
VITE_PUBLIC_PATH=/
VITE_ENABLE_LOGS=false
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

## 📄 License

[Your License Here]

## 🙏 Credits

Built with:
- [Phaser 3](https://phaser.io/) - Game framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool
- [Tiled](https://www.mapeditor.org/) - Level editor

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](your-repo-url/issues)
- **Discord**: [Community Server](your-discord-url)

---

**Ready to create amazing platform games!** 🎮✨