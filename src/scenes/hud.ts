import 'phaser';
import {EventNames} from "../types";

export default class HUD extends Phaser.Scene {
    private staminaGauge: integer = 7;

    constructor() {
        super({
           key: 'HUD',
           active: true,
        });
    }

    preload(): void {
        // const a = this.cache.json.get('s_objects');
        //
        // this.load.multiatlas('s_hud', 'objects/objects.json', 'objects');
    }

    create(): void {
        // this.anims.create({
        //     key: 'stamina',
        //     frames: this.anims.generateFrameNames('s_hud', {
        //         start: 1, end: 11,
        //         suffix: '.png',
        //     }),
        //     frameRate: 0,
        //     repeat: 0,
        // });
        //
        // const bar = this.add.sprite(100, this.game.canvas.height - 10, 's_hud', 'BombBar/4.png');
        // bar.setScale(4,4);
        //
        // this.scene.get('MainScene').events.on(EventNames.RegeneratingStamina, (amount) => {
        //     bar.setFrame(`BombBar/${amount}.png`);
        // }, this);
    }

    update(): void {}
}