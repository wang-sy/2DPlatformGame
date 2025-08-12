import { Scene } from 'phaser';

export class HealthUI {
    private scene: Scene;
    private hearts: Phaser.GameObjects.Graphics[] = [];
    private maxHealth: number;
    private currentHealth: number;
    private heartSize: number = 30;
    private heartSpacing: number = 40;
    private x: number;
    private y: number;

    constructor(scene: Scene, x: number = 50, y: number = 50) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.maxHealth = 3;
        this.currentHealth = 3;
        
        this.createHearts();
    }

    private createHearts(): void {
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = this.scene.add.graphics();
            const heartX = this.x + (i * this.heartSpacing);
            const heartY = this.y;
            
            this.drawHeart(heart, heartX, heartY, true);
            heart.setScrollFactor(0);
            heart.setDepth(1000);
            
            this.hearts.push(heart);
        }
    }

    private drawHeart(graphics: Phaser.GameObjects.Graphics, x: number, y: number, filled: boolean): void {
        graphics.clear();
        
        if (filled) {
            graphics.fillStyle(0xff0000, 1);
            graphics.lineStyle(2, 0xffffff, 1);
        } else {
            graphics.fillStyle(0x333333, 0.5);
            graphics.lineStyle(2, 0x666666, 1);
        }
        
        // \u7ed8\u5236\u5fc3\u5f62
        const size = this.heartSize;
        const halfSize = size / 2;
        const quarterSize = size / 4;
        
        graphics.beginPath();
        graphics.moveTo(x, y + quarterSize);
        
        // \u5de6\u4e0a\u534a\u5706
        graphics.arc(x - quarterSize, y - quarterSize, quarterSize, Math.PI, 0, false);
        
        // \u53f3\u4e0a\u534a\u5706
        graphics.arc(x + quarterSize, y - quarterSize, quarterSize, Math.PI, 0, false);
        
        // \u53f3\u4fa7\u66f2\u7ebf\u5230\u5e95\u90e8
        graphics.lineTo(x + halfSize, y);
        graphics.lineTo(x, y + halfSize);
        
        // \u5de6\u4fa7\u66f2\u7ebf\u5230\u5e95\u90e8
        graphics.lineTo(x - halfSize, y);
        
        graphics.closePath();
        graphics.fillPath();
        graphics.strokePath();
    }

    updateHealth(health: number): void {
        if (health < 0) health = 0;
        if (health > this.maxHealth) health = this.maxHealth;
        
        const oldHealth = this.currentHealth;
        this.currentHealth = health;
        
        // \u66f4\u65b0\u5fc3\u5f62\u663e\u793a
        for (let i = 0; i < this.maxHealth; i++) {
            const heart = this.hearts[i];
            const heartX = this.x + (i * this.heartSpacing);
            const heartY = this.y;
            
            if (i < health) {
                // \u6ee1\u8840\u7684\u5fc3
                this.drawHeart(heart, heartX, heartY, true);
                
                // \u5982\u679c\u662f\u523a\u6062\u590d\u7684\u8840\u91cf\uff0c\u6dfb\u52a0\u52a8\u753b
                if (oldHealth < health && i === health - 1) {
                    this.scene.tweens.add({
                        targets: heart,
                        scaleX: 1.3,
                        scaleY: 1.3,
                        duration: 200,
                        yoyo: true,
                        ease: 'Back.easeOut'
                    });
                }
            } else {
                // \u7a7a\u8840\u7684\u5fc3
                this.drawHeart(heart, heartX, heartY, false);
                
                // \u5982\u679c\u662f\u523a\u5931\u53bb\u7684\u8840\u91cf\uff0c\u6dfb\u52a0\u788e\u88c2\u52a8\u753b
                if (oldHealth > health && i === health) {
                    this.createHeartBreakEffect(heartX, heartY);
                    
                    this.scene.tweens.add({
                        targets: heart,
                        scaleX: 0.8,
                        scaleY: 0.8,
                        alpha: 0.5,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            heart.scaleX = 1;
                            heart.scaleY = 1;
                            heart.alpha = 1;
                        }
                    });
                }
            }
        }
    }

    private createHeartBreakEffect(x: number, y: number): void {
        // \u521b\u5efa\u788e\u7247\u6548\u679c
        for (let i = 0; i < 6; i++) {
            const particle = this.scene.add.graphics();
            particle.fillStyle(0xff0000, 1);
            particle.fillCircle(0, 0, 3);
            particle.x = x;
            particle.y = y;
            particle.setScrollFactor(0);
            particle.setDepth(999);
            
            const angle = (Math.PI * 2 / 6) * i;
            const distance = 30;
            
            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }

    setMaxHealth(maxHealth: number): void {
        // \u6e05\u9664\u65e7\u7684\u5fc3\u5f62
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];
        
        // \u8bbe\u7f6e\u65b0\u7684\u6700\u5927\u8840\u91cf
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        
        // \u91cd\u65b0\u521b\u5efa\u5fc3\u5f62
        this.createHearts();
    }

    destroy(): void {
        this.hearts.forEach(heart => heart.destroy());
        this.hearts = [];
    }
}