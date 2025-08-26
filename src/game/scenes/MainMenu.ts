import { Scene, GameObjects } from 'phaser';
import { Game } from './Game';
import { eventBus, GameEvent } from '../events/EventBus';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.logo = this.add.image(512, 300, 'logo');

        this.title = this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        
        const startText = this.add.text(512, 550, 'Tap or Click to Start', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: startText,
            alpha: { from: 1, to: 0.5 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Emit scene start event
        eventBus.emit(GameEvent.SCENE_START, {
            scene: 'MainMenu'
        });

        this.input.once('pointerdown', () => {
            // Emit scene change event
            eventBus.emit(GameEvent.SCENE_CHANGE, {
                from: 'MainMenu',
                to: 'Game'
            });
            
            // Re-add and start a fresh Game scene
            this.scene.add('Game', Game, false);
            this.scene.start('Game');
        });
    }
}
