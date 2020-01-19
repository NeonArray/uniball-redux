import 'phaser';


class Orb extends Phaser.GameObjects.Sprite implements Component {
    color: OrbColor;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
    }

    create() {

    }

    preload() {

    }

    update() {

    private registerAnimations(): void {
        if (typeof this.currentScene.anims.get('cycleColors') !== 'undefined') {
            return;
        }

        this.currentScene.anims.create({
            key: 'cycleColors',
            frames: this.currentScene.anims.generateFrameNames('s_orbs', {
                start: 0, end: 3,
                prefix: 'orbs-',
                suffix: '.png',
            }),
            frameRate: 1,
            repeat: -1,
        });
    }
}