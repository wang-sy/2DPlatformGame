import Phaser from 'phaser';
import { VirtualJoystick, JoystickData } from '../ui/VirtualJoystick';

export interface TouchControls {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    jump: boolean;
    shoot: boolean;
    joystickX: number;
    joystickY: number;
    jumpChargeTime: number;
    isChargingJump: boolean;
}

export class TouchInputManager {
    private scene: Phaser.Scene;
    private controls: TouchControls;
    private virtualButtons: Map<string, Phaser.GameObjects.Graphics>;
    private touchZones: Map<string, Phaser.Geom.Rectangle>;
    private activePointers: Map<number, string>;
    private isMobileDevice: boolean;
    private joystick?: VirtualJoystick;
    private jumpPressStartTime: number = 0;
    private jumpButtonText?: Phaser.GameObjects.Text;
    
    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.controls = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false,
            joystickX: 0,
            joystickY: 0,
            jumpChargeTime: 0,
            isChargingJump: false
        };
        
        this.virtualButtons = new Map();
        this.touchZones = new Map();
        this.activePointers = new Map();
        
        this.isMobileDevice = this.checkMobileDevice();
        
        if (this.isMobileDevice) {
            this.createVirtualControls();
            this.setupTouchListeners();
        }
    }
    
    private checkMobileDevice(): boolean {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               ('ontouchstart' in window) ||
               (navigator.maxTouchPoints > 0);
    }
    
    private createVirtualControls(): void {
        const { width, height } = this.scene.scale.gameSize;
        const buttonAlpha = 0.3;
        const buttonColor = 0xffffff;
        
        // Create joystick instead of directional buttons
        const joystickX = 120;
        const joystickY = height - 150;
        this.joystick = new VirtualJoystick(this.scene, joystickX, joystickY);
        
        const jumpButtonSize = 60;
        const jumpX = width - 150;
        const jumpY = height - 150;
        
        const jumpButton = this.scene.add.graphics();
        jumpButton.fillStyle(buttonColor, buttonAlpha);
        jumpButton.fillCircle(jumpX, jumpY, jumpButtonSize);
        jumpButton.setScrollFactor(0);
        jumpButton.setDepth(1000);
        
        this.jumpButtonText = this.scene.add.text(jumpX, jumpY, 'JUMP', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.jumpButtonText.setScrollFactor(0);
        this.jumpButtonText.setDepth(1001);
        
        // Add charge indicator ring
        const chargeRing = this.scene.add.graphics();
        chargeRing.lineStyle(4, 0x00ff00, 0);
        chargeRing.strokeCircle(jumpX, jumpY, jumpButtonSize + 10);
        chargeRing.setScrollFactor(0);
        chargeRing.setDepth(999);
        chargeRing.setName('jumpChargeRing');
        
        this.virtualButtons.set('jump', jumpButton);
        this.virtualButtons.set('jumpChargeRing', chargeRing);
        this.touchZones.set('jump', new Phaser.Geom.Rectangle(
            jumpX - jumpButtonSize, jumpY - jumpButtonSize,
            jumpButtonSize * 2, jumpButtonSize * 2
        ));
        
        const shootButtonSize = 50;
        const shootX = width - 250;
        const shootY = height - 100;
        
        const shootButton = this.scene.add.graphics();
        shootButton.fillStyle(buttonColor, buttonAlpha);
        shootButton.fillCircle(shootX, shootY, shootButtonSize);
        shootButton.setScrollFactor(0);
        shootButton.setDepth(1000);
        
        const shootText = this.scene.add.text(shootX, shootY, 'SHOOT', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);
        shootText.setScrollFactor(0);
        shootText.setDepth(1001);
        
        this.virtualButtons.set('shoot', shootButton);
        this.touchZones.set('shoot', new Phaser.Geom.Rectangle(
            shootX - shootButtonSize, shootY - shootButtonSize,
            shootButtonSize * 2, shootButtonSize * 2
        ));
    }
    
    private setupTouchListeners(): void {
        this.scene.input.addPointer(2);
        
        this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.handlePointerDown(pointer);
        });
        
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                this.handlePointerMove(pointer);
            }
        });
        
        this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.handlePointerUp(pointer);
        });
        
        this.scene.input.on('pointercancel', (pointer: Phaser.Input.Pointer) => {
            this.handlePointerUp(pointer);
        });
    }
    
    private handlePointerDown(pointer: Phaser.Input.Pointer): void {
        const x = pointer.x;
        const y = pointer.y;
        
        this.touchZones.forEach((zone, key) => {
            if (Phaser.Geom.Rectangle.Contains(zone, x, y)) {
                this.activePointers.set(pointer.id, key);
                this.updateControlState(key, true);
                this.updateButtonVisual(key, true);
                
                // Track jump button press time for charge jump
                if (key === 'jump') {
                    this.jumpPressStartTime = this.scene.time.now;
                    this.controls.isChargingJump = true;
                }
            }
        });
    }
    
    private handlePointerMove(pointer: Phaser.Input.Pointer): void {
        const x = pointer.x;
        const y = pointer.y;
        const currentButton = this.activePointers.get(pointer.id);
        
        let newButton: string | null = null;
        this.touchZones.forEach((zone, key) => {
            if (Phaser.Geom.Rectangle.Contains(zone, x, y)) {
                newButton = key;
            }
        });
        
        if (currentButton && currentButton !== newButton) {
            this.updateControlState(currentButton, false);
            this.updateButtonVisual(currentButton, false);
            this.activePointers.delete(pointer.id);
        }
        
        if (newButton && currentButton !== newButton) {
            this.activePointers.set(pointer.id, newButton);
            this.updateControlState(newButton, true);
            this.updateButtonVisual(newButton, true);
        }
    }
    
    private handlePointerUp(pointer: Phaser.Input.Pointer): void {
        const button = this.activePointers.get(pointer.id);
        if (button) {
            // Calculate charge time for jump
            if (button === 'jump' && this.jumpPressStartTime > 0) {
                const chargeTime = this.scene.time.now - this.jumpPressStartTime;
                this.controls.jumpChargeTime = chargeTime;
                this.jumpPressStartTime = 0;
                this.controls.isChargingJump = false;
                
                // Reset charge ring visual
                const chargeRing = this.virtualButtons.get('jumpChargeRing');
                if (chargeRing) {
                    chargeRing.clear();
                    chargeRing.lineStyle(4, 0x00ff00, 0);
                    const jumpZone = this.touchZones.get('jump');
                    if (jumpZone) {
                        const centerX = jumpZone.x + jumpZone.width / 2;
                        const centerY = jumpZone.y + jumpZone.height / 2;
                        chargeRing.strokeCircle(centerX, centerY, 70);
                    }
                }
                
                // Reset jump button text
                if (this.jumpButtonText) {
                    this.jumpButtonText.setText('JUMP');
                    this.jumpButtonText.setColor('#ffffff');
                }
            }
            
            this.updateControlState(button, false);
            this.updateButtonVisual(button, false);
            this.activePointers.delete(pointer.id);
        }
    }
    
    private updateControlState(button: string, pressed: boolean): void {
        switch(button) {
            case 'left':
                this.controls.left = pressed;
                break;
            case 'right':
                this.controls.right = pressed;
                break;
            case 'jump':
                this.controls.jump = pressed;
                this.controls.up = pressed;
                break;
            case 'shoot':
                this.controls.shoot = pressed;
                break;
        }
    }
    
    private updateButtonVisual(button: string, pressed: boolean): void {
        const graphics = this.virtualButtons.get(button);
        if (graphics) {
            graphics.alpha = pressed ? 0.6 : 1;
        }
    }
    
    public getControls(): TouchControls {
        // Update joystick data if available
        if (this.joystick) {
            const joystickData = this.joystick.getData();
            this.controls.joystickX = joystickData.x;
            this.controls.joystickY = joystickData.y;
            
            // Map joystick to left/right controls for compatibility
            this.controls.left = joystickData.x < -0.3;
            this.controls.right = joystickData.x > 0.3;
            this.controls.up = joystickData.y < -0.3;
            this.controls.down = joystickData.y > 0.3;
        }
        
        // Update jump charge time if charging
        if (this.controls.isChargingJump && this.jumpPressStartTime > 0) {
            const currentChargeTime = this.scene.time.now - this.jumpPressStartTime;
            this.controls.jumpChargeTime = currentChargeTime;
            
            // Update charge visual
            const chargeRing = this.virtualButtons.get('jumpChargeRing');
            if (chargeRing) {
                const maxChargeTime = 1000;
                const chargePercent = Math.min(currentChargeTime / maxChargeTime, 1);
                
                chargeRing.clear();
                const alpha = 0.3 + chargePercent * 0.7;
                const color = chargePercent < 0.2 ? 0xffffff : 
                             chargePercent < 0.5 ? 0xffff00 : 
                             chargePercent < 0.8 ? 0xff8800 : 0xff0000;
                
                chargeRing.lineStyle(4 + chargePercent * 4, color, alpha);
                
                const jumpZone = this.touchZones.get('jump');
                if (jumpZone) {
                    const centerX = jumpZone.x + jumpZone.width / 2;
                    const centerY = jumpZone.y + jumpZone.height / 2;
                    
                    // Draw arc based on charge
                    const startAngle = -90;
                    const endAngle = startAngle + (360 * chargePercent);
                    chargeRing.arc(centerX, centerY, 70, 
                        Phaser.Math.DegToRad(startAngle), 
                        Phaser.Math.DegToRad(endAngle), false);
                    chargeRing.strokePath();
                }
                
                // Update button text
                if (this.jumpButtonText) {
                    if (chargePercent >= 0.2) {
                        this.jumpButtonText.setText('CHARGE!');
                        this.jumpButtonText.setColor(chargePercent >= 0.8 ? '#ff0000' : '#ffff00');
                    }
                }
            }
        }
        
        return this.controls;
    }
    
    public isActive(): boolean {
        return this.isMobileDevice;
    }
    
    public resetControls(): void {
        this.controls = {
            left: false,
            right: false,
            up: false,
            down: false,
            jump: false,
            shoot: false,
            joystickX: 0,
            joystickY: 0,
            jumpChargeTime: 0,
            isChargingJump: false
        };
    }
    
    public destroy(): void {
        if (this.joystick) {
            this.joystick.destroy();
        }
        if (this.jumpButtonText) {
            this.jumpButtonText.destroy();
        }
        this.virtualButtons.forEach(button => button.destroy());
        this.virtualButtons.clear();
        this.touchZones.clear();
        this.activePointers.clear();
    }
}