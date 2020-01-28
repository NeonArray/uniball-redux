import "phaser";
import { Constants } from "../constants";
import { IConstructorParams, OrbColor, Registry, EventNames } from "../types";

interface IPlayerConstructorParams {
    scene: Phaser.Scene;
    x: integer;
    y: integer;
    key: string;
    frame?: string;
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private currentScene: Phaser.Scene;
    private inputKeys: Map<string, Phaser.Input.Keyboard.Key> = new Map();
    private isMoving: boolean = false;
    private isFalling: boolean = false;
    private lastTime: number;
    private staminaDelayTime: number;
    private stamina: integer = 4;
    private health: integer = 1;

    constructor(params: IPlayerConstructorParams) {
        super(params.scene, params.x, params.y, params.key, params.frame);

        this.currentScene = params.scene;
        this.initSprite();
        this.currentScene.add.existing(this);
    }

    public update(time: number): void {
        const color: OrbColor = this.currentScene.registry.get("currentOrbColor");

        if (this.health <= 0) {
            this.die(color);
            return;
        }

        if (this.inputKeys.get("LEFT").isDown) {
            this.setFlipX(true);
            this.setVelocityX(Constants.P_MOVE_SPEED * -1);

            if (this.body.touching.down) {
                this.anims.play(`run_${color}`, true);
                this.isMoving = true;

                this.createRunningParticles(time);
            }
        } else if (this.inputKeys.get("RIGHT").isDown) {
            this.setFlipX(false);
            this.setVelocityX(Constants.P_MOVE_SPEED);

            if (this.body.touching.down) {
                this.anims.play(`run_${color}`, true);
                this.isMoving = true;

                this.createRunningParticles(time);
            }
        } else {
            this.isMoving = false;
            this.setVelocityX(0);
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.inputKeys.get("UP"))
            && this.stamina > 0
        ) {
            this.anims.play(`jump_${color}`, true);
            this.createJumpingParticle();
            this.setVelocityY(Constants.P_JUMP_HEIGHT * -1);
            this.isMoving = true;
            this.reduceStamina();
        } else if (
            !this.body.touching.down
            && Phaser.Input.Keyboard.JustDown(this.inputKeys.get("DOWN"))
        ) {
            this.anims.play(`fall_${color}`);
            this.setVelocityY(Constants.P_SPIKE_SPEED);
            this.isMoving = true;
            this.isFalling = true;
        }

        if (this.isFalling && this.body.touching.down) {
            this.createFallingParticles();
            this.isFalling = false;
        }

        if (this.body.touching.down) {
            this.regenerateStamina(time);
        }

