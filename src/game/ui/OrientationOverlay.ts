import { Scene } from 'phaser';

export class OrientationOverlay {
    private scene: Scene;
    private overlay?: Phaser.GameObjects.Container;
    private background?: Phaser.GameObjects.Rectangle;
    private text?: Phaser.GameObjects.Text;
    private icon?: Phaser.GameObjects.Text;
    
    constructor(scene: Scene) {
        this.scene = scene;
        this.createOverlay();
        this.checkOrientation();
        
        window.addEventListener('orientationchange', () => this.checkOrientation());
        window.addEventListener('resize', () => this.checkOrientation());
    }
    
    private createOverlay(): void {
        const { width, height } = this.scene.scale.gameSize;
        
        this.overlay = this.scene.add.container(0, 0);
        this.overlay.setDepth(10000);
        this.overlay.setScrollFactor(0);
        
        this.background = this.scene.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.95
        );
        
        this.icon = this.scene.add.text(
            width / 2,
            height / 2 - 50,
            '📱',
            {
                fontSize: '80px'
            }
        ).setOrigin(0.5);
        
        this.text = this.scene.add.text(
            width / 2,
            height / 2 + 50,
            'Please rotate your device\nto landscape mode',
            {
                fontSize: '24px',
                color: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        this.overlay.add([this.background, this.icon, this.text]);
        this.overlay.setVisible(false);
        
        // Rotation animation
        this.scene.tweens.add({
            targets: this.icon,
            angle: 90,
            duration: 1500,
            ease: 'Power2',
            repeat: -1,
            yoyo: true
        });
    }
    
    private checkOrientation(): void {
        if (!this.isMobile()) {
            this.overlay?.setVisible(false);
            return;
        }
        
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            this.overlay?.setVisible(true);
            this.scene.scene.pause();
        } else {
            this.overlay?.setVisible(false);
            this.scene.scene.resume();
        }
    }
    
    private isMobile(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window);
    }
    
    destroy(): void {
        window.removeEventListener('orientationchange', () => this.checkOrientation());
        window.removeEventListener('resize', () => this.checkOrientation());
        this.overlay?.destroy();
    }
}