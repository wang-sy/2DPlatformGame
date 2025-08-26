import Phaser from 'phaser';

export interface JoystickData {
    x: number;
    y: number;
    angle: number;
    distance: number;
    isActive: boolean;
}

export class VirtualJoystick {
    private scene: Phaser.Scene;
    private base: Phaser.GameObjects.Graphics;
    private stick: Phaser.GameObjects.Graphics;
    private baseRadius: number = 60;
    private stickRadius: number = 30;
    private x: number;
    private y: number;
    private pointerId: number = -1;
    private data: JoystickData;
    private dragLimit: number;
    
    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.dragLimit = this.baseRadius - this.stickRadius;
        
        this.data = {
            x: 0,
            y: 0,
            angle: 0,
            distance: 0,
            isActive: false
        };
        
        this.createJoystick();
        this.setupInputHandlers();
    }
    
    private createJoystick(): void {
        // Create base circle
        this.base = this.scene.add.graphics();
        this.base.fillStyle(0xffffff, 0.2);
        this.base.lineStyle(3, 0xffffff, 0.4);
        this.base.fillCircle(0, 0, this.baseRadius);
        this.base.strokeCircle(0, 0, this.baseRadius);
        this.base.x = this.x;
        this.base.y = this.y;
        this.base.setScrollFactor(0);
        this.base.setDepth(999);
        
        // Create stick circle
        this.stick = this.scene.add.graphics();
        this.stick.fillStyle(0xffffff, 0.5);
        this.stick.lineStyle(2, 0xffffff, 0.6);
        this.stick.fillCircle(0, 0, this.stickRadius);
        this.stick.strokeCircle(0, 0, this.stickRadius);
        this.stick.x = this.x;
        this.stick.y = this.y;
        this.stick.setScrollFactor(0);
        this.stick.setDepth(1000);
        
        // Add direction indicators
        const indicators = this.scene.add.graphics();
        indicators.lineStyle(2, 0xffffff, 0.1);
        
        // Draw cross lines
        indicators.moveTo(this.x - this.baseRadius + 10, this.y);
        indicators.lineTo(this.x + this.baseRadius - 10, this.y);
        indicators.moveTo(this.x, this.y - this.baseRadius + 10);
        indicators.lineTo(this.x, this.y + this.baseRadius - 10);
        indicators.strokePath();
        indicators.setScrollFactor(0);
        indicators.setDepth(998);
    }
    
    private setupInputHandlers(): void {
        this.scene.input.on('pointerdown', this.handlePointerDown, this);
        this.scene.input.on('pointermove', this.handlePointerMove, this);
        this.scene.input.on('pointerup', this.handlePointerUp, this);
        this.scene.input.on('pointercancel', this.handlePointerUp, this);
    }
    
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        // Check if pointer is within joystick base area
        const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, this.x, this.y);
        
        if (dist <= this.baseRadius && this.pointerId === -1) {
            this.pointerId = pointer.id;
            this.data.isActive = true;
            this.updateStickPosition(pointer.x, pointer.y);
        }
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        if (pointer.id !== this.pointerId) return;
        
        if (this.data.isActive) {
            this.updateStickPosition(pointer.x, pointer.y);
        }
    }
    
    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        if (pointer.id !== this.pointerId) return;
        
        this.pointerId = -1;
        this.data.isActive = false;
        this.resetStick();
    }
    
    private updateStickPosition(pointerX: number, pointerY: number): void {
        const deltaX = pointerX - this.x;
        const deltaY = pointerY - this.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);
        
        if (distance <= this.dragLimit) {
            this.stick.x = pointerX;
            this.stick.y = pointerY;
            this.data.distance = distance / this.dragLimit;
        } else {
            // Constrain to circle edge
            this.stick.x = this.x + Math.cos(angle) * this.dragLimit;
            this.stick.y = this.y + Math.sin(angle) * this.dragLimit;
            this.data.distance = 1;
        }
        
        // Normalize values
        this.data.x = (this.stick.x - this.x) / this.dragLimit;
        this.data.y = (this.stick.y - this.y) / this.dragLimit;
        this.data.angle = angle;
        
        // Visual feedback - make stick more opaque when active
        this.stick.clear();
        this.stick.fillStyle(0xffffff, 0.7);
        this.stick.lineStyle(2, 0xffffff, 0.8);
        this.stick.fillCircle(0, 0, this.stickRadius);
        this.stick.strokeCircle(0, 0, this.stickRadius);
    }
    
    private resetStick(): void {
        // Animate stick back to center
        this.scene.tweens.add({
            targets: this.stick,
            x: this.x,
            y: this.y,
            duration: 100,
            ease: 'Power2',
            onComplete: () => {
                this.data.x = 0;
                this.data.y = 0;
                this.data.angle = 0;
                this.data.distance = 0;
                
                // Reset visual
                this.stick.clear();
                this.stick.fillStyle(0xffffff, 0.5);
                this.stick.lineStyle(2, 0xffffff, 0.6);
                this.stick.fillCircle(0, 0, this.stickRadius);
                this.stick.strokeCircle(0, 0, this.stickRadius);
            }
        });
    }
    
    public getData(): JoystickData {
        return this.data;
    }
    
    public isActive(): boolean {
        return this.data.isActive;
    }
    
    public destroy(): void {
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.scene.input.off('pointercancel', this.handlePointerUp, this);
        
        this.base.destroy();
        this.stick.destroy();
    }
}