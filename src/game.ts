import 'phaser';
import scenes from './scenes/scenes';

const config: Phaser.Types.Core.GameConfig = {
    title: 'Uniball Redux',
    version: '0.0.1.0',
    type: Phaser.AUTO,
    backgroundColor: '#203f3e',
    width: 800,
    height: 400,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: true,
        },
    },
    scene: scenes,
};

const game = new Phaser.Game(config);
