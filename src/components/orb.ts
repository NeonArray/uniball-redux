import "phaser";
import {OrbColor} from "../types";
import Text = Phaser.GameObjects.Text;
import {Constants} from "../constants";

interface IOrbConstructor {
    x: integer;
    y: integer;
    scene: Phaser.Scene;
    key: any;
    frame?: string;
    color: OrbColor;
}

export default class Orb extends Phaser.Physics.Arcade.Sprite {
    readonly color: OrbColor;
    readonly scaledSize: number = 0.65;
    private currentScene: Phaser.Scene;
    private label: Text;
    private debug: boolean = false; // TODO: This should really be a global flag

    constructor(params: IOrbConstructor) {
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

        this.registerAnimations();

        this.currentScene.add
            .sprite(
                this.x,
                this.y,
                Constants.SHEET_KEY
            )
            .play("pop")
            .on("animationcomplete", function (): void {
                this.destroy();
            });

        this.setScale(this.scaledSize, this.scaledSize);
        this.body.setCircle(16, 0, 0);

        this.setMaxVelocity(Constants.O_MAX_SPEED, Constants.O_MAX_SPEED);

        this.setCollideWorldBounds(true);

        if (this.color === OrbColor.wild) {
            this.anims.play("cycleColors");
        }
    }

    private registerAnimations(): void {
        if (typeof this.currentScene.anims.get("cycleColors") !== "undefined") {
            return;
        }

        this.currentScene.anims.create({
            key: "cycleColors",
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 3,
                prefix: "Uniball-Redux/Objects/Orbs/",
                suffix: ".png",
            }),
            frameRate: 1,
            repeat: -1,
        });

        this.currentScene.anims.create({
            key: "pop",
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 9,
                prefix: "Uniball-Redux/Effects/Burst/",
                suffix: ".png",
            }),
            frameRate: 28,
            repeat: 0,
        });

        this.currentScene.anims.create({
            key: "collected",
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 10,
                prefix: "Uniball-Redux/Effects/Collected/",
                suffix: ".png",
            }),
            frameRate: 40,
            repeat: 0,
        });

        this.currentScene.anims.create({
            key: "explode",
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 7,
                prefix: "Uniball-Redux/Effects/Bomb/",
                suffix: ".png",
            }),
            frameRate: 22,
            repeat: 0,
        });
    }
}