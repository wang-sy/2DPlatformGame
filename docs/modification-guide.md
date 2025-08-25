# Modification and Extension Guide

## Overview

This guide provides step-by-step instructions for common modifications and extensions to the game framework. Each section includes code examples and best practices.

## Table of Contents

1. [Common Modifications](#common-modifications)
2. [Adding New Features](#adding-new-features)
3. [Customizing Game Mechanics](#customizing-game-mechanics)
4. [Creating New Object Types](#creating-new-object-types)
5. [Extending AI Behaviors](#extending-ai-behaviors)
6. [UI Modifications](#ui-modifications)
7. [Performance Optimizations](#performance-optimizations)

---

## Common Modifications

### Changing Game Resolution

**Location**: `src/game/main.ts`

```typescript
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1280,  // Change from 1024
    height: 720,  // Change from 768
    // ...
};
```

### Adjusting Physics

**Location**: `src/game/main.ts`

```typescript
physics: {
    default: "arcade",
    arcade: {
        gravity: { x: 0, y: 800 },  // Increase gravity (default: 600)
        debug: true                  // Enable debug mode
    }
}
```

### Modifying Player Abilities

**Location**: `src/game/sprites/Player.ts`

```typescript
// Change default abilities
private abilities: PlayerAbilities = {
    canJump: true,
    canDoubleJump: false,      // Disable double jump
    canWallJump: false,         // Disable wall jump
    canChargeJump: true,
    canShoot: false,            // Disable shooting
    canMove: true
};

// Adjust movement parameters
private moveSpeed: number = 250;    // Faster movement (default: 200)
private jumpSpeed: number = 600;    // Higher jump (default: 500)
private maxJumps: number = 3;       // Triple jump (default: 2)
```

### Changing Controls

**Location**: `src/game/sprites/Player.ts`

```typescript
// In constructor
this.cursors = scene.input.keyboard!.createCursorKeys();

// Add WASD controls
this.wasd = scene.input.keyboard!.addKeys('W,S,A,D');

// In update method
if (this.cursors.left.isDown || this.wasd.A.isDown) {
    this.setVelocityX(-this.moveSpeed);
}
```

---

## Adding New Features

### Adding a Dash Ability

**Step 1**: Add ability flag in `Player.ts`

```typescript
interface PlayerAbilities {
    // ... existing abilities
    canDash: boolean;
}

private isDashing: boolean = false;
private dashCooldown: number = 0;
private dashSpeed: number = 600;
private dashDuration: number = 200;
```

**Step 2**: Add dash key

```typescript
private dashKey: Phaser.Input.Keyboard.Key;

constructor() {
    // ...
    this.dashKey = scene.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.SHIFT
    );
}
```

**Step 3**: Implement dash logic

```typescript
update(): void {
    // Update cooldown
    if (this.dashCooldown > 0) {
        this.dashCooldown -= this.scene.game.loop.delta;
    }
    
    // Check for dash input
    if (Phaser.Input.Keyboard.JustDown(this.dashKey) && 
        this.abilities.canDash && 
        this.dashCooldown <= 0 && 
        !this.isDashing) {
        this.performDash();
    }
}

private performDash(): void {
    this.isDashing = true;
    this.dashCooldown = 1000; // 1 second cooldown
    
    const direction = this.flipX ? -1 : 1;
    this.setVelocityX(this.dashSpeed * direction);
    
    // Create dash effect
    this.scene.tweens.add({
        targets: this,
        alpha: 0.5,
        duration: this.dashDuration,
        yoyo: true,
        onComplete: () => {
            this.isDashing = false;
        }
    });
    
    // Emit dash event
    eventBus.emit(GameEvent.PLAYER_DASH, {
        player: this,
        direction: direction
    });
}
```

### Adding a Score Multiplier System

**Step 1**: Create multiplier manager

```typescript
// src/game/managers/ScoreMultiplierManager.ts
export class ScoreMultiplierManager {
    private multiplier: number = 1;
    private comboCount: number = 0;
    private comboTimer: number = 0;
    private comboWindow: number = 2000; // 2 seconds
    
    updateCombo(scene: Phaser.Scene): void {
        this.comboCount++;
        this.comboTimer = this.comboWindow;
        this.multiplier = Math.min(1 + Math.floor(this.comboCount / 5), 5);
        
        // Show multiplier UI
        this.showMultiplierText(scene);
    }
    
    update(delta: number): void {
        if (this.comboTimer > 0) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) {
                this.resetCombo();
            }
        }
    }
    
    getMultipliedScore(baseScore: number): number {
        return baseScore * this.multiplier;
    }
    
    private resetCombo(): void {
        this.comboCount = 0;
        this.multiplier = 1;
    }
}
```

### Adding Checkpoints

**Step 1**: Create Checkpoint sprite

```typescript
// src/game/sprites/Checkpoint.ts
export class Checkpoint extends Phaser.Physics.Arcade.Sprite {
    private activated: boolean = false;
    private checkpointId: string;
    
    constructor(scene: Scene, checkpointObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = checkpointObject.x || 0;
        const y = checkpointObject.y || 0;
        
        super(scene, x, y, 'checkpoint');
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        
        this.checkpointId = checkpointObject.name || 'checkpoint';
    }
    
    activate(): void {
        if (!this.activated) {
            this.activated = true;
            this.setTint(0x00ff00); // Green tint
            
            // Save checkpoint
            eventBus.emit(GameEvent.CHECKPOINT_REACHED, {
                id: this.checkpointId,
                x: this.x,
                y: this.y
            });
        }
    }
}
```

**Step 2**: Add to Game scene

```typescript
// In Game.ts
private checkpoints: Phaser.Physics.Arcade.StaticGroup;
private lastCheckpoint: { x: number, y: number } | null = null;

// In createObjectsFromTilemap
case "checkpoint":
    this.createCheckpointFromTilemap(obj, uuid);
    break;

// Add checkpoint collision
this.physics.add.overlap(
    this.player,
    this.checkpoints,
    this.handleCheckpointCollision,
    undefined,
    this
);

private handleCheckpointCollision(player: any, checkpoint: any) {
    const cp = checkpoint as Checkpoint;
    cp.activate();
    this.lastCheckpoint = { x: cp.x, y: cp.y };
}

// Respawn at checkpoint
private respawnPlayer(): void {
    if (this.lastCheckpoint) {
        this.player.setPosition(this.lastCheckpoint.x, this.lastCheckpoint.y);
    } else {
        // Respawn at start
        this.scene.restart();
    }
}
```

---

## Customizing Game Mechanics

### Implementing Gravity Zones

```typescript
// src/game/sprites/GravityZone.ts
export class GravityZone extends Phaser.GameObjects.Zone {
    private gravityX: number;
    private gravityY: number;
    private affectedObjects: Set<Phaser.Physics.Arcade.Sprite> = new Set();
    
    constructor(scene: Scene, zoneObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = zoneObject.x || 0;
        const y = zoneObject.y || 0;
        const width = zoneObject.width || 128;
        const height = zoneObject.height || 128;
        
        super(scene, x + width/2, y + height/2, width, height);
        
        // Parse properties
        const properties = zoneObject.properties as any[];
        properties?.forEach(prop => {
            if (prop.name === 'gravity_x') this.gravityX = prop.value;
            if (prop.name === 'gravity_y') this.gravityY = prop.value;
        });
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
    }
    
    applyGravity(object: Phaser.Physics.Arcade.Sprite): void {
        if (!this.affectedObjects.has(object)) {
            this.affectedObjects.add(object);
            object.setGravity(this.gravityX, this.gravityY);
        }
    }
    
    removeGravity(object: Phaser.Physics.Arcade.Sprite): void {
        if (this.affectedObjects.has(object)) {
            this.affectedObjects.delete(object);
            object.setGravity(0, 800); // Reset to default
        }
    }
}
```

### Adding Weather Effects

```typescript
// src/game/effects/WeatherSystem.ts
export class WeatherSystem {
    private scene: Phaser.Scene;
    private particles: Phaser.GameObjects.Particles.ParticleEmitter;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }
    
    startRain(): void {
        const rainTexture = this.createRainTexture();
        
        this.particles = this.scene.add.particles(0, 0, rainTexture, {
            x: { min: 0, max: this.scene.cameras.main.width },
            y: -10,
            lifespan: 2000,
            speedY: { min: 300, max: 500 },
            speedX: { min: -20, max: 20 },
            scale: { start: 0.5, end: 0 },
            quantity: 2,
            frequency: 50
        });
        
        this.particles.setScrollFactor(0);
        this.particles.setDepth(1000);
    }
    
    private createRainTexture(): string {
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0x4444ff, 0.6);
        graphics.fillRect(0, 0, 2, 10);
        graphics.generateTexture('raindrop', 2, 10);
        graphics.destroy();
        return 'raindrop';
    }
}
```

---

## Creating New Object Types

### Template for New Sprite Type

```typescript
// src/game/sprites/NewSprite.ts
import { Scene } from 'phaser';
import { eventBus, GameEvent } from '../events/EventBus';

export class NewSprite extends Phaser.Physics.Arcade.Sprite {
    // Properties
    private customProperty: number = 0;
    
    constructor(scene: Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = tiledObject.x || 0;
        const y = tiledObject.y || 0;
        const texture = tiledObject.name || 'default_texture';
        
        super(scene, x, y, texture);
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Parse properties
        this.parseProperties(tiledObject);
        
        // Setup physics
        this.setupPhysics();
        
        // Initialize
        this.initialize();
    }
    
    private parseProperties(tiledObject: Phaser.Types.Tilemaps.TiledObject): void {
        const properties = tiledObject.properties as any[];
        if (!properties) return;
        
        properties.forEach(prop => {
            switch (prop.name) {
                case 'custom_property':
                    this.customProperty = prop.value;
                    break;
            }
        });
    }
    
    private setupPhysics(): void {
        this.setBounce(0.2);
        this.setCollideWorldBounds(true);
        // Additional physics setup
    }
    
    private initialize(): void {
        // Initial setup
        // Create animations, effects, etc.
    }
    
    update(): void {
        // Update logic
    }
    
    // Public methods
    public activate(): void {
        // Activation logic
        eventBus.emit('new-sprite-activated', { sprite: this });
    }
}
```

### Registering New Object Type

**Step 1**: Add to Game scene

```typescript
// In Game.ts
private newSprites: Phaser.Physics.Arcade.Group;

// In createObject method
case "new_sprite":
    this.createNewSpriteFromTilemap(obj, uuid);
    break;

private createNewSpriteFromTilemap(
    obj: Phaser.Types.Tilemaps.TiledObject, 
    uuid: string
) {
    if (!this.newSprites) {
        this.newSprites = this.physics.add.group({
            classType: NewSprite,
            runChildUpdate: true
        });
    }
    
    const sprite = new NewSprite(this, obj);
    this.newSprites.add(sprite);
    
    // Register with UUID manager
    this.gameObjectManager.registerObject(uuid, sprite, 'new_sprite', obj.name);
}
```

---

## Extending AI Behaviors

### Adding Custom Enemy AI

```typescript
// In Enemy.ts, add new movement method
private updateCustomAI(): void {
    // Example: Circular movement
    const time = this.scene.time.now * 0.001;
    const radius = 100;
    const centerX = this.startX;
    const centerY = this.y;
    
    this.x = centerX + Math.cos(time) * radius;
    this.y = centerY + Math.sin(time) * radius / 2;
    
    // Face direction of movement
    const nextX = centerX + Math.cos(time + 0.1) * radius;
    this.setFlipX(nextX < this.x);
}

// In update method
case 'circular':
    this.updateCustomAI();
    break;
```

### Creating Boss AI

```typescript
// src/game/sprites/Boss.ts
export class Boss extends Enemy {
    private phase: number = 1;
    private attackPattern: number = 0;
    private attackCooldown: number = 0;
    
    update(time: number, delta: number): void {
        super.update(time, delta);
        
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= delta;
        }
        
        // Phase transitions
        const healthPercent = this.health / this.maxHealth;
        if (healthPercent < 0.66 && this.phase === 1) {
            this.phase = 2;
            this.enterPhase2();
        } else if (healthPercent < 0.33 && this.phase === 2) {
            this.phase = 3;
            this.enterPhase3();
        }
        
        // Execute attack patterns
        if (this.attackCooldown <= 0) {
            this.executeAttack();
        }
    }
    
    private executeAttack(): void {
        switch (this.attackPattern) {
            case 0:
                this.projectileAttack();
                break;
            case 1:
                this.chargeAttack();
                break;
            case 2:
                this.areaAttack();
                break;
        }
        
        // Cycle patterns
        this.attackPattern = (this.attackPattern + 1) % 3;
        this.attackCooldown = 2000 / this.phase; // Faster in later phases
    }
    
    private projectileAttack(): void {
        // Create projectiles
        for (let i = 0; i < 3 * this.phase; i++) {
            const angle = (Math.PI * 2 * i) / (3 * this.phase);
            const projectile = new Projectile(
                this.scene,
                this.x,
                this.y,
                angle
            );
        }
    }
}
```

---

## UI Modifications

### Custom Health Bar

```typescript
// src/game/ui/CustomHealthBar.ts
export class CustomHealthBar {
    private scene: Phaser.Scene;
    private x: number;
    private y: number;
    private width: number = 200;
    private height: number = 20;
    
    private background: Phaser.GameObjects.Rectangle;
    private fill: Phaser.GameObjects.Rectangle;
    private border: Phaser.GameObjects.Rectangle;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        
        this.createHealthBar();
    }
    
    private createHealthBar(): void {
        // Background
        this.background = this.scene.add.rectangle(
            this.x, this.y, this.width, this.height, 0x000000
        );
        
        // Health fill
        this.fill = this.scene.add.rectangle(
            this.x, this.y, this.width, this.height, 0x00ff00
        );
        
        // Border
        this.border = this.scene.add.rectangle(
            this.x, this.y, this.width, this.height
        );
        this.border.setStrokeStyle(2, 0xffffff);
        
        // Set scroll factor for UI
        [this.background, this.fill, this.border].forEach(element => {
            element.setScrollFactor(0);
            element.setDepth(1000);
        });
    }
    
    updateHealth(current: number, max: number): void {
        const percentage = current / max;
        this.fill.width = this.width * percentage;
        
        // Change color based on health
        if (percentage > 0.6) {
            this.fill.setFillStyle(0x00ff00); // Green
        } else if (percentage > 0.3) {
            this.fill.setFillStyle(0xffff00); // Yellow
        } else {
            this.fill.setFillStyle(0xff0000); // Red
        }
        
        // Animate damage
        if (percentage < 1) {
            this.scene.tweens.add({
                targets: this.fill,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                yoyo: true
            });
        }
    }
}
```

### Adding Dialog System

```typescript
// src/game/ui/DialogSystem.ts
export class DialogSystem {
    private scene: Phaser.Scene;
    private dialogBox: Phaser.GameObjects.Rectangle;
    private dialogText: Phaser.GameObjects.Text;
    private isShowing: boolean = false;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createDialogBox();
    }
    
    private createDialogBox(): void {
        const width = 600;
        const height = 150;
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.height - height / 2 - 20;
        
        // Box background
        this.dialogBox = this.scene.add.rectangle(
            x, y, width, height, 0x000000, 0.8
        );
        this.dialogBox.setStrokeStyle(2, 0xffffff);
        
        // Text
        this.dialogText = this.scene.add.text(
            x, y, '', {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: width - 40 }
            }
        );
        this.dialogText.setOrigin(0.5);
        
        // Hide initially
        this.hide();
    }
    
    showDialog(text: string, duration: number = 3000): void {
        this.dialogText.setText(text);
        this.dialogBox.setVisible(true);
        this.dialogText.setVisible(true);
        this.isShowing = true;
        
        // Auto-hide after duration
        this.scene.time.delayedCall(duration, () => {
            this.hide();
        });
    }
    
    hide(): void {
        this.dialogBox.setVisible(false);
        this.dialogText.setVisible(false);
        this.isShowing = false;
    }
}
```

---

## Performance Optimizations

### Object Pooling Implementation

```typescript
// src/game/utils/ObjectPool.ts
export class ObjectPool<T extends Phaser.GameObjects.GameObject> {
    private pool: T[] = [];
    private activeObjects: Set<T> = new Set();
    private createFn: () => T;
    private resetFn: (obj: T) => void;
    
    constructor(
        createFn: () => T,
        resetFn: (obj: T) => void,
        initialSize: number = 10
    ) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            const obj = this.createFn();
            obj.setActive(false);
            obj.setVisible(false);
            this.pool.push(obj);
        }
    }
    
    get(): T {
        let obj: T;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop()!;
        } else {
            obj = this.createFn();
        }
        
        obj.setActive(true);
        obj.setVisible(true);
        this.activeObjects.add(obj);
        this.resetFn(obj);
        
        return obj;
    }
    
    release(obj: T): void {
        if (!this.activeObjects.has(obj)) return;
        
        obj.setActive(false);
        obj.setVisible(false);
        this.activeObjects.delete(obj);
        this.pool.push(obj);
    }
    
    releaseAll(): void {
        this.activeObjects.forEach(obj => {
            this.release(obj);
        });
    }
}
```

### Optimizing Update Loops

```typescript
// Use time-based updates instead of frame-based
private updateTimer: number = 0;
private updateInterval: number = 100; // Update every 100ms

update(time: number, delta: number): void {
    this.updateTimer += delta;
    
    if (this.updateTimer >= this.updateInterval) {
        this.updateTimer = 0;
        this.performExpensiveUpdate();
    }
    
    // Always update critical things
    this.updatePosition();
}

// Batch operations
private batchUpdate(): void {
    const updates: (() => void)[] = [];
    
    this.enemies.children.entries.forEach(enemy => {
        if (enemy.active) {
            updates.push(() => enemy.update());
        }
    });
    
    // Execute all updates
    updates.forEach(update => update());
}
```

### Texture Atlas Optimization

```typescript
// Combine multiple sprites into one atlas
{
    "textures": [
        {
            "image": "game_atlas.png",
            "frames": [
                // All game sprites in one texture
                { "filename": "player_idle", ... },
                { "filename": "enemy_walk", ... },
                { "filename": "item_coin", ... }
            ]
        }
    ]
}

// Load once
this.load.atlas('game_atlas', 'atlas.png', 'atlas.json');

// Use throughout
new Sprite(scene, x, y, 'game_atlas', 'player_idle');
```

---

## Testing and Debugging

### Adding Debug Mode

```typescript
// src/game/utils/DebugMode.ts
export class DebugMode {
    private enabled: boolean = false;
    private scene: Phaser.Scene;
    private debugText: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Toggle with F1
        scene.input.keyboard!.on('keydown-F1', () => {
            this.toggle();
        });
    }
    
    toggle(): void {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this.enable();
        } else {
            this.disable();
        }
    }
    
    private enable(): void {
        // Show physics debug
        this.scene.physics.world.drawDebug = true;
        
        // Create debug text
        this.debugText = this.scene.add.text(10, 10, '', {
            fontSize: '14px',
            color: '#00ff00',
            backgroundColor: '#000000'
        });
        this.debugText.setScrollFactor(0);
        this.debugText.setDepth(10000);
        
        // Update debug info
        this.scene.events.on('update', this.updateDebugInfo, this);
    }
    
    private updateDebugInfo(): void {
        const player = (this.scene as any).player;
        if (!player) return;
        
        const info = [
            `FPS: ${Math.round(this.scene.game.loop.actualFps)}`,
            `Player Pos: ${Math.round(player.x)}, ${Math.round(player.y)}`,
            `Velocity: ${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)}`,
            `Objects: ${this.scene.children.list.length}`,
            `Physics Bodies: ${this.scene.physics.world.bodies.size}`
        ];
        
        this.debugText.setText(info.join('\n'));
    }
    
    private disable(): void {
        this.scene.physics.world.drawDebug = false;
        if (this.debugText) {
            this.debugText.destroy();
        }
        this.scene.events.off('update', this.updateDebugInfo, this);
    }
}
```

---

## Best Practices

### Code Organization

1. **One class per file**: Keep components separate
2. **Use TypeScript interfaces**: Define clear contracts
3. **Emit events**: Decouple components
4. **Document properties**: Especially tilemap configs
5. **Handle edge cases**: Null checks, bounds validation

### Performance Guidelines

1. **Pool frequently created objects**: Bullets, particles, effects
2. **Use texture atlases**: Reduce draw calls
3. **Limit update frequency**: Not everything needs 60fps
4. **Clean up resources**: Remove event listeners, destroy objects
5. **Profile regularly**: Use browser dev tools

### Testing Checklist

- [ ] Test all player abilities
- [ ] Verify enemy behaviors
- [ ] Check collision detection
- [ ] Test level progression
- [ ] Verify save/load functionality
- [ ] Check audio playback
- [ ] Test on different screen sizes
- [ ] Profile performance
- [ ] Check memory leaks
- [ ] Test edge cases

---

## Conclusion

This framework is designed to be extended. Start with small modifications and gradually add complexity. Always test changes thoroughly and maintain backward compatibility when possible.

For more examples and community contributions, check the project repository.