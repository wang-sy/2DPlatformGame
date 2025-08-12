import { Scene } from 'phaser';
import { Game } from './Game';

export class Victory extends Scene {
    constructor() {
        super('Victory');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x4a90e2);
        
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        
        // Victory title
        const victoryText = this.add.text(centerX, centerY - 100, 'Level Complete!', {
            fontFamily: 'Arial Black',
            fontSize: 72,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        });
        victoryText.setOrigin(0.5);
        
        // Animation effect
        this.tweens.add({
            targets: victoryText,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // Continue game prompt
        const continueText = this.add.text(centerX, centerY + 50, 'Click to Continue', {
            fontFamily: 'Arial',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        continueText.setOrigin(0.5);
        continueText.setAlpha(0);
        
        this.time.delayedCall(800, () => {
            this.tweens.add({
                targets: continueText,
                alpha: 1,
                duration: 500
            });
            
            // Blinking effect
            this.tweens.add({
                targets: continueText,
                alpha: { from: 1, to: 0.5 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });
        
        // Return to main menu prompt
        const menuText = this.add.text(centerX, centerY + 120, 'Press ESC to Return to Main Menu', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 3
        });
        menuText.setOrigin(0.5);
        
        // Create star particle effect
        this.createStarParticles();
        
        // Click to continue game
        this.input.once('pointerdown', () => {
            // Re-add and start a fresh Game scene
            this.scene.add('Game', Game, false);
            this.scene.start('Game');
            this.scene.stop('Victory');
        });
        
        // ESC key to return to main menu
        const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey?.once('down', () => {
            this.scene.start('MainMenu');
            this.scene.stop('Victory');
        });
    }
    
    private createStarParticles(): void {
        const colors = [0xffff00, 0xffffff, 0xffcc00];
        
        for (let i = 0; i < 20; i++) {
            this.time.delayedCall(i * 100, () => {
                const x = Phaser.Math.Between(100, this.cameras.main.width - 100);
                const y = Phaser.Math.Between(100, this.cameras.main.height - 100);
                const color = Phaser.Utils.Array.GetRandom(colors);
                
                const star = this.add.star(x, y, 5, 3, 6, color);
                star.setScale(0);
                
                this.tweens.add({
                    targets: star,
                    scale: { from: 0, to: 1 },
                    rotation: { from: 0, to: Math.PI * 2 },
                    duration: 1000,
                    ease: 'Power2'
                });
                
                this.tweens.add({
                    targets: star,
                    alpha: { from: 1, to: 0 },
                    delay: 1000,
                    duration: 500,
                    onComplete: () => {
                        star.destroy();
                    }
                });
            });
        }
    }
}