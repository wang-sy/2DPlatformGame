import { GameObjectManager } from '../managers/GameObjectManager';
import { Player } from './Player';

export class Trigger extends Phaser.GameObjects.Zone {
    private triggered: boolean = false;
    private eventType: 'move' | 'scale';
    private targetUUID: string;
    private velocityX: number = 0;
    private velocityY: number = 0;
    private duration: number = 1000;
    private targetScaleX: number = 1;  // Renamed to avoid conflict with Phaser's scaleX
    private targetScaleY: number = 1;  // Renamed to avoid conflict with Phaser's scaleY
    private repeat: boolean = false;
    private delay: number = 0;
    private returnToOrigin: boolean = true;  // New property to control return behavior
    private originalVelocity?: Phaser.Math.Vector2;
    private originalScale?: Phaser.Math.Vector2;
    private debugGraphics?: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        const x = tiledObject.x || 0;
        const y = tiledObject.y || 0;
        const width = tiledObject.width || 64;
        const height = tiledObject.height || 64;
        
        super(scene, x + width/2, y + height/2, width, height);
        
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        
        // Parse properties from tilemap
        this.parseProperties(tiledObject);
        
        // Debug visualization - disabled by default
        // Uncomment the following lines to see trigger areas in development
        // if (import.meta.env.DEV) {
        //     this.createDebugVisualization();
        // }
    }
    
    private parseProperties(tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        const properties = tiledObject.properties as any[];
        if (!properties) return;
        
        properties.forEach(prop => {
            switch (prop.name) {
                case 'event_type':
                    this.eventType = prop.value as 'move' | 'scale';
                    break;
                case 'target_uuid':
                    this.targetUUID = prop.value;
                    break;
                case 'velocity_x':
                    this.velocityX = prop.value;
                    break;
                case 'velocity_y':
                    this.velocityY = prop.value;
                    break;
                case 'duration':
                    this.duration = prop.value;
                    break;
                case 'scale_x':
                    this.targetScaleX = prop.value;
                    break;
                case 'scale_y':
                    this.targetScaleY = prop.value;
                    break;
                case 'repeat':
                    this.repeat = prop.value;
                    break;
                case 'delay':
                    this.delay = prop.value;
                    break;
                case 'return_to_origin':
                    this.returnToOrigin = prop.value;
                    break;
            }
        });
    }
    
    private createDebugVisualization() {
        // Create a semi-transparent rectangle to show trigger area
        this.debugGraphics = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            0xff0000,
            0.2
        );
        this.debugGraphics.setStrokeStyle(2, 0xff0000, 0.5);
    }
    
    activate(_player: Player) {
        // Check if already triggered and not repeatable
        if (this.triggered && !this.repeat) {
            return;
        }
        
        // Early check if target still exists before triggering
        if (this.targetUUID) {
            const targetObj = GameObjectManager.getInstance().getObjectByUUID(this.targetUUID);
            if (!targetObj || !targetObj.object || !targetObj.object.active) {
                console.warn(`Cannot activate trigger: target object ${this.targetUUID} is not available`);
                return;
            }
        }
        
        this.triggered = true;
        
        // Apply delay if specified
        if (this.delay > 0) {
            this.scene.time.delayedCall(this.delay, () => {
                this.executeTriggerEvent();
            });
        } else {
            this.executeTriggerEvent();
        }
        
        // Visual feedback for trigger activation
        if (this.debugGraphics) {
            this.scene.tweens.add({
                targets: this.debugGraphics,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }
    
    private executeTriggerEvent() {
        if (!this.targetUUID) {
            console.warn('Trigger has no target UUID');
            return;
        }
        
        const targetObj = GameObjectManager.getInstance().getObjectByUUID(this.targetUUID);
        if (!targetObj) {
            console.warn(`Target object with UUID ${this.targetUUID} not found`);
            return;
        }
        
        // Check if the object is still active and not destroyed
        if (!targetObj.object || !targetObj.object.active) {
            console.warn(`Target object with UUID ${this.targetUUID} has been destroyed or is inactive`);
            // Reset trigger state if repeatable
            if (this.repeat) {
                this.triggered = false;
            }
            return;
        }
        
        switch (this.eventType) {
            case 'move':
                this.executeMoveEvent(targetObj.object);
                break;
            case 'scale':
                this.executeScaleEvent(targetObj.object);
                break;
            default:
                console.warn(`Unknown event type: ${this.eventType}`);
        }
    }
    
    private executeMoveEvent(target: Phaser.GameObjects.GameObject) {
        // Safety check: ensure target still exists and is active
        if (!target || !target.active) {
            console.warn('Target object no longer exists or is inactive');
            if (this.repeat) {
                this.triggered = false;
            }
            return;
        }
        
        const physicsTarget = target as any;
        if (!physicsTarget.body) {
            console.warn('Target object has no physics body for movement');
            return;
        }
        
        // Check if it's a static body
        const isStatic = physicsTarget.body.immovable && !physicsTarget.body.moves;
        
        if (isStatic) {
            // For static bodies, animate position change
            const originalX = physicsTarget.x;
            const originalY = physicsTarget.y;
            
            // Calculate target position based on velocity and duration
            // Distance = Velocity * Time
            const moveX = this.velocityX * (this.duration / 1000);
            const moveY = this.velocityY * (this.duration / 1000);
            
            // Animate to new position
            this.scene.tweens.add({
                targets: physicsTarget,
                x: originalX + moveX,
                y: originalY + moveY,
                duration: this.duration,
                ease: 'Power2.InOut',
                onUpdate: () => {
                    // Check if target still exists before updating
                    if (!physicsTarget || !physicsTarget.active) {
                        this.scene.tweens.killTweensOf(physicsTarget);
                        return;
                    }
                    // Update static body position
                    if (physicsTarget.body && physicsTarget.body.updateFromGameObject) {
                        physicsTarget.body.updateFromGameObject();
                    }
                },
                onComplete: () => {
                    // Check if target still exists before returning to origin
                    if (!physicsTarget || !physicsTarget.active) {
                        if (this.repeat) {
                            this.triggered = false;
                        }
                        return;
                    }
                    
                    if (this.returnToOrigin) {
                        // Return to original position
                        this.scene.tweens.add({
                            targets: physicsTarget,
                            x: originalX,
                            y: originalY,
                            duration: this.duration,
                            ease: 'Power2.InOut',
                            onUpdate: () => {
                                // Check if target still exists during return animation
                                if (!physicsTarget || !physicsTarget.active) {
                                    this.scene.tweens.killTweensOf(physicsTarget);
                                    return;
                                }
                                if (physicsTarget.body && physicsTarget.body.updateFromGameObject) {
                                    physicsTarget.body.updateFromGameObject();
                                }
                            },
                            onComplete: () => {
                                // Reset triggered state if repeatable
                                if (this.repeat) {
                                    this.triggered = false;
                                }
                            }
                        });
                    } else {
                        // Don't return, just reset triggered state if repeatable
                        if (this.repeat) {
                            // Wait for a bit before allowing re-trigger
                            this.scene.time.delayedCall(1000, () => {
                                this.triggered = false;
                            });
                        }
                    }
                }
            });
        } else {
            // For dynamic bodies, use velocity
            if (!this.originalVelocity) {
                this.originalVelocity = new Phaser.Math.Vector2(
                    physicsTarget.body.velocity.x,
                    physicsTarget.body.velocity.y
                );
            }
            
            physicsTarget.setVelocity(this.velocityX, this.velocityY);
            
            this.scene.time.delayedCall(this.duration, () => {
                // Check if target still exists before resetting velocity
                if (!physicsTarget || !physicsTarget.active) {
                    if (this.repeat) {
                        this.triggered = false;
                    }
                    return;
                }
                
                if (this.originalVelocity && physicsTarget.setVelocity) {
                    physicsTarget.setVelocity(this.originalVelocity.x, this.originalVelocity.y);
                }
                
                if (this.repeat) {
                    this.triggered = false;
                }
            });
        }
    }
    
    private executeScaleEvent(target: Phaser.GameObjects.GameObject) {
        // Safety check: ensure target still exists and is active
        if (!target || !target.active) {
            console.warn('Target object no longer exists or is inactive');
            if (this.repeat) {
                this.triggered = false;
            }
            return;
        }
        
        const scaleTarget = target as any;
        
        // Store original scale if this is the first time
        if (!this.originalScale) {
            this.originalScale = new Phaser.Math.Vector2(
                scaleTarget.scaleX,
                scaleTarget.scaleY
            );
        }
        
        // Animate scale change
        this.scene.tweens.add({
            targets: target,
            scaleX: this.targetScaleX,
            scaleY: this.targetScaleY,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // Keep the new scale for the specified duration
                this.scene.time.delayedCall(this.duration, () => {
                    // Check if target still exists before animating back
                    if (!target || !target.active) {
                        if (this.repeat) {
                            this.triggered = false;
                        }
                        return;
                    }
                    
                    // Animate back to original scale
                    this.scene.tweens.add({
                        targets: target,
                        scaleX: this.originalScale!.x,
                        scaleY: this.originalScale!.y,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            // Reset triggered state if repeatable
                            if (this.repeat) {
                                this.triggered = false;
                            }
                        }
                    });
                });
            }
        });
    }
    
    reset() {
        this.triggered = false;
        this.originalVelocity = undefined;
        this.originalScale = undefined;
    }
    
    isTriggered(): boolean {
        return this.triggered;
    }
    
    destroy() {
        if (this.debugGraphics) {
            this.debugGraphics.destroy();
        }
        super.destroy();
    }
}