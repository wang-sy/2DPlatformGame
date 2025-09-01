# Developer Documentation

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ with npm
- TypeScript knowledge
- Basic Phaser 3 understanding
- Modern IDE (VS Code recommended)

### Quick Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📦 Core APIs

### Player API

The Player component provides comprehensive control over character movement and abilities.

```typescript
import { Player } from './components/Player';

// Player configuration interface
interface PlayerConfig {
  speed: number;           // Movement speed (default: 160)
  jumpVelocity: number;    // Jump force (default: -330)
  maxJumps: number;        // Multi-jump count (default: 2)
  maxHealth: number;       // Health points (default: 3)
  shootCooldown: number;   // Projectile cooldown in ms (default: 300)
  wallJumpEnabled: boolean; // Enable wall jumping (default: true)
  chargedJumpEnabled: boolean; // Enable charged jumps (default: true)
  superJumpEnabled: boolean; // Enable super jump (default: true)
}

// Player instance methods
player.takeDamage(amount: number): void
player.heal(amount: number): void
player.shoot(): void
player.respawn(x: number, y: number): void
player.enableAbility(ability: string): void
player.disableAbility(ability: string): void
```

#### Player Events
```typescript
// Listen to player events
EventBus.on('player-damaged', (data: { damage: number, remainingHealth: number }) => {
  console.log(`Player took ${data.damage} damage`);
});

EventBus.on('player-death', () => {
  console.log('Player died');
});

EventBus.on('player-jump', (data: { jumpCount: number, isWallJump: boolean }) => {
  console.log(`Player jumped (count: ${data.jumpCount})`);
});

EventBus.on('player-shoot', (data: { x: number, y: number, direction: number }) => {
  console.log('Player fired projectile');
});
```

### Enemy API

Enemies support multiple AI behaviors and configurations.

```typescript
import { Enemy } from './components/Enemy';

// Enemy configuration
interface EnemyConfig {
  type: string;            // Enemy sprite type
  aiType: AIBehaviorType;  // AI behavior pattern
  speed: number;           // Movement speed
  jumpVelocity: number;    // Jump force
  health: number;          // Health points
  damage: number;          // Damage dealt to player
  patrolDistance?: number; // Patrol range
  detectionRange?: number; // Player detection radius
  jumpInterval?: number;   // Jump frequency in ms
}

// AI Behavior Types
enum AIBehaviorType {
  STATIC = 'static',           // No movement
  PATROL = 'patrol',           // Back and forth
  JUMP = 'jump',               // Periodic jumping
  MOVE_AND_JUMP = 'moveJump',  // Move with jumps
  PATROL_JUMP = 'patrolJump',  // Patrol with jumps
  FOLLOW = 'follow',           // Track player
  FOLLOW_JUMP = 'followJump',  // Track with jumps
  CUSTOM = 'custom'            // Custom behavior
}

// Enemy methods
enemy.takeDamage(amount: number): void
enemy.setAIBehavior(behavior: AIBehaviorType): void
enemy.setTarget(target: Phaser.GameObjects.Sprite): void
enemy.patrol(distance: number): void
enemy.followTarget(): void
```

### Trigger System API

Create interactive game mechanics without coding.

```typescript
import { Trigger } from './components/Trigger';

// Trigger configuration
interface TriggerConfig {
  targetUUIDs: string[];    // Target object UUIDs
  triggerType: TriggerType; // Action type
  moveX?: number;           // Horizontal movement
  moveY?: number;           // Vertical movement
  duration?: number;        // Action duration in ms
  returnToOrigin?: boolean; // Return after action
  scale?: number;           // Scale multiplier
  delay?: number;           // Action delay in ms
  repeat?: number;          // Repeat count (-1 = infinite)
  activeTexture?: string;   // Texture when active
  inactiveTexture?: string; // Texture when inactive
}

// Trigger types
enum TriggerType {
  MOVE = 'move',           // Move target objects
  SCALE = 'scale',         // Scale target objects
  ROTATE = 'rotate',       // Rotate target objects
  DESTROY = 'destroy',     // Destroy target objects
  SPAWN = 'spawn',         // Spawn new objects
  TELEPORT = 'teleport',   // Teleport objects
  CUSTOM = 'custom'        // Custom action
}

// Trigger methods
trigger.activate(): void
trigger.deactivate(): void
trigger.reset(): void
trigger.setTargets(uuids: string[]): void
```

