import { Scene } from 'phaser';
import { Player } from '../sprites/Player';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    tilesets: Phaser.Tilemaps.Tileset[];
    layers: Phaser.Tilemaps.TilemapLayer[];
    player: Player;

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

    update() {
        if (this.player) {
            this.player.update();
        }
    }
}