        if (!this.isMoving) {
            this.anims.play(`idle_${color}`, true);
        }
    }

    public getStamina(): integer {
        return this.stamina;
    }

    private hit(): void {
        this.anims.stop();
        const color: OrbColor = this.currentScene.registry.get(Registry.CurrentColor);
        this.anims.play(`hit_${color}`, false);
        this.reduceHealth();
    }

    private initSprite(): void {
        this.currentScene.physics.world.enable(this);
        this.registerAnimations();
        this.registerControls();

        this.body.setSize(35, 59);
        this.setCollideWorldBounds(true);

        this.registerObservers();
    }

    private registerObservers(): void {
        this.currentScene.events.on(EventNames.PlayerHit, this.hit, this);
    }

    private addKey(key: string): Phaser.Input.Keyboard.Key {
        return this.currentScene.input.keyboard.addKey(key);
    }

    private registerAnimations(): void {
        const keyString: string = "s_peggie_";

        for (let orbColorKey in OrbColor) {

            if (!OrbColor.hasOwnProperty(orbColorKey) || orbColorKey === OrbColor.wild) {
                continue;
            }

            this.currentScene.anims.create({
                key: `idle_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 34,
                    prefix: "Idle/", suffix: ".png"
                }),
                frameRate: 25,
                repeatDelay: 1500,
                repeat: -1,
            });
            this.currentScene.anims.create({
                key: `run_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 14,
                    prefix: "Run/", suffix: ".png"
                }),
                frameRate: 20,
                repeat: -1,
            });
            this.currentScene.anims.create({
                key: `jump_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 4,
                    prefix: "Attack/", suffix: ".png"
                }),
                frameRate: 8,
                repeat: 0,
            });
            this.currentScene.anims.create({
                key: `fall_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 2,
                    prefix: "Fall/", suffix: ".png"
                }),
                frameRate: 1,
                repeat: 0,
            });
            this.currentScene.anims.create({
                key: `hit_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 8,
                    prefix: "Hit/", suffix: ".png"
                }),
                frameRate: 16,
                repeat: 0,
            });
            this.currentScene.anims.create({
                key: `dead_${orbColorKey}`,
                frames: this.currentScene.anims.generateFrameNames(`${keyString}${orbColorKey}`, {
                    start: 1, end: 4,
                    prefix: "DeadGround/", suffix: ".png"
                }),
                frameRate: 4,
                repeat: 2,
            });
        }

        this.currentScene.anims.create({
            key: `p_run`,
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 1, end: 6,
                prefix: "Uniball-Redux/Effects/RunParticles/", suffix: ".png"
            }),
            frameRate: 12,
            repeat: 0,
        });
        this.currentScene.anims.create({
            key: `p_jump`,
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 5,
                prefix: "Uniball-Redux/Effects/JumpParticles/", suffix: ".png"
            }),
            frameRate: 12,
            repeat: 0,
        });
        this.currentScene.anims.create({
            key: `p_fall`,
            frames: this.currentScene.anims.generateFrameNames(Constants.SHEET_KEY, {
                start: 0, end: 6,
                prefix: "Uniball-Redux/Effects/FallParticles/", suffix: ".png"
            }),
            frameRate: 12,
            repeat: 0,
        });
    }

    private reduceStamina(): void {
        this.stamina = Phaser.Math.Clamp(this.stamina - 1, 0, Constants.P_MAX_STAMINA);
        this.currentScene.events.emit(EventNames.RegeneratingStamina, this.stamina);
    }

    private regenerateStamina(time: number): void {
        const delay: integer = 1000;

        return ((time: number) => {

            if (this.stamina === Constants.P_MAX_STAMINA) {
                this.currentScene.events.emit(EventNames.StaminaMaxed);
                return;
            }

            if (time < this.staminaDelayTime + delay) {
                return;
            }

            this.staminaDelayTime = time;

            this.stamina += 1;

            this.currentScene.events.emit(EventNames.RegeneratingStamina, this.stamina);
        })(time);
    }

    private reduceHealth(): void {
        this.health = Phaser.Math.Clamp(this.health - 1, 0, Constants.P_MAX_HEALTH);
        this.currentScene.events.emit(EventNames.ReduceHealth, this.health);
    }

    private increaseHealth(): void {
        this.health = Phaser.Math.Clamp(this.health + 1, 0, Constants.P_MAX_HEALTH);
        this.currentScene.events.emit(EventNames.IncreaseHealth, this.health);
    }

    private die(color: OrbColor): void {
        this.setVelocity(0, 100);

        this.anims
            .play(`dead_${color}`, true)
            .on("animationcomplete", () => {
                // TODO: Something should happen here, but t'what?
            });
    }

    private createRunningParticles(time: number): void {
        const delay: integer = 250;

        return ((time: number) => {

            if (time < this.lastTime + delay) {
                return;
            }

            this.lastTime = time;

            this.currentScene.add
                .sprite(this.x, this.y + 25, Constants.SHEET_KEY, "Uniball-Redux/Effects/RunParticles/1.png")
                .play("p_run")
                .on("animationcomplete", function (): void {
                    this.destroy();
                });
        })(time);
    }

    private createJumpingParticle(): void {
        this.currentScene.add
            .sprite(
                this.x,
                this.y + 17,
                Constants.SHEET_KEY,
                "Uniball-Redux/Effects/JumpParticles/1.png"
            )
            .play("p_jump")
            .on("animationcomplete", function (): void {
                this.destroy();
            });
    }

    private createFallingParticles(): void {
        this.createJumpingParticle();
        this.currentScene.add
            .sprite(
                this.x,
                this.y + 17,
                Constants.SHEET_KEY,
                "Uniball-Redux/Effects/FallParticles/1.png"
            )
            .play("p_fall")
            .on("animationcomplete", function (): void {
                this.destroy();
            });
    }

    private registerControls(): void {
        this.inputKeys = new Map([
            ["LEFT", this.addKey("A")],
            ["RIGHT", this.addKey("D")],
            ["DOWN", this.addKey("S")],
            ["UP", this.addKey("W")]
        ]);
    }
}