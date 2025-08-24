import { Scene } from 'phaser';
import { eventBus, GameEvent } from '../events/EventBus';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
    private obstacleType: string;
    private isDestructible: boolean;
    private health: number;
    private maxHealth: number;
    private isDestroyed: boolean = false;

    constructor(scene: Scene, obstacleObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = obstacleObject.x || 0;
        const y = obstacleObject.y || 0;
        const texture = obstacleObject.name || 'block_empty';
        
        super(scene, x, y - 32, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        
        this.setOrigin(0.5, 0.5);
        this.obstacleType = obstacleObject.name || 'block_empty';
        
        this.setSize(64, 64);
        this.setOffset(0, 0);
        
        // Parse properties from array format
        const properties = obstacleObject.properties as any[];
        console.log(`[Obstacle] Properties: ${JSON.stringify(properties)}`);
        
        // Default values
        this.isDestructible = false;
        this.maxHealth = 3;
        
        // Extract properties from array
        if (properties && Array.isArray(properties)) {
            properties.forEach(prop => {
                if (prop.name === 'destructible') {
                    this.isDestructible = prop.value;
                } else if (prop.name === 'health') {
                    this.maxHealth = prop.value;
                }
            });
        }
        
        this.health = this.maxHealth;
        
        console.log(`[Obstacle] Created at (${this.x}, ${this.y}), destructible: ${this.isDestructible}, health: ${this.health}/${this.maxHealth}`);
        
        if (this.body && typeof this.body.updateFromGameObject === 'function') {
            (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
        }
    }

    getObstacleType(): string {
        return this.obstacleType;
    }

    getIsDestructible(): boolean {
        return this.isDestructible;
    }

    takeDamage(damage: number = 1): void {
        if (!this.isDestructible) {
            console.log(`[Obstacle] Hit non-destructible obstacle at (${this.x}, ${this.y})`);
            return;
        }
        
        if (this.isDestroyed) {
            console.log(`[Obstacle] Hit already destroyed obstacle`);
            return;
        }

        this.health -= damage;
        console.log(`[Obstacle] Obstacle at (${this.x}, ${this.y}) took ${damage} damage. Health: ${this.health}/${this.maxHealth}`);
        
        if (this.health <= 0) {
            console.log(`[Obstacle] Obstacle at (${this.x}, ${this.y}) destroyed!`);
            this.destroy();
        } else {
            this.showDamageEffect();
        }
    }

    private showDamageEffect(): void {
        const originalTint = this.tint;
        
        this.setTint(0xff0000);
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            onComplete: () => {
                this.setTint(originalTint);
            }
        });
        
        this.scene.cameras.main.shake(50, 0.002);
        
        const cracks = Math.floor((1 - this.health / this.maxHealth) * 3) + 1;
        for (let i = 0; i < cracks; i++) {
            const crack = this.scene.add.rectangle(
                this.x + Phaser.Math.Between(-20, 20),
                this.y + Phaser.Math.Between(-20, 20),
                Phaser.Math.Between(2, 5),
                Phaser.Math.Between(10, 20),
                0x333333
            );
            crack.setAngle(Phaser.Math.Between(0, 360));
            crack.setDepth(this.depth + 1);
            
            this.scene.time.delayedCall(500, () => {
                crack.destroy();
            });
        }
    }

    destroy(): void {
        if (this.isDestroyed) {
            return;
        }
        
        this.isDestroyed = true;
        
        this.createDestructionEffect();
        
        eventBus.emit(GameEvent.OBSTACLE_DESTROYED, {
            x: this.x,
            y: this.y,
            type: this.obstacleType
        });
        
        super.destroy();
    }

    private createDestructionEffect(): void {
        const particleCount = 12;
        const colors = [0x8B4513, 0x654321, 0x7F6000, 0x4B3621];
        
        for (let i = 0; i < particleCount; i++) {
            const size = Phaser.Math.Between(4, 8);
            const particle = this.scene.add.rectangle(
                this.x,
                this.y,
                size,
                size,
                Phaser.Math.RND.pick(colors)
            );
            
            const angle = (Math.PI * 2 / particleCount) * i;
            const speed = Phaser.Math.Between(100, 300);
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed - Phaser.Math.Between(50, 150);
            
            this.scene.physics.add.existing(particle);
            const body = particle.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(vx, vy);
            body.setGravityY(500);
            body.setBounce(0.5, 0.5);
            
            this.scene.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: 1000,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
        
        const dustCloud = this.scene.add.circle(this.x, this.y, 40, 0x8B4513, 0.5);
        dustCloud.setDepth(100);
        
        this.scene.tweens.add({
            targets: dustCloud,
            scale: { from: 0, to: 2 },
            alpha: { from: 0.5, to: 0 },
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                dustCloud.destroy();
            }
        });
        
        // this.scene.cameras.main.shake(100, 0.005);
        
        const flash = this.scene.add.rectangle(
            this.x,
            this.y,
            80,
            80,
            0xffffff,
            0.8
        );
        flash.setDepth(99);
        
        this.scene.tweens.add({
            targets: flash,
            scale: { from: 0, to: 1.5 },
            alpha: { from: 0.8, to: 0 },
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                flash.destroy();
            }
        });
    }
}