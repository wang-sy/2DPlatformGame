import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { StaticHazard } from '../sprites/StaticHazard';
import { Goal } from '../sprites/Goal';
import { Collectible } from '../sprites/Collectible';
import { HealthUI } from '../ui/HealthUI';
import { CollectedItemsManager } from '../managers/CollectedItemsManager';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    tilesets: Phaser.Tilemaps.Tileset[];
    layers: Phaser.Tilemaps.TilemapLayer[];
    player: Player;
    hazards: Phaser.Physics.Arcade.StaticGroup;
    goals: Phaser.Physics.Arcade.StaticGroup;
    collectibles: Phaser.Physics.Arcade.StaticGroup;
    restartKey: Phaser.Input.Keyboard.Key;
    isVictory: boolean = false;
    healthUI: HealthUI;
    scoreText: Phaser.GameObjects.Text;
    collectedItemsManager: CollectedItemsManager;

    constructor ()
    {
        super('Game');
        this.collectedItemsManager = new CollectedItemsManager();
    }

    create ()
    {
        // Reset collected items manager for new game
        this.collectedItemsManager.reset();
        
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x87CEEB);

        // Create the tilemap
        this.map = this.make.tilemap({ key: 'tilemap' });

        // Load tilesets from tilemap config.
        this.tilesets = [];
        this.map.tilesets.forEach((tileset: Phaser.Tilemaps.Tileset) => {
            let addedTileset = this.map.addTilesetImage(tileset.name, tileset.name);
            if (addedTileset) {
                this.tilesets.push(addedTileset);
            }
        });

        // find tilemap layer.
        this.layers = [];
        this.map.getTileLayerNames().forEach((tileLayerName: string) => {
            const layer = this.map.createLayer(tileLayerName, this.tilesets, 0, 0);
            if (layer) {
                this.layers.push(layer);
                layer.setCollisionByProperty({ collision: true });
            }
        })

        this.createObjectsFromTilemap()

        // Create collision events
        this.createOverleapEvents();
        
        // Setup restart key (R key)
        this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // Create health UI
        this.healthUI = new HealthUI(this, 50, 50);
        if (this.player) {
            this.healthUI.updateHealth(this.player.getHealth());
        }
        
        // Create score UI
        this.scoreText = this.add.text(50, 100, 'Score: 0', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000);
    }

    private createObjectsFromTilemap() {
        this.map.getObjectLayerNames().forEach(((objectLayerName: string) => {
            let objectLayer = this.map.getObjectLayer(objectLayerName);

            objectLayer?.objects.forEach((obj: Phaser.Types.Tilemaps.TiledObject) => {
                this.createObject(obj)
            })
        }))
    }

    private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
        switch (obj.type) {
            case "player":
                this.createPlayerFromTilemap(obj);
                return
            case "hazard":
                this.createHazardFromTilemap(obj);
                return
            case "goal":
                this.createGoalFromTilemap(obj);
                return
            case "collectible":
                this.createCollectibleFromTilemap(obj);
                return
            default:
                console.log("unknown object type", obj.type);
        }
    }

    private createPlayerFromTilemap(playerObject: Phaser.Types.Tilemaps.TiledObject) {
        // if player is already created, then skip.
        if (this.player) {
            return;
        }
        // Create player
        this.player = new Player(this, playerObject);

        // Set up collisions between player and tilemap layers
        this.layers.forEach(layer => {
            this.physics.add.collider(this.player, layer);
        });

        // Set camera bounds to match the tilemap
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Make camera follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setLerp(0.1, 0.1);

        // Set world bounds for physics
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    private createHazardFromTilemap(hazardObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!this.hazards) {
            this.hazards = this.physics.add.staticGroup();
        }
        
        const hazard = new StaticHazard(this, hazardObject);
        this.hazards.add(hazard);
    }
    
    private createGoalFromTilemap(goalObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!this.goals) {
            this.goals = this.physics.add.staticGroup();
        }
        
        const goal = new Goal(this, goalObject);
        this.goals.add(goal);
    }
    
    private createCollectibleFromTilemap(collectibleObject: Phaser.Types.Tilemaps.TiledObject) {
        if (!this.collectibles) {
            this.collectibles = this.physics.add.staticGroup();
        }
        
        const collectible = new Collectible(this, collectibleObject);
        this.collectibles.add(collectible);
        
        // Track must-collect items
        if (collectible.isMustCollect()) {
            this.collectedItemsManager.addMustCollectItem(collectible.getName());
        }
    }

    private createOverleapEvents() {
        // Setup player vs hazards overlap detection
        if (this.player && this.hazards) {
            this.physics.add.overlap(
                this.player, 
                this.hazards, 
                this.handlePlayerHazardCollision, 
                undefined, 
                this
            );
        }
        
        // Setup player vs goals overlap detection
        if (this.player && this.goals) {
            this.physics.add.overlap(
                this.player,
                this.goals,
                this.handlePlayerGoalCollision,
                undefined,
                this
            );
        }
        
        // Setup player vs collectibles overlap detection
        if (this.player && this.collectibles) {
            this.physics.add.overlap(
                this.player,
                this.collectibles,
                this.handlePlayerCollectibleCollision,
                undefined,
                this
            );
        }
    }

    private handlePlayerHazardCollision(player: any, hazard: any) {
        const hazardInstance = hazard as StaticHazard;
        const playerInstance = player as Player;
        
        playerInstance.takeDamage(hazardInstance.getDamage());
        
        // Update health UI
        if (this.healthUI) {
            this.healthUI.updateHealth(playerInstance.getHealth());
        }
    }
    
    private handlePlayerGoalCollision(_player: any, goal: any) {
        if (this.isVictory) return;
        
        const goalInstance = goal as Goal;
        if (goalInstance.isCollected()) return;
        
        // Check if all must-collect items have been collected
        if (!this.collectedItemsManager.hasCollectedAllRequired()) {
            const missingItems = this.collectedItemsManager.getMissingRequiredItems();
            if (missingItems.length > 0) {
                // Show missing items with images
                this.showMissingItemsVisual(missingItems);
                return;
            }
        }
        
        goalInstance.collect();
        this.isVictory = true;
        
        // Pass collected items data to Victory scene
        this.time.delayedCall(1000, () => {
            const summaryData = this.collectedItemsManager.getSummaryData();
            this.scene.start('Victory', summaryData);
            this.scene.remove('Game');
        });
    }
    
    private showMissingItemsVisual(missingItems: string[]) {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Display missing item images
        const itemSpacing = 100;
        const startX = centerX - (missingItems.length - 1) * itemSpacing / 2;
        
        missingItems.forEach((item, index) => {
            const itemX = startX + index * itemSpacing;
            const itemY = centerY - 80;
            
            // Create glow effect behind item
            const glowCircle = this.add.circle(itemX, itemY, 45, 0xffff00, 0.3);
            glowCircle.setScrollFactor(0);
            glowCircle.setDepth(999);
            
            // Animate glow pulsing
            this.tweens.add({
                targets: glowCircle,
                scale: { from: 1, to: 1.5 },
                alpha: { from: 0.3, to: 0.1 },
                duration: 800,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut'
            });
            
            // Create item silhouette/shadow first
            const itemShadow = this.add.image(itemX, itemY, item);
            itemShadow.setScale(1.8);
            itemShadow.setScrollFactor(0);
            itemShadow.setDepth(1000);
            itemShadow.setTint(0x000000);
            itemShadow.setAlpha(0.3);
            
            // Create the actual item image
            const itemImage = this.add.image(itemX, itemY, item);
            itemImage.setScale(0);
            itemImage.setScrollFactor(0);
            itemImage.setDepth(1001);
            
            // Add red tint to indicate it's missing
            itemImage.setTint(0xff6666);
            
            // Create "!" exclamation mark above item
            const exclamation = this.add.text(itemX, itemY - 60, '!', {
                fontSize: '48px',
                color: '#ff0000',
                fontFamily: 'Arial Black',
                stroke: '#ffffff',
                strokeThickness: 4
            });
            exclamation.setOrigin(0.5);
            exclamation.setScrollFactor(0);
            exclamation.setDepth(1002);
            exclamation.setScale(0);
            
            // Animate item appearance with bounce
            this.tweens.add({
                targets: itemImage,
                scale: 1.5,
                duration: 400,
                ease: 'Back.easeOut',
                delay: index * 100
            });
            
            // Animate exclamation mark
            this.tweens.add({
                targets: exclamation,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut',
                delay: index * 100 + 200
            });
            
            // Add shake animation to item
            this.tweens.add({
                targets: itemImage,
                x: itemX + 5,
                duration: 100,
                yoyo: true,
                repeat: 10,
                ease: 'Linear',
                delay: index * 100 + 400
            });
            
            // Create particle effects around the item
            for (let j = 0; j < 8; j++) {
                this.time.delayedCall(index * 100 + j * 50, () => {
                    const angle = (j / 8) * Math.PI * 2;
                    const particleX = itemX + Math.cos(angle) * 30;
                    const particleY = itemY + Math.sin(angle) * 30;
                    
                    const particle = this.add.circle(particleX, particleY, 3, 0xff0000);
                    particle.setScrollFactor(0);
                    particle.setDepth(998);
                    
                    this.tweens.add({
                        targets: particle,
                        x: itemX + Math.cos(angle) * 60,
                        y: itemY + Math.sin(angle) * 60,
                        alpha: { from: 1, to: 0 },
                        scale: { from: 1, to: 0 },
                        duration: 600,
                        ease: 'Power2',
                        onComplete: () => {
                            particle.destroy();
                        }
                    });
                });
            }
            
            // Fade out and destroy after delay
            this.time.delayedCall(2800, () => {
                this.tweens.add({
                    targets: [itemImage, itemShadow, exclamation, glowCircle],
                    alpha: 0,
                    scale: 0,
                    duration: 400,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        itemImage.destroy();
                        itemShadow.destroy();
                        exclamation.destroy();
                        glowCircle.destroy();
                    }
                });
            });
        });
        
        // Screen flash effect
        const flash = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0xff0000, 0);
        flash.setScrollFactor(0);
        flash.setDepth(990);
        
        this.tweens.add({
            targets: flash,
            alpha: 0.2,
            duration: 150,
            ease: 'Power2',
            yoyo: true,
            onComplete: () => {
                flash.destroy();
            }
        });
    }
    
    private handlePlayerCollectibleCollision(_player: any, collectible: any) {
        const collectibleInstance = collectible as Collectible;
        if (collectibleInstance.isCollected()) return;
        
        collectibleInstance.collect();
        
        // Use the type from the collectible (configured in tilemap)
        const itemName = collectibleInstance.getName();
        const itemType = collectibleInstance.getType();
        
        // Collect the item
        this.collectedItemsManager.collectItem(
            itemName,
            itemType,
            collectibleInstance.getScore(),
            collectibleInstance.isMustCollect(),
            collectibleInstance.getProperties()
        );
        
        // Update score display
        this.updateScoreDisplay();
    }
    
    private updateScoreDisplay() {
        if (this.scoreText) {
            const score = this.collectedItemsManager.getTotalScore();
            this.scoreText.setText(`Score: ${score}`);
            
            // Score pop animation
            this.tweens.add({
                targets: this.scoreText,
                scale: 1.2,
                duration: 100,
                yoyo: true,
                ease: 'Power2'
            });
        }
    }

    update() {
        if (this.player) {
            this.player.update();
        }
        
        // Check restart key
        if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.restartGame();
        }
    }
    
    restartGame() {
        // Pause physics world
        this.physics.world.pause();
        
        // Fade out effect
        this.cameras.main.fadeOut(250, 0, 0, 0);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // Start GameOver scene
            this.scene.start('GameOver');
            // Completely remove and destroy Game scene
            this.scene.remove('Game');
        });
    }
    
    victory() {
        // Pause physics world
        this.physics.world.pause();
        
        // Fade out effect
        this.cameras.main.fadeOut(500, 255, 255, 255);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // Start Victory scene with collected items data
            const summaryData = this.collectedItemsManager.getSummaryData();
            this.scene.start('Victory', summaryData);
            // Completely remove and destroy Game scene
            this.scene.remove('Game');
        });
    }
}
