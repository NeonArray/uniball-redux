import 'phaser';


class Orb extends Phaser.GameObjects.Sprite implements Component {
    color: OrbColor;
    readonly color: OrbColor;
    readonly maxVelocity: number = 150;
    readonly scaledSize: number = 0.65;
    private currentScene: Phaser.Scene;

    constructor(params) {
        super(params.scene, params.x, params.y, params.key, params.frame);
    }

    create() {

    }

    preload() {

    }

    update() {
    private initSprite(): void {
        this.currentScene.physics.world.enable(this);

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