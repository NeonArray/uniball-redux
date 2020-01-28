import 'phaser';
import {OrbColor} from '../types';
import Text = Phaser.GameObjects.Text;
import {Constants} from '../constants';

export default class Orb extends Phaser.Physics.Arcade.Sprite {
    readonly color: OrbColor;
    readonly maxVelocity: number = 150;
    readonly scaledSize: number = 0.65;
    private currentScene: Phaser.Scene;
    private label: Text;
    private debug: boolean = false;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        this.color = params.color;

        this.currentScene = params.scene;
        this.initSprite();
        this.currentScene.add.existing(this);

        if (this.debug) {
            this.label = this.currentScene.add.text(this.x, this.y, this.color);
        }
    }

    update(): void {
        if (this.debug) {
            this.label.x = this.x;
            this.label.y = this.y;
        }
    }

    private initSprite(): void {
        this.currentScene.physics.world.enable(this);

        this.currentScene.add
            .sprite(this.x, this.y, Constants.SHEET_KEY)
            .play('pop')
            .on('animationcomplete', function () {
                this.destroy();
            });

        this.setScale(this.scaledSize, this.scaledSize);
        this.body.setCircle(16, 0, 0);
        this.setMaxVelocity(this.maxVelocity, this.maxVelocity);

        this.setCollideWorldBounds(true);
        this.registerAnimations();

        if (this.color === OrbColor.wild) {
            this.anims.play('cycleColors');
        }
    }

    private registerAnimations(): void {
        if (typeof this.currentScene.anims.get('cycleColors') !== 'undefined') {
            return;
        }

        this.currentScene.anims.create({
            key: 'cycleColors',
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 3,
                prefix: 'Uniball-Redux/Objects/Orbs/',
                suffix: '.png',
            }),
            frameRate: 1,
            repeat: -1,
        });
    }
}