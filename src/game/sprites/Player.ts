import Phaser from 'phaser';
import { AnimationManager } from '../managers/AnimationManager';
import { SoundEffectPlayer } from '../managers/SoundEffectPlayer';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private moveSpeed: number = 200;
    private jumpSpeed: number = 500;
    private currentAnimation: string = '';
    private key: string = '';
    
    // Double jump
    private jumpCount: number = 0;
    private maxJumps: number = 2;
    
    // Wall jump
    private isTouchingWall: boolean = false;
    private wallJumpCooldown: number = 0;
    private wallJumpSpeed: number = 400;
    
    // Charge jump
    private isCharging: boolean = false;
    private chargeTime: number = 0;
    private maxChargeTime: number = 1000;
    private minChargeTime: number = 200;
    private chargeJumpMultiplier: number = 2;
    
    // Health and damage
    private health: number = 3;
    private maxHealth: number = 3;
    private isInvulnerable: boolean = false;
    
    // Animation
    private animationManager: AnimationManager;
    private soundEffectPlayer: SoundEffectPlayer;

    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        let x = tiledObject.x ?? 0;
        let y = tiledObject.y ?? 0;

        let key = tiledObject.name;

        super(scene, x, y, key);

        this.key = key;
        this.animationManager = AnimationManager.getInstance();
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();

        scene.add.existing(this);
        scene.physics.add.existing(this);

        let texture = scene.textures.get(key);
        let firstFrame = (texture.frames as any)[texture.firstFrame];

        let displayWidth = (tiledObject.width ?? firstFrame.width);
        let displayHeight = (tiledObject.height ?? firstFrame.height);

        let xScale = displayWidth / firstFrame.width
        let yScale = displayHeight / firstFrame.height
        
        this.setScale(xScale, yScale);
        // 设置物理碰撞体为原始尺寸的80%
        this.setSize(firstFrame.width * 0.7, firstFrame.height * 0.7);
        // 居中偏移量为原始尺寸的10%
        this.setOffset(firstFrame.width * 0.1, firstFrame.height * 0.1);
        
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setGravityY(800);
        
        this.cursors = scene.input.keyboard!.createCursorKeys();
        
        // Play initial animation using AnimationManager
        this.playAnimation('idle');
    }

    private playAnimation(animName: string): void {
        const animKey = this.animationManager.getAnimationKey(this.key, animName);
        if (this.animationManager.hasAnimation(this.key, animName)) {
            if (this.currentAnimation !== animKey) {
                this.play(animKey);
                this.currentAnimation = animKey;
                
                // Play sound effect for this animation
                if (this.soundEffectPlayer.hasAnimationSound(this.key, animName)) {
                    this.soundEffectPlayer.playAnimationSound(this.key, animName);
                }
            }
        }
    }

    update(): void {
        const velocity = this.body?.velocity;
        if (!velocity) return;

        const onGround = this.body?.blocked.down || false;
        const touchingLeft = this.body?.blocked.left || false;
        const touchingRight = this.body?.blocked.right || false;
        
        // Update wall touching status
        this.isTouchingWall = !onGround && (touchingLeft || touchingRight);
        
        // Update wall jump cooldown
        if (this.wallJumpCooldown > 0) {
            this.wallJumpCooldown -= this.scene.game.loop.delta;
        }
        
        // Reset jump count when on ground
        if (onGround) {
            this.jumpCount = 0;
        }
        
        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.setVelocityX(-this.moveSpeed);
            this.setFlipX(true);
            
            if (onGround) {
                this.playAnimation('walk');
            }
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(this.moveSpeed);
            this.setFlipX(false);
            
            if (onGround) {
                this.playAnimation('walk');
            }
        } else {
            this.setVelocityX(0);
            
            if (onGround && !this.cursors.down.isDown && !this.isCharging) {
                this.playAnimation('idle');
            }
        }
        
        // Duck
        if (this.cursors.down.isDown && onGround && !this.isCharging) {
            this.playAnimation('duck');
        }
        
        // Charge jump (hold space while on ground)
        const spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        if (spaceKey?.isDown && onGround && !this.isCharging) {
            this.isCharging = true;
            this.chargeTime = 0;
            this.playAnimation('duck');
        }
        
        if (this.isCharging && spaceKey?.isDown) {
            this.chargeTime += this.scene.game.loop.delta;
            if (this.chargeTime > this.maxChargeTime) {
                this.chargeTime = this.maxChargeTime;
            }
            // Visual feedback for charging (tint color based on charge level)
            const chargePercent = this.chargeTime / this.maxChargeTime;
            const tintValue = 0xffffff - Math.floor(chargePercent * 0x008888);
            this.setTint(tintValue);
        }
        
        // Release charge jump
        if (this.isCharging && spaceKey?.isUp) {
            if (this.chargeTime >= this.minChargeTime) {
                const chargeMultiplier = 1 + (this.chargeTime / this.maxChargeTime) * (this.chargeJumpMultiplier - 1);
                this.setVelocityY(-this.jumpSpeed * chargeMultiplier);
                this.jumpCount = 1;
            }
            this.isCharging = false;
            this.chargeTime = 0;
            this.clearTint();
            this.playAnimation('jump');
        }
        
        // Normal jump and double jump
        const justPressedUp = Phaser.Input.Keyboard.JustDown(this.cursors.up);
        
        if (justPressedUp && !this.isCharging) {
            // Wall jump
            if (this.isTouchingWall && this.wallJumpCooldown <= 0) {
                const wallJumpX = touchingLeft ? this.wallJumpSpeed : -this.wallJumpSpeed;
                this.setVelocityX(wallJumpX);
                this.setVelocityY(-this.jumpSpeed * 0.9);
                this.wallJumpCooldown = 300;
                this.jumpCount = 1;
                this.playAnimation('jump');
            }
            // Normal jump and double jump
            else if (this.jumpCount < this.maxJumps) {
                const jumpPower = this.jumpCount === 0 ? this.jumpSpeed : this.jumpSpeed * 0.85;
                this.setVelocityY(-jumpPower);
                this.jumpCount++;
                this.playAnimation('jump');
                
                // Play jump sound if available
                if (this.soundEffectPlayer.hasAnimationSound(this.key, 'jump')) {
                    this.soundEffectPlayer.playAnimationSound(this.key, 'jump', 0.7);
                }
            }
        }
        
        // Wall slide effect
        if (this.isTouchingWall && velocity.y > 0) {
            this.setVelocityY(Math.min(velocity.y, 100));
            this.playAnimation('climb');
        }
        
        // Jump animation
        if (!onGround && !this.isTouchingWall) {
            this.playAnimation('jump');
        }
    }

    hit(): void {
        this.playAnimation('hit');
        
        // Play hit sound effect
        if (this.soundEffectPlayer.hasAnimationSound(this.key, 'hit')) {
            this.soundEffectPlayer.playAnimationSound(this.key, 'hit');
        }
        
        this.scene.time.delayedCall(500, () => {
            this.playAnimation('idle');
        });
    }

    takeDamage(damage: number): void {
        if (this.isInvulnerable) {
            return;
        }
        
        this.health -= damage;
        this.isInvulnerable = true;
        
        this.playAnimation('hit');
        
        const knockbackX = this.flipX ? 200 : -200;
        this.setVelocity(knockbackX, -300);
        
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.3 },
            duration: 100,
            repeat: 7,
            yoyo: true,
            onComplete: () => {
                this.alpha = 1;
                this.isInvulnerable = false;
            }
        });
        
        if (this.health <= 0) {
            this.handleDeath();
        }
    }

    private handleDeath(): void {
        this.setTint(0xff0000);
        this.setVelocity(0, -400);
        this.body!.enable = false;
        
        // Play death sound effect
        if (this.soundEffectPlayer.hasAnimationSound(this.key, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.key, 'die');
        }
        
        this.scene.time.delayedCall(1000, () => {
            // Call Game scene's restartGame method
            const gameScene = this.scene as any;
            if (gameScene.restartGame) {
                gameScene.restartGame();
            } else {
                this.scene.scene.restart();
            }
        });
    }

    getHealth(): number {
        return this.health;
    }

    getMaxHealth(): number {
        return this.maxHealth;
    }
}