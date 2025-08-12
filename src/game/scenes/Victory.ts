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
        
        // \u80dc\u5229\u6807\u9898
        const victoryText = this.add.text(centerX, centerY - 100, '\u901a\u5173\u6210\u529f\uff01', {
            fontFamily: 'Arial Black',
            fontSize: 72,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        });
        victoryText.setOrigin(0.5);
        
        // \u52a8\u753b\u6548\u679c
        this.tweens.add({
            targets: victoryText,
            scale: { from: 0, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        // \u7ee7\u7eed\u6e38\u620f\u63d0\u793a
        const continueText = this.add.text(centerX, centerY + 50, '\u70b9\u51fb\u7ee7\u7eed', {
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
            
            // \u95ea\u70c1\u6548\u679c
            this.tweens.add({
                targets: continueText,
                alpha: { from: 1, to: 0.5 },
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        });
        
        // \u8fd4\u56de\u4e3b\u83dc\u5355\u63d0\u793a
        const menuText = this.add.text(centerX, centerY + 120, '\u6309 ESC \u8fd4\u56de\u4e3b\u83dc\u5355', {
            fontFamily: 'Arial',
            fontSize: 20,
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 3
        });
        menuText.setOrigin(0.5);
        
        // \u521b\u5efa\u661f\u661f\u7c92\u5b50\u6548\u679c
        this.createStarParticles();
        
        // \u70b9\u51fb\u7ee7\u7eed\u6e38\u620f
        this.input.once('pointerdown', () => {
            // \u91cd\u65b0\u6dfb\u52a0\u5e76\u542f\u52a8\u5168\u65b0\u7684Game\u573a\u666f
            this.scene.add('Game', Game, false);
            this.scene.start('Game');
            this.scene.stop('Victory');
        });
        
        // ESC\u952e\u8fd4\u56de\u4e3b\u83dc\u5355
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