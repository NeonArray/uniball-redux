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

    }
}