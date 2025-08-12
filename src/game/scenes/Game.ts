import { Scene } from 'phaser';
import { Player } from '../sprites/Player';
import { StaticHazard } from '../sprites/StaticHazard';
import { Goal } from '../sprites/Goal';
import { HealthUI } from '../ui/HealthUI';

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
    restartKey: Phaser.Input.Keyboard.Key;
    isVictory: boolean = false;
    healthUI: HealthUI;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
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

        // 创建碰撞事件.
        this.createOverleapEvents();
        
        // 设置重启快捷键 (R键)
        this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        // 创建血量UI
        this.healthUI = new HealthUI(this, 50, 50);
        if (this.player) {
            this.healthUI.updateHealth(this.player.getHealth());
        }
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

    private createOverleapEvents() {
        // 设置玩家与hazards的overlap检测
        if (this.player && this.hazards) {
            this.physics.add.overlap(
                this.player, 
                this.hazards, 
                this.handlePlayerHazardCollision, 
                undefined, 
                this
            );
        }
        
        // 设置玩家与goals的overlap检测
        if (this.player && this.goals) {
            this.physics.add.overlap(
                this.player,
                this.goals,
                this.handlePlayerGoalCollision,
                undefined,
                this
            );
        }
    }

    private handlePlayerHazardCollision(player: any, hazard: any) {
        const hazardInstance = hazard as StaticHazard;
        const playerInstance = player as Player;
        
        playerInstance.takeDamage(hazardInstance.getDamage());
        
        // 更新血量UI
        if (this.healthUI) {
            this.healthUI.updateHealth(playerInstance.getHealth());
        }
    }
    
    private handlePlayerGoalCollision(player: any, goal: any) {
        if (this.isVictory) return;
        
        const goalInstance = goal as Goal;
        if (goalInstance.isCollected()) return;
        
        goalInstance.collect();
        this.isVictory = true;
        
        this.time.delayedCall(1000, () => {
            this.victory();
        });
    }

    update() {
        if (this.player) {
            this.player.update();
        }
        
        // 检查重启键
        if (this.restartKey && Phaser.Input.Keyboard.JustDown(this.restartKey)) {
            this.restartGame();
        }
    }
    
    restartGame() {
        // 暂停物理世界
        this.physics.world.pause();
        
        // 淡出效果
        this.cameras.main.fadeOut(250, 0, 0, 0);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // 启动GameOver场景
            this.scene.start('GameOver');
            // 彻底移除并销毁Game场景
            this.scene.remove('Game');
        });
    }
    
    victory() {
        // 暂停物理世界
        this.physics.world.pause();
        
        // 淡出效果
        this.cameras.main.fadeOut(500, 255, 255, 255);
        
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            // 启动Victory场景
            this.scene.start('Victory');
            // 彻底移除并销毁Game场景
            this.scene.remove('Game');
        });
    }
}
