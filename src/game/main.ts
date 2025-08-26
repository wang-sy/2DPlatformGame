import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
// import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { Victory } from './scenes/Victory';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { BGMPlayer } from './managers/BGMPlayer';
import { MobileOptimization } from './utils/MobileOptimization';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig

const optimalRes = MobileOptimization.getOptimalResolution();
const pixelRatio = MobileOptimization.getPixelRatio();

const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: optimalRes.width,
    height: optimalRes.height,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: optimalRes.width,
        height: optimalRes.height,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 1920,
            height: 1440
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        GameOver,
        Victory
    ],
    physics: {
        default: "arcade",
        arcade: {
            gravity: {x: 0, y: 600},
            debug: false
        }
    },
    input: {
        activePointers: 3,
        touch: {
            target: null,
            capture: true
        }
    },
    render: {
        pixelArt: false,
        antialias: !MobileOptimization.isMobile(),
        antialiasGL: !MobileOptimization.isMobile(),
        mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
        powerPreference: MobileOptimization.isMobile() ? 'low-power' : 'high-performance',
        batchSize: MobileOptimization.isMobile() ? 512 : 2048,
        maxTextures: MobileOptimization.isMobile() ? 8 : -1,
        resolution: pixelRatio
    },
    fps: {
        target: MobileOptimization.isMobile() ? 30 : 60,
        forceSetTimeOut: MobileOptimization.isMobile()
    },
    disableContextMenu: true
};

const StartGame = (parent: string) => {
    MobileOptimization.preventDefaultTouchBehaviors();
    
    const game = new Game({ ...config, parent });
    
    // Initialize BGMPlayer with the game instance
    BGMPlayer.getInstance().initialize(game);
    
    // Mobile optimizations
    if (MobileOptimization.isMobile()) {
        MobileOptimization.enableWakeLock();
        
        // Request fullscreen on first interaction
        document.addEventListener('touchstart', () => {
            const gameContainer = document.getElementById('game-container');
            if (gameContainer && document.fullscreenElement === null) {
                MobileOptimization.requestFullscreen(gameContainer);
            }
        }, { once: true });
    }
    
    return game;
}

export default StartGame;
