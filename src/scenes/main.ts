import "phaser";
import Player from "../components/player";
import {EventNames, OrbColor, Registry} from "../types";
import Orb from "../components/orb";
import {Constants} from "../constants";
import orb from "../components/orb";

export default class MainScene extends Phaser.Scene {
    private player: Player;
    private currentColor: OrbColor = OrbColor.red;
    private groups;

    constructor() {
        super("MainScene");
    }

    public preload(): void {
        this.registry.set("currentOrbColor", OrbColor.red);

        this.load.image("stamina", "player/stamina.png");
        this.load.multiatlas(Constants.SHEET_KEY, "uniball-redux.json");

        for (const orbColorKey in OrbColor) {

            if (!OrbColor.hasOwnProperty(orbColorKey) || orbColorKey === OrbColor.wild) {
                continue;
            }

            this.load.multiatlas(
                `s_peggie_${OrbColor[orbColorKey]}`,
                `player/peggie-${OrbColor[orbColorKey]}.json`,
                "player"
            );
        }
    }

    public create(): void {

        this.groups = {
            platforms: this.physics.add.staticGroup(),
            fx: this.add.group(),
        };

        ///// ============== PLAYER =================
        this.player = new Player({
            scene: this,
            x: this.game.canvas.width / 2,
            y: this.game.canvas.height - 65,
            key: `s_peggie_${this.currentColor}`,
            frame: "Idle/1.png",
        });

        ///// ============== PLATFORMS =================
        const ground: Phaser.GameObjects.TileSprite = this.add.tileSprite(
            0,
            this.game.canvas.height - 16,
            this.game.canvas.width * 2,
            32,
            Constants.SHEET_KEY,
            "Uniball-Redux/Env/grass.png"
        );
        this.groups.platforms.add(ground);

        ///// ============== ORBS =================

        const orbGroupConfig: object = {
            bounceY: 1,
            bounceX: 1,
            collideWorldBounds: true,
            allowGravity: false,
            velocityX: Phaser.Math.Between(Constants.O_MIN_SPEED, Constants.O_MAX_SPEED),
            velocityY: Phaser.Math.Between(Constants.O_MIN_SPEED, Constants.O_MAX_SPEED),
        };

        this.groups.orbs = {
            red: this.physics.add.group(orbGroupConfig),
            blue: this.physics.add.group(orbGroupConfig),
            green: this.physics.add.group(orbGroupConfig),
            purple: this.physics.add.group(orbGroupConfig),
            wild: this.physics.add.group(orbGroupConfig),
        };

        const colorArray: string [] = Object.keys(OrbColor);

        colorArray.forEach((orbColorsKey: string, i: integer) => {
            const _orb: Orb = new Orb({
                scene: this,
                x: Phaser.Math.Between(50, this.game.canvas.width - 20),
                y: Phaser.Math.Between(50, this.game.canvas.height - 100),
                key: Constants.SHEET_KEY,
                frame: `Uniball-Redux/Objects/Orbs/${i}.png`,
                color: OrbColor[orbColorsKey],
            });

            this.groups.orbs[orbColorsKey].add(_orb);
        });


        ///// ============== STAMINA =================
        this.anims.create({
            key: "stamina",
            frames: this.anims.generateFrameNames("s_hud", {
                start: 1, end: 11,
                suffix: ".png",
            }),
            frameRate: 0,
            repeat: 0,
        });

        this.anims.create({
            key: "smoke",
            frames: this.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 7,
                prefix: "Uniball-Redux/Effects/Smoke/",
                suffix: ".png",
            }),
            frameRate: 20,
            repeat: 0,
        });

        ///// ============== COLLIDERS =================
        this.physics.add.collider([
            this.player,
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ], this.groups.platforms);

        this.physics.add.collider([
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ], [
            this.groups.orbs.red,
            this.groups.orbs.blue,
            this.groups.orbs.green,
            this.groups.orbs.purple,
            this.groups.orbs.wild,
        ]);

        this.physics.add.collider(
            this.player,
            [
                this.groups.orbs.red,
                this.groups.orbs.blue,
                this.groups.orbs.green,
                this.groups.orbs.purple
            ],
            this.onOrbCollisionWithPlayer,
            null,
            this,
        );

        this.physics.add.collider(
            this.player,
            [
                this.groups.orbs.red,
                this.groups.orbs.blue,
                this.groups.orbs.green,
                this.groups.orbs.purple
            ],
            this.onWildOrbCollisionWithPlayer,
            null,
            this,
        );

        this.physics.add.collider(
            this.player,
            this.groups.orbs.wild,
            this.onWildOrbCollisionWithPlayer,
            null,
            this,
        );
    }

    public update(time: number): void {
        this.player.update(time);

        // this.checkWinCondition();

        // this.groups.orbs.red.getChildren().forEach(orb => orb.update());
        // this.groups.orbs.purple.getChildren().forEach(orb => orb.update());
        // this.groups.orbs.green.getChildren().forEach(orb => orb.update());
        // this.groups.orbs.blue.getChildren().forEach(orb => orb.update());
    }

    private checkWinCondition(): void {
        if (
            this.groups.orbs.red.getChildren().length === 0
            && this.groups.orbs.green.getChildren().length === 0
            && this.groups.orbs.purple.getChildren().length === 0
            && this.groups.orbs.blue.getChildren().length === 0
        ) {
            this.groups.orbs.wild.destroy(true);
            this.player.disableBody();
            this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, "You done did the thing.", {
                font: "24px Arial",
                fill: "#fff",
            }).setOrigin(0.5, 0.5);
        }
    }

    private onWildOrbCollisionWithPlayer(player: Player, orb: Orb): void {
        /*
         I subtract one from the index because the frames generated for the animation don't seem to be zeroth based.
        */
        let index: number;
        const colors: string[] = ["red", "green", "purple", "blue"];

        try {
            index = orb.anims.currentFrame.index - 1;
        } catch (exception) {
            index = 1;
        }

        this.currentColor = OrbColor[colors[index]];
        this.registry.set(Registry.CurrentColor, this.currentColor);

        orb.destroy();

        this.add
            .sprite(
                this.player.x,
                this.player.y,
                Constants.SHEET_KEY,
                "Uniball-Redux/Effects/Smoke/0.png",
            )
            .setScale(2, 2)
            .play("smoke")
            .on("animationcomplete", function (): void {
                this.destroy();
            });

        player.setTexture(`s_peggie_${this.currentColor}`);

        this.createNextWildOrb();

        this.events.emit(EventNames.ColorChange, this.currentColor);
    }

    private multiplyAnOrb(orb: Orb): void {
        if (this.groups.orbs[orb.color].children.entries.length > 150) {
            return;
        }

        const key: string[] = Object.keys(OrbColor);

        const _orb: Orb = new Orb({
            scene: this,
            x: Phaser.Math.Between(50, this.game.canvas.width - 20),
            y: Phaser.Math.Between(50, this.game.canvas.height - 100),
            key: Constants.SHEET_KEY,
            frame: `Uniball-Redux/Objects/Orbs/${key.indexOf(orb.color)}.png`,
            color: orb.color,
        });
        const _orb2: Orb = new Orb({
            scene: this,
            x: Phaser.Math.Between(50, this.game.canvas.width - 20),
            y: Phaser.Math.Between(50, this.game.canvas.height - 100),
            key: Constants.SHEET_KEY,
            frame: `Uniball-Redux/Objects/Orbs/${key.indexOf(orb.color)}.png`,
            color: orb.color,
        });

        this.groups.orbs[orb.color].add(_orb);
        this.groups.orbs[orb.color].add(_orb2);
    }

    private onOrbCollisionWithPlayer(player: Player, orb: Orb): void {

        if (this.currentColor === orb.color) {
            const score: integer = this.registry.get(Registry.Score) + 1;
            this.registry.set(Registry.Score, score);
            this.events.emit(EventNames.ScoreIncrease, score);

            // this.add
            //     .sprite(
            //         orb.x,
            //         orb.y,
            //         Constants.SHEET_KEY,
            //         "Uniball-Redux/Effects/Collected/0.png",
            //     )
            //     .play("collected")
            //     .on("animationcomplete", function ():void {
            //         this.destroy();
            //     });
        } else {
            this.multiplyAnOrb(orb);

            this.add
                .sprite(
                    orb.x,
                    orb.y,
                    Constants.SHEET_KEY,
                    "Uniball-Redux/Effects/Bomb/0.png",
                )
                .play("explode")
                .on("animationcomplete", function (): void {
                    this.destroy();
                });

            // this.events.emit(EventNames.PlayerHit);
        }

        orb.destroy();
    }

    private createNextWildOrb(): void {
        if (this.groups.orbs.wild.countActive() > 1) {
            return;
        }

        const secondsToWait: number = Phaser.Math.Between(1, 5) * 1000;

        this.time.delayedCall(secondsToWait, () => {
            const orb: Orb = new Orb({
                scene: this,
                x: Phaser.Math.Between(50, 300),
                y: Phaser.Math.Between(50, 300),
                key: Constants.SHEET_KEY,
                frame: "Uniball-Redux/Objects/Orbs/1.png",
                color: OrbColor.wild,
            });
            this.groups.orbs.wild.add(orb);
            orb.anims.play("cycleColors");
        }, [], this);
    }
}
