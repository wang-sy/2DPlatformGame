import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    map: Phaser.Tilemaps.Tilemap;
    tilesets: Phaser.Tilemaps.Tileset[];
    layers: Phaser.Tilemaps.TilemapLayer[];

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
            this.map.createLayer(tileLayerName, this.tilesets, 0, 0);
        })

        // Set camera bounds to match the tilemap
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Optional: Center the camera on the tilemap
        this.cameras.main.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);

        this.input.once('pointerdown', () => {

            this.scene.start('GameOver');

        });
    }
}
