import { Scene } from 'phaser';
import { eventBus, GameEvent } from '../events/EventBus';

export class Goal extends Phaser.Physics.Arcade.Sprite {
    // private goalType: string;
    private collected: boolean = false;

    constructor(scene: Scene, goalObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = goalObject.x || 0;
        const y = goalObject.y || 0;
        const texture = goalObject.name || 'goal';
        
        super(scene, x, y - 32, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        
        this.setOrigin(0.5, 0.5);
        // this.goalType = goalObject.name || 'flag';
        
        this.setSize(40, 56);
        this.setOffset(12, 8);
        
        this.createAnimations();
        this.playIdleAnimation();
    }

    private createAnimations(): void {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 10,
            duration: 1500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    private playIdleAnimation(): void {
        this.scene.tweens.add({
            targets: this,
            scaleX: 1.1,
            scaleY: 0.9,
            duration: 800,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    collect(): void {
        if (this.collected) return;
        
        this.collected = true;
        
        // Emit goal reached event
        eventBus.emit(GameEvent.GOAL_REACHED, {
            player: null // Will be set by the Game scene
        });
        
        this.scene.tweens.add({
            targets: this,
            y: this.y - 100,
            alpha: 0,
            scale: 2,
            duration: 1000,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.destroy();
            }
        });
        
        for (let i = 0; i < 10; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const particle = this.scene.add.circle(
                    this.x + Phaser.Math.Between(-20, 20),
                    this.y + Phaser.Math.Between(-20, 20),
                    3,
                    0x00ff00
                );
                
                this.scene.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(-50, 50),
                    y: particle.y - Phaser.Math.Between(30, 60),
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => {
                        particle.destroy();
                    }
                });
            });
        }
    }

    isCollected(): boolean {
        return this.collected;
    }
}