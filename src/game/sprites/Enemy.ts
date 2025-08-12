import { Scene } from 'phaser';
import { AnimationManager } from '../managers/AnimationManager';

/**
 * Generic Enemy sprite class
 * 
 * Properties that can be configured in Tiled tilemap editor:
 * - damage: (int) Damage dealt to player on contact
 * - move_method: (string) Movement pattern: "patrol", "jump", "static", "follow", "patrol_jump"
 * - move_speed: (int) Movement speed (default: 100)
 * - jump_power: (int) Jump strength (default: 400)
 * - patrol_distance: (int) Distance to patrol in pixels (default: 200)
 * - detection_range: (int) Range to detect player for follow mode (default: 300)
 * - jump_interval: (int) Time between jumps in milliseconds (default: 2000)
 */
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private enemyName: string;
    private damage: number = 1;
    private moveMethod: string = 'static';
    private moveSpeed: number = 100;
    private jumpPower: number = 400;
    private patrolDistance: number = 200;
    private detectionRange: number = 300;
    private jumpInterval: number = 2000;
    
    // Movement state
    private startX: number;
    private direction: number = 1; // 1 for right, -1 for left
    private lastJumpTime: number = 0;
    private isGrounded: boolean = false;
    private player: any = null;
    
    // Animation state
    private currentAnimation: string = '';
    private hasAtlas: boolean = false;
    private animationManager: AnimationManager;

    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = enemyObject.x || 0;
        const y = enemyObject.y || 0;
        const texture = enemyObject.name || 'enemy';
        
        super(scene, x, y - 32, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setOrigin(0.5, 0.5);
        this.enemyName = enemyObject.name || 'enemy';
        this.animationManager = AnimationManager.getInstance();
        
        // Store starting position for patrol
        this.startX = this.x;
        
        // Set up physics
        this.setBounce(0.1);
        this.setGravityY(800);
        
        // Set size based on texture
        const textureFrame = this.texture.get(0);
        const width = textureFrame.width * 0.8;
        const height = textureFrame.height * 0.8;
        this.setSize(width, height);
        this.setOffset(width * 0.1, height * 0.1);
        
        // Extract properties from tilemap
        this.extractProperties(enemyObject);
        
        // Start initial movement
        this.initializeMovement();
    }
    
    private extractProperties(enemyObject: Phaser.Types.Tilemaps.TiledObject): void {
        // Get properties from tileset
        const gid = enemyObject.gid;
        if (gid) {
            const tilemap = this.scene.cache.tilemap.get('tilemap');
            if (tilemap && tilemap.data) {
                const tilesetData = tilemap.data.tilesets;
                for (const tileset of tilesetData) {
                    if (gid >= tileset.firstgid && gid < tileset.firstgid + tileset.tilecount) {
                        const tileId = gid - tileset.firstgid;
                        if (tileset.tiles && tileset.tiles[tileId]) {
                            const tileProperties = tileset.tiles[tileId].properties;
                            if (tileProperties) {
                                for (const prop of tileProperties) {
                                    this.setProperty(prop.name, prop.value);
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        
        // Override with object-specific properties
        if (enemyObject.properties) {
            for (const prop of enemyObject.properties) {
                this.setProperty(prop.name, prop.value);
            }
        }
    }
    
    private setProperty(name: string, value: any): void {
        switch (name) {
            case 'damage':
                this.damage = value;
                break;
            case 'move_method':
                this.moveMethod = value;
                break;
            case 'move_speed':
                this.moveSpeed = value;
                break;
            case 'jump_power':
                this.jumpPower = value;
                break;
            case 'patrol_distance':
                this.patrolDistance = value;
                break;
            case 'detection_range':
                this.detectionRange = value;
                break;
            case 'jump_interval':
                this.jumpInterval = value;
                break;
            case 'atlas':
                this.hasAtlas = value;
                break;
        }
    }
    
    
    private initializeMovement(): void {
        // Set initial movement based on move method
        switch (this.moveMethod) {
            case 'patrol':
                this.setVelocityX(this.moveSpeed * this.direction);
                this.playAnimation('walk');
                break;
            case 'jump':
                this.playAnimation('idle');
                break;
            case 'patrol_jump':
                this.setVelocityX(this.moveSpeed * this.direction);
                this.playAnimation('walk');
                break;
            case 'static':
            default:
                this.setVelocityX(0);
                this.playAnimation('idle');
                break;
        }
    }
    
    private playAnimation(animType: string): void {
        if (!this.hasAtlas) return;
        
        const animKey = this.animationManager.getAnimationKey(this.enemyName, animType);
        if (this.animationManager.hasAnimation(this.enemyName, animType) && this.currentAnimation !== animKey) {
            this.play(animKey);
            this.currentAnimation = animKey;
        }
    }
    
    update(time: number, _delta: number): void {
        // Check if grounded
        this.isGrounded = this.body?.blocked.down || false;
        
        // Find player reference if needed
        if (!this.player && (this.moveMethod === 'follow' || this.moveMethod === 'follow_jump')) {
            const gameScene = this.scene as any;
            this.player = gameScene.player;
        }
        
        // Update movement based on method
        switch (this.moveMethod) {
            case 'patrol':
                this.updatePatrol();
                break;
            case 'jump':
                this.updateJump(time);
                break;
            case 'patrol_jump':
                this.updatePatrolJump(time);
                break;
            case 'follow':
                this.updateFollow();
                break;
            case 'follow_jump':
                this.updateFollowJump(time);
                break;
            case 'static':
            default:
                // No movement
                break;
        }
        
        // Update sprite flip based on direction
        if (this.direction < 0) {
            this.setFlipX(true);
        } else if (this.direction > 0) {
            this.setFlipX(false);
        }
    }
    
    private updatePatrol(): void {
        // Check patrol boundaries
        if (Math.abs(this.x - this.startX) >= this.patrolDistance / 2) {
            this.direction *= -1;
            this.setVelocityX(this.moveSpeed * this.direction);
        }
        
        // Check for obstacles
        if (this.body?.blocked.left && this.direction < 0) {
            this.direction = 1;
            this.setVelocityX(this.moveSpeed * this.direction);
        } else if (this.body?.blocked.right && this.direction > 0) {
            this.direction = -1;
            this.setVelocityX(this.moveSpeed * this.direction);
        }
        
        // Update animation
        if (this.isGrounded && Math.abs(this.body?.velocity.x || 0) > 10) {
            this.playAnimation('walk');
        }
    }
    
    private updateJump(time: number): void {
        if (this.isGrounded && time - this.lastJumpTime > this.jumpInterval) {
            // Random jump direction
            const jumpDirection = Phaser.Math.Between(-1, 1);
            this.setVelocity(jumpDirection * this.moveSpeed * 0.5, -this.jumpPower);
            this.lastJumpTime = time;
            this.playAnimation('jump');
            
            if (jumpDirection !== 0) {
                this.direction = jumpDirection;
            }
        } else if (this.isGrounded) {
            this.setVelocityX(0);
            this.playAnimation('idle');
        }
    }
    
    private updatePatrolJump(time: number): void {
        this.updatePatrol();
        
        // Add periodic jumps
        if (this.isGrounded && time - this.lastJumpTime > this.jumpInterval) {
            this.setVelocityY(-this.jumpPower);
            this.lastJumpTime = time;
            this.playAnimation('jump');
        }
    }
    
    private updateFollow(): void {
        if (!this.player) return;
        
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
        
        if (distance < this.detectionRange) {
            // Move towards player
            const dx = this.player.x - this.x;
            this.direction = Math.sign(dx);
            
            if (Math.abs(dx) > 10) {
                this.setVelocityX(this.moveSpeed * this.direction);
                this.playAnimation('walk');
            } else {
                this.setVelocityX(0);
                this.playAnimation('idle');
            }
        } else {
            // Stop when player is out of range
            this.setVelocityX(0);
            this.playAnimation('idle');
        }
    }
    
    private updateFollowJump(time: number): void {
        this.updateFollow();
        
        // Jump when player is above
        if (this.player && this.isGrounded && time - this.lastJumpTime > this.jumpInterval) {
            const dy = this.player.y - this.y;
            if (dy < -50) {
                this.setVelocityY(-this.jumpPower);
                this.lastJumpTime = time;
                this.playAnimation('jump');
            }
        }
    }
    
    getDamage(): number {
        return this.damage;
    }
    
    takeDamage(_damage: number): void {
        // Implement enemy damage/death logic here if needed
        // For now, just destroy the enemy
        this.destroy();
    }
    
    getMoveMethod(): string {
        return this.moveMethod;
    }
}