### Event Bus API

Central communication system for decoupled components.

```typescript
import { EventBus } from './systems/EventBus';

// Subscribe to events
const listener = EventBus.on('event-name', (data: any) => {
  // Handle event
}, context);

// Emit events
EventBus.emit('event-name', { key: 'value' });

// One-time listener
EventBus.once('event-name', handler, context);

// Remove listener
EventBus.off('event-name', handler, context);

// Remove all listeners for event
EventBus.removeAllListeners('event-name');
```

#### Core Event Types
```typescript
// Game flow events
'game-start'          // Game started
'game-pause'          // Game paused
'game-resume'         // Game resumed
'game-over'           // Game ended
'level-complete'      // Level finished
'checkpoint-reached'  // Checkpoint activated

// Player events
'player-spawn'        // Player created
'player-damaged'      // Player hurt
'player-death'        // Player died
'player-respawn'      // Player respawned
'player-jump'         // Player jumped
'player-land'         // Player landed
'player-shoot'        // Player fired
'player-collect'      // Item collected

// Enemy events
'enemy-spawn'         // Enemy created
'enemy-damaged'       // Enemy hurt
'enemy-death'         // Enemy destroyed
'enemy-alert'         // Enemy detected player

// UI events
'ui-button-click'     // Button pressed
'ui-menu-open'        // Menu opened
'ui-menu-close'       // Menu closed
'score-update'        // Score changed
'health-update'       // Health changed

// System events
'scene-ready'         // Scene loaded
'assets-loaded'       // Assets ready
'config-loaded'       // Config parsed
'tilemap-loaded'      // Map loaded
```

### Animation Manager API

Centralized animation system with automatic fallbacks.

```typescript
import { AnimationManager } from './managers/AnimationManager';

// Get singleton instance
const animManager = AnimationManager.getInstance(scene);

// Create animations from atlas
animManager.createAnimationsFromAtlas(
  'player',           // Key prefix
  'player-atlas',     // Atlas key
  {
    idle: { start: 0, end: 3, frameRate: 10 },
    run: { start: 4, end: 11, frameRate: 12 },
    jump: { start: 12, end: 15, frameRate: 8 }
  }
);

// Create single animation
animManager.createAnimation(
  'enemy-walk',       // Animation key
  'enemy-atlas',      // Texture key
  { start: 0, end: 7, frameRate: 10, repeat: -1 }
);

// Play animation on sprite
animManager.playAnimation(sprite, 'player-run');

// Check animation exists
if (animManager.hasAnimation('player-idle')) {
  // Animation available
}
```

### GameObject Manager API

Track and manage all game entities.

```typescript
import { GameObjectManager } from './managers/GameObjectManager';

// Get singleton instance
const objManager = GameObjectManager.getInstance();

// Register object with UUID
const uuid = objManager.registerObject(gameObject);

// Get object by UUID
const obj = objManager.getObjectByUUID(uuid);

// Get objects by type
const enemies = objManager.getObjectsByType('enemy');
const platforms = objManager.getObjectsByType('platform');

// Remove object
objManager.removeObject(uuid);

// Clear all objects
objManager.clearAll();

// Get all registered objects
const allObjects = objManager.getAllObjects();
```

### Audio System API

#### Background Music (BGM)
```typescript
import { BGMPlayer } from './managers/BGMPlayer';

// Get singleton instance
const bgm = BGMPlayer.getInstance(scene);

// Configure BGM for scenes
bgm.configureBGM({
  'MainMenu': 'menu-music',
  'GameScene': 'level1-music',
  'BossScene': 'boss-music'
});

// Play BGM for current scene
bgm.playSceneBGM('GameScene');

// Control playback
bgm.pause();
bgm.resume();
bgm.stop();
bgm.setVolume(0.5); // 0-1 range

// Crossfade between tracks
bgm.crossfade('level1-music', 'boss-music', 2000); // 2 second fade
```

#### Sound Effects (SFX)
```typescript
import { SoundEffectPlayer } from './managers/SoundEffectPlayer';

// Get singleton instance
const sfx = SoundEffectPlayer.getInstance(scene);

// Configure animation sounds
sfx.configureAnimationSounds({
  'player-jump': ['jump1', 'jump2'],  // Random variant
  'player-land': 'land',
  'enemy-death': 'explosion'
});

// Play sound effect
sfx.playSound('coin-collect');

// Play with options
sfx.playSoundWithOptions('explosion', {
  volume: 0.8,
  detune: -100,  // Pitch shift
  delay: 500     // Delay in ms
});

// Play random from array
sfx.playRandomSound(['hit1', 'hit2', 'hit3']);
```

### Mobile Controls API

```typescript
import { MobileControls } from './ui/MobileControls';

// Create mobile controls
const controls = new MobileControls(scene, {
  joystickMode: 'dynamic',  // 'dynamic' or 'fixed'
  joystickPosition: { x: 150, y: scene.height - 150 },
  jumpButtonPosition: { x: scene.width - 150, y: scene.height - 100 },
  shootButtonPosition: { x: scene.width - 150, y: scene.height - 200 },
  showButtons: true,
  enableVibration: true
});

// Get input values
const movement = controls.getMovement(); // { x: -1 to 1, y: -1 to 1 }
const isJumping = controls.isJumpPressed();
const isShooting = controls.isShootPressed();

// Set callbacks
controls.onJumpPress(() => {
  player.jump();
});

controls.onShootPress(() => {
  player.shoot();
});

// Show/hide controls
controls.setVisible(true);
controls.setEnabled(false);

// Destroy controls
controls.destroy();
```

### Device Detection API

```typescript
import { DeviceDetector } from './systems/DeviceDetector';

// Initialize detector
const device = new DeviceDetector();

// Check device type
if (device.isMobile()) {
  // Enable touch controls
}

if (device.isTablet()) {
  // Tablet-specific UI
}

if (device.isIOS()) {
  // iOS-specific features
}

// Get device info
const info = device.getDeviceInfo();
console.log(info);
// {
//   isMobile: boolean,
//   isTablet: boolean,
//   isDesktop: boolean,
//   isIOS: boolean,
//   isAndroid: boolean,
//   screenWidth: number,
//   screenHeight: number,
//   pixelRatio: number,
//   orientation: 'portrait' | 'landscape'
// }

// Listen to orientation changes
device.onOrientationChange((orientation) => {
  console.log(`Rotated to ${orientation}`);
});
```

### Tilemap Loader API

```typescript
import { TilemapLoader } from './systems/TilemapLoader';

// Load tilemap
const loader = new TilemapLoader(scene);
loader.loadTilemap('level1', 'assets/tilemaps/level1.json');

// Get loaded objects
const objects = loader.getLoadedObjects();

// Get objects by type
const enemies = loader.getObjectsByType('enemy');
const triggers = loader.getObjectsByType('trigger');

// Get object by name
const boss = loader.getObjectByName('boss-enemy');

// Custom object creation
loader.registerObjectFactory('custom-type', (config) => {
  return new CustomObject(scene, config);
});
```

## 🛠️ Advanced Features

### Custom Components

Create new game entities by extending base classes:

```typescript
import { Phaser } from 'phaser';

export class CustomEnemy extends Phaser.Physics.Arcade.Sprite {
  private health: number = 100;
  private speed: number = 50;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'custom-enemy');
    
    // Add to scene
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configure physics
    this.setCollideWorldBounds(true);
    this.setBounce(0.2);
    
    // Setup animations
    this.createAnimations();
    
    // Register with GameObjectManager
    GameObjectManager.getInstance().registerObject(this);
  }
  
  private createAnimations(): void {
    // Define animations
  }
  
  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
    }
  }
  
  update(time: number, delta: number): void {
    // Custom AI logic
  }
}
```

### Custom AI Behaviors

Implement new enemy AI patterns:

```typescript
import { Enemy } from './components/Enemy';

export class CustomAIBehavior {
  execute(enemy: Enemy, player: Player, delta: number): void {
    // Calculate distance to player
    const distance = Phaser.Math.Distance.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    
    // Custom behavior logic
    if (distance < 200) {
      // Attack mode
      enemy.setVelocityX(enemy.x < player.x ? 100 : -100);
      
      if (Math.random() < 0.01) {
        enemy.setVelocityY(-300); // Jump attack
      }
    } else {
      // Patrol mode
      if (!enemy.body.blocked.left && !enemy.body.blocked.right) {
        enemy.setVelocityX(enemy.flipX ? -50 : 50);
      } else {
        enemy.flipX = !enemy.flipX;
      }
    }
  }
}

// Register behavior
enemy.registerCustomBehavior('aggressive', new CustomAIBehavior());
```

### Custom Triggers

Create complex interactive mechanics:

```typescript
export class CustomTrigger extends Trigger {
  protected executeCustomAction(): void {
    // Get target objects
    const targets = this.getTargetObjects();
    
    // Custom action logic
    targets.forEach(target => {
      // Example: Make objects pulse
      this.scene.tweens.add({
        targets: target,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 500,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });
      
      // Emit custom event
      EventBus.emit('custom-trigger-activated', {
        trigger: this.uuid,
        targets: targets.map(t => t.uuid)
      });
    });
  }
}
```

### Scene Extensions

Create custom scenes with additional features:

```typescript
export class CustomGameScene extends Phaser.Scene {
  private weatherSystem: WeatherSystem;
  private lightingSystem: LightingSystem;
  
  create(): void {
    // Standard setup
    super.create();
    
    // Add custom systems
    this.weatherSystem = new WeatherSystem(this);
    this.lightingSystem = new LightingSystem(this);
    
    // Configure environment
    this.weatherSystem.setWeather('rain', 0.5);
    this.lightingSystem.setTimeOfDay('sunset');
    
    // Custom event handlers
    EventBus.on('boss-defeated', this.onBossDefeated, this);
  }
  
  update(time: number, delta: number): void {
    super.update(time, delta);
    
    // Update custom systems
    this.weatherSystem.update(delta);
    this.lightingSystem.update(time);
  }
  
  private onBossDefeated(): void {
    // Trigger special sequence
    this.weatherSystem.clearWeather(3000);
    this.lightingSystem.transitionTo('dawn', 5000);
  }
}
```

## 🔧 Configuration Reference

### Game Configuration

Located in `src/config/gameConfig.ts`:

```typescript
export const gameConfig = {
  // Display
  width: window.innerWidth,
  height: window.innerHeight,
  pixelArt: false,
  antialias: true,
  
  // Physics
  gravity: { x: 0, y: 600 },
  debug: false,  // Enable physics debug
  
  // Player
  playerSpeed: 160,
  playerJumpVelocity: -330,
  playerMaxJumps: 2,
  playerMaxHealth: 3,
  
  // Enemies
  defaultEnemySpeed: 50,
  defaultEnemyHealth: 1,
  defaultEnemyDamage: 1,
  
  // Game Rules
  respawnDelay: 1000,
  invulnerabilityDuration: 2000,
  
  // Performance
  maxProjectiles: 20,
  maxParticles: 100,
  objectPoolSize: 50
};
```

### Asset Configuration

JSON configuration for game entities:

```json
{
  "player": {
    "texture": "player-sprite",
    "atlas": "player-atlas",
    "animations": {
      "idle": { "frames": [0, 1, 2, 3], "frameRate": 10 },
      "run": { "frames": [4, 5, 6, 7, 8, 9], "frameRate": 12 },
      "jump": { "frames": [10, 11], "frameRate": 8 },
      "fall": { "frames": [12, 13], "frameRate": 8 }
    },
    "sounds": {
      "jump": ["jump1", "jump2"],
      "land": "land",
      "hurt": "damage",
      "shoot": "laser"
    },
    "physics": {
      "bounce": 0,
      "friction": 1,
      "collideWorldBounds": true
    }
  }
}
```

## 🐛 Debugging

### Debug Mode

Enable debug features in development:

```typescript
// Enable physics debug
const config = {
  physics: {
    default: 'arcade',
    arcade: {
      debug: true  // Shows collision boxes
    }
  }
};

// Enable performance stats
game.config.fps = {
  target: 60,
  forceSetTimeOut: true,
  deltaHistory: 10,
  panicMax: 120
};
```

### Debug Overlay

Custom debug information:

```typescript
class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  
  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00'
    }).setScrollFactor(0).setDepth(9999);
  }
  
  update(scene: Phaser.Scene): void {
    const fps = Math.round(scene.game.loop.actualFps);
    const objects = scene.children.list.length;
    const bodies = scene.physics.world.bodies.size;
    
    this.text.setText([
      `FPS: ${fps}`,
      `Objects: ${objects}`,
      `Bodies: ${bodies}`,
      `Memory: ${(performance as any).memory?.usedJSHeapSize / 1048576 || 'N/A'} MB`
    ]);
  }
}
```

### Console Commands

Useful development commands:

```javascript
// In browser console
game.scene.scenes[0].physics.world.drawDebug = true;  // Toggle physics debug
game.scene.scenes[0].physics.world.isPaused = true;   // Pause physics
EventBus.emit('debug-mode', { enabled: true });        // Enable debug mode
game.config.fps.target = 30;                           // Change target FPS
```

## 📈 Performance Optimization

### Object Pooling

Reuse objects to reduce garbage collection:

```typescript
class ProjectilePool {
  private pool: Phaser.GameObjects.Group;
  
  constructor(scene: Phaser.Scene) {
    this.pool = scene.physics.add.group({
      classType: Projectile,
      maxSize: 20,
      runChildUpdate: true
    });
  }
  
  spawn(x: number, y: number, velocity: Phaser.Math.Vector2): void {
    const projectile = this.pool.get(x, y);
    if (projectile) {
      projectile.fire(velocity);
    }
  }
  
  despawn(projectile: Projectile): void {
    this.pool.killAndHide(projectile);
  }
}
```

### Texture Optimization

Best practices for textures:

```typescript
// Use texture atlases
this.load.atlas('player', 'player.png', 'player.json');

// Compress textures
this.load.image('background', 'bg.webp');  // Use WebP format

// Load textures on demand
scene.load.image('boss', 'boss.png');
scene.load.start();
scene.load.once('complete', () => {
  // Texture loaded
});
```

### Update Optimization

Optimize update loops:

```typescript
class OptimizedEnemy extends Enemy {
  private updateTimer: number = 0;
  
  update(time: number, delta: number): void {
    // Heavy calculations every 100ms instead of every frame
    this.updateTimer += delta;
    if (this.updateTimer > 100) {
      this.updateTimer = 0;
      this.calculatePath();
    }
    
    // Light updates every frame
    this.move();
  }
}
```

## 🚢 Deployment

### Production Build

```bash
# Standard production build
npm run build

# Optimized production build
npm run build:optimized

# Build without console logs
npm run build-nolog
```

### Build Configuration

Vite configuration options:

```javascript
// vite/config.prod.optimized.mjs
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          game: ['./src/Game.ts']
        }
      }
    }
  }
};
```

### Hosting

Deploy the `dist` folder to:

- **GitHub Pages**: Free static hosting
- **Netlify/Vercel**: Automatic deploys from Git
- **AWS S3 + CloudFront**: Scalable CDN
- **itch.io**: Game distribution platform

## 📚 Resources

### Official Documentation
- [Phaser 3 API](https://photonstorm.github.io/phaser3-docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

### Tools
- [Tiled Map Editor](https://www.mapeditor.org/)
- [TexturePacker](https://www.codeandweb.com/texturepacker)
- [Phaser Editor 2D](https://phasereditor2d.com/)

### Community
- [Phaser Discord](https://discord.gg/phaser)
- [HTML5 Game Devs Forum](https://www.html5gamedevs.com/)
- [Phaser Tutorials](https://phaser.io/tutorials